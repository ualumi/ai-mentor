from sqlalchemy.future import select
from app.core.models import User

async def get_user_by_email(email: str, db):
    result = await db.execute(
        select(User).where(User.email == email)
    )
    return result.scalar_one_or_none()
