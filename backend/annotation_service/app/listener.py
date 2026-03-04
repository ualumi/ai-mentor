
'''import json
from app.redis_client import redis
#from app.resolver import PythonResolver
from app.resolver import PythonResolver

CHANNEL_IN = "analysis_result"
CHANNEL_OUT = "code_annotations_ready"


class AnalysisListener:

    def __init__(self):
        #self.resolver = PythonResolver()
        pass

    async def start(self):

        pubsub = redis.pubsub()
        await pubsub.subscribe(CHANNEL_IN)

        print("🟢 Annotation service listening analysis_result...")

        async for message in pubsub.listen():
            print("get msg")
            if message["type"] != "message":
                continue

            try:
                payload = json.loads(message["data"])

                user_id = payload.get("user_id")
                code = payload.get("code")
                analysis = payload.get("analysis")
                print("code", code)
                print("analysis", analysis)
                if not user_id or not code or not analysis:
                    continue

                if "analysis_result" in analysis:
                    analysis = analysis["analysis_result"]

                #annotations = self.resolver.resolve(code, analysis)
                resolver = PythonResolver(code)
                annotations = resolver.resolve(analysis)

                print(annotations)
                out = {
                    "user_id": user_id,
                    "annotations": [
                        {
                            "line": a.line,
                            "type": a.type,
                            "message": a.message,
                            "confidence": a.confidence,
                        }
                        for a in annotations
                    ]
                }

                await redis.publish(
                    CHANNEL_OUT,
                    json.dumps(out)
                )

                print(f"📤 code_annotations_ready sent for {user_id}")

            except Exception as e:
                print("Annotation listener error:", e)'''

import json
from app.redis_client import redis
from app.resolver import PythonResolver

import logging

logger = logging.getLogger(__name__)

REQUEST_PATTERN = "analytics_response:*"

class AnalysisListener:

    async def start(self):

        pubsub = redis.pubsub()
        await pubsub.psubscribe(REQUEST_PATTERN)

        print("🟢 Annotation service listening analytics_response:* ...")

        async for message in pubsub.listen():
            if message["type"] != "pmessage":
                continue

            try:
                channel = message["channel"]  # analytics_response:{user_id}
                print(message)
                raw_data = message["data"]

                if isinstance(raw_data, bytes):
                    raw_data = raw_data.decode()

                payload = json.loads(raw_data)

                user_id = payload.get("user_id")
                code = payload.get("code")
                analysis = payload.get("analysis")
                attempt_id = payload.get("attempt_id")

                if not user_id or not code or not analysis:
                    continue

                # если вдруг вложенность
                if isinstance(analysis, dict) and "analysis_result" in analysis:
                    analysis = analysis["analysis_result"]

                # 🔎 Генерация аннотаций
                resolver = PythonResolver(code)
                annotations = resolver.resolve(analysis)
                print(annotations)
                out = {
                    "user_id": user_id,
                    "attempt_id": attempt_id,
                    "annotations": [
                        {
                            "line": a.line,
                            "type": a.type,
                            "message": a.message,
                            "confidence": a.confidence,
                        }
                        for a in annotations
                    ]
                }

                # 🔥 Публикуем ТОЛЬКО в канал пользователя
                await redis.publish(
                    f"code_annotations:{user_id}",
                    json.dumps(out)
                )
                logger.info(f"📤 code_annotations sent for {user_id}, value: {out}")
                print(f"📤 code_annotations sent for {user_id}")

            except Exception as e:
                print("Annotation listener error:", e)