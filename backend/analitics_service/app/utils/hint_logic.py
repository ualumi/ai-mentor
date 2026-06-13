'''import re
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
    return random.choice(lst); #get_llm_hint(code_snippet=code)'''


from app.core.model_client import analyze_code

async def generate_analysis(code: str, condition: str | None = None) -> dict:
    return await analyze_code(code, task=condition)

