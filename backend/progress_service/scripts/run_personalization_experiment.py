import argparse
import copy
import csv
import json
import random
import sys
from pathlib import Path
from statistics import mean

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.adapters.analysis_adapter import extract_evidence
from app.domain.cluster_builder import update_clusters
from app.domain.contextual_bandit import choose_task_parameters, update_task_parameter_value
from app.domain.graph_builder import update_graph
from app.domain.module_builder import build_task_parameter_candidates
from app.domain.progress_aggregator import apply_evidence
from app.domain.recommender import build_recommendations
from app.domain.reward import compute_module_reward
from app.domain.skill_ontology import (
    canonicalize_evidence_list,
    normalize_skill_name,
    typed_relation_weight,
)
from app.state import (
    COMPETENCY_GRAPH,
    SKILL_ALIASES,
    SKILL_REGISTRY,
    TYPED_COMPETENCY_GRAPH,
    USER_BANDIT_STATS,
)


OUTPUT_DIR = Path("data/experiments")
RANDOM_SEED = 42


def _tag(name: str, score: float, weight: float, applied: bool, confidence: float) -> dict:
    return {
        "name": name,
        "score": score,
        "weight": weight,
        "applied": applied,
        "confidence": confidence,
    }


CONFIGS = (
    {
        "name": "raw_skills_rule_policy",
        "canonicalization": False,
        "graph": False,
        "typed_graph": False,
        "policy": "rule",
    },
    {
        "name": "canonical_skills_rule_policy",
        "canonicalization": True,
        "graph": False,
        "typed_graph": False,
        "policy": "rule",
    },
    {
        "name": "canonical_untyped_graph_rule_policy",
        "canonicalization": True,
        "graph": True,
        "typed_graph": False,
        "policy": "rule",
    },
    {
        "name": "full_canonical_typed_graph_linucb",
        "canonicalization": True,
        "graph": True,
        "typed_graph": True,
        "policy": "linucb",
    },
)

OBSERVATIONS = (
    {
        "id": "attempt_01",
        "correctness": {"is_correct": False, "score": 0.35},
        "tags": [
            _tag("for loops", 4.0, 0.8, True, 0.88),
            _tag("conditionals", 5.0, 0.6, True, 0.82),
            _tag("code quality", 4.5, 0.4, True, 0.75),
        ],
    },
    {
        "id": "attempt_02",
        "correctness": {"is_correct": True, "score": 0.72},
        "tags": [
            _tag("цикл", 7.0, 0.8, True, 0.88),
            _tag("conditions", 6.5, 0.6, True, 0.8),
            _tag("CodeQuality", 6.0, 0.5, True, 0.78),
        ],
    },
    {
        "id": "attempt_03",
        "correctness": {"is_correct": False, "score": 0.4},
        "tags": [
            _tag("programming", 4.5, 0.5, True, 0.8),
            _tag("recursion", 3.0, 1.0, True, 0.9),
            _tag("functions", 4.0, 0.8, True, 0.85),
            _tag("base case", 2.0, 0.7, False, 0.75),
        ],
    },
    {
        "id": "attempt_04",
        "correctness": {"is_correct": False, "score": 0.45},
        "tags": [
            _tag("recursive functions", 4.5, 1.0, True, 0.88),
            _tag("function", 5.0, 0.8, True, 0.82),
            _tag("call stack", 3.0, 0.5, False, 0.7),
        ],
    },
    {
        "id": "attempt_05",
        "correctness": {"is_correct": True, "score": 0.78},
        "tags": [
            _tag("recursion", 7.0, 1.0, True, 0.9),
            _tag("functions", 7.5, 0.8, True, 0.85),
            _tag("conditionals", 6.5, 0.6, True, 0.8),
        ],
    },
    {
        "id": "attempt_06",
        "correctness": {"is_correct": True, "score": 0.82},
        "tags": [
            _tag("for-loop", 8.0, 0.7, True, 0.86),
            _tag("iteration", 7.5, 0.6, True, 0.82),
            _tag("code_quality", 7.0, 0.4, True, 0.78),
        ],
    },
    {
        "id": "attempt_07",
        "correctness": {"is_correct": False, "score": 0.5},
        "tags": [
            _tag("math", 4.0, 0.9, True, 0.88),
            _tag("discrete math", 4.0, 0.6, True, 0.78),
            _tag("recursion", 5.0, 0.7, True, 0.82),
        ],
    },
    {
        "id": "attempt_08",
        "correctness": {"is_correct": True, "score": 0.8},
        "tags": [
            _tag("mathematics", 7.0, 0.9, True, 0.86),
            _tag("recurrence relations", 6.5, 0.7, True, 0.78),
            _tag("recursion", 7.0, 0.7, True, 0.84),
        ],
    },
    {
        "id": "attempt_09",
        "correctness": {"is_correct": True, "score": 0.86},
        "tags": [
            _tag("recursion", 8.0, 1.0, True, 0.9),
            _tag("base_case", 7.5, 0.7, True, 0.82),
            _tag("call_stack", 6.5, 0.5, True, 0.78),
        ],
    },
    {
        "id": "attempt_10",
        "correctness": {"is_correct": True, "score": 0.9},
        "tags": [
            _tag("loops", 8.5, 0.7, True, 0.88),
            _tag("functions", 8.0, 0.8, True, 0.85),
            _tag("code quality", 8.0, 0.5, True, 0.8),
        ],
    },
    {
        "id": "attempt_11",
        "correctness": {"is_correct": False, "score": 0.48},
        "tags": [
            _tag("dynamic programming", 3.5, 1.0, True, 0.84),
            _tag("recursion", 5.5, 0.7, True, 0.82),
            _tag("arrays", 4.5, 0.6, True, 0.78),
        ],
    },
    {
        "id": "attempt_12",
        "correctness": {"is_correct": True, "score": 0.82},
        "tags": [
            _tag("dynamic_programming", 7.0, 1.0, True, 0.84),
            _tag("recursion", 8.0, 0.7, True, 0.86),
            _tag("arrays", 7.0, 0.6, True, 0.8),
        ],
    },
)

EXPECTED_ALIASES = {
    "for loops": "loops",
    "цикл": "loops",
    "for-loop": "loops",
    "loops": "loops",
    "recursive functions": "recursion",
    "function": "functions",
}

EXPECTED_STRUCTURAL_RELATIONS = (
    ("programming", "recursion", "parent_of"),
    ("recursion", "functions", "prerequisite_of"),
    ("recursion", "conditionals", "prerequisite_of"),
    ("recursion", "base_case", "prerequisite_of"),
    ("dynamic_programming", "recursion", "prerequisite_of"),
)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-dir", default=str(OUTPUT_DIR))
    args = parser.parse_args()

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    results = []
    histories = []
    for config in CONFIGS:
        summary, history = run_config(config)
        results.append(summary)
        histories.extend(history)

    structural_cases = run_ml_structural_deficit_cases()

    write_json(output_dir / "personalization_experiment_summary.json", results)
    write_csv(output_dir / "personalization_experiment_summary.csv", results)
    write_json(output_dir / "personalization_experiment_history.json", histories)
    write_csv(output_dir / "personalization_experiment_history.csv", histories)
    write_json(output_dir / "ml_structural_deficit_cases.json", structural_cases)
    write_csv(output_dir / "ml_structural_deficit_cases.csv", structural_cases)

    print(json.dumps({
        "summary": results,
        "ml_structural_cases": structural_cases,
    }, ensure_ascii=False, indent=2))


def run_config(config: dict) -> tuple[dict, list[dict]]:
    random.seed(RANDOM_SEED)
    reset_runtime_state()

    user_id = f"experiment_{config['name']}"
    context_id = f"{user_id}:session"
    user_progress = {"skills": {}, "clusters": {}}
    pending = None
    rewards = []
    predictions = {"bkt": [], "ema": []}
    observations = []
    history = []
    raw_labels = set()
    canonical_labels = set()
    generated_recommendations = 0
    reward_events = 0

    for index, raw_analysis in enumerate(OBSERVATIONS, start=1):
        progress_before = copy.deepcopy(user_progress)
        evidence_list = extract_evidence(raw_analysis)
        raw_labels.update(evidence["competency"] for evidence in evidence_list)

        if config["canonicalization"]:
            evidence_list = canonicalize_evidence_list(evidence_list, user_progress)

        canonical_labels.update(evidence["competency"] for evidence in evidence_list)
        collect_prediction_errors(progress_before, evidence_list, predictions, observations)

        for evidence in evidence_list:
            apply_evidence(user_progress["skills"], evidence)

        update_graph(evidence_list)
        if not config["graph"]:
            COMPETENCY_GRAPH.clear()
            TYPED_COMPETENCY_GRAPH.clear()
        elif not config["typed_graph"]:
            TYPED_COMPETENCY_GRAPH.clear()

        update_clusters(user_progress)

        reward = None
        if pending:
            reward = compute_module_reward(
                state_before=pending["state_before"]["skills"],
                state_after=user_progress["skills"],
                recommendation=pending["task_parameters"],
                is_correct=is_correct(raw_analysis),
            )
            rewards.append(reward)
            reward_events += 1

            if config["policy"] == "linucb":
                update_task_parameter_value(
                    bandit_context_id=context_id,
                    recommendation=pending["task_parameters"],
                    user_progress_before=pending["state_before"],
                    reward=reward,
                )

        recommendations = build_recommendations(user_id, user_progress)
        task_parameters = None
        if recommendations:
            module = recommendations[0]
            candidates = build_task_parameter_candidates(module, user_progress)
            task_parameters = choose_policy_action(
                config=config,
                context_id=context_id,
                candidates=candidates,
                user_progress=user_progress,
            )

        if task_parameters:
            generated_recommendations += 1
            pending = {
                "task_parameters": task_parameters,
                "state_before": copy.deepcopy(user_progress),
            }

        history.append(history_row(
            config=config,
            index=index,
            raw_analysis=raw_analysis,
            evidence_list=evidence_list,
            user_progress=user_progress,
            task_parameters=task_parameters,
            reward=reward,
        ))

    summary = {
        "config": config["name"],
        "observations": len(OBSERVATIONS),
        "evidence_signals": sum(len(item["tags"]) for item in OBSERVATIONS),
        "raw_skill_count": len(raw_labels),
        "canonical_skill_count": len(canonical_labels),
        "duplicate_reduction": round(
            1.0 - len(canonical_labels) / max(len(raw_labels), 1),
            4,
        ),
        "canonicalization_accuracy": canonicalization_accuracy(config),
        "typed_edge_precision": typed_edge_precision(config),
        "structural_deficit_hit_at_3": structural_deficit_hit_at_3(config, user_progress),
        "progress_updates": len(OBSERVATIONS),
        "recommendations": generated_recommendations,
        "reward_events": reward_events,
        "average_reward": round(mean(rewards), 4) if rewards else None,
        "cumulative_reward": round(sum(rewards), 4),
        "success_rate": round(
            mean(float(is_correct(item)) for item in OBSERVATIONS),
            4,
        ),
        "bkt_mae": mae(predictions["bkt"], observations),
        "ema_mae": mae(predictions["ema"], observations),
        "final_average_mastery": average_state_value(user_progress, "mastery"),
        "final_average_deficit": average_state_value(user_progress, "deficit"),
        "final_average_uncertainty": average_state_value(user_progress, "uncertainty"),
    }
    return summary, history


def run_ml_structural_deficit_cases() -> list[dict]:
    cases = [
        {
            "student": "Student A",
            "description": "Low model_evaluation is structurally connected with metrics and validation.",
            "observations": (
                {
                    "correctness": {"is_correct": False, "score": 0.42},
                    "tags": [
                        _tag("model evaluation", 3.0, 1.0, True, 0.9),
                        _tag("metrics", 2.5, 0.9, True, 0.86),
                        _tag("cross validation", 3.0, 0.7, False, 0.8),
                    ],
                },
                {
                    "correctness": {"is_correct": False, "score": 0.48},
                    "tags": [
                        _tag("model_evaluation", 4.0, 1.0, True, 0.9),
                        _tag("precision recall", 3.0, 0.8, True, 0.82),
                        _tag("validation", 3.5, 0.7, True, 0.78),
                    ],
                },
                {
                    "correctness": {"is_correct": True, "score": 0.74},
                    "tags": [
                        _tag("model evaluation", 6.5, 1.0, True, 0.9),
                        _tag("metrics", 6.0, 0.9, True, 0.84),
                        _tag("cross_validation", 5.5, 0.7, True, 0.8),
                    ],
                },
            ),
        },
        {
            "student": "Student B",
            "description": "Low model_evaluation is structurally connected with data splitting and overfitting.",
            "observations": (
                {
                    "correctness": {"is_correct": False, "score": 0.38},
                    "tags": [
                        _tag("model evaluation", 3.0, 1.0, True, 0.9),
                        _tag("train test split", 2.5, 0.9, True, 0.85),
                        _tag("overfitting", 3.0, 0.7, False, 0.78),
                    ],
                },
                {
                    "correctness": {"is_correct": False, "score": 0.44},
                    "tags": [
                        _tag("model_evaluation", 4.0, 1.0, True, 0.9),
                        _tag("data leakage", 2.5, 0.7, True, 0.8),
                        _tag("train_test_split", 3.5, 0.9, True, 0.84),
                    ],
                },
                {
                    "correctness": {"is_correct": True, "score": 0.7},
                    "tags": [
                        _tag("model evaluation", 6.0, 1.0, True, 0.9),
                        _tag("overfitting", 5.5, 0.8, True, 0.82),
                        _tag("train_test_split", 6.0, 0.9, True, 0.84),
                    ],
                },
            ),
        },
    ]

    rows = []
    for case in cases:
        reset_runtime_state()
        user_progress = {"skills": {}, "clusters": {}}
        for raw_analysis in case["observations"]:
            evidence_list = canonicalize_evidence_list(extract_evidence(raw_analysis), user_progress)
            for evidence in evidence_list:
                apply_evidence(user_progress["skills"], evidence)
            update_graph(evidence_list)
            update_clusters(user_progress)

        main_skill = "model_evaluation"
        related = ranked_structural_neighbors(main_skill, user_progress, limit=4)
        main_state = user_progress["skills"].get(main_skill, {})
        rows.append({
            "student": case["student"],
            "description": case["description"],
            "main_competency": main_skill,
            "main_mastery": main_state.get("mastery"),
            "main_deficit": main_state.get("deficit"),
            "top_structural_neighbors": " | ".join(
                f"{item['skill']}:{item['deficit']}:{item['relation_weight']}"
                for item in related
            ),
            "recommended_compensation_focus": " + ".join(item["skill"] for item in related[:2]),
        })

    return rows


def ranked_structural_neighbors(main_skill: str, user_progress: dict, limit: int) -> list[dict]:
    rows = []
    for skill, state in user_progress.get("skills", {}).items():
        if skill == main_skill:
            continue
        graph_weight = COMPETENCY_GRAPH[main_skill].get(skill, 0.0)
        typed_weight = typed_relation_weight(main_skill, skill)
        relation_weight = round(graph_weight + typed_weight, 4)
        rows.append({
            "skill": skill,
            "deficit": state.get("deficit", 1.0),
            "relation_weight": relation_weight,
            "score": relation_weight * (0.5 + state.get("deficit", 1.0)),
        })

    rows.sort(key=lambda item: item["score"], reverse=True)
    return rows[:limit]


def choose_policy_action(
    config: dict,
    context_id: str,
    candidates: list[dict],
    user_progress: dict,
) -> dict | None:
    if not candidates:
        return None

    if config["policy"] == "linucb":
        return choose_task_parameters(context_id, candidates, user_progress)

    if config["policy"] == "random":
        return random.choice(candidates)

    main_skill = candidates[0]["main_competency"]
    state = user_progress.get("skills", {}).get(main_skill, {})
    if state.get("deficit", 1.0) > 0.55 or state.get("uncertainty", 1.0) > 0.5:
        preferred = "support"
    elif state.get("mastery", 0.0) > 0.75 and state.get("trend", 0.0) >= 0:
        preferred = "stretch"
    else:
        preferred = "balanced"

    return next(
        (candidate for candidate in candidates if candidate.get("variant") == preferred),
        candidates[0],
    )


def collect_prediction_errors(
    progress_before: dict,
    evidence_list: list[dict],
    predictions: dict,
    observations: list[float],
) -> None:
    skills_before = progress_before.get("skills", {})
    for evidence in evidence_list:
        skill = evidence["competency"]
        state_before = skills_before.get(skill, {})
        observations.append(evidence_observation(evidence))
        predictions["bkt"].append(
            state_before.get("bkt_mastery", state_before.get("mastery", 0.2))
        )
        predictions["ema"].append(
            state_before.get("ema_mastery", state_before.get("ema", 0.0))
        )


def history_row(
    config: dict,
    index: int,
    raw_analysis: dict,
    evidence_list: list[dict],
    user_progress: dict,
    task_parameters: dict | None,
    reward: float | None,
) -> dict:
    skills = user_progress.get("skills", {})
    main_skill = task_parameters.get("main_competency") if task_parameters else None
    main_state = skills.get(main_skill, {}) if main_skill else {}
    return {
        "config": config["name"],
        "attempt": index,
        "is_correct": is_correct(raw_analysis),
        "raw_skills": "|".join(tag["name"] for tag in raw_analysis["tags"]),
        "canonical_skills": "|".join(evidence["competency"] for evidence in evidence_list),
        "main_competency": main_skill,
        "variant": task_parameters.get("variant") if task_parameters else None,
        "goal": task_parameters.get("goal") if task_parameters else None,
        "difficulty": task_parameters.get("difficulty") if task_parameters else None,
        "priority": task_parameters.get("priority") if task_parameters else None,
        "main_mastery": main_state.get("mastery"),
        "main_deficit": main_state.get("deficit"),
        "main_uncertainty": main_state.get("uncertainty"),
        "reward": reward,
    }


def canonicalization_accuracy(config: dict) -> float | None:
    if not config["canonicalization"]:
        return None

    correct = 0
    for raw_name, expected in EXPECTED_ALIASES.items():
        alias = SKILL_ALIASES.get(normalize_skill_name(raw_name))
        if alias == expected:
            correct += 1

    return round(correct / len(EXPECTED_ALIASES), 4)


def typed_edge_precision(config: dict) -> float | None:
    if not config["typed_graph"]:
        return None

    typed_edges = 0
    correct_edges = 0
    expected = set(EXPECTED_STRUCTURAL_RELATIONS)
    for source, targets in TYPED_COMPETENCY_GRAPH.items():
        for target, relations in targets.items():
            for relation, weight in relations.items():
                if weight <= 0:
                    continue
                typed_edges += 1
                if (source, target, relation) in expected or relation in {"same_as", "related_to"}:
                    correct_edges += 1

    if typed_edges == 0:
        return 0.0

    return round(correct_edges / typed_edges, 4)


def structural_deficit_hit_at_3(config: dict, user_progress: dict) -> float | None:
    if not config["typed_graph"]:
        return None

    checks = {
        "recursion": {"functions", "conditionals", "base_case", "call_stack"},
        "dynamic_programming": {"recursion", "arrays"},
    }
    hits = 0
    for skill, expected_related in checks.items():
        ranked = sorted(
            user_progress.get("skills", {}).keys(),
            key=lambda candidate: typed_relation_weight(skill, candidate),
            reverse=True,
        )
        top_3 = set([item for item in ranked if item != skill][:3])
        if top_3 & expected_related:
            hits += 1

    return round(hits / len(checks), 4)


def average_state_value(user_progress: dict, key: str) -> float | None:
    values = [
        state.get(key)
        for state in user_progress.get("skills", {}).values()
        if state.get(key) is not None
    ]
    return round(mean(values), 4) if values else None


def evidence_observation(evidence: dict) -> float:
    score = max(0.0, min(float(evidence.get("score", 0.0)) / 10.0, 1.0))
    if not evidence.get("applied", False):
        score *= 0.3
    return max(0.0, min(score, 1.0))


def mae(predictions: list[float], observations: list[float]) -> float | None:
    if not predictions:
        return None

    errors = [
        abs(float(prediction) - float(observation))
        for prediction, observation in zip(predictions, observations)
    ]
    return round(mean(errors), 4)


def is_correct(raw_analysis: dict) -> bool:
    correctness = raw_analysis.get("correctness", {})
    if isinstance(correctness, dict):
        return bool(correctness.get("is_correct", False))

    return bool(correctness)


def reset_runtime_state() -> None:
    COMPETENCY_GRAPH.clear()
    TYPED_COMPETENCY_GRAPH.clear()
    SKILL_ALIASES.clear()
    SKILL_REGISTRY.clear()
    USER_BANDIT_STATS.clear()


def write_json(path: Path, value) -> None:
    with path.open("w", encoding="utf-8") as file:
        json.dump(value, file, ensure_ascii=False, indent=2)


def write_csv(path: Path, rows: list[dict]) -> None:
    if not rows:
        return

    fieldnames = sorted({key for row in rows for key in row})
    with path.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


if __name__ == "__main__":
    main()
