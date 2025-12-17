from app.application.queries.get_by_email import get_user_by_email
from app.core.security import create_access_token

async def login_user_command(data, db):
    user = await get_user_by_email(data.email, db)
    if not user or not user.password_hash:
        raise ValueError("Invalid credentials")

    from app.domain.user import UserAggregate
    agg = UserAggregate(user.username, user.email, user.password_hash)

    if not agg.check_password(data.password):
        raise ValueError("Invalid credentials")

    token = create_access_token({"sub": str(user.id)})
    return token
