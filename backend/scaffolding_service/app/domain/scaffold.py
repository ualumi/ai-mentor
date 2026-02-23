class ScaffoldingTask:
    def __init__(self):
        self.steps = [
            {"id": 0, "description": "Загрузить датасет"},
            {"id": 1, "description": "Обучить модель"},
            {"id": 2, "description": "Оценить качество модели"},
        ]

    def get_step(self, step_id: int):
        step = self.steps[step_id]
        return {
            "step_id": step["id"],
            "title": f"Шаг {step_id}",
            "description": step["description"]
        }

    def total_steps(self):
        return len(self.steps)

    def validate(self, step_id: int, code: str) -> bool:
        rules = {
            0: ["read_csv", "load"],
            1: ["fit"],
            2: ["score", "accuracy"]
        }

        required = rules.get(step_id, [])
        return all(r in code for r in required)