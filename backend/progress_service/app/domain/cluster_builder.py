'''from collections import defaultdict
from app.state import COMPETENCY_GRAPH

CLUSTER_THRESHOLD = 5.0

def update_clusters(user_progress: dict):

    visited = set()
    clusters = []

    for node in COMPETENCY_GRAPH:

        if node in visited:
            continue

        cluster = set([node])

        for neighbor, weight in COMPETENCY_GRAPH[node].items():

            if weight >= CLUSTER_THRESHOLD:
                cluster.add(neighbor)

        visited.update(cluster)

        clusters.append(list(cluster))

    return clusters'''

'''from app.state import COMPETENCY_GRAPH

def update_clusters(user_progress: dict):

    clusters_state = {}

    for skill, state in user_progress["skills"].items():

        best_cluster = None
        best_score = 0

        # ищем сильнее всего связанные навыки
        for neighbor, weight in COMPETENCY_GRAPH[skill].items():

            if weight > best_score:
                best_score = weight
                best_cluster = neighbor

        cluster_id = best_cluster or skill

        if cluster_id not in clusters_state:
            clusters_state[cluster_id] = {
                "skills": [],
                "ema_sum": 0.0
            }

        clusters_state[cluster_id]["skills"].append(skill)
        clusters_state[cluster_id]["ema_sum"] += state["ema"]

    # финализация cluster state
    for cid, data in clusters_state.items():

        skills = data["skills"]

        ema = data["ema_sum"] / len(skills)

        user_progress["clusters"][cid] = {
            "skills": skills,
            "ema": round(ema, 3),
            "deficit": round(1 - ema, 3)
        }'''

'''from collections import defaultdict, deque
from app.state import COMPETENCY_GRAPH

THRESHOLD = 0.4

def build_clusters(user_progress: dict):

    graph = defaultdict(set)

    # 1. thresholded graph
    for a in COMPETENCY_GRAPH:
        for b, w in COMPETENCY_GRAPH[a].items():
            if w >= THRESHOLD:
                graph[a].add(b)
                graph[b].add(a)

    visited = set()
    clusters = {}

    cluster_id = 0

    # 2. connected components
    for node in graph:

        if node in visited:
            continue

        queue = deque([node])
        component = set()

        while queue:
            v = queue.popleft()

            if v in visited:
                continue

            visited.add(v)
            component.add(v)

            for nei in graph[v]:
                if nei not in visited:
                    queue.append(nei)

        # 3. build cluster state
        ema_values = [
            user_progress["skills"][c]["ema"]
            for c in component
            if c in user_progress["skills"]
        ]

        clusters[f"cluster_{cluster_id}"] = {
            "skills": list(component),
            "ema": sum(ema_values) / max(1, len(ema_values)),
            "deficit": 1 - (sum(ema_values) / max(1, len(ema_values)))
        }

        cluster_id += 1

    user_progress["clusters"] = clusters'''

'''from collections import defaultdict
from app.state import COMPETENCY_GRAPH


def update_clusters(user_progress: dict):

    skills = user_progress["skills"]

    # итог: skill -> list of (related skill, weight)
    membership = defaultdict(list)

    for skill in skills:

        total_weight = 0.0
        affinities = []

        for other_skill in skills:

            if skill == other_skill:
                continue

            # graph similarity (no threshold!)
            weight = COMPETENCY_GRAPH[skill].get(other_skill, 0.0)

            if weight <= 0:
                continue

            affinities.append((other_skill, weight))
            total_weight += weight

        # нормализация (softmax-like)
        if total_weight > 0:
            normalized = [
                (s, w / total_weight)
                for s, w in affinities
            ]
        else:
            normalized = []

        membership[skill] = normalized

    # агрегированный "soft cluster signal"
    cluster_signals = defaultdict(float)

    for skill, links in membership.items():

        deficit = 1.0 - skills[skill]["ema"]

        for other, w in links:
            cluster_signals[other] += w * deficit

    # сохраняем результат
    user_progress["clusters"] = {
        "membership": membership,
        "signals": dict(cluster_signals)
    }'''


#from app.state import NODE_EMBEDDINGS
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from app.state import COMPETENCY_GRAPH

'''def update_clusters(user_progress):

    skills = list(user_progress["skills"].keys())

    clusters = {}

    for skill in skills:

        emb = NODE_EMBEDDINGS[skill]

        cluster = []

        for other in skills:

            if other == skill:
                continue

            sim = cosine_similarity(
                emb.reshape(1, -1),
                NODE_EMBEDDINGS[other].reshape(1, -1)
            )[0][0]

            if sim > 0.65:
                cluster.append(other)

        clusters[skill] = cluster

    user_progress["clusters"] = clusters'''

def update_clusters(user_progress):

    skills = user_progress["skills"]

    membership = {}

    for skill in skills:

        links = COMPETENCY_GRAPH[skill]

        scores = []

        for other in skills:

            if other == skill:
                continue

            w = links.get(other, 0.0)

            # 🔥 добавляем self-deficit influence
            deficit = 1.0 - skills[other]["ema"]

            score = w * deficit

            if score > 0:
                scores.append((other, score))

        # normalize
        total = sum(s for _, s in scores) or 1.0

        membership[skill] = [
            (s, w / total)
            for s, w in scores
        ]

    user_progress["clusters"] = membership