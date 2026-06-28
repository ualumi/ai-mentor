import json
import torch


def generate_bugfix_task(model, tokenizer, system_prompt: str, payload: dict):
    messages = [
        {"role": "system", "content": system_prompt},
        {
            "role": "user",
            "content": (
                "Сгенерируй ML bugfix задачу.\n"
                + json.dumps(payload, ensure_ascii=False, indent=2)
            ),
        },
    ]

    prompt = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True,
    )

    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    prompt_len = inputs["input_ids"].shape[1]

    with torch.no_grad():
        output = model.generate(
            **inputs,
            max_new_tokens=1200,
            temperature=0.7,
            top_p=0.95,
            do_sample=True,
            pad_token_id=tokenizer.pad_token_id,
            eos_token_id=tokenizer.eos_token_id,
        )

    result_tokens = output[0][prompt_len:]
    return tokenizer.decode(result_tokens, skip_special_tokens=True).strip()