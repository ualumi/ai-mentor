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

import asyncio
import json
from uuid import uuid4

from app.application.queries.get_weak_cases import get_weak_cases
from app.application.services.external_client import ExternalClient 
from app.infrastructure.event_bus import EventBus
from app.infrastructure.db import get_external_identity_by_internal
from app.infrastructure.redis import redis_client

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

async def import_progress_legacy(email: str):

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
        for case in user.get("cases", []):
            title = case.get("title", "unknown")
            success = any(sub.get("verdict") == "accepted" for sub in case.get("submissions", []))
            attempts = case.get("attempts_count", 0)

            # Логика слабости: если есть правильное решение → 1.0, если нет → по числу попыток
            if success:
                skills[title] = 1.0
            elif attempts > 0:
                skills[title] = max(0.3, 1.0 - 0.2 * attempts)
            else:
                skills[title] = 0.0

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


async def import_progress(email: str):
    user_id = _integration_user_id(email)
    weak_cases_result = await get_weak_cases(email)
    weak_cases = weak_cases_result.get("weak_cases", [])
    weak_cases_with_code = [
        case for case in weak_cases
        if case.get("last_code")
    ]

    if not weak_cases_with_code:
        return {
            "status": "no_weak_cases",
            "user_id": user_id,
            "weak_cases": weak_cases,
            "skills": {},
            "recommendations": [],
            "module_recommendations": [],
        }

    pubsub = redis_client.pubsub(ignore_subscribe_messages=True)
    await pubsub.subscribe(f"user_progress:{user_id}")

    try:
        import_request_id = str(uuid4())

        for index, case in enumerate(weak_cases_with_code):
            await _publish_analytics_request(
                user_id=user_id,
                case=case,
                import_request_id=import_request_id,
                index=index,
            )

        progress_payload = await _wait_for_recommendations(
            pubsub,
            expected_user_id=user_id,
        )
    finally:
        await pubsub.unsubscribe(f"user_progress:{user_id}")
        await pubsub.close()

    if not progress_payload:
        return {
            "status": "recommendation_timeout",
            "user_id": user_id,
            "weak_cases": weak_cases,
            "skills": {},
            "recommendations": [],
            "module_recommendations": [],
            "progress": {},
        }

    recommendations = progress_payload.get("recommendations") or []
    module_recommendations = (
        progress_payload.get("module_recommendations")
        or progress_payload.get("progress", {}).get("module_recommendations")
        or recommendations
    )
    skills = _skills_from_recommendations(module_recommendations)

    await EventBus.publish(
        "integration.events",
        {
            "event": "external_progress_imported",
            "email": email,
            "user_id": user_id,
            "weak_cases_count": len(weak_cases_with_code),
            "recommendations": recommendations,
            "module_recommendations": module_recommendations,
        }
    )

    return {
        "status": "imported",
        "user_id": user_id,
        "weak_cases": weak_cases,
        "skills": skills,
        "recommendations": recommendations,
        "module_recommendations": module_recommendations,
        "progress": progress_payload.get("progress", {}),
    }


async def _publish_analytics_request(
    *,
    user_id: str,
    case: dict,
    import_request_id: str,
    index: int,
) -> None:
    condition = {
        "description": case.get("description") or case.get("title") or "",
        "title": case.get("title"),
        "reason": case.get("reason"),
        "attempts": case.get("attempts"),
    }

    await redis_client.publish(
        f"analytics_request:{user_id}",
        json.dumps({
            "user_id": user_id,
            "attempt_id": None,
            "import_request_id": import_request_id,
            "import_case_index": index,
            "learning_session_id": None,
            "step_id": None,
            "mode": "import_progress",
            "code": case["last_code"],
            "condition": condition,
            "source": "integration_import_progress",
        })
    )


async def _wait_for_recommendations(
    pubsub,
    *,
    expected_user_id: str,
    timeout: float = 30.0,
) -> dict:
    deadline = asyncio.get_running_loop().time() + timeout

    while True:
        remaining = deadline - asyncio.get_running_loop().time()
        if remaining <= 0:
            return {}

        message = await pubsub.get_message(
            ignore_subscribe_messages=True,
            timeout=min(1.0, remaining),
        )
        if not message:
            continue

        try:
            payload = json.loads(message["data"])
        except (TypeError, json.JSONDecodeError):
            continue

        if str(payload.get("user_id")) != str(expected_user_id):
            continue

        recommendations = (
            payload.get("module_recommendations")
            or payload.get("recommendations")
            or payload.get("progress", {}).get("module_recommendations")
            or payload.get("progress", {}).get("recommendations")
        )
        if recommendations:
            return payload


def _skills_from_recommendations(recommendations: list) -> dict:
    return {
        recommendation["main_competency"]: 0
        for recommendation in recommendations
        if isinstance(recommendation, dict) and recommendation.get("main_competency")
    }


def _integration_user_id(email: str) -> str:
    return f"integration:{str(email or '').strip().lower()}"
