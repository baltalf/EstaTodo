#!/usr/bin/env python3
"""
Ejecutable independiente del detector de visión.
Envía eventos via HTTP POST al backend.
"""
from __future__ import annotations

import asyncio
import logging
import sys
import time
from datetime import datetime
from pathlib import Path

# Añadir backend al path
_BACKEND = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(_BACKEND))

import httpx

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

RETRIES = 3
BACKOFF_SEC = 2.0


def _ingest_event(payload: dict) -> None:
    """Envía evento al backend con retry."""
    from core.config import settings

    url = settings.INGEST_URL
    ts = payload.get("timestamp")
    if isinstance(ts, datetime):
        payload = {**payload, "timestamp": ts.isoformat()}

    for attempt in range(RETRIES):
        try:
            r = httpx.post(url, json=payload, timeout=30.0)
            r.raise_for_status()
            logger.info("Evento enviado: type=%s camera=%s", payload.get("type"), payload.get("camera_id"))
            return
        except Exception as e:
            logger.warning("Intento %d/%d falló: %s", attempt + 1, RETRIES, e)
            if attempt < RETRIES - 1:
                time.sleep(BACKOFF_SEC)
            else:
                logger.error("No se pudo enviar evento tras %d intentos", RETRIES)


def main() -> None:
    from core.config import settings
    from vision.detector import VisionDetector

    def on_event(payload: dict) -> None:
        _ingest_event(payload)

    detector = VisionDetector(
        source=settings.CAMERA_SOURCE,
        on_event=on_event,
        get_module=lambda: "FACTORY",
    )
    logger.info("Cargando modelo...")
    detector.load_model()
    logger.info("Iniciando captura desde %s", settings.CAMERA_SOURCE)
    asyncio.run(detector.run())


if __name__ == "__main__":
    main()
