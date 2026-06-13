import asyncio
import os

MODEL_NAME = os.getenv("MENTOR_MODEL_ID", "disemenova/qwen2.5-7b-ai-mentor")
MAX_SEQ_LENGTH = int(os.getenv("MENTOR_MAX_SEQ_LENGTH", "1024"))
MAX_NEW_TOKENS = int(os.getenv("MENTOR_MAX_NEW_TOKENS", "256"))
TEMPERATURE = float(os.getenv("MENTOR_TEMPERATURE", "0.7"))
REPETITION_PENALTY = float(os.getenv("MENTOR_REPETITION_PENALTY", "1.1"))
LOAD_IN_4BIT = os.getenv("MENTOR_LOAD_IN_4BIT", "true").lower() == "true"
FALLBACK_WITHOUT_4BIT = os.getenv("MENTOR_FALLBACK_WITHOUT_4BIT", "true").lower() == "true"

SYSTEM_PROMPT = (
    "Ты - ИИ-ментор для обучения программированию. "
    "Ты никогда не пишешь код в ответах. "
    "Ты направляешь студента через наводящие вопросы и короткие подсказки. "
    "Всегда отвечай только на русском языке."
)

model = None
tokenizer = None
_torch = None
_inference_adapter = None
_model_lock = asyncio.Lock()
_load_lock = asyncio.Lock()


def _format_user_message(code_snippet: str, lang: str = "python") -> str:
    return f"```{lang}\n{code_snippet.strip()}\n```"


async def load_model() -> None:
    global model, tokenizer, _torch, _inference_adapter

    if model is not None and tokenizer is not None:
        return

    async with _load_lock:
        if model is not None and tokenizer is not None:
            return

        try:
            import torch
        except Exception as exc:
            raise RuntimeError("Не удалось импортировать torch для mentor_service.") from exc

        if not torch.cuda.is_available():
            raise RuntimeError("CUDA недоступна для mentor_service.")

        print(f"Loading mentor model: {MODEL_NAME}")

        loaded_model = None
        loaded_tokenizer = None

        try:
            from unsloth import FastLanguageModel

            try:
                loaded_model, loaded_tokenizer = _load_fast_language_model(
                    FastLanguageModel,
                    torch,
                    load_in_4bit=LOAD_IN_4BIT,
                )
            except Exception as exc:
                if not (
                    LOAD_IN_4BIT
                    and FALLBACK_WITHOUT_4BIT
                    and _is_bitsandbytes_cuda_error(exc)
                ):
                    raise

                print(
                    "bitsandbytes/CUDA 4-bit load failed. "
                    "Retrying mentor model without 4-bit quantization..."
                )
                loaded_model, loaded_tokenizer = _load_fast_language_model(
                    FastLanguageModel,
                    torch,
                    load_in_4bit=False,
                )

            FastLanguageModel.for_inference(loaded_model)
            _inference_adapter = "unsloth"

        except Exception as exc:
            if not _is_bitsandbytes_cuda_error(exc):
                raise RuntimeError(
                    "Не удалось импортировать зависимости модели mentor_service."
                ) from exc

            print(
                "Unsloth/bitsandbytes import failed. "
                "Loading mentor model with transformers instead..."
            )
            loaded_model, loaded_tokenizer = _load_transformers_model(torch)
            _inference_adapter = "transformers"

        model = loaded_model
        tokenizer = loaded_tokenizer
        _torch = torch

        print(
            f"Mentor model loaded successfully on device: {model.device} "
            f"via {_inference_adapter}"
        )


def _load_fast_language_model(FastLanguageModel, torch, *, load_in_4bit: bool):
    return FastLanguageModel.from_pretrained(
        model_name=MODEL_NAME,
        max_seq_length=MAX_SEQ_LENGTH,
        dtype=torch.float16,
        load_in_4bit=load_in_4bit,
    )


def _load_transformers_model(torch):
    from transformers import AutoModelForCausalLM, AutoTokenizer

    loaded_tokenizer = AutoTokenizer.from_pretrained(
        MODEL_NAME,
        trust_remote_code=True,
    )
    loaded_model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME,
        torch_dtype=torch.float16,
        trust_remote_code=True,
    ).to("cuda:0")
    loaded_model.eval()

    return loaded_model, loaded_tokenizer


def _is_bitsandbytes_cuda_error(exc: Exception) -> bool:
    message = str(exc).lower()
    return (
        "bitsandbytes" in message
        or "libbitsandbytes" in message
        or "libnvjitlink" in message
        or "cuda setup error" in message
        or "cuda runtime libraries" in message
        or "compiled without gpu support" in message
    )


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
        if _is_bitsandbytes_cuda_error(exc):
            return (
                "Не удалось запустить 4-bit модель ментора из-за несовместимости "
                "bitsandbytes и CUDA runtime. Перезапустите mentor_service с "
                "MENTOR_LOAD_IN_4BIT=false или пересоберите образ с совместимой "
                "версией bitsandbytes."
            )

        return f"Ошибка генерации подсказки: {exc}"
