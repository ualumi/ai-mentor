import json
import random
from app.model import model, tokenizer
from app.inference import generate_bugfix_task

SYSTEM_PROMPT = (
    "Ты генерируешь новую ML bugfix-задачу строго в формате объектов из датасета. "
    "Верни только один JSON-объект без Markdown и без пояснений. "
    "Порядок полей должен быть ровно таким: "
    "`title`, `difficulty`, `topic_tags`, `task_context`, `tests`, "
    "`expected_output`, `input_example`, `output_example`, `requirements`, "
    "`constraints`, `broken_code`. "
    "`tests`, `requirements` и `constraints` должны быть массивами строк. "
    "`broken_code` должен быть одной строкой с полным Python-кодом и символами `\\n`. "
    "Не добавляй лишние поля и не обрывай JSON."
)

TASK_POOL = {
    "loops": [
        "Напишите цикл, который выводит числа от 1 до 10",
        "Посчитайте сумму элементов списка используя цикл",
        "Найдите максимальный элемент массива через цикл"
    ],
    "pandas": [
        "Загрузите CSV файл используя pandas",
        "Посчитайте среднее значение столбца",
        "Отфильтруйте строки по условию"
    ]
}


def generate_condition(competency: str, attempts: list):

    payload = {
        "difficulty": "easy",
        "topic_tags": {competency:0.3, competency:0.3, competency:0.4},
    }
    print(payload)
    result = generate_bugfix_task(
        model=model,
        tokenizer=tokenizer,
        system_prompt=SYSTEM_PROMPT,
        payload=payload,
    )

    print(result)

    data = json.loads(result)
    title = data["title"]
    broken_code = data["broken_code"].replace('\\n', '\n')  # Простой способ

    #tasks = TASK_POOL.get(competency, [])
    #cse= random.randint(1, 100)
    if title and broken_code:
        return {
            "description": title,
            "broken_code": broken_code
        }

    return {
            "description": f"Пример задачи {competency} с параметром",
            "broken_code": "def mean_row_count_of_values_below_train_mean_per_column_detailed(train_matrix, val_matrix):\\n    baselines = [sum(column) / len(column) for column in zip(*val_matrix)]\\n\\n    values = []\\n    for row in val_matrix:\\n        current = 0\\n        for value, baseline in zip(row, baselines):\\n            if value >= baseline:\\n                current += 1\\n        values.append(current)\\n\\n    return sum(values) / len(values)"
    }