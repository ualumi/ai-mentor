import os

async def get_llm_hint(code_snippet: str) -> str:
    """
    Пример подключения к LLM (асинхронный вызов)
    """
    try:
        return ["ответ модели", "модель не подключена"]
    except Exception as e:
        return f"Ошибка генерации подсказки: {e}"
