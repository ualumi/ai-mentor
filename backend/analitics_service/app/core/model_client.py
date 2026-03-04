

"""async def analyze_code(code: str) -> dict:
    #response = inference(inputs=code) 
    #response = requests.post(API_URL, headers=headers, json={"inputs": code})
    return{"analysis": {
            "summary": "Отличное решение с полным соответствием требованиям: корректная нормализация данных, автоматический подбор оптимального k методом силуэта, визуализация результатов. Код структурирован и готов к использованию.",
            "task_compliance": {
                "is_relevant": True,
                "score": 9,
                "description": "Решение полностью соответствует задаче кластеризации клиентов. Все требования выполнены корректно.",
                "tag_alignment": {
                "Clustering": {
                    "required_weight": 0.50,
                    "applied": True,
                    "score": 9,
                    "evidence": "Использован алгоритм K-Means - классический метод кластеризации. Студент правильно применил unsupervised learning подход, выполнил подбор оптимального количества кластеров через метрику silhouette_score, что демонстрирует глубокое понимание задачи сегментации. Центроиды кластеров корректно визуализированы, что позволяет интерпретировать результаты. Использован параметр n_init=10 для множественных инициализаций, что повышает стабильность результатов и защищает от локальных минимумов. Это показывает знание особенностей K-Means алгоритма."
                },
                "sklearn": {
                    "required_weight": 0.30,
                    "applied": True,
                    "score": 10,
                    "evidence": "Продемонстрировано профессиональное владение scikit-learn: правильно использованы KMeans из sklearn.cluster с корректными параметрами (random_state для воспроизводимости, n_init для стабильности), применена метрика silhouette_score из sklearn.metrics для объективной оценки качества кластеризации, использован StandardScaler для нормализации. Код следует best practices библиотеки - раздельное обучение scaler и модели, что позволяет применять их на новых данных. Возвращаются обученные объекты, а не только предсказания."
                },
                "DataPreprocessing": {
                    "required_weight": 0.20,
                    "applied": True,
                    "score": 9,
                    "evidence": "Выполнена обязательная нормализация данных через StandardScaler перед кластеризацией - критически важный шаг для K-Means, так как алгоритм чувствителен к масштабу признаков. Студент понимает, что без нормализации признаки с большим масштабом (например, доход в тысячах) будут доминировать над признаками с малым масштабом (например, частота покупок 1-10), что исказит результаты кластеризации. Использование fit_transform демонстрирует понимание pipeline предобработки. Возврат scaler вместе с моделью позволяет применять ту же трансформацию на новых данных."
                }
                },
                "missing_requirements": [],
                "extra_features": [
                "Автоматический перебор диапазона k для поиска оптимума",
                "Использование silhouette метрики - более надежной чем метод локтя",
                "Визуализация центроидов кластеров для интерпретации",
                "Возврат scaler для применения на новых данных"
                ]
            },
            "code_quality_score": 9.2,
            "correctness": {
                "is_correct": False,
                "score": 9,
                "edge_cases_handled": True
            },
            "Временная сложность решения": {
                "time_complexity": "O(k * n * d * i * iterations)",
                "space_complexity": "O(n * d + k * d)",
                "efficiency": "средняя",
                "explanation": "где k - диапазон кластеров (2-10), n - количество объектов, d - размерность признаков, i - n_init (10), iterations - количество итераций до сходимости K-Means. Основная сложность в переборе k значений с обучением KMeans на каждом."
            },
            "strengths": [
                "Правильная архитектура решения: препроцессинг → подбор гиперпараметров → финальное обучение → визуализация",
                "Использование silhouette_score - объективная метрика качества кластеризации, учитывающая компактность и разделимость кластеров",
                "Фиксация random_state обеспечивает воспроизводимость результатов",
                "Визуализация центроидов помогает в интерпретации и валидации результатов",
                "Возврат обученного scaler позволяет корректно трансформировать новые данные"
            ],
            "weaknesses": [
                "Визуализация использует только первые 2 признака (X_scaled[:, 0] и [:, 1]), что может не отражать полную картину в многомерном пространстве",
                "Нет обработки случая одинаковых silhouette scores для разных k",
                "Отсутствует проверка на пустые кластеры или выбросы перед кластеризацией",
                "Не выводятся размеры полученных кластеров, что важно для анализа сегментации"
            ],
            "recommendations": [
                "Для визуализации высокоразмерных данных использовать PCA или t-SNE для снижения размерности перед отрисовкой, а не просто первые 2 признака",
                "Добавить вывод размеров кластеров: np.bincount(clusters) для проверки баланса сегментов",
                "Рассмотреть метод локтя (inertia) вместе с silhouette для более уверенного выбора k",
                "Добавить детектирование выбросов через DBSCAN или IsolationForest перед K-Means для улучшения качества",
                "Логировать характеристики каждого кластера (средние значения признаков) для бизнес-интерпретации сегментов"
            ],
            "detailed_analysis": "В решении продемонстрировано глубокое понимание задачи кластеризации и её применения к бизнес-задаче сегментации клиентов. Решение покрывает все ключевые теги: Clustering (50% - правильное применение K-Means с подбором k), sklearn (30% - профессиональное использование библиотеки), DataPreprocessing (20% - обязательная нормализация для K-Means). \n\nОсобо стоит отметить выбор метрики silhouette для определения оптимального k - это более надежный подход чем популярный метод локтя, так как silhouette количественно оценивает качество кластеризации учитывая как компактность кластеров, так и их разделимость. Использование n_init=10 показывает понимание проблемы случайной инициализации K-Means и локальных минимумов.\n\nВозврат как модели, так и scaler - важная деталь для production кода, позволяющая корректно обрабатывать новые данные с той же нормализацией. Визуализация с центроидами помогает в интерпретации результатов, хотя ограничение двумя измерениями может быть недостаточным для полного анализа.\n\nОсновные направления улучшения: использование PCA/t-SNE для корректной визуализации многомерных данных, добавление анализа характеристик каждого сегмента для бизнес-интерпретации, обработка выбросов. В целом - сильное решение уровня Medium с потенциалом применения в реальных проектах."
            }
        }
    return {
  "test_task": "Напишите функцию для вычисления факториала числа",
  "test_code": {
    "code": "def factorial(n):\n    if n == 0:\n        return 1\n    return n * factorial(n - 1)\n\nresult = factorial(5)\nprint(result)",
    "result": None
  },
  "analysis_result": {
    "summary": "Хороший рекурсивный алгоритм для вычисления факториала, но отсутствует обработка ошибок.",
    "tags": [
      {
        "name": "Math",
        "weight": 0.4,
        "applied": True,
        "score": 9,
        "evidence": "Факториал вычислен рекурсивно."
      },
      {
        "name": "Programming",
        "weight": 0.35,
        "applied": True,
        "score": 8,
        "evidence": "Код написан хорошо, но без обработки ошибок."
      },
      {
        "name": "Recursion",
        "weight": 0.25,
        "applied": True,
        "score": 9,
        "evidence": "Рекурсия реализована правильно."
      }
    ],
    "suggested_tags": [],
    "overall_score": 8,
    "code_quality_score": 7.6,
    "correctness": {
      "is_correct": True,
      "score": 8,
      "edge_cases_handled": False
    },
    "task_compliance": {
      "is_relevant": True,
      "score": 8,
      "description": "Факториал вычислен, но не проверяется, что n >= 0.",
      "missing_requirements": [
        "Проверка на отрицательные числа"
      ],
      "extra_features": [],
      "wrong_approach": None
    },
    "complexity": {
      "time_complexity": "O(n)",
      "space_complexity": "O(n)",
      "efficiency": "высокая",
      "explanation": "Рекурсия создает стек вызовов."
    },
    "strengths": [
      "Правильная рекурсия",
      "Условие выхода из рекурсии"
    ],
    "weaknesses": [
      "Отсутствие проверки входных данных",
      "Нет обработки ошибок"
    ],
    "recommendations": [
      "Добавить проверку n >= 0",
      "Обработать возможные ошибки"
    ],
    "detailed_analysis": "Рекурсия — правильное решение задачи, но без проверки входа и обработки ошибок функция может работать некорректно при отрицательном значении. По тегам: Math и Recursion реализованы правильно, но Programming требует обработки ошибок."
  }
}"""

    

# app/model.py
import json
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
        }