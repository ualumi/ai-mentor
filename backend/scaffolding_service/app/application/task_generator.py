import random


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

    tasks = TASK_POOL.get(competency, [])
    cse= random.randint(1, 100)
    if not tasks:
        return {
            "description": f"Пример задачи {competency} с параметром {cse}",
            "broken_code": "def mean_row_count_of_values_below_train_mean_per_column_detailed(train_matrix, val_matrix):\\n    baselines = [sum(column) / len(column) for column in zip(*val_matrix)]\\n\\n    values = []\\n    for row in val_matrix:\\n        current = 0\\n        for value, baseline in zip(row, baselines):\\n            if value >= baseline:\\n                current += 1\\n        values.append(current)\\n\\n    return sum(values) / len(values)"
        }

    return {
        "description": random.choice(tasks)
    }