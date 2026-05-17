import torch

from app.domain.gnn_model import SkillGNN
from app.domain.graph_builder import build_pyg_graph
from app.state import COMPETENCY_GRAPH

model = SkillGNN()

optimizer = torch.optim.Adam(
    model.parameters(),
    lr=0.001
)

loss_fn = torch.nn.MSELoss()

'''def train_step(sample):

    data, skills = build_pyg_graph(
        sample["state"]
    )

    pred = model(data)

    target = []

    for s in skills:

        skill_state = sample["state"]["skills"][s]

        target.append(
            skill_state["trend"]
        )

    target = torch.tensor(target)

    loss = loss_fn(pred, target)

    optimizer.zero_grad()

    loss.backward()

    optimizer.step()

    return loss.item()'''

"""def train_step(sample):

    #data, skills = build_pyg_graph(sample["state"])
    data, skills, node_index = build_pyg_graph(sample["state"])
    #pred = model(data).view(-1)
    embeddings, pred = model(data)
    pred = pred.view(-1)

    '''target = []

    for s in skills:
        target.append(sample["state"][s]["ema"])   # ✔ FIX MAIN LOGIC'''
    target = torch.zeros(len(skills))

    target_idx = node_index.get(sample["skill"])

    if target_idx is not None:
        target[target_idx] = sample["gain"]

    target = torch.tensor(target, dtype=torch.float, device=pred.device)

    loss = loss_fn(pred, target)

    optimizer.zero_grad()
    loss.backward()

    torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
    optimizer.step()

    return loss.item()"""

def train_step(sample):

    data, skills, node_index = build_pyg_graph(sample["state"])

    embeddings, pred = model(data)
    pred = pred.squeeze()

    target = torch.zeros(len(skills), device=pred.device, dtype=torch.float)

    target_idx = node_index.get(sample["skill"])

    if target_idx is not None:
        target[target_idx] = sample["gain"]

        # soft propagation target (IMPORTANT)
        neighbors = COMPETENCY_GRAPH.get(sample["skill"], {})

        for neigh, w in neighbors.items():
            if neigh in node_index:
                target[node_index[neigh]] = sample["gain"] * w * 0.5

    loss = loss_fn(pred, target)

    optimizer.zero_grad()
    loss.backward()

    torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
    optimizer.step()

    return loss.item()