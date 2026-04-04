FROM python:3.11-slim

# Отключаем буферизацию логов
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Системные зависимости (минимум)
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Python зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем код
COPY app ./app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8012"]