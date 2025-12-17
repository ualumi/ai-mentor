from app.modules.scaffolding.module import ScaffoldingModule

class LearningOrchestrator:
    def __init__(self):
        self.module = ScaffoldingModule()

    def process_attempt(self, user_id, code, sandbox_result):
        if user_id not in self.module.state:
            self.module.start(user_id, competency_id="ml_basic")

        result = self.module.handle_attempt(
            user_id, code, sandbox_result
        )

        return {
            "methodology": "scaffolding",
            "result": result,
            "step": self.module.state[user_id]["step"]
        }
