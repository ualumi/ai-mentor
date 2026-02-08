FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

#RUN pip install \
#    --default-timeout=600 \
#    torch==2.1.0+cpu \
#    -f https://download.pytorch.org/whl/torch_stable.html

COPY . .

ENV PYTHONUNBUFFERED=1 \
    REDIS_HOST=redis \
    REDIS_PORT=6379 \
    REDIS_DB=0

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8007"]

#FROM python:3.11-slim

#WORKDIR /app

#COPY requirements.txt .

# 1️⃣ Сначала ставим все обычные зависимости
#RUN pip install \
#    --default-timeout=600 \
#    --no-cache-dir \
#    -r requirements.txt

# 2️⃣ Потом ставим torch (через официальный CDN)
#RUN pip install \
#    --default-timeout=600 \
#    torch==2.2.2+cpu \
#    --index-url https://download.pytorch.org/whl/cpu

#COPY . .

# Задаем папку кэша внутри контейнера, например /app/models
#RUN python -c "from transformers import AutoTokenizer, AutoModelForSequenceClassification; \
#AutoTokenizer.from_pretrained('Vilyam888/Code_analyze.1.0', cache_dir='/app/models'); \
#AutoModelForSequenceClassification.from_pretrained('Vilyam888/Code_analyze.1.0', cache_dir='/app/models')"

#ENV PYTHONUNBUFFERED=1 \
#    REDIS_HOST=redis \
#    REDIS_PORT=6379 \
#    REDIS_DB=0

#CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8007"]





#FROM python:3.11-slim

#ENV PYTHONDONTWRITEBYTECODE=1 \
#    PYTHONUNBUFFERED=1 \
#    PIP_NO_CACHE_DIR=1 \
#    PIP_DISABLE_PIP_VERSION_CHECK=1 \
#    PIP_DEFAULT_TIMEOUT=600

#WORKDIR /app

# системные зависимости (важно для torch/transformers)
#RUN apt-get update && apt-get install -y \
#    git \
#    build-essential \
#    && rm -rf /var/lib/apt/lists/*

#COPY requirements.txt .

# pip сначала обновляем
#RUN pip install --upgrade pip setuptools wheel

# обычные зависимости
#RUN pip install -r requirements.txt

# torch отдельно и явно
#RUN pip install \
#    torch==2.4.0+cpu \
#    --index-url https://download.pytorch.org/whl/cpu

#COPY . .

#ENV REDIS_HOST=redis \
#    REDIS_PORT=6379 \
#    REDIS_DB=0

#CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8007"]



#FROM python:3.11-slim

#WORKDIR /app

#COPY requirements.txt .

# 1️⃣ Системные зависимости (ОБЯЗАТЕЛЬНО для torch + transformers)
#RUN apt-get update && apt-get install -y \
#    git \
#    build-essential \
#    && rm -rf /var/lib/apt/lists/*

# 2️⃣ Python зависимости (БЕЗ torch)
#RUN pip install \
#    --no-cache-dir \
#    --default-timeout=600 \
#    -r requirements.txt

# 3️⃣ СТРОГО CPU-версия PyTorch
#RUN pip install \
#    --no-cache-dir \
#    --default-timeout=600 \
#    torch==2.4.0+cpu \
#    --index-url https://download.pytorch.org/whl/cpu

#COPY . .

#ENV PYTHONUNBUFFERED=1

#CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8007"]
