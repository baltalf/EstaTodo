from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from core.config import settings
from db.database import init_db
from api import events, stream, cameras, module, media
from api.payments import router as payments_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    from api.stream import start_broadcast_task
    start_broadcast_task()
    yield

app = FastAPI(
    title="SafeGuard AI",
    description="Auditoria laboral inmutable con IA + Blockchain",
    version="0.1.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(events.router, prefix="/api/events", tags=["events"])
app.include_router(cameras.router, prefix="/api/cameras", tags=["cameras"])
app.include_router(module.router, prefix="/api/module", tags=["module"])
app.include_router(media.router, prefix="/api/media", tags=["media"])
app.include_router(payments_router)
app.include_router(stream.router, prefix="/ws", tags=["websocket"])

@app.get("/health")
async def health():
    return {"status": "ok", "service": "SafeGuard AI"}
