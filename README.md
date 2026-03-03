# ai-mentor
  annotation_service:
    build:
      context: ./annotation_service
    container_name: annotation_service
    ports:
      - "8011:8011"
    environment:
      REDIS_HOST: redis
      REDIS_PORT: 6379
    depends_on:
      - redis
    networks:
      - mentor-net
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
