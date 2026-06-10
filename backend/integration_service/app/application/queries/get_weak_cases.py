from app.infrastructure.db import get_external_identity_by_internal
from app.application.services.external_client import ExternalClient

client = ExternalClient()


# 🔹 временно используем тот же mock
def mock_external_progress():
    return [
{
"user": {
"id": 42,
"email": "user@example.com",
"username": "student42",
"is_active": True,
"created_at": "2026-01-15T10:12:03.123456",
"updated_at": "2026-02-02T17:41:00.000000"
},
"cases": [
{
    "case_id": 7,
    "title": "Сумма двух чисел",
    "description": "Даны два числа, выведите их сумму.",
    "attempts_count": 4,
    "last_submission_at": "2026-02-02T17:40:10.000000",
    "submissions": [
    {
        "submission_id": 101,
        "language": "python",
        "code": "a, b = map(int, input().split())\nprint(a + b)",
        "verdict": "wrong_answer",
        "total_time_ms": 12,
        "created_at": "2026-02-02T17:35:10.000000",
        "tests": [
            {
            "test_case_id": 9001,
            "status": "failed",
            "time_ms": 5,
            "actual_text": "3",
            "passed": False
            },
        ]
    },
    {
        "submission_id": 102,
        "language": "python",
        "code": "a, b = map(int, input().split())\nprint(a + b)",
        "verdict": "accepted",
        "total_time_ms": 9,
        "created_at": "2026-02-02T17:40:10.000000",
        "tests": [
            {
            "test_case_id": 9001,
            "status": "passed",
            "time_ms": 3,
            "actual_text": "4",
            "passed": True
            }
        ]
    },
    
]
},
{
    "case_id": 8,
    "title": "Сумма nht[] чисел",
    "description": "Даны два числа, выведите их сумму.",
    "attempts_count": 4,
    "last_submission_at": "2026-02-02T17:40:10.000000",
    "submissions": [
    {
        "submission_id": 101,
        "language": "python",
        "code": "a, b = map(int, input().split())\nprint(a + b)",
        "verdict": "wrong_answer",
        "total_time_ms": 12,
        "created_at": "2026-02-02T17:35:10.000000",
        "tests": [
            {
            "test_case_id": 9001,
            "status": "failed",
            "time_ms": 5,
            "actual_text": "3",
            "passed": False
            },
        ]
    },
    {
        "submission_id": 102,
        "language": "python",
        "code": "a, b = map(int, input().split())\nprint(a + b)",
        "verdict": "accepted",
        "total_time_ms": 9,
        "created_at": "2026-02-02T17:40:10.000000",
        "tests": [
            {
            "test_case_id": 9001,
            "status": "passed",
            "time_ms": 3,
            "actual_text": "4",
            "passed": False
            }
        ]
    },
    
]
},
{
    "case_id": 9,
    "title": "Сумма 4 чисел",
    "description": "Даны два числа, выведите их сумму.",
    "attempts_count": 4,
    "last_submission_at": "2026-02-02T17:40:10.000000",
    "submissions": [
    {
        "submission_id": 101,
        "language": "python",
        "code": "a, b = map(int, input().split())\nprint(a + b)",
        "verdict": "wrong_answer",
        "total_time_ms": 12,
        "created_at": "2026-02-02T17:35:10.000000",
        "tests": [
            {
            "test_case_id": 9001,
            "status": "failed",
            "time_ms": 5,
            "actual_text": "3",
            "passed": False
            },
        ]
    },
    {
        "submission_id": 102,
        "language": "python",
        "code": "a, b = map(int, input().split())\nprint(a + b)",
        "verdict": "wrong_answer",
        "total_time_ms": 9,
        "created_at": "2026-02-02T17:40:10.000000",
        "tests": [
            {
            "test_case_id": 9001,
            "status": "passed",
            "time_ms": 3,
            "actual_text": "4",
            "passed": False
            }
        ]
    },
    
]
},
{
    "case_id": 10,
    "title": "Сумма 2 чисел",
    "description": "Даны два числа, выведите их сумму.",
    "attempts_count": 4,
    "last_submission_at": "2026-02-02T17:40:10.000000",
    "submissions": [
    {
        "submission_id": 101,
        "language": "python",
        "code": "a, b = map(int, input().split())\nprint(a + b)",
        "verdict": "wrong_answer",
        "total_time_ms": 12,
        "created_at": "2026-02-02T17:35:10.000000",
        "tests": [
            {
            "test_case_id": 9001,
            "status": "failed",
            "time_ms": 5,
            "actual_text": "3",
            "passed": False
            },
        ]
    },
    {
        "submission_id": 102,
        "language": "python",
        "code": "a, b = map(int, input().split())\nprint(a + b)",
        "verdict": "wrong_answer",
        "total_time_ms": 9,
        "created_at": "2026-02-02T17:40:10.000000",
        "tests": [
            {
            "test_case_id": 9001,
            "status": "passed",
            "time_ms": 3,
            "actual_text": "4",
            "passed": False
            }
        ]
    },
    
]
}
],
"lectures": [
{
"lecture_id": 3,
"slug": "intro-python",
"title": "Введение в Python",
"progress_status": "completed",
"completed_at": "2026-02-01T12:00:00.000000",
"updated_at": "2026-02-01T12:00:00.000000"
}
],
"quizzes": [
{
"lecture_id": 3,
"attempts_used": 1,
"attempts_left": 1,
"best_score": 4,
"max_score": 5,
"last_attempt_at": "2026-02-01T12:05:00.000000"
}
],
"exams": [
{
"exam_id": 11,
"name": "Экзамен №1",
"attempts_used": 1,
"attempts_left": 1,
"last_attempt_at": "2026-02-02T10:00:00.000000",
"attempts": [
{
"attempt_id": 555,
"attempt_number": 1,
"status": "finished",
"score": 80,
"max_score": 100,
"started_at": "2026-02-02T10:00:00.000000",
"finished_at": "2026-02-02T11:00:00.000000"
}
]
}
]
}
]  # можешь переиспользовать свой мок


async def get_weak_cases(email: str):
    '''identity = await get_external_identity_by_internal(email)

    if not identity:
        return {"status": "no_external_account"}

    external_user_id = identity["external_user_id"]'''

    # 🔹 либо реальный вызов:
    #progress = await client.get_user_progress(email)

    # 🔹 пока мок:
    progress = mock_external_progress()

    weak_cases = extract_weak_cases(progress)

    return {
        "status": "ok",
        "weak_cases": weak_cases
    }


def extract_weak_cases(progress_data):
    weak_cases = []

    for user in progress_data:
        for case in user.get("cases", []):
            title = case.get("title")
            attempts = case.get("attempts_count", 0)
            submissions = case.get("submissions", [])
            description = case.get("description", "")
            accepted = any(sub.get("verdict") == "accepted" for sub in submissions)

            # 🔥 критерии "слабости"
            if not accepted:
                weak_cases.append({
                    "title": title,
                    "description": description,
                    "reason": "no_success",
                    "attempts": attempts,
                    "last_code": submissions[-1]["code"] if submissions else None
                })

            elif attempts >= 2:
                weak_cases.append({
                    "title": title,
                    "reason": "too_many_attempts",
                    "description": description,
                    "attempts": attempts,
                    "last_code": submissions[-1]["code"]
                })

    return weak_cases