FROM python:3.11-slim

# Системные зависимости (минимум)
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Установка зависимостей
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем код
COPY app ./app

# Запуск сервиса
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8004"]
