import copy
import json
from datetime import datetime

from app.adapters.analysis_adapter import extract_evidence
from app.domain.cluster_builder import update_clusters
from app.domain.contextual_bandit import (
    choose_task_parameters,
    update_task_parameter_value,
)
from app.domain.graph_builder import update_graph
from app.domain.module_builder import build_task_parameter_candidates
from app.domain.progress_aggregator import apply_evidence
from app.domain.recommender import build_recommendations
from app.domain.skill_ontology import (
    canonicalize_evidence_list,
    canonicalize_skill,
    register_skill_alias,
)
from app.domain.reward import compute_module_reward
from app.model_versions import MODEL_VERSIONS
from app.redis_client import redis
from app.state import (
    ACTIVE_MODULES,
    EVIDENCE_STORE,
    PENDING_ACTIONS,
    RAW_ANALYSIS,
    RECOMMENDATION_HISTORY,
    USER_COMPETENCY_GRAPHS,
    USER_PROGRESS,
    USER_RECOMMENDATIONS,
    USER_SKILL_RELATION_STATS,
    USER_TYPED_COMPETENCY_GRAPHS,
)
from app.storage import append_event, persist_runtime_state


async def redis_listener(pubsub):
    async for msg in pubsub.listen():
        if msg["type"] != "pmessage":
            continue

        try:
            payload = json.loads(msg["data"])
        except Exception:
            continue

        learning_session_id = payload.get("learning_session_id")
        user_id = payload.get("user_id")
        raw_analysis = payload.get("analysis")
        attempt_id = payload.get("attempt_id")
        mode = payload.get("mode")
        condition = payload.get("condition")
        code = payload.get("code")

        if user_id is None or not raw_analysis:
            continue

        user_id = str(user_id)
        pending_key = _pending_key(user_id, learning_session_id, mode)
        _safe_append_event(
            "analysis_received",
            {
                "analysis": raw_analysis,
                "condition": condition,
                "code": code,
                "model_versions": MODEL_VERSIONS,
            },
            user_id=user_id,
            learning_session_id=learning_session_id,
            attempt_id=attempt_id,
            mode=mode,
        )

        user_progress = USER_PROGRESS.setdefault(
            user_id,
            {
                "skills": {},
                "clusters": {},
            },
        )

        RAW_ANALYSIS.setdefault(user_id, []).append(raw_analysis)
        progress_before = {
            "skills": copy.deepcopy(user_progress["skills"]),
            "clusters": copy.deepcopy(user_progress.get("clusters", {})),
        }

        evidence_list = canonicalize_evidence_list(
            extract_evidence(raw_analysis),
            user_progress,
        )
        EVIDENCE_STORE.setdefault(user_id, []).extend(evidence_list)

        for evidence in evidence_list:
            apply_evidence(user_progress["skills"], evidence)

        update_graph(
            evidence_list,
            user_id=user_id,
            progress_before=progress_before,
            progress_after=user_progress,
        )
        update_clusters(user_progress, user_id=user_id)
        _safe_append_event(
            "progress_updated",
            {
                "evidence": evidence_list,
                "progress_before": progress_before,
                "progress_after": user_progress,
                "model_versions": MODEL_VERSIONS,
            },
            user_id=user_id,
            learning_session_id=learning_session_id,
            attempt_id=attempt_id,
            mode=mode,
        )

        pending = PENDING_ACTIONS.pop(pending_key, None) if pending_key else None
        reward = None

        if pending:
            reward = compute_module_reward(
                state_before=pending["state_before"]["skills"],
                state_after=user_progress["skills"],
                recommendation=pending["task_parameters"],
                is_correct=_is_correct(raw_analysis),
            )
            update_task_parameter_value(
                bandit_context_id=pending_key,
                recommendation=pending["task_parameters"],
                user_progress_before=pending["state_before"],
                reward=reward,
                user_id=user_id,
            )
            RECOMMENDATION_HISTORY[user_id].append({
                "learning_session_id": learning_session_id,
                "module": pending["module"],
                "task_parameters": pending["task_parameters"],
                "reward": reward,
                "created_at": pending["created_at"],
                "resolved_at": datetime.utcnow().isoformat(),
                "resolved_by_attempt_id": attempt_id,
                "mode": mode,
                "model_versions": MODEL_VERSIONS,
            })
            _safe_append_event(
                "reward_computed",
                {
                    "reward": reward,
                    "recommendation": pending["task_parameters"],
                    "module": pending["module"],
                    "state_before": pending["state_before"],
                    "state_after": user_progress,
                    "is_correct": _is_correct(raw_analysis),
                    "model_versions": MODEL_VERSIONS,
                },
                user_id=user_id,
                learning_session_id=learning_session_id,
                attempt_id=attempt_id,
                mode=mode,
            )

        module_recommendations = build_recommendations(user_id, user_progress)
        module_recommendations = [
            _with_model_versions(recommendation)
            for recommendation in module_recommendations
        ]
        task_parameters = None

        if pending_key:
            module = _get_active_module(
                pending_key=pending_key,
                module_recommendations=module_recommendations,
                condition=condition,
            )
            task_candidates = build_task_parameter_candidates(module, user_progress)
            task_parameters = choose_task_parameters(
                bandit_context_id=pending_key,
                candidates=task_candidates,
                user_progress=user_progress,
                user_id=user_id,
            )
            task_parameters = _with_model_versions(task_parameters)

            if task_parameters:
                PENDING_ACTIONS[pending_key] = {
                    "attempt_id": attempt_id,
                    "module": module,
                    "task_parameters": task_parameters,
                    "state_before": {
                        "skills": copy.deepcopy(user_progress["skills"]),
                        "clusters": copy.deepcopy(user_progress.get("clusters", {})),
                    },
                    "created_at": datetime.utcnow().isoformat(),
                    "model_versions": MODEL_VERSIONS,
                }

        recommendations = (
            [task_parameters]
            if task_parameters
            else module_recommendations
        )
        published_progress = copy.deepcopy(user_progress)
        published_progress["personal_deficit_model"] = {
            "competency_graph": copy.deepcopy(USER_COMPETENCY_GRAPHS[user_id]),
            "typed_competency_graph": copy.deepcopy(USER_TYPED_COMPETENCY_GRAPHS[user_id]),
            "relation_stats": copy.deepcopy(USER_SKILL_RELATION_STATS[user_id]),
        }
        published_progress["module_recommendations"] = module_recommendations
        published_progress["task_parameters"] = task_parameters
        published_progress["recommendations"] = recommendations

        USER_RECOMMENDATIONS[user_id] = recommendations
        _safe_append_event(
            "recommendation_generated",
            {
                "module_recommendations": module_recommendations,
                "task_parameters": task_parameters,
                "recommendations": recommendations,
                "model_versions": MODEL_VERSIONS,
            },
            user_id=user_id,
            learning_session_id=learning_session_id,
            attempt_id=attempt_id,
            mode=mode,
        )
        _safe_persist_runtime_state()

        await redis.publish(
            f"user_progress:{user_id}",
            json.dumps({
                "user_id": user_id,
                "learning_session_id": learning_session_id,
                "mode": mode,
                "progress": published_progress,
                "module_recommendations": module_recommendations,
                "task_parameters": task_parameters,
                "recommendations": recommendations,
                "reward": reward,
                "score": raw_analysis.get("correctness"),
                "attempt_id": attempt_id,
                "condition": condition,
                "code": code,
                "model_versions": MODEL_VERSIONS,
            }),
        )


def _pending_key(
    user_id: str,
    learning_session_id,
    mode,
) -> str | None:
    if str(mode).lower() != "module" or learning_session_id is None:
        return None

    return f"{user_id}:{learning_session_id}"


def _get_active_module(
    pending_key: str,
    module_recommendations: list[dict],
    condition,
) -> dict:
    if pending_key in ACTIVE_MODULES:
        module = ACTIVE_MODULES[pending_key]
        module = _enrich_module_from_recommendations(module, module_recommendations)
        ACTIVE_MODULES[pending_key] = module
        return module

    module = _module_from_condition(condition)

    if not module:
        module = module_recommendations[0] if module_recommendations else None
    else:
        module = _enrich_module_from_recommendations(module, module_recommendations)

    if not module:
        module = {
            "type": "educational_module",
            "main_competency": "general_practice",
            "difficulty": 0.4,
            "tags": [
                {
                    "name": "general_practice",
                    "required_level": 0.7,
                }
            ],
            "goal": "initial_practice",
            "priority": 0.0,
            "explain_goal": "Пока данных о вашем прогрессе мало, поэтому рекомендован часто востребованный модуль.",
            "explanation": {
                "reason": "Пока данных о вашем прогрессе мало, поэтому рекомендован часто востребованный модуль.",
                "signals": {},
            },
        }

    ACTIVE_MODULES[pending_key] = module
    return module


def _enrich_module_from_recommendations(
    module: dict,
    module_recommendations: list[dict],
) -> dict:
    if not module:
        return module

    current_tags = module.get("tags") or []
    if len(current_tags) >= 3:
        return module

    recommendation = _matching_module_recommendation(module, module_recommendations)
    recommendation_tags = recommendation.get("tags", []) if recommendation else []
    if len(recommendation_tags) <= len(current_tags):
        return module

    enriched = copy.deepcopy(module)
    enriched["tags"] = copy.deepcopy(recommendation_tags[:3])
    enriched["main_competency"] = recommendation.get(
        "main_competency",
        enriched.get("main_competency"),
    )
    enriched["explanation"] = {
        **enriched.get("explanation", {}),
        "module_reason": recommendation.get("explanation", {}).get("reason"),
        "signals": recommendation.get("explanation", {}).get("signals", {}),
    }
    enriched["explain_goal"] = (
        enriched.get("explain_goal")
        or recommendation.get("explain_goal")
        or recommendation.get("explanation", {}).get("reason")
    )
    return enriched


def _matching_module_recommendation(
    module: dict,
    module_recommendations: list[dict],
) -> dict | None:
    main_competency = module.get("main_competency")
    if not main_competency:
        return module_recommendations[0] if module_recommendations else None

    for recommendation in module_recommendations:
        if recommendation.get("main_competency") == main_competency:
            return recommendation

    return module_recommendations[0] if module_recommendations else None


def _module_from_condition(condition) -> dict | None:
    if not isinstance(condition, dict):
        return None

    main_competency = (
        condition.get("main_competency")
        or condition.get("competency")
        or condition.get("module")
    )
    if main_competency:
        raw_main_competency = str(main_competency)
        main_competency, confidence, method = canonicalize_skill(raw_main_competency)
        register_skill_alias(raw_main_competency, main_competency, confidence, method)

    tags = _normalize_tags(
        condition.get("tags") or condition.get("tag_requirements"),
        main_competency,
    )

    if not main_competency:
        return None

    return {
        "type": "educational_module",
        "main_competency": main_competency,
        "difficulty": condition.get("difficulty", 0.4),
        "tags": tags,
        "goal": condition.get("goal", "consolidation"),
        "priority": condition.get("priority", 0.0),
        "explanation": {
            "reason": "Module context restored from the task condition.",
            "signals": {},
        },
    }


def _normalize_tags(tags, main_competency: str) -> list[dict]:
    if not tags:
        return [
            {
                "name": main_competency,
                "required_level": 0.75,
            }
        ]

    normalized = []

    for tag in tags:
        if isinstance(tag, str):
            raw_tag = tag
            tag, confidence, method = canonicalize_skill(raw_tag)
            register_skill_alias(raw_tag, tag, confidence, method)
            normalized.append({
                "name": tag,
                "required_level": 0.5 if tag != main_competency else 0.75,
            })
            continue

        if isinstance(tag, dict):
            name = tag.get("name") or tag.get("competency")
            if not name:
                continue
            raw_name = str(name)
            name, confidence, method = canonicalize_skill(raw_name)
            register_skill_alias(raw_name, name, confidence, method)

            normalized.append({
                "name": name,
                "required_level": tag.get("required_level", tag.get("weight", 0.5)),
            })

    return normalized or [
        {
            "name": main_competency,
            "required_level": 0.75,
        }
    ]


def _is_correct(raw_analysis: dict) -> bool:
    correctness = raw_analysis.get("correctness", {})

    if isinstance(correctness, dict):
        return bool(correctness.get("is_correct", False))

    try:
        return float(correctness) > 0.7
    except (TypeError, ValueError):
        return False


def _with_model_versions(recommendation: dict | None) -> dict | None:
    if recommendation is None:
        return None

    recommendation = copy.deepcopy(recommendation)
    recommendation["model_versions"] = MODEL_VERSIONS
    return recommendation


def _safe_append_event(event_type: str, payload: dict, **metadata):
    try:
        append_event(event_type, payload, **metadata)
    except Exception as exc:
        print(f"Could not append ML event {event_type}: {exc}")


def _safe_persist_runtime_state():
    try:
        persist_runtime_state()
    except Exception as exc:
        print(f"Could not persist ML runtime state: {exc}")
