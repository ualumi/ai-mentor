from app.domain.module_builder import build_module_candidates


def build_module_recommendations(user_id: str, user_progress: dict) -> list[dict]:
    return build_module_candidates(user_progress, user_id=user_id)


def build_recommendations(user_id: str, user_progress: dict) -> list[dict]:
    return build_module_recommendations(user_id, user_progress)
