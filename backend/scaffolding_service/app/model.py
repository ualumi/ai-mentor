import torch
from transformers import AutoModelForCausalLM, AutoTokenizer


MODEL_PATH = "Vilyam888/Broken_Code_Generation.1.0"

model = None
tokenizer = None


def _model_dtype():
    if not torch.cuda.is_available():
        return torch.float32
    if torch.cuda.is_bf16_supported():
        return torch.bfloat16
    return torch.float16


def load_model():
    global model, tokenizer

    if model is not None and tokenizer is not None:
        return model, tokenizer

    print("Loading scaffolding model...")

    tokenizer = AutoTokenizer.from_pretrained(
        MODEL_PATH,
        trust_remote_code=True,
    )

    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    tokenizer.padding_side = "left"

    model = AutoModelForCausalLM.from_pretrained(
        MODEL_PATH,
        torch_dtype=_model_dtype(),
        device_map="auto",
        trust_remote_code=True,
    )

    model.eval()

    print("Scaffolding model loaded")
    return model, tokenizer


def get_model():
    if model is None or tokenizer is None:
        raise RuntimeError("Scaffolding model is not loaded")
    return model, tokenizer
