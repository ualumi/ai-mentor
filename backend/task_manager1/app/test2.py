
import asyncio
import json
import uuid
import requests
import websockets

# -------------------------------
# Настройки сервисов
# -------------------------------
USER_SERVICE = "http://user_service:8002"
LEARNING_SERVICE = "http://learning_service:8001"


# -------------------------------
# 1️⃣ Регистрация и логин пользователя
# -------------------------------
email = f"test_{uuid.uuid4().hex[:6]}@example.com"
password = "password123"

r = requests.post(
    f"{USER_SERVICE}/auth/register",
    json={"email": email, "password": password, "username": email.split('@')[0]},
)
assert r.status_code in (200, 201)
user_id = r.json()["user_id"]
r = requests.post(
    f"{USER_SERVICE}/auth/login",
    json={"email": email, "password": password},
)
assert r.status_code == 200
token = r.json()["access_token"]

print(f"✅ User registered & logged in: {email}")

import asyncio
import websockets
import json
import random
f=random.randint(1, 10)

async def connect_to_websocket():
    async with websockets.connect(
        f"ws://localhost:8004/ws/tasks/{user_id}"
    ) as websocket:

        # 1️⃣ отправляем код (как run_code)
        await websocket.send(json.dumps({
            "event": "run_code",
            "code": "print(9/3)"
        }))

        # 2️⃣ запускаем выполнение
        await websocket.send(json.dumps({
            "event": "submit_code",
            "code":  "print(4/3)"
               }))

        # 3️⃣ слушаем ответы
        while True:
            try:
                # Ждем ответ максимум 5 секунд
                response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                print("⬅️", response)
            except asyncio.TimeoutError:
                print("⏰ Таймаут - новых ответов нет, закрываем соединение")
                break  # Выходим из цикла


asyncio.run(connect_to_websocket())

#test1
"def factorial(n):\n    if n == 0:\n        return 1\n    return n * factorial(n - 1)\n\nresult = factorial(5)\nprint(result)"
#test2
"import numpy as np\nimport matplotlib.pyplot as plt\nfrom sklearn.cluster import KMeans\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.metrics import silhouette_score\n\n\ndef cluster_customers(X, max_k=10):\n    scaler = StandardScaler()\n    X_scaled = scaler.fit_transform(X)\n    silhouette_scores = []\n    k_range = range(2, max_k + 1)\n    for k in k_range:\n        kmeans = KMeans(n_clusters=k, n_init=10, random_state=42)\n        labels = kmeans.fit_predict(X_scaled)\n        score = silhouette_score(X_scaled, labels)\n        silhouette_scores.append(score)\n    optimal_k = k_range[np.argmax(silhouette_scores)]\n    final_model = KMeans(n_clusters=optimal_k, n_init=10, random_state=42)\n    final_labels = final_model.fit_predict(X_scaled)\n    plt.figure(figsize=(10, 6))\n    colors = plt.cm.Set1(np.linspace(0, 1, optimal_k))\n    for i in range(optimal_k):\n        mask = final_labels == i\n        plt.scatter(\n            X_scaled[mask, 0],\n            X_scaled[mask, 1],\n            c=[colors[i]],\n            label=f\'Cluster {i}\',\n            alpha=0.6,\n            edgecolors=\'white\',\n            linewidth=0.5\n        )\n    plt.scatter(\n        final_model.cluster_centers_[:, 0],\n        final_model.cluster_centers_[:, 1],\n        c=\'red\',\n        marker=\'X\',\n        s=200,\n        linewidths=2,\n        edgecolors=\'black\',\n        label=\'Centroids\'\n    )\n    plt.xlabel(\'First feature (scaled)\')\n    plt.ylabel(\'Second feature (scaled)\')\n    plt.title(f\'Customer Clustering (k={optimal_k})\')\n    plt.legend()\n    plt.grid(True, alpha=0.3)\n    plt.show()\n    plt.figure(figsize=(10, 4))\n    plt.plot(k_range, silhouette_scores, \'bo-\')\n    plt.axvline(x=optimal_k, color=\'red\', linestyle=\'--\', label=f\'Optimal k={optimal_k}\')\n    plt.xlabel(\'Number of clusters (k)\')\n    plt.ylabel(\'Silhouette Score\')\n    plt.title(\'Silhouette Score for different k\')\n    plt.legend()\n    plt.grid(True, alpha=0.3)\n    plt.show()\n    print(f\"Optimal number of clusters: {optimal_k}\")\n    print(f\"Best silhouette score: {max(silhouette_scores):.3f}\")\n    return {\n        \'model\': final_model,\n        \'scaler\': scaler,\n        \'optimal_k\': optimal_k,\n        \'labels\': final_labels,\n        \'silhouette_scores\': silhouette_scores\n    }\n\n\nif __name__ == \"__main__\":\n    np.random.seed(42)\n    n_samples = 300\n    cluster1 = np.random.randn(100, 4) * 0.5 + [20, 30000, 2, 1]\n    cluster2 = np.random.randn(100, 4) * 0.8 + [35, 55000, 10, 5]\n    cluster3 = np.random.randn(100, 4) * 1.0 + [50, 80000, 25, 8]\n    X = np.vstack([cluster1, cluster2, cluster3])\n    result = cluster_customers(X, max_k=8)\n    print(\"Clustering completed successfully!\")\n    print(f\"Model type: {type(result[\'model\']).__name__}\")\n    print(f\"Scaler type: {type(result[\'scaler\']).__name__}\")"
#json={"competency": "Clustering", "methodology": "scaffolding"},

r = requests.post(
    f"{LEARNING_SERVICE}/learning/start",
    headers={"Authorization": f"Bearer {token}"},
    json={"competency": "Clustering"},
)
assert r.status_code == 200, f"Failed to start session: {r.status_code}, {r.text}"
print("Response from Learning Service:", r.status_code, r.text)

session_id = r.json()["session_id"]
print(f"🧩 session_id = {session_id}")

async def connect_to_websocket():
    async with websockets.connect(
        f"ws://localhost:8004/ws/tasks/{user_id}"
    ) as websocket:
        
        condition = await websocket.recv()
        print("📘", condition)

        # 1️⃣ отправляем код (как run_code)
        await websocket.send(json.dumps({
            "event": "run_code",
            "code": "print(9/3)"
        }))

        # 2️⃣ запускаем выполнение
        await websocket.send(json.dumps({
            "event": "submit_code",
            "code":  "print(4/3)"
               }))

        # 3️⃣ слушаем ответы
        while True:
            response = await websocket.recv()
            print("⬅️", response)


asyncio.run(connect_to_websocket())
