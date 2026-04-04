import re
import aiohttp
from app.core.model_client import get_llm_hint
import random;

lst = ["ответ модели", "модель не подключена"]

HINTS = {
    "SyntaxError": "Проверь синтаксис: возможно, пропущена скобка или отступ.",
    "IndexError": "Проверь индекс — возможно, выход за пределы списка.",
    "ZeroDivisionError": "Деление на ноль невозможно.",
}

async def generate_hint(code: str) -> str:
    # Пример: простая логика + возможный вызов LLM
    for error_type, hint in HINTS.items():
        if re.search(error_type, code, re.IGNORECASE):
            return hint
    return random.choice(lst); #get_llm_hint(code_snippet=code)

"""import re
from app.core.model_client import get_llm_hint

MIN_CODE_LENGTH = 10

QUICK_HINTS = {
    r"ZeroDivisionError":   "Подумай, в каком случае знаменатель может оказаться равен нулю?",
    r"RecursionError":      "Есть ли в твоей рекурсии условие выхода? Что происходит на каждом шаге?",
    r"import\s+\*":         "Почему использование `import *` может быть проблемой в большом проекте?",
}


async def generate_hint(code: str) -> str:
    if not code or not isinstance(code, str):
        return "Пришли свой код — посмотрим вместе."

    code = code.strip()
    if len(code) < MIN_CODE_LENGTH:
        return "Код слишком короткий. Напиши больше — тогда смогу помочь разобраться."

    # быстрые паттерны - ответ без LLM
    for pattern, hint in QUICK_HINTS.items():
        if re.search(pattern, code, re.IGNORECASE):
            return hint
    # основной путь
    return await get_llm_hint(code_snippet=code)"""

