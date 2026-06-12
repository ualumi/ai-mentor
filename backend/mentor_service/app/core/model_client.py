import asyncio
import os

MODEL_NAME = os.getenv("MENTOR_MODEL_ID", "disemenova/qwen2.5-7b-ai-mentor")
MAX_SEQ_LENGTH = int(os.getenv("MENTOR_MAX_SEQ_LENGTH", "1024"))
MAX_NEW_TOKENS = int(os.getenv("MENTOR_MAX_NEW_TOKENS", "256"))
TEMPERATURE = float(os.getenv("MENTOR_TEMPERATURE", "0.7"))
REPETITION_PENALTY = float(os.getenv("MENTOR_REPETITION_PENALTY", "1.1"))
LOAD_IN_4BIT = os.getenv("MENTOR_LOAD_IN_4BIT", "true").lower() == "true"

SYSTEM_PROMPT = (
    "Ты - ИИ-ментор для обучения программированию. "
    "Ты никогда не пишешь код в ответах. "
    "Ты направляешь студента через наводящие вопросы и короткие подсказки. "
    "Всегда отвечай только на русском языке."
)

model = None
tokenizer = None
_torch = None
_model_lock = asyncio.Lock()
_load_lock = asyncio.Lock()


def _format_user_message(code_snippet: str, lang: str = "python") -> str:
    return f"```{lang}\n{code_snippet.strip()}\n```"


async def load_model() -> None:
    global model, tokenizer, _torch

    if model is not None and tokenizer is not None:
        return

    async with _load_lock:
        if model is not None and tokenizer is not None:
            return

        try:
            import torch
            from unsloth import FastLanguageModel
        except Exception as exc:
            raise RuntimeError(
                "Не удалось импортировать зависимости модели. "
                "Установите torch/unsloth и связанные пакеты для mentor_service."
            ) from exc

        if not torch.cuda.is_available():
            raise RuntimeError(
                "Куды нетy."
            )

        print(f"Loading mentor model: {MODEL_NAME}")

        loaded_model, loaded_tokenizer = FastLanguageModel.from_pretrained(
            model_name=MODEL_NAME,
            max_seq_length=MAX_SEQ_LENGTH,
            dtype=torch.float16,
            load_in_4bit=LOAD_IN_4BIT,
        )

        FastLanguageModel.for_inference(loaded_model)

        model = loaded_model
        tokenizer = loaded_tokenizer
        _torch = torch

        print(f"Mentor model loaded successfully on device: {model.device}")



def _generate_response(code_snippet: str) -> str:
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": _format_user_message(code_snippet)},
    ]

    text = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True,
    )

    inputs = tokenizer(text, return_tensors="pt").to(model.device)

    with _torch.no_grad():
        output_ids = model.generate(
            **inputs,
            max_new_tokens=MAX_NEW_TOKENS,
            temperature=TEMPERATURE,
            do_sample=True,
            repetition_penalty=REPETITION_PENALTY,
            pad_token_id=tokenizer.eos_token_id,
        )

    new_tokens = output_ids[0][inputs["input_ids"].shape[1]:]
    response = tokenizer.decode(new_tokens, skip_special_tokens=True).strip()

    return response or "Не удалось сгенерировать подсказку."


async def get_llm_hint(code_snippet: str) -> str:
    if not code_snippet or not code_snippet.strip():
        return "Пришли свой код, и я помогу разобраться."

    try:
        await load_model()
        async with _model_lock:
            return _generate_response(code_snippet)
    except Exception as exc:
        return f"Ошибка генерации подсказки: {exc}"