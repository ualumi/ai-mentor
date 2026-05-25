async def build_adaptive_task_payload(
    competency: str,
    progress_raw: dict
):
    if not progress_raw:
        #return (competency)
        return {
            "difficulty": "easy",
            "topic_tags": {
                competency: 1.0
            }
        }

    skills = progress_raw.get("skills", {})

    if competency not in skills:
        return {
            "difficulty": "easy",
            "topic_tags": {
                competency: 1.0
            }
        }

    recommendations = progress_raw.get(
        "recommendations",
        []
    )

    module_recs = [
        r for r in recommendations
        if _recommendation_competency(r) == competency
    ]

    rec = (
        max(module_recs, key=lambda x: x["priority"])
        if module_recs
        else None
    )

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
        competency,
        []
    )

    topic_tags = {
        competency: 0.5
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
