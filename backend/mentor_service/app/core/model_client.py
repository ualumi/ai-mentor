"""import os

async def get_llm_hint(code_snippet: str) -> str:

    try:
        return ["ответ модели", "модель не подключена"]
    except Exception as e:
        return f"Ошибка генерации подсказки: {e}"""




import os
import aiohttp
import json

HF_TOKEN    = os.getenv("HF_TOKEN", "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")
HF_MODEL_ID = os.getenv("HF_MODEL_ID", "disemenova/qwen2.5-7b-ai-mentor")

HF_API_URL  = f"https://api-inference.huggingface.co/models/{HF_MODEL_ID}"


SYSTEM_PROMPT = (
    "Ты — ИИ-ментор для обучения программированию. "
    "Ты никогда не пишешь код в ответах. "
    "Ты направляешь студента через наводящие вопросы и короткие подсказки."
)


REQUEST_TIMEOUT = aiohttp.ClientTimeout(total=60)


def _build_prompt(code_snippet: str) -> str:

    return (
        f"<|im_start|>system\n{SYSTEM_PROMPT}<|im_end|>\n"
        f"<|im_start|>user\n```python\n{code_snippet}\n```<|im_end|>\n"
        f"<|im_start|>assistant\n"
    )


async def get_llm_hint(code_snippet: str) -> str:

    if not HF_TOKEN:
        return "Ошибка: HF_TOKEN не задан в переменных окружения."

    prompt = _build_prompt(code_snippet)

    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens":      150,
            "temperature":         0.7,
            "top_p":               0.9,
            "repetition_penalty":  1.1,
            "do_sample":           True,
            "return_full_text":    False,  
            "stop":                ["<|im_end|>", "<|im_start|>"],
        },
        "options": {
            "wait_for_model": True,  
            "use_cache":      False,  
        }
    }

    headers = {
        "Authorization": f"Bearer {HF_TOKEN}",
        "Content-Type":  "application/json",
    }

    try:
        async with aiohttp.ClientSession(timeout=REQUEST_TIMEOUT) as session:
            async with session.post(
                HF_API_URL,
                headers=headers,
                json=payload,
            ) as resp:

                if resp.status == 503:
                    return "Модель загружается, попробуй через 30 секунд."

                if resp.status == 401:
                    return "Ошибка авторизации: проверь HF_TOKEN."

                if resp.status != 200:
                    error_text = await resp.text()
                    return f"Ошибка HF API ({resp.status}): {error_text[:200]}"

                result = await resp.json()

                if isinstance(result, list) and len(result) > 0:
                    generated = result[0].get("generated_text", "").strip()
                    for stop_token in ["<|im_end|>", "<|im_start|>"]:
                        generated = generated.split(stop_token)[0].strip()
                    return generated if generated else "Не удалось сгенерировать подсказку."

                return "Неожиданный формат ответа от HF API."

    except aiohttp.ClientConnectorError:
        return "Ошибка сети: не удалось подключиться к HuggingFace API."
    except aiohttp.ServerTimeoutError:
        return "Таймаут: HuggingFace API не ответил за 60 секунд."
    except Exception as e:
        return f"Ошибка генерации подсказки: {str(e)}"
