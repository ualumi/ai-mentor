import os
from pathlib import Path

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

DEFAULT_MODEL_ID = os.getenv(
    "BROKEN_CODE_MODEL_ID",
    "Vilyam888/Broken_Code_Generation.1.0",
)
LOCAL_MODEL_PATH = os.getenv("BROKEN_CODE_MODEL_PATH", "/models/broken-code")
OFFLINE_MODE = os.getenv("TRANSFORMERS_OFFLINE", "0").lower() in {"1", "true", "yes"}


def _has_local_model_files(path: str) -> bool:
    model_dir = Path(path)
    if not model_dir.is_dir():
        return False

    tokenizer_files = (
        "tokenizer_config.json",
        "tokenizer.json",
        "tokenizer.model",
        "vocab.json",
    )
    return (model_dir / "config.json").exists() and any(
        (model_dir / file_name).exists() for file_name in tokenizer_files
    )


def _resolve_model_source() -> tuple[str, bool]:
    if _has_local_model_files(LOCAL_MODEL_PATH):
        return LOCAL_MODEL_PATH, True

    if OFFLINE_MODE:
        raise RuntimeError(
            "Папка модели генерации сломанного кода недоступна или заполнена не полностью. "
            f"Ожидались локальные файлы по пути: {LOCAL_MODEL_PATH}"
        )

    print(
        "⚠️ Локальная модель генерации сломанного кода не найдена, переключаюсь на Hugging Face: "
        f"{DEFAULT_MODEL_ID}"
    )
    return DEFAULT_MODEL_ID, False


MODEL_PATH, USE_LOCAL_FILES = _resolve_model_source()

tokenizer = AutoTokenizer.from_pretrained(
    MODEL_PATH,
    trust_remote_code=True,
    local_files_only=USE_LOCAL_FILES or OFFLINE_MODE,
)

if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

tokenizer.padding_side = "left"

model = AutoModelForCausalLM.from_pretrained(
    MODEL_PATH,
    torch_dtype=torch.bfloat16 if torch.cuda.is_available() and torch.cuda.is_bf16_supported()
    else (torch.float16 if torch.cuda.is_available() else torch.float32),
    device_map="auto",
    trust_remote_code=True,
    local_files_only=USE_LOCAL_FILES or OFFLINE_MODE,
)

model.eval()