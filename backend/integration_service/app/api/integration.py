from fastapi import APIRouter, Depends
from app.application.commands.import_progress import import_progress
from app.core.security import get_current_user

router = APIRouter()

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

'''@router.post("/import-progress")
async def import_user_progress(user=Depends(get_current_user)):
    
    user_id = int(user["sub"])
    print(user_id)
    result = await import_progress(user_id)
    print(result)
    return result'''

from pydantic import BaseModel

class ImportRequest(BaseModel):
    email: str


@router.post("/import-progress")
async def import_user_progress(
    request: ImportRequest,
):
    email = request.email

    print("EMAIL:", email)

    result = await import_progress(email)

    print(result)
    return result

from app.application.queries.get_weak_cases import get_weak_cases

@router.post("/weak-cases")
async def weak_cases(request: ImportRequest):
    email = request.email

    result = await get_weak_cases(email)
    return result

#via sso
'''@router.get("/weak-cases")
async def weak_cases(user=Depends(get_current_user)):
    user_id = int(user["sub"])
    result = await get_weak_cases(user_id)
    print(result)
    return result'''