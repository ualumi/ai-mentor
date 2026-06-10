import json
import re

from app.inference import generate_bugfix_task
from app.model import model, tokenizer

SYSTEM_PROMPT = """
Ты генерируешь учебные ML/Python bugfix-задачи.
Верни только JSON без markdown и пояснений вокруг.
JSON должен содержать:
- title: короткое название задачи;
- broken_code: Python-код с одной содержательной ошибкой;
- task_context: объяснение контекста задачи и того, что нужно исправить;
- tests: массив строк с pytest/assert проверками.
Задача должна соответствовать difficulty и topic_tags из payload.
"""


def generate_condition(competency, task, attempts: list):
    payload = _build_generation_payload(competency, task, attempts)
    print(f"Task generation payload: {payload}")

    result = generate_bugfix_task(
        model=model,
        tokenizer=tokenizer,
        system_prompt=SYSTEM_PROMPT,
        payload=payload,
    )
    print(result)

    data = _parse_generation_result(result)
    if not data:
        return _fallback_condition(payload)

    title = data.get("title") or data.get("description")
    broken_code = _normalize_code(data.get("broken_code"))
    task_context = data.get("task_context") or data.get("context")

    if title and broken_code and task_context:
        condition = {
            "description": title,
            "broken_code": broken_code,
            "task_context": task_context,
        }

        tests = data.get("tests")
        if isinstance(tests, list):
            condition["tests"] = [str(test) for test in tests]

        return condition

    return _fallback_condition(payload)


def _build_generation_payload(competency, task, attempts: list) -> dict:
    if isinstance(task, dict) and task:
        payload = dict(task)
    else:
        payload = {}

    topic_tags = payload.get("topic_tags")
    if not isinstance(topic_tags, dict) or not topic_tags:
        topic_tags = {str(competency or "python"): 1.0}

    payload["topic_tags"] = topic_tags
    payload["difficulty"] = payload.get("difficulty", 0.4)
    payload["competency"] = competency
    payload["attempts"] = attempts or []

    return payload


def _parse_generation_result(result: str) -> dict | None:
    if not result:
        return None

    try:
        return json.loads(result)
    except json.JSONDecodeError:
        pass

    match = re.search(r"\{.*\}", result, flags=re.DOTALL)
    if not match:
        return None

    try:
        return json.loads(match.group(0))
    except json.JSONDecodeError:
        return None


def _normalize_code(code) -> str | None:
    if not isinstance(code, str) or not code.strip():
        return None

    return code.replace("\\n", "\n").strip()


def _fallback_condition(payload: dict) -> dict:
    tags = ", ".join(payload.get("topic_tags", {}).keys()) or payload.get("competency") or "python"

    return {
        "description": f"Задача по теме: {tags}",
        "broken_code": (
            "def mean_row_count_of_values_below_train_mean_per_column_detailed(train_matrix, val_matrix):\n"
            "    baselines = [sum(column) / len(column) for column in zip(*val_matrix)]\n\n"
            "    values = []\n"
            "    for row in val_matrix:\n"
            "        current = 0\n"
            "        for value, baseline in zip(row, baselines):\n"
            "            if value >= baseline:\n"
            "                current += 1\n"
            "        values.append(current)\n\n"
            "    return sum(values) / len(values)"
        ),
        "task_context": (
            "Генератор не вернул валидный JSON, поэтому выдана резервная задача. "
            "Исправьте расчет baseline и направление сравнения."
        ),
        "tests": [
            "value = mean_row_count_of_values_below_train_mean_per_column_detailed([['a', 1.0], ['b', 3.0]], [['x', 2.0], ['y', 0.0], ['z', 1.0]])",
            "assert abs(value - 1.0) < 1e-12",
        ],
    }
