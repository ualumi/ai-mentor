async def build_adaptive_task_payload(
    competency: str,
    progress_raw: dict
):
    canonical_competency = _normalize_skill_name(competency)

    if not progress_raw:
        #return (competency)
        return {
            "difficulty": "easy",
            "topic_tags": {
                canonical_competency: 1.0
            }
        }

    skills = progress_raw.get("skills", {})
    skill_key = _find_skill_key(skills, canonical_competency)

    if not skill_key:
        return {
            "difficulty": "easy",
            "topic_tags": {
                canonical_competency: 1.0
            }
        }

    recommendations = progress_raw.get(
        "recommendations",
        []
    )

    module_recs = [
        r for r in recommendations
        if _normalize_skill_name(_recommendation_competency(r)) == canonical_competency
    ]

    rec = (
        max(module_recs, key=lambda x: x["priority"])
        if module_recs
        else None
    )

    tags_from_recommendation = _topic_tags_from_recommendation(rec)
    if tags_from_recommendation:
        return {
            "difficulty": rec["difficulty"],
            "topic_tags": tags_from_recommendation,
        }

    '''clusters = (
        progress_raw
        .get("clusters", {})
        .get("membership", {})
    )

    cluster_links = clusters.get(
        competency,
        []
    )'''
    clusters = progress_raw.get("clusters", {})
    membership = clusters.get("membership", clusters)

    cluster_links = membership.get(
        skill_key,
        []
    )

    topic_tags = {
        skill_key: 0.5
    }

    total = sum(
        w for _, w in cluster_links
    ) or 1.0

    for skill, w in cluster_links:
        topic_tags[skill] = (
            w / total
        ) * 0.5

    return {
        "difficulty": (
            rec["difficulty"]
            if rec
            else "easy"
        ),

        "topic_tags": topic_tags
    }


def _recommendation_competency(recommendation: dict) -> str | None:
    if not isinstance(recommendation, dict):
        return None

    module = recommendation.get("module")

    return (
        recommendation.get("main_competency")
        or recommendation.get("competency")
        or (module.get("main_competency") if isinstance(module, dict) else None)
    )


def _topic_tags_from_recommendation(recommendation: dict | None) -> dict:
    if not isinstance(recommendation, dict):
        return {}

    tags = [
        tag
        for tag in recommendation.get("tags", [])
        if isinstance(tag, dict) and (tag.get("name") or tag.get("competency"))
    ]
    if not tags:
        return {}

    main_competency = _normalize_skill_name(_recommendation_competency(recommendation))
    topic_tags = {}
    related_tags = []

    for tag in tags[:3]:
        skill = _normalize_skill_name(tag.get("name") or tag.get("competency"))
        if not skill:
            continue

        weight = _safe_float(tag.get("required_level", tag.get("weight", 0.5)))
        if skill == main_competency and skill not in topic_tags:
            topic_tags[skill] = 0.5
        else:
            related_tags.append((skill, weight))

    total_related_weight = sum(weight for _, weight in related_tags) or 1.0
    for skill, weight in related_tags:
        topic_tags[skill] = round((weight / total_related_weight) * 0.5, 3)

    if not topic_tags and main_competency:
        topic_tags[main_competency] = 1.0

    return topic_tags


def _find_skill_key(skills: dict, competency: str) -> str | None:
    if competency in skills:
        return competency

    for skill in skills:
        if _normalize_skill_name(skill) == competency:
            return skill

    return None


def _normalize_skill_name(name) -> str:
    return str(name or "").strip().lower().replace("-", "_").replace("/", "_").replace(" ", "_")


def _safe_float(value, default: float = 0.5) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default
