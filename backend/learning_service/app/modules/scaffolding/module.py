from app.modules.base import LearningModule

class ScaffoldingModule(LearningModule):
    def __init__(self):
        self.state = {}

    def start(self, user_id, competency_id):
        self.state[user_id] = {
            "step": 1,
            "completed": False
        }

    def get_task(self, user_id):
        step = self.state[user_id]["step"]
        return f"Scaffolding: шаг {step}"

    def handle_attempt(self, user_id, code, sandbox_result):
        if sandbox_result["returncode"] == 0:
            self.state[user_id]["step"] += 1
            if self.state[user_id]["step"] > 3:
                self.state[user_id]["completed"] = True
                return {"event": "module_completed"}
            return {"event": "step_completed"}

        return {"event": "step_failed"}

    def is_completed(self, user_id):
        return self.state[user_id]["completed"]
