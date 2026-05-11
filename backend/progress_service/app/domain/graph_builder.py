from itertools import combinations
from app.state import COMPETENCY_GRAPH

def update_graph(evidence_list):

    competencies = [
        ev["competency"]
        for ev in evidence_list
    ]

    # усиливаем связи совместно встречающихся навыков
    for a, b in combinations(set(competencies), 2):

        COMPETENCY_GRAPH[a][b] += 0.1
        COMPETENCY_GRAPH[b][a] += 0.1