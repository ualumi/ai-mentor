#FROM python:3.11-slim

#WORKDIR /app

#COPY requirements.txt .

#RUN pip install \
#    --default-timeout=600 \
#    torch==2.1.0+cpu \
#    -f https://download.pytorch.org/whl/torch_stable.html

#COPY . .

#ENV PYTHONUNBUFFERED=1 \
#    REDIS_HOST=redis \
#    REDIS_PORT=6379 \
#    REDIS_DB=0

#CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8007"]

FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

# 1️⃣ Сначала ставим все обычные зависимости
RUN pip install \
    --default-timeout=600 \
    --no-cache-dir \
    -r requirements.txt

# 2️⃣ Потом ставим torch (через официальный CDN)
#RUN pip install \
#    --default-timeout=600 \
#    torch==2.2.2+cpu \
#    --index-url https://download.pytorch.org/whl/cpu

COPY . .

# Задаем папку кэша внутри контейнера, например /app/models
#RUN python -c "from transformers import AutoTokenizer, AutoModelForSequenceClassification; \
#AutoTokenizer.from_pretrained('Vilyam888/Code_analyze.1.0', cache_dir='/app/models'); \
#AutoModelForSequenceClassification.from_pretrained('Vilyam888/Code_analyze.1.0', cache_dir='/app/models')"

ENV PYTHONUNBUFFERED=1 \
    REDIS_HOST=redis \
    REDIS_PORT=6379 \
    REDIS_DB=0

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8007"]
