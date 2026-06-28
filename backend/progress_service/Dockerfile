# Базовый образ Python
#FROM python:3.11-slim

# Рабочая директория
#WORKDIR /app

# Копируем зависимости
#COPY requirements.txt .

# Устанавливаем зависимости
#RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь код
#COPY . .

#CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8008"]
# По умолчанию uvicorn будет запускаться из docker-compose

FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# CPU torch
#RUN pip install torch --index-url https://download.pytorch.org/whl/cpu

# PyG
#RUN pip install torch-geometric

# rest
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

ENV OMP_NUM_THREADS=1
ENV MKL_NUM_THREADS=1
ENV OPENBLAS_NUM_THREADS=1
ENV NUMEXPR_NUM_THREADS=1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8008"]