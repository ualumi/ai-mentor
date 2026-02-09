# Базовый образ Python
FROM python:3.11-slim

# Рабочая директория
WORKDIR /app

# Копируем зависимости
COPY requirements.txt .

# Устанавливаем зависимости
RUN pip install --no-cache-dir -r requirements.txt

RUN apt-get update && apt-get install -y build-essential libffi-dev python3-dev gcc && \
    rm -rf /var/lib/apt/lists/*
RUN apt-get update && apt-get install -y netcat-traditional

# Копируем весь код
COPY . .

#CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8009"]
# По умолчанию uvicorn будет запускаться из docker-compose
CMD bash -c "until nc -z db 5432; do echo '⏳ Ждём Postgres...'; sleep 2; done; echo '✅ Postgres готов!'; uvicorn app.main:app --host 0.0.0.0 --port 8009"