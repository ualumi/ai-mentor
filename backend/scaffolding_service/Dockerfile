#FROM python:3.11-slim

#ENV PYTHONUNBUFFERED=1

#WORKDIR /app

#RUN apt-get update && apt-get install -y \
#    build-essential \
#    && rm -rf /var/lib/apt/lists/*

#COPY requirements.txt .
#RUN pip install --no-cache-dir -r requirements.txt

#COPY app ./app

#EXPOSE 8000
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN apt-get update && apt-get install -y \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN python - <<'PY'
from pathlib import Path

src = Path("requirements.txt").read_text(encoding="utf-8").splitlines()
filtered = [line for line in src if not line.strip().startswith("torch")]
Path("requirements.no_torch.txt").write_text("\n".join(filtered) + "\n", encoding="utf-8")
PY

RUN pip install \
    --no-cache-dir \
    --default-timeout=600 \
    torch==2.4.1 torchvision==0.19.1 torchaudio==2.4.1 \
    --index-url https://download.pytorch.org/whl/cu121

RUN pip install \
    --no-cache-dir \
    --default-timeout=600 \
    -r requirements.no_torch.txt

COPY . .

ENV PYTHONUNBUFFERED=1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
