from __future__ import annotations

import asyncio
from datetime import datetime
from typing import Any, Optional

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from core.config import settings
from db.database import async_session_maker
from db.models import Event, BlockchainStatus
from vision.detector import VisionDetector

from .module import get_current_module


router = APIRouter()

connected_clients: set[WebSocket] = set()
event_queue: asyncio.Queue[dict[str, Any]] = asyncio.Queue(maxsize=1000)

_detector: Optional[VisionDetector] = None
_detector_task: Optional[asyncio.Task[None]] = None
_broadcast_task: Optional[asyncio.Task[None]] = None


@router.websocket("/stream")
async def ws_stream(ws: WebSocket) -> None:
    await ws.accept()
    connected_clients.add(ws)
    try:
        # Esperar mensajes del cliente para detectar desconexión.
        # (Los eventos se empujan desde `_broadcast_loop`.)
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        connected_clients.discard(ws)
    except Exception:
        connected_clients.discard(ws)


async def _broadcast_loop() -> None:
    while True:
        event = await event_queue.get()
        if not connected_clients:
            continue

        stale: list[WebSocket] = []
        for ws in connected_clients:
            try:
                await ws.send_json(event)
            except Exception:
                stale.append(ws)

        for ws in stale:
            connected_clients.discard(ws)


def _to_ws_payload(db_event: Event) -> dict[str, Any]:
    ts: Optional[datetime] = db_event.timestamp
    return {
        "id": db_event.id,
        "type": db_event.type,
        "camera_id": db_event.camera_id,
        "timestamp": ts.isoformat() if ts else None,
        "clip_path": db_event.clip_path,
        "hash_sha256": db_event.hash_sha256,
        "blockchain_tx": db_event.blockchain_tx,
        "blockchain_status": str(db_event.blockchain_status)
        if db_event.blockchain_status is not None
        else BlockchainStatus.PENDING.value,
        "confidence": db_event.confidence,
        "metadata": db_event.event_metadata or {},
        "module": db_event.module or "FACTORY",
        "genlayer_verdict": db_event.genlayer_verdict,
    }


async def handle_event(event_payload: dict[str, Any]) -> None:
    """
    Persistir evento en DB y enviarlo al broadcast queue.
    Event payload esperado (creado por VisionDetector):
      - type, camera_id, timestamp (datetime), clip_path, hash_sha256, confidence, metadata
    """
    ts = event_payload.get("timestamp")
    if not isinstance(ts, datetime):
        raise ValueError("handle_event: se esperaba timestamp datetime")

    async with async_session_maker() as session:
        ev = Event(
            type=event_payload["type"],
            camera_id=event_payload["camera_id"],
            timestamp=ts,
            clip_path=event_payload.get("clip_path"),
            hash_sha256=event_payload.get("hash_sha256"),
            confidence=float(event_payload.get("confidence", 0.0)),
            event_metadata=event_payload.get("metadata") or {},
            module=event_payload.get("module") or "FACTORY",
            genlayer_verdict=event_payload.get("genlayer_verdict"),
        )
        session.add(ev)
        await session.commit()
        await session.refresh(ev)

        await event_queue.put(_to_ws_payload(ev))


@router.on_event("startup")
async def _startup() -> None:
    global _detector, _detector_task, _broadcast_task

    if _broadcast_task is None:
        _broadcast_task = asyncio.create_task(_broadcast_loop())

    if _detector_task is None:
        _detector = VisionDetector(
            source=settings.CAMERA_SOURCE,
            on_event=handle_event,
            get_module=get_current_module,
        )
        _detector.load_model()
        _detector_task = asyncio.create_task(_detector.run())


@router.on_event("shutdown")
async def _shutdown() -> None:
    global _detector_task

    if _detector is not None:
        _detector.stop()

    if _detector_task is not None:
        _detector_task.cancel()
