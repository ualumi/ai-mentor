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
        if r["competency"] == competency
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

    cluster_links = clusters.get(
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