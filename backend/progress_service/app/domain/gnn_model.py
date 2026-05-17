import torch
import torch.nn.functional as F

from torch_geometric.nn import GCNConv

class SkillGNN(torch.nn.Module):

    def __init__(self):

        super().__init__()

        self.conv1 = GCNConv(5, 16)
        self.conv2 = GCNConv(16, 8)

        self.predictor = torch.nn.Linear(8, 1)

    def encode(self, data):

        x, edge_index = data.x, data.edge_index

        x = self.conv1(x, edge_index)
        x = F.relu(x)

        x = self.conv2(x, edge_index)

        return x

    def predict(self, embeddings):

        return self.predictor(embeddings).squeeze()

    '''def forward(self, data):

        embeddings = self.encode(data)

        predictions = self.predict(embeddings)

        return embeddings, predictions'''
    def forward(self, data):
        x = self.encode(data)
        pred = self.predict(x)
        return x, pred
    
model = SkillGNN()