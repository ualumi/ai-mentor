#FROM python:3.11-slim

#WORKDIR /app

#COPY requirements.txt .
#RUN pip install --no-cache-dir -r requirements.txt

#COPY . .

#CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8002"]

# В Dockerfile user_service
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Установим утилиту для ожидания

# Устанавливаем зависимости для сборки bcrypt
RUN apt-get update && apt-get install -y build-essential libffi-dev python3-dev gcc && \
    rm -rf /var/lib/apt/lists/*
RUN apt-get update && apt-get install -y netcat-traditional

COPY . .

# Сначала ждём, пока БД будет доступна
CMD bash -c "until nc -z db 5432; do echo '⏳ Ждём Postgres...'; sleep 2; done; echo '✅ Postgres готов!'; uvicorn app.main:app --host 0.0.0.0 --port 8002"
