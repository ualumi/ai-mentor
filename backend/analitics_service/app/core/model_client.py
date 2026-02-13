
#API_URL = "https://router.huggingface.co/models/Vilyam888/Code_analyze.1.0"
#API_URL ="https://router.huggingface.co/models/Vilyam888/Code_analyze.1.0"
#headers = {"Authorization": f"Bearer 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"}

async def analyze_code(code: str) -> dict:
    #response = inference(inputs=code) 
    #response = requests.post(API_URL, headers=headers, json={"inputs": code})
    return {
        "analysis": {
            "summary": "Отличное решение...",
            "task_compliance": {
            "is_relevant": True,
            "score": 9,
            "description": "Решение полностью соответствует задаче...",
            "tag_alignment": {
                "Clustering": {
                "required_weight": 0.50,
                "applied": True,
                "score": 9,
                "evidence": "Использован алгоритм K-Means..."
                },
                "sklearn": {
                "required_weight": 0.30,
                "applied": True,
                "score": 10,
                "evidence": "Продемонстрировано профессиональное владение..."
                },
                "DataPreprocessing": {
                "required_weight": 0.20,
                "applied": True,
                "score": 9,
                "evidence": "Выполнена обязательная нормализация данных..."
                }
            },
            "missing_requirements": [],
            "extra_features": [
                "Автоматический перебор диапазона k...",
                "Использование silhouette метрики...",
                "Визуализация центроидов кластеров...",
                "Возврат scaler для применения на новых данных"
            ]
            },
            "code_quality_score": 9.2,
            "correctness": {
            "is_correct": True,
            "score": 9,
            "edge_cases_handled": True
            },
            "Временная сложность решения": {
            "time_complexity": "O(k * n * d * i * iterations)",
            "space_complexity": "O(n * d + k * d)",
            "efficiency": "средняя",
            "explanation": "где k - диапазон кластеров (2-10)..."
            },
            "strengths": [
            "Правильная архитектура решения...",
            "Использование silhouette_score...",
            "Фиксация random_state обеспечивает воспроизводимость...",
            "Визуализация центроидов помогает...",
            "Возврат обученного scaler позволяет..."
            ],
            "weaknesses": [
            "Визуализация использует только первые 2 признака...",
            "Нет обработки случая одинаковых silhouette scores...",
            "Отсутствует проверка на пустые кластеры...",
            "Не выводятся размеры полученных кластеров..."
            ],
            "recommendations": [
            "Для визуализации высокоразмерных данных использовать PCA...",
            "Добавить вывод размеров кластеров...",
            "Рассмотреть метод локтя (inertia) вместе с silhouette...",
            "Добавить детектирование выбросов...",
            "Логировать характеристики каждого кластера..."
            ],
            "detailed_analysis": "В решении продемонстрировано глубокое понимание..."
        }
    }

# app/model.py
'''import json
import torch
import asyncio
from transformers import AutoModelForCausalLM, AutoTokenizer

MODEL_NAME = "Vilyam888/Code_analyze.1.0"

# ⬇️ ВРЕМЕННО: дефолтное условие задачи
DEFAULT_TASK = """
Напишите корректное и читаемое решение задачи.
Оцените корректность, стиль, возможные ошибки и улучшения.
"""

model = None
tokenizer = None
model_lock = asyncio.Lock()  # защита от параллельной генерации


def load_model():
    """Загружается ОДИН раз при старте сервиса"""
    global model, tokenizer

    if model is not None and tokenizer is not None:
        return

    print("🔄 Loading Code Analyzer model...")

    tokenizer = AutoTokenizer.from_pretrained(
        MODEL_NAME,
        use_fast=False,
        trust_remote_code=True
    )
    print("Tokenizer loaded")
    print("Model loading... ")
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME,
        torch_dtype=torch.bfloat16 if torch.cuda.is_available() else torch.float32,
        device_map="auto",
        trust_remote_code=True
    )

    model.eval()
    print("✅ Model loaded successfully")


def build_input(task: str, code: str) -> str:
    parts = []
    if task.strip():
        parts.append(f"Задача:\n{task.strip()}")
    if code.strip():
        parts.append(
            "Решение (код):\n```python\n"
            f"{code.strip()}\n```"
        )
    return "\n\n".join(parts)


#async def analyze_code(task: str | None, code: str) -> dict:
async def analyze_code(code: str, task=DEFAULT_TASK) -> dict:
    """
    Асинхронный анализ кода.
    Возвращает dict (JSON), готовый к отправке в Redis.
    """
    print("start generating")
    global model, tokenizer

    if model is None or tokenizer is None:
        raise RuntimeError("Model is not loaded")

    #task_text = task.strip() if task else DEFAULT_TASK
    task_text = DEFAULT_TASK
    if not code or not code.strip():
        return {
            "error": "Empty code"
        }

    prompt = (
        build_input(task_text, code)
        + "\n\nОтвет:\n"
    )

    async with model_lock:
        inputs = tokenizer(
            prompt,
            return_tensors="pt"
        ).to(model.device)

        print("🧠 Generating response...")
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=1024,
                temperature=0.7,
                top_p=0.8,
                top_k=20,
                repetition_penalty=1.05,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id,
            )
            print("✅ Generation finished")
    decoded = tokenizer.decode(
        outputs[0],
        skip_special_tokens=True
    )

    # 🔎 извлекаем JSON часть
    if "Ответ:" in decoded:
        decoded = decoded.split("Ответ:", 1)[-1].strip()

    try:
        print(json.loads(decoded))
        return json.loads(decoded)
    except json.JSONDecodeError:
        return {
            "raw_response": decoded
        }'''