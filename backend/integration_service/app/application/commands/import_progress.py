'''from app.application.services.external_client import ExternalClient
from app.infrastructure.event_bus import EventBus
from app.infrastructure.db import get_external_identity, get_external_identity_by_internal

client = ExternalClient()

async def import_progress(user_id: int):

    identity = await get_external_identity_by_internal(user_id)

    if not identity:
        return {"status": "no_external_account"}

    external_user_id = identity["external_user_id"]
    
    progress = await client.get_user_progress(external_user_id)

    # 🔥 извлекаем навыки (упрощенная логика)
    skills = extract_skills(progress)

    await EventBus.publish(
        "integration.events",
        {
            "event": "external_progress_imported",
            "user_id": user_id,
            "skills": skills
        }
    )

    return {
        "status": "imported",
        "skills": skills
    }'''

from app.application.services.external_client import ExternalClient 
from app.infrastructure.event_bus import EventBus
from app.infrastructure.db import get_external_identity_by_internal

# 🔹 временный мок
'''def mock_external_progress():
    return [
        {
            "user": {
                "id": 42,
                "email": "user@example.com",
                "username": "student42"
            },
            "cases": [
                {
                    "case_id": 7,
                    "title": "Сумма двух чисел",
                    "description": "Даны два числа, выведите их сумму.",
                    "attempts_count": 2,
                    "submissions": [
                        {"submission_id": 101, "language": "python", "code": "print(1+2)", "verdict": "wrong_answer"},
                        {"submission_id": 102, "language": "python", "code": "print(2+2)", "verdict": "accepted"}
                    ]
                }
            ],
            "lectures": [],
            "quizzes": [],
            "exams": []
        }
    ]'''

def mock_external_progress():
    return [
        {
            "user": {
                "id": 42,
                "email": "user@example.com",
                "username": "student42"
            },
            "cases": [
                {
                    "case_id": 7,
                    "title": "Сумма двух чисел",
                    "attempts_count": 2,
                    "submissions": [
                        {"submission_id": 101, "verdict": "wrong_answer"},
                        {"submission_id": 102, "verdict": "accepted"}
                    ]
                },
                {
                    "case_id": 8,
                    "title": "Циклы в Python",
                    "attempts_count": 3,
                    "submissions": [
                        {"submission_id": 103, "verdict": "wrong_answer"},
                        {"submission_id": 104, "verdict": "wrong_answer"}
                    ]
                }
            ],
            "lectures": [
                {"lecture_id": 1, "title": "Введение в Python", "progress_status": "completed"},
                {"lecture_id": 2, "title": "Циклы", "progress_status": "in_progress"}
            ],
            "quizzes": [
                {"lecture_id": 2, "best_score": 2, "max_score": 5}
            ],
            "exams": [
                {"exam_id": 1, "score": 50, "max_score": 100, "status": "finished"}
            ]
        }
    ]


client = ExternalClient()

'''async def import_progress(user_id: int):

    identity = await get_external_identity_by_internal(user_id)

    if not identity:
        return {"status": "no_external_account"}

    external_user_id = identity["external_user_id"]
    
    # 🔹 вместо реального запроса подставляем мок
    progress = await client.get_user_progress(external_user_id)
    #progress = mock_external_progress()  # <-- вот здесь подменяем

    # 🔥 извлекаем навыки (упрощенная логика)
    skills = extract_skills(progress)

    await EventBus.publish(
        "integration.events",
        {
            "event": "external_progress_imported",
            "user_id": user_id,
            "skills": skills
        }
    )

    return {
        "status": "imported",
        "skills": skills
    }'''

async def import_progress(email: str):

    '''identity = await get_external_identity_by_internal(user_id)

    if not identity:
        return {"status": "no_external_account"}

    external_user_id = identity["external_user_id"]'''
    
    # 🔹 вместо реального запроса подставляем мок
    #progress = await client.get_user_progress(email)
    progress = mock_external_progress()  # <-- вот здесь подменяем

    # 🔥 извлекаем навыки (упрощенная логика)
    skills = extract_skills(progress)

    await EventBus.publish(
        "integration.events",
        {
            "event": "external_progress_imported",
            "email": email,
            "skills": skills
        }
    )

    return {
        "status": "imported",
        "skills": skills
    }


def extract_skills(progress_data):
    skills = {}

    for user in progress_data:
        # Задачи
        '''for case in user.get("cases", []):
            title = case.get("title", "unknown")
            success = any(sub.get("verdict") == "accepted" for sub in case.get("submissions", []))
            attempts = case.get("attempts_count", 0)

            # Логика слабости: если есть правильное решение → 1.0, если нет → по числу попыток
            if success:
                skills[title] = 1.0
            elif attempts > 0:
                skills[title] = max(0.3, 1.0 - 0.2 * attempts)
            else:
                skills[title] = 0.0'''

        # Лекции
        for lecture in user.get("lectures", []):
            title = lecture.get("title", "unknown lecture")
            status = lecture.get("progress_status", "not_started")
            if status == "completed":
                skills[title] = 1.0
            elif status == "in_progress":
                skills[title] = 0.5
            else:
                skills[title] = 0.0

        # Квизы
        '''for quiz in user.get("quizzes", []):
            lecture_id = quiz.get("lecture_id")
            best_score = quiz.get("best_score", 0)
            max_score = quiz.get("max_score", 1)
            score_ratio = best_score / max_score
            skills[f"quiz_{lecture_id}"] = score_ratio

        # Экзамены
        for exam in user.get("exams", []):
            exam_id = exam.get("exam_id")
            score = exam.get("score", 0)
            max_score = exam.get("max_score", 1)
            score_ratio = score / max_score
            skills[f"exam_{exam_id}"] = score_ratio'''

    return skills

'''def extract_skills(progress_data):
    """
    Очень простая логика:
    - если задача решена → +1 к навыку
    """

    skills = {}

    for user in progress_data:
        for case in user.get("cases", []):
            title = case.get("title", "unknown")

            success = any(
                sub.get("verdict") == "accepted"
                for sub in case.get("submissions", [])
            )

            skills[title] = 1.0 if success else 0.3

    return skills'''