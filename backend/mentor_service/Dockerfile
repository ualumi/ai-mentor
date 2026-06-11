FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN apt-get update && apt-get install -y \
    git \
    build-essential \
    gcc \
    g++ \
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

#RUN pip install torch==2.1.2 torchvision==0.16.2 torchaudio==2.1.2 \
#    --index-url https://download.pytorch.org/whl/cu118

#RUN pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu128

RUN pip install \
    --no-cache-dir \
    --default-timeout=600 \
    -r requirements.no_torch.txt

COPY . .

ENV PYTHONUNBUFFERED=1 \
    REDIS_HOST=redis \
    REDIS_PORT=6379 \
    REDIS_DB=0

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8006"]
