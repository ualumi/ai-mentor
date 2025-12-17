class LearningModule:
    def start(self, user_id, competency_id):
        raise NotImplementedError

    def get_task(self, user_id):
        raise NotImplementedError

    def handle_attempt(self, user_id, code, sandbox_result):
        raise NotImplementedError

    def is_completed(self, user_id) -> bool:
        raise NotImplementedError
