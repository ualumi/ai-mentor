import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

MODEL_PATH = "Vilyam888/Broken_Code_Generation.1.0"

tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, trust_remote_code=True)

if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

tokenizer.padding_side = "left"

model = AutoModelForCausalLM.from_pretrained(
    MODEL_PATH,
    torch_dtype=torch.bfloat16 if torch.cuda.is_available() and torch.cuda.is_bf16_supported()
    else (torch.float16 if torch.cuda.is_available() else torch.float32),
    device_map="auto",
    trust_remote_code=True,
)

model.eval()