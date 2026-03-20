from __future__ import annotations

from typing import Any

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def list_events() -> list[dict[str, Any]]:
    # Día 1: stub mínimo para que el backend arranque.
    return []


@router.get("/{event_id}")
async def get_event(event_id: str) -> dict[str, Any]:
    # Día 1: stub mínimo para que el backend arranque.
    return {"id": event_id}


@router.post("/verify")
async def verify_event(payload: dict[str, Any]) -> dict[str, Any]:
    # Día 1: verificación blockchain no implementada aún.
    return {"ok": False, "reason": "verify_event no implementado en Día 1"}

