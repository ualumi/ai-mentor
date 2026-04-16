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
            "description": f"Пример задачи"
        }

    return {
        "description": random.choice(tasks)
    }