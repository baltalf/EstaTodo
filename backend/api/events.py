from __future__ import annotations

from datetime import datetime
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select

from api.stream import handle_event
from db.database import async_session_maker
from db.models import Event
from blockchain.avalanche_client import avalanche_client

router = APIRouter()


class EventIngest(BaseModel):
    type: str
    camera_id: str
    timestamp: datetime
    clip_path: str | None = None
    hash_sha256: str | None = None
    confidence: float = 0.0
    metadata: dict[str, Any] = Field(default_factory=dict)
    module: str = "FACTORY"


@router.post("/ingest")
async def ingest_event(body: EventIngest) -> dict[str, Any]:
    payload = body.model_dump()
    ev = await handle_event(payload, extract_key_frames=True)
    return {
        "id": ev.id,
        "hash_sha256": ev.hash_sha256,
        "key_frames": (ev.event_metadata or {}).get("key_frames", []),
    }


@router.get("/")
async def list_events() -> list[dict[str, Any]]:
    async with async_session_maker() as session:
        result = await session.execute(select(Event).order_by(Event.timestamp.desc()).limit(100))
        events = result.scalars().all()
        import logging
        logging.getLogger(__name__).info(f"[INFO] Consultando eventos, total={len(events)}")
        from api.stream import _to_ws_payload
        return [_to_ws_payload(ev) for ev in events]


@router.get("/{event_id}")
async def get_event(event_id: str) -> dict[str, Any]:
    return {"id": event_id}


@router.get("/{event_id}/verify")
async def verify_event_endpoint(event_id: str) -> dict[str, Any]:
    async with async_session_maker() as session:
        result = await session.execute(select(Event).where(Event.id == event_id))
        ev = result.scalar_one_or_none()
        if not ev:
            raise HTTPException(status_code=404, detail="Event not found")
        
        verified = False
        if ev.hash_sha256:
            verified = await avalanche_client.verify_hash(ev.hash_sha256)
            
        return {
            "event_id": str(ev.id),
            "hash_sha256": str(ev.hash_sha256),
            "blockchain_tx": str(ev.blockchain_tx) if ev.blockchain_tx else None,
            "verified": verified,
            "blockchain_status": str(ev.blockchain_status) if ev.blockchain_status else None
        }

