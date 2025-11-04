import os

async def get_llm_hint(code_snippet: str) -> str:
    """
    Пример подключения к LLM (асинхронный вызов)
    """
    try:
        return ["ой оно не получилось у тебя зай", "зайка модельки пока нет, позже напишу"]
    except Exception as e:
        return f"Ошибка генерации подсказки: {e}"
