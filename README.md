# ai-mentor

## Запуск:
### backend
   ```bash
   cd backend
   docker compose build
   docker compose up
   ```
### frontend
   ```bash
   cd frontend
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install nodejs
   npm i
   npm run dev
   ```

## Структура проекта

```bash
mlops-flight-delay/
│
├── data/                
│   └── raw/             # исходные данные (через DVC)
│
├── models/              # сохранённые модели
├── reports/             # отчёты (метрики, графики)
│
├── src/
│   ├── preprocess.py    # очистка и подготовка данных
│   ├── train.py         # обучение модели
│   ├── evaluate.py      # оценка модели
│   ├── predict.py       # скрипт для инференса
│   ├── api.py           # REST API (FastAPI)
│   └── utils.py         # вспомогательные функции
│
├── tests/               # unit-тесты
│   └── test_dummy.py
│
├── .gitignore
├── requirements.txt
├── dvc.yaml
├── Dockerfile
└── README.md
