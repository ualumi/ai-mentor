'''from itertools import combinations
from app.state import COMPETENCY_GRAPH

def update_graph(evidence_list):

    competencies = [
        ev["competency"]
        for ev in evidence_list
    ]

    # усиливаем связи совместно встречающихся навыков
    for a, b in combinations(set(competencies), 2):

        COMPETENCY_GRAPH[a][b] += 0.1
        COMPETENCY_GRAPH[b][a] += 0.1'''

'''from itertools import combinations
from app.state import COMPETENCY_GRAPH


def update_graph(evidence_list: list[dict]):
    """
    Builds co-occurrence based dynamic competency graph.
    """

    competencies = [
        ev["competency"]
        for ev in evidence_list
    ]

    unique = set(competencies)

    for a, b in combinations(unique, 2):
        COMPETENCY_GRAPH[a][b] += 0.1
        COMPETENCY_GRAPH[b][a] += 0.1'''

'''from itertools import combinations
from app.state import COMPETENCY_GRAPH

EDGE_DECAY = 0.98

def update_graph(evidence_list):

    competencies = [
        ev["competency"]
        for ev in evidence_list
    ]

    unique = set(competencies)

    # decay старых связей
    for a in COMPETENCY_GRAPH:
        for b in COMPETENCY_GRAPH[a]:
            COMPETENCY_GRAPH[a][b] *= EDGE_DECAY

    # усиливаем совместные появления
    for a, b in combinations(unique, 2):

        COMPETENCY_GRAPH[a][b] += 1.0
        COMPETENCY_GRAPH[b][a] += 1.0'''

'''from itertools import combinations
from app.state import COMPETENCY_GRAPH

EDGE_DECAY = 0.98

def update_graph(evidence_list):

    competencies = [
        ev["competency"]
        for ev in evidence_list
    ]

    unique = set(competencies)

    # decay старых связей
    for a in COMPETENCY_GRAPH:
        for b in COMPETENCY_GRAPH[a]:
            COMPETENCY_GRAPH[a][b] *= EDGE_DECAY

    # усиливаем совместные появления
    for a, b in combinations(unique, 2):

        COMPETENCY_GRAPH[a][b] += 1.0
        COMPETENCY_GRAPH[b][a] += 1.0'''

from itertools import combinations

import torch
from torch_geometric.data import Data

from app.state import COMPETENCY_GRAPH

EDGE_DECAY = 0.98
MAX_EDGE_WEIGHT = 10.0


# =========================================================
# 1. UPDATE COMPETENCY GRAPH
# =========================================================

'''def update_graph(evidence_list):

    competencies = [
        ev["competency"]
        for ev in evidence_list
    ]

    unique = set(competencies)

    # -----------------------------------
    # decay old edges
    # -----------------------------------

    for a in COMPETENCY_GRAPH:

        for b in COMPETENCY_GRAPH[a]:

            COMPETENCY_GRAPH[a][b] *= EDGE_DECAY

    # -----------------------------------
    # reinforce co-occurrence
    # -----------------------------------

    for a, b in combinations(unique, 2):

        COMPETENCY_GRAPH[a][b] += 1.0
        COMPETENCY_GRAPH[b][a] += 1.0

        # clip edge weights
        COMPETENCY_GRAPH[a][b] = min(
            COMPETENCY_GRAPH[a][b],
            MAX_EDGE_WEIGHT
        )

        COMPETENCY_GRAPH[b][a] = min(
            COMPETENCY_GRAPH[b][a],
            MAX_EDGE_WEIGHT
        )'''


def update_graph(evidence_list):

    competencies = [ev["competency"] for ev in evidence_list]
    unique = set(competencies)

    # -----------------------------------
    # decay (only active nodes)
    # -----------------------------------

    for a in unique:
        for b in COMPETENCY_GRAPH[a]:
            COMPETENCY_GRAPH[a][b] *= EDGE_DECAY

    # -----------------------------------
    # self reinforcement (IMPORTANT)
    # -----------------------------------

    for a in unique:
        COMPETENCY_GRAPH[a][a] = 1.0

    # -----------------------------------
    # reinforce co-occurrence
    # -----------------------------------

    for ev in evidence_list:

        a = ev["competency"]
        strength = ev["score"] / 10.0

        for other in unique:

            if a == other:
                continue

            COMPETENCY_GRAPH[a][other] += strength
            COMPETENCY_GRAPH[other][a] += strength * 0.5

            COMPETENCY_GRAPH[a][other] = min(
                COMPETENCY_GRAPH[a][other],
                MAX_EDGE_WEIGHT
            )

            COMPETENCY_GRAPH[other][a] = min(
                COMPETENCY_GRAPH[other][a],
                MAX_EDGE_WEIGHT
            )


# =========================================================
# 2. BUILD PYG GRAPH FOR GNN
# =========================================================

def build_pyg_graph(user_progress):

    skills = list(
        user_progress["skills"].keys()
    )

    # empty graph protection
    if not skills:

        return Data(), []

    # -----------------------------------
    # node indexing
    # -----------------------------------

    node_index = {
        skill: idx
        for idx, skill in enumerate(skills)
    }

    # -----------------------------------
    # node features
    # -----------------------------------

    x = []

    for skill in skills:

        state = user_progress["skills"][skill]

        x.append([

            # mastery level
            state.get("ema", 0.0),

            # deficit
            state.get("deficit", 1.0),

            # learning trend
            state.get("trend", 0.0),

            # practice amount
            float(state.get("attempts", 0)),

            # involvement importance
            state.get("avg_weight", 0.0)

        ])

    # -----------------------------------
    # edges
    # -----------------------------------

    edge_index = []
    edge_weight = []

    for a in skills:

        for b, weight in COMPETENCY_GRAPH[a].items():

            if b not in node_index:
                continue

            # skip self loops
            if a == b:
                continue

            normalized_weight = min(
                weight / MAX_EDGE_WEIGHT,
                1.0
            )

            edge_index.append([
                node_index[a],
                node_index[b]
            ])

            edge_weight.append(
                normalized_weight
            )

    # -----------------------------------
    # fallback for isolated nodes
    # -----------------------------------

    if not edge_index:

        edge_index = [
            [i, i]
            for i in range(len(skills))
        ]

        edge_weight = [
            1.0
            for _ in range(len(skills))
        ]

    # -----------------------------------
    # tensor conversion
    # -----------------------------------

    edge_index = torch.tensor(
        edge_index,
        dtype=torch.long
    ).t().contiguous()

    edge_weight = torch.tensor(
        edge_weight,
        dtype=torch.float
    )

    x = torch.tensor(
        x,
        dtype=torch.float
    )

    return Data(
        x=x,
        edge_index=edge_index,
        edge_attr=edge_weight
    ), skills, node_index