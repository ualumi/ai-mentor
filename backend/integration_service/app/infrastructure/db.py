from app.infrastructure.redis import redis_client
import json

# ключи:
# integration:external:{external_user_id}
# integration:internal:{internal_user_id}

async def save_external_identity(external_user_id, internal_user_id, email):

    data = {
        "external_user_id": external_user_id,
        "internal_user_id": internal_user_id,
        "email": email
    }

    await redis_client.set(
        f"integration:external:{external_user_id}",
        json.dumps(data)
    )

    await redis_client.set(
        f"integration:internal:{internal_user_id}",
        json.dumps(data)
    )


async def get_external_identity(external_user_id):

    data = await redis_client.get(f"integration:external:{external_user_id}")

    return json.loads(data) if data else None


async def get_external_identity_by_internal(internal_user_id):

    data = await redis_client.get(f"integration:internal:{internal_user_id}")

    return json.loads(data) if data else None