import requests

token = input("Введите JWT токен: ")

headers = {
    "Authorization": f"Bearer {token}"
}

r = requests.post(
    "http://learning_service:8001/learning/start",
    json={
        "competency": "ml_basic",
        "methodology": "scaffolding"
    },
    headers=headers
)

print(r.status_code, r.json())
