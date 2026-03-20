import argparse
import asyncio
import logging
import os
import sys
from pathlib import Path

# Agregar root al sys.path para importar backend
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.append(str(root_dir))

from backend.core.config import settings
from backend.vision.detector import VisionDetector

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

import httpx

def find_first_mp4(directory: Path) -> Path | None:
    """Busca el primer archivo .mp4 en un directorio."""
    for file in directory.rglob("*.mp4"):
        return file
    return None

async def dummy_on_event(payload: dict):
    """Callback de prueba que envía el evento al backend."""
    ts = payload.get("timestamp")
    from datetime import datetime
    if isinstance(ts, datetime):
        payload = {**payload, "timestamp": ts.isoformat()}

    url = settings.INGEST_URL
    try:
        async with httpx.AsyncClient() as client:
            r = await client.post(url, json=payload, timeout=30.0)
            r.raise_for_status()
        logger.info(f"[INFO] Evento enviado OK → id: {payload.get('hash_sha256', 'N/A')}")
    except Exception as e:
        logger.error(f"[ERROR] No se pudo enviar evento al backend: {e}")

async def main():
    parser = argparse.ArgumentParser(description="Probar detector con archivo de video")
    parser.add_argument("--video", type=str, help="Ruta al archivo de video (.mp4, .avi, etc.)")
    args = parser.parse_args()

    video_path = args.video

    if not video_path:
        logger.info("No se proporcionó --video, buscando el primer .mp4 en la raíz del proyecto...")
        found_video = find_first_mp4(root_dir)
        if not found_video:
            logger.error("No se encontró ningún archivo .mp4. Por favor, provea uno con --video.")
            sys.exit(1)
        video_path = str(found_video)

    if not os.path.exists(video_path):
        logger.error(f"El archivo de video no existe: {video_path}")
        sys.exit(1)

    logger.info(f"[INFO] Cargando modelo...")
    # Sobreescribir el source en settings temporalmente para que el log lo muestre, o pasarlo directo
    settings.CAMERA_SOURCE = video_path

    logger.info(f"[INFO] Usando video: {video_path}")

    # Inicializar el detector usando el video path en lugar de la cámara web
    detector = VisionDetector(
        source=video_path,
        on_event=dummy_on_event,
        get_module=lambda: "TEST_MODULE"
    )

    try:
        detector.load_model()
        await detector.run()
    except KeyboardInterrupt:
        logger.info("Interrupción por el teclado, deteniendo...")
        detector.stop()
    except Exception as e:
        logger.exception(f"Error durante la ejecución del detector: {e}")
    finally:
        logger.info("Script finalizado.")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
