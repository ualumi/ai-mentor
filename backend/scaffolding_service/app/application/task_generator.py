import random
from app.model import get_model
from app.inference import generate_bugfix_task
import json

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


FIX_MARKER = "ВОТ ТУТ НУЖНО ИСПРАВИТЬ КОД"


def sanitize_broken_code(code: str) -> str:
    if not code:
        return code

    cleaned_lines = []

    for line in code.splitlines():
        marker_index = line.find(FIX_MARKER)
        if marker_index >= 0:
            line = line[:marker_index + len(FIX_MARKER)]
        cleaned_lines.append(line)

    trailing_newline = "\n" if code.endswith("\n") else ""
    return "\n".join(cleaned_lines) + trailing_newline


def generate_condition( competency, task, attempts: list):

    print(task)
    model, tokenizer = get_model()

    result = generate_bugfix_task(
        model=model,
        tokenizer=tokenizer,
        system_prompt=SYSTEM_PROMPT,
        payload=task,
    )

    print(result)

    data = json.loads(result)
    title = data["title"]
    broken_code = data["broken_code"].replace('\\n', '\n')  # Простой способ
    broken_code = sanitize_broken_code(broken_code)

    #tasks = TASK_POOL.get(competency, [])
    #cse= random.randint(1, 100)
    if title and broken_code:
        return {
            "description": title,
            "broken_code": broken_code,
            "task_context": data.get("task_context", ""),
            "tests": data.get("tests", []),
        }

    return {
            "description": f"Пример задачи {competency} с параметром",
            "broken_code": "def mean_row_count_of_values_below_train_mean_per_column_detailed(train_matrix, val_matrix):\\n    baselines = [sum(column) / len(column) for column in zip(*val_matrix)]\\n\\n    values = []\\n    for row in val_matrix:\\n        current = 0\\n        for value, baseline in zip(row, baselines):\\n            if value >= baseline:\\n                current += 1\\n        values.append(current)\\n\\n    return sum(values) / len(values)"
    }
    '''print(f"Task: {task}")
    if task == {}:
        task = competency
    tasks = TASK_POOL.get(competency, [])
    cse= random.randint(1, 100)
    if not tasks:
        return {
<<<<<<< HEAD
            "description": f"Пример задачи {competency} с параметром {cse}",
            "broken_code": "def mean_row_count_of_values_below_train_mean_per_column_detailed(train_matrix, val_matrix):\\n    baselines = [sum(column) / len(column) for column in zip(*val_matrix)]\\n\\n    values = []\\n    for row in val_matrix:\\n        current = 0\\n        for value, baseline in zip(row, baselines):\\n            if value >= baseline:\\n                current += 1\\n        values.append(current)\\n\\n    return sum(values) / len(values)"
=======
            "description": f"Пример задачи {task} с параметром {cse}",
            "broken_code": "def mean_row_count_of_values_below_train_mean_per_column_detailed(train_matrix, val_matrix):\\n    baselines = [sum(column) / len(column) for column in zip(*val_matrix)]\\n\\n    values = []\\n    for row in val_matrix:\\n        current = 0\\n        for value, baseline in zip(row, baselines):\\n            if value >= baseline:\\n                current += 1\\n        values.append(current)\\n\\n    return sum(values) / len(values)",
            "task_context": "Для обучения простых rule-of-thumb можно сравнивать validation значения не с global baseline, а с train mean своего столбца. Число значений ниже этого baseline показывает, насколько validation строка лежит ниже train центра. В текущем коде baseline считается по validation, а условие перевёрнуто.",
              "tests": [
                "value = mean_row_count_of_values_below_train_mean_per_column_detailed([['a', 1.0], ['b', 3.0]], [['x', 2.0], ['y', 0.0], ['z', 1.0]])",
                "assert abs(value - 1.0) < 1e-12"
            ],

>>>>>>> frontend-dev
        }
       

    return {
        "description": random.choice(tasks)
    }'''
    
