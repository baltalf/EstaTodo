from __future__ import annotations

from typing import Any

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def list_cameras() -> list[dict[str, Any]]:
    # Día 1: stub mínimo (CRUD de cámaras para más adelante).
    return []


@router.post("/")
async def create_camera(payload: dict[str, Any]) -> dict[str, Any]:
    # Día 1: stub mínimo.
    return {"created": False, "reason": "create_camera no implementado en Día 1", "payload": payload}

