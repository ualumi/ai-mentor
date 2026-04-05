FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONUNBUFFERED=1 \
    REDIS_HOST=redis \
    REDIS_PORT=6379 \
    REDIS_DB=0

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8006"]