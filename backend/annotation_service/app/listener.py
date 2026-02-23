'''import json
import redis
from app.resolver import PythonResolver
from app.publisher import EventPublisher


class AnalysisListener:

    def __init__(self, redis_url: str):
        self.redis = redis.Redis.from_url(redis_url)
        self.pubsub = self.redis.pubsub()
        self.publisher = EventPublisher(redis_url)
        self.resolver = PythonResolver()

    def start(self):
        self.pubsub.subscribe("analysis_result")

        for message in self.pubsub.listen():
            print("get msg")
            if message["type"] != "message":
                continue

            try:
                data = json.loads(message["data"])
                self.handle_event(data)
            except Exception as e:
                print("Error processing message:", e)

    def handle_event(self, payload: dict):

        session_id = payload.get("session_id")
        code = payload.get("test_code", {}).get("code", "")

        # ✅ теперь берём analysis
        analysis = payload.get("analysis", {})

        if not code or not analysis:
            return

        try:
            annotations = self.resolver.resolve(code, analysis)
        except Exception as e:
            print("Resolver error:", e)
            return

        event = {
            "event": "code_annotations_ready",
            "session_id": session_id,
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

        self.publisher.publish("code_annotations_ready", event)'''



import json
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
                print("Annotation listener error:", e)