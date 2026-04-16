from fastapi import FastAPI
from app.api.auth import router as auth_router
from app.api.integration import router as integration_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Integration Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "http://localhost:5173"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/integration")
app.include_router(integration_router, prefix="/api/integration")

@app.get("/health")
async def health():
    return {"status": "ok"}