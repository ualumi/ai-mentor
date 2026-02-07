from datetime import datetime, timedelta
from sqlalchemy import select, update
from app.models import Episode
from sqlalchemy.sql import func

# Максимальный разрыв между попытками в эпизоде
MAX_GAP_MINUTES = 10

async def get_open_episode(db, session_id: str, last_attempt_time: datetime):
    """
    Возвращает открытый эпизод для session_id.
    Эпизод считается открытым, если последняя попытка в нем была не более MAX_GAP_MINUTES назад.
    """
    q = select(Episode).where(
        Episode.session_id == session_id,
        Episode.end_time.is_(None)
    )
    res = await db.execute(q)
    episode = res.scalars().first()

    if not episode:
        return None

    # если последняя попытка слишком старая, закрываем эпизод
    if episode.start_time + timedelta(minutes=MAX_GAP_MINUTES) < last_attempt_time:
        episode.end_time = last_attempt_time
        await db.commit()
        return None

    return episode
