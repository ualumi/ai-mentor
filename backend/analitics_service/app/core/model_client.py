'''import os

async def get_llm_hint(code_snippet: str) -> str:
    """
    Пример подключения к LLM (асинхронный вызов)
    """
    try:
        return ["ответ модели", "модель не подключена"]
    except Exception as e:
        return f"Ошибка генерации подсказки: {e}"'''

'''from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

MODEL_NAME = "Vilyam888/Code_analyze.1.0"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)
model.eval()

LABELS = [
    "model_evaluation",
    "data_leakage",
    "overfitting",
    "cross_validation",
]'''
import requests
#API_URL = "https://router.huggingface.co/models/Vilyam888/Code_analyze.1.0"
#API_URL ="https://router.huggingface.co/models/Vilyam888/Code_analyze.1.0"
#headers = {"Authorization": f"Bearer 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"}
'''from huggingface_hub import InferenceClient
api_key = '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'

client = InferenceClient(
    model="Vilyam888/Code_analyze.1.0",
    token=api_key
)'''

async def analyze_code(code: str) -> dict:
    #response = inference(inputs=code) 
    #response = requests.post(API_URL, headers=headers, json={"inputs": code})
    '''result = client.post(
            json={"inputs": code}
        )
    return result'''
    return "hola"
    '''print(response.status_code)
    print(response.text)
    print(response.json())
    return response.json()'''
    '''inputs = tokenizer(
        code,
        return_tensors="pt",
        truncation=True,
        max_length=512
    )

    with torch.no_grad():
        outputs = model(**inputs)

    probs = torch.softmax(outputs.logits, dim=1)[0]

    competencies = {
        LABELS[i]: float(probs[i])
        for i in range(len(LABELS))
    }

    confidence = max(competencies.values())

    return {
        "competencies": competencies,
        "confidence": confidence
    }'''

