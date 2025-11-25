'''import requests

BASE_URL = "http://localhost:8002"

r = requests.post(
    f"{BASE_URL}/auth/register",
    json={
        "username": "test_user",
        "email": "test_user@example.com",
        "password": "123456"
    },
)
print("Статус:", r.status_code)
print("Ответ как текст:", r.text)
print("JSON:", r.json())


import httpx

url = "http://localhost:8002/auth/login"  
data = {
    "email": "test_user@example.com",  
    "password": "123456"     
}

response = httpx.post(url, json=data)
print("Статус:", response.status_code)
print("Ответ JSON:", response.json())'''
import requests
import httpx

r = requests.post(
    "http://localhost:8002/auth/register",
    json={
        "username": "test_user",
        "email": "test_user@example.com",
        "password": "123456"
    },
)
print(r.status_code, r.text)

response = httpx.post(
    "http://localhost:8002/auth/login",
    json={
        "email": "test_user@example.com",
        "password": "123456"
    }
)
print(response.status_code, response.json())