

'''def build_recommendations(progress: dict) -> list[dict]:
    recs = []

    for comp, state in progress.items():
        ema = state["ema"]
        trend = state["trend"]
        attempts = state["attempts"]
        mastery = state["mastery"]

        if ema < 0.5 and attempts >= 2:
            recs.append({
                "type": "module",
                "competency": comp,
                "priority": "high"
            })

        elif 0.5 <= ema < 0.75 and abs(trend) < 0.05:
            recs.append({
                "type": "practice",
                "competency": comp,
                "priority": "medium"
            })

        elif mastery:
            recs.append({
                "type": "challenge",
                "competency": comp,
                "priority": "low"
            })

    return recs'''

'''from app.domain.bandit_policy import choose_action
from app.state import COMPETENCY_GRAPH

def build_recommendations(progress):

    candidate_actions = []

    for comp, state in progress.items():

        ema = state["ema"]

        # слабая компетенция
        if ema < 0.7:

            candidate_actions.append(comp)

            # добавляем связанные узлы графа
            neighbors = COMPETENCY_GRAPH.get(comp, {})

            for neighbor, weight in neighbors.items():

                if weight > 0.3:
                    candidate_actions.append(neighbor)

    if not candidate_actions:
        return []

    selected = choose_action(candidate_actions)
    print(f"🎯 Selected action: {selected} from candidates: {candidate_actions}")
    print(COMPETENCY_GRAPH)
    return [{
        "type": "adaptive_practice",
        "competency": selected
    }]'''

'''from app.domain.bandit_policy import choose_action

def build_recommendations(user_id: str, user_progress: dict):

    #actions = list(user_progress.keys())  # кандидаты
    actions = [
        weak
        for weak in user_progress.keys()
    ]

    if not actions:
        return []

    action = choose_action(user_id, actions)

    if not action:
        return []

    return [
        {
            "type": "bandit_recommendation",
            "competency": action,
            "priority": "adaptive",
            "strategy": "contextual_epsilon_greedy"
        }
    ]'''

'''from app.domain.cluster_builder import build_clusters

def build_recommendations(user_id, user_progress):

    clusters = build_clusters()

    recommendations = []

    for cluster in clusters:

        deficits = []

        for skill in cluster:

            state = user_progress["skills"].get(skill)

            if not state:
                continue

            deficits.append(
                1.0 - state["ema"]
            )

        if not deficits:
            continue

        avg_deficit = sum(deficits) / len(deficits)

        recommendations.append({
            "module": cluster[0],
            "skills": cluster,
            "priority": round(avg_deficit, 3),
            "difficulty": choose_difficulty(avg_deficit),
            "topic_tags": build_topic_tags(cluster, user_progress)
        })

    recommendations.sort(
        key=lambda x: x["priority"],
        reverse=True
    )

    return recommendations[:3]

def choose_difficulty(deficit):

    if deficit > 0.7:
        return "easy"

    if deficit > 0.4:
        return "medium"

    return "hard"

def build_topic_tags(cluster, user_progress):

    weights = {}

    total = 0.0

    for skill in cluster:

        ema = user_progress["skills"][skill]["ema"]

        deficit = 1.0 - ema

        weights[skill] = deficit

        total += deficit

    if total == 0:
        total = 1.0

    return {
        k: round(v / total, 3)
        for k, v in weights.items()
    }'''




'''def choose_difficulty(deficit):

    if deficit > 0.7:
        return "easy"

    if deficit > 0.4:
        return "medium"

    return "hard"

def build_topic_tags(cluster, user_progress):

    weights = {}

    skills = cluster["skills"]

    total = 0.0

    for skill in skills:

        state = user_progress["skills"].get(skill, {})

        ema = state.get("ema", 0.0)

        deficit = 1.0 - ema

        weights[skill] = deficit

        total += deficit

    if total == 0:
        total = 1.0

    return {
        k: round(v / total, 3)
        for k, v in weights.items()
    }'''


'''def build_recommendations(user_id, user_progress):

    clusters = user_progress.get("clusters", {})

    if not clusters:
        return []

    recommendations = []

    for cid, cluster in clusters.items():

        priority = cluster["deficit"]

        recommendations.append({
            "competency": cid,   # 👈 ТОЛЬКО ИМЯ КЛАСТЕРА
            "priority": round(priority, 3),
            "difficulty": choose_difficulty(priority)
        })

    return sorted(
        recommendations,
        key=lambda x: x["priority"],
        reverse=True
    )[:3]'''

'''def build_recommendations(user_id, user_progress):

    skills = user_progress.get("skills", {})
    graph = user_progress.get("clusters", {}).get("signals", {})

    if not skills:
        return []

    # -----------------------------
    # 1. compute propagated deficit per skill
    # -----------------------------
    skill_scores = {}

    for skill, state in skills.items():

        base_deficit = 1.0 - state["ema"]

        # direct deficit + graph influence
        propagated = base_deficit

        for related, signal in graph.items():
            propagated += signal * base_deficit

        skill_scores[skill] = propagated

    # -----------------------------
    # 2. rank skills
    # -----------------------------
    ranked = sorted(
        skill_scores.items(),
        key=lambda x: x[1],
        reverse=True
    )

    # -----------------------------
    # 3. build recommendations
    # -----------------------------
    recommendations = []

    for skill, score in ranked[:3]:

        recommendations.append({
            "competency": skill,   # теперь это skill, а не cluster
            "priority": round(score, 3),
            "difficulty": choose_difficulty(score)
        })

    return recommendations'''


'''from app.state import NODE_EMBEDDINGS
from sklearn.metrics.pairwise import cosine_similarity

def build_recommendations(user_id, user_progress):

    skills = user_progress["skills"]

    ranked = []

    for skill, state in skills.items():

        deficit = 1.0 - state["ema"]

        emb = NODE_EMBEDDINGS[skill]

        # propagate influence via embedding space
        influence = 0.0

        for other in skills:

            if other == skill:
                continue

            sim = cosine_similarity(
                emb.reshape(1, -1),
                NODE_EMBEDDINGS[other].reshape(1, -1)
            )[0][0]

            other_deficit = 1.0 - skills[other]["ema"]

            influence += sim * other_deficit

        score = deficit + 0.5 * influence

        ranked.append((skill, score))

    ranked.sort(key=lambda x: x[1], reverse=True)

    return [
        {
            "competency": s,
            "priority": round(sc, 3),
            "difficulty": choose_difficulty(sc)
        }
        for s, sc in ranked[:3]
    ]'''

from app.state import SKILL_EMBEDDINGS
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np


def choose_difficulty(score):

    if score > 0.7:
        return "easy"

    if score > 0.4:
        return "medium"

    return "hard"


from app.domain.gnn_model import model
from app.domain.graph_builder import build_pyg_graph

def build_recommendations(user_id, user_progress):

    skills = user_progress["skills"]

    if not skills:
        return []

    # -----------------------------------
    # build graph
    # -----------------------------------

    '''data, ordered_skills = build_pyg_graph(
        user_progress
    )'''
    data, ordered_skills, _ = build_pyg_graph(user_progress)

    # -----------------------------------
    # GNN inference
    # -----------------------------------

    embeddings, predicted_gain = model(data)

    ranked = []

    for idx, skill in enumerate(ordered_skills):

        state = skills[skill]

        deficit = (
            1.0 - state["ema"]
        )

        gain = float(
            predicted_gain[idx]
            .detach()
            .cpu()
        )

        gain = max(gain, 0.0)

        # -----------------------------------
        # final tutoring priority
        # -----------------------------------

        priority = (
            0.6 * deficit
            + 0.4 * gain
        )

        ranked.append({
            "competency": skill,
            "priority": round(priority, 3),
            "difficulty": choose_difficulty(
                deficit
            ),
            "predicted_gain": round(gain, 3),
            "deficit": round(deficit, 3)
        })

    ranked.sort(
        key=lambda x: x["priority"],
        reverse=True
    )

    return ranked[:3]