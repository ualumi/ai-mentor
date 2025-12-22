from app.application.queries.get_by_email import get_user_by_email
from app.domain.user import UserAggregate
from app.core.models import User

async def register_user_command(data, db):
    existing = await get_user_by_email(data.email, db)
    if existing:
        raise ValueError("Email already exists")

    user_agg = UserAggregate.register(
        username=data.username,
        email=data.email,
        password=data.password
    )

    db_user = User(
        username=user_agg.username,
        email=user_agg.email,
        password_hash=user_agg.password_hash
    )

    db.add(db_user)
    await db.commit()

    return db_user.id   
