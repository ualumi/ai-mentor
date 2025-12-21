from fastapi import FastAPI
from app.api.sessions import router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Learning Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.on_event("startup")
async def startup():
    import asyncio
    from app.infrastructure.subscriber import listen_scaffolding_events
    asyncio.create_task(listen_scaffolding_events())
