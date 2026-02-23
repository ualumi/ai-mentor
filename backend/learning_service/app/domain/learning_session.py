from uuid import uuid4
from datetime import datetime
import json

class LearningSession:
    def __init__(
        self,
        user_id: int,
        competency: str,
        methodology: str
    ):
        self.id = str(uuid4())
        self.user_id = user_id
        self.competency = competency
        self.methodology = methodology
        self.current_step = 0
        self.status = "active"
        self.steps = [
            {"step": 0, "type": "practice", "status": "pending"}
        ]
        self.started_at = datetime.utcnow().isoformat()

    def to_dict(self):
        return {
            "session_id": self.id,
            "user_id": self.user_id,
            "competency": self.competency,
            "methodology": self.methodology,
            "current_step": self.current_step,
            "started_at": self.started_at,
            "status": self.status,
            "steps": json.dumps(self.steps)
        }
