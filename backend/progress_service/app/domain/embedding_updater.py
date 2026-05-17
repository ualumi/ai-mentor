from app.domain.gnn_model import SkillGNN
from app.domain.graph_builder import build_pyg_graph
from app.state import SKILL_EMBEDDINGS

model = SkillGNN()

def update_embeddings(user_id, user_progress):

    #data, skills = build_pyg_graph(user_progress)
    data, skills, _ = build_pyg_graph(user_progress)

    embeddings, _ = model(data)

    result = {}

    for i, skill in enumerate(skills):

        result[skill] = embeddings[i].detach().numpy().tolist()

    SKILL_EMBEDDINGS[user_id] = result