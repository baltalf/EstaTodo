"""Toggle FACTORY/CARGO para el pipeline de visión."""
from __future__ import annotations

from fastapi import APIRouter

router = APIRouter()

_current_module: str = "FACTORY"


def get_current_module() -> str:
    return _current_module


def set_current_module(module: str) -> None:
    global _current_module
    if module.upper() in ("FACTORY", "CARGO"):
        _current_module = module.upper()


@router.get("/")
async def get_module() -> dict[str, str]:
    return {"module": get_current_module()}


@router.post("/")
async def post_module(payload: dict) -> dict[str, str]:
    module = (payload.get("module") or "").strip().upper()
    if module not in ("FACTORY", "CARGO"):
        return {"module": get_current_module(), "error": "module must be FACTORY or CARGO"}
    set_current_module(module)
    return {"module": get_current_module()}
