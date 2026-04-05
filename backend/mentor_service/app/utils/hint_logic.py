import re
from app.core.model_client import get_llm_hint

MIN_CODE_LENGTH = 10

QUICK_HINTS = {
    r"SyntaxError": "Проверь синтаксис: возможно, где-то пропущена скобка, двоеточие или отступ.",
    r"IndexError": "Посмотри, не выходишь ли ты за границы списка или строки.",
    r"ZeroDivisionError": "Подумай, в каком случае знаменатель может оказаться равен нулю.",
    r"RecursionError": "Есть ли в рекурсии условие выхода и меняется ли состояние на каждом шаге?",
    r"import\s+\*": "Почему `import *` может мешать читать и поддерживать код?",
}


async def generate_hint(code: str) -> str:
    if not code or not isinstance(code, str):
        return "Пришли свой код, и посмотрим вместе."

    code = code.strip()
    if len(code) < MIN_CODE_LENGTH:
        return "Код слишком короткий. Пришли больше контекста, и я дам полезную подсказку."

    for pattern, hint in QUICK_HINTS.items():
        if re.search(pattern, code, re.IGNORECASE):
            return hint
    return await get_llm_hint(code_snippet=code)

