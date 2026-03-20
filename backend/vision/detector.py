"""
Vision pipeline — YOLOv8 + deteccion de eventos laborales.

TODO para Cursor:
1. load_model() cargando yolov8n.pt desde ultralytics
2. run() con loop de captura desde self.source (webcam o RTSP)
3. En cada frame correr inferencia y llamar EventDetector.analyze()
4. Cuando analyze() devuelve evento, llamar ClipExtractor.extract()
5. Emitir evento via callback on_event
"""
from __future__ import annotations

import logging
from collections import deque
from datetime import datetime
import asyncio
import time
from typing import Any, Callable, Optional

import cv2
from ultralytics import YOLO

from core.config import settings
from .clip_extractor import ClipExtractor
from .event_detector import EventDetector

logger = logging.getLogger(__name__)

PERSON_CLASS_ID = 0

LABEL_TO_EVENT = {
    "fall": "FALL",
    "no_helmet": "NO_HELMET", 
    "no_vest": "NO_VEST",
    "person": "FALL",  # temporal para testing con video genérico
}

class VisionDetector:
    def __init__(self, source: str, on_event: Callable, get_module: Optional[Callable[[], str]] = None):
        self.source = source
        self.on_event = on_event
        self.get_module = get_module or (lambda: "FACTORY")
        self.model: Optional[YOLO] = None
        self.event_detector: Optional[EventDetector] = None
        self.clip_extractor: Optional[ClipExtractor] = None
        self.running = False
        self.camera_id = str(source)
        self.frame_buffer: deque[tuple[datetime, Any]] = deque(
            maxlen=settings.CLIP_BUFFER_FRAMES
        )
        self._capture: Optional[cv2.VideoCapture] = None
        self._last_event_ts: dict[str, datetime] = {}
        self.cooldown_seconds = 10.0

    def load_model(self):
        """Cargar YOLOv8 guardchain.pt (person, truck, PPE)."""
        model_path = getattr(settings, "MODEL_PATH", "edge/models/guardchain.pt")
        logger.info("[INFO] Cargando modelo: %s", model_path)
        try:
            self.model = YOLO(model_path)
        except Exception as e:
            fallback_path = "yolov8n.pt"
            logger.warning("[WARNING] No se pudo cargar %s, usando %s como fallback. Error: %s", model_path, fallback_path, e)
            self.model = YOLO(fallback_path)
            
        self.event_detector = EventDetector(self.model.names)
        self.clip_extractor = ClipExtractor(self.frame_buffer)

    async def run(self):
        """Captura desde webcam/RTSP y ejecuta inferencia frame a frame."""
        if self.model is None or self.event_detector is None or self.clip_extractor is None:
            raise RuntimeError("VisionDetector: load_model() debe ejecutarse antes de run()")

        self.running = True
        loop = asyncio.get_running_loop()
        await asyncio.to_thread(self._run_sync, loop)

    def _source_to_capture(self, src: str) -> Any:
        src = str(src).strip()
        if src.isdigit():
            return int(src)
        return src

    def _run_sync(self, loop: asyncio.AbstractEventLoop) -> None:
        """Loop pesado en thread: OpenCV + ultralytics + extracción de clips."""
        if self.model is None or self.event_detector is None or self.clip_extractor is None:
            return

        cap = cv2.VideoCapture(self._source_to_capture(self.source))
        self._capture = cap
        if not cap.isOpened():
            raise RuntimeError(f"VisionDetector: no se pudo abrir la fuente: {self.source}")

        logger.info("VisionDetector: captura iniciada desde %s", self.source)
        try:
            frames_processed = 0
            while self.running:
                ret, frame = cap.read()
                if not ret:
                    if settings.LOOP_VIDEO:
                        logger.info("VisionDetector: Video finalizado, reiniciando...")
                        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                        continue
                    else:
                        logger.info("VisionDetector: Video finalizado")
                        self.stop()
                        break

                frames_processed += 1
                if frames_processed % 100 == 0:
                    logger.info(f"[INFO] Procesados {frames_processed} frames, sin eventos aún")


                ts = datetime.utcnow()
                # Guardar copia para no pisar memoria interna del buffer.
                self.frame_buffer.append((ts, frame.copy()))

                results = self.model(frame, verbose=False)
                dets = _yolo_results_to_detections(results, self.model.names)
                
                # Log detection visible
                event_info = None
                for det in dets:
                    conf = det['confidence']
                    cls_name = det['class_name']
                    if conf >= getattr(settings, "CONFIDENCE_THRESHOLD", 0.50):
                        label_norm = cls_name.lower().strip()
                        if label_norm in LABEL_TO_EVENT:
                            ev_type = LABEL_TO_EVENT[label_norm]
                            logger.info(f"[DETECCIÓN] tipo={cls_name} confianza={conf:.2f} → mapeado a {ev_type} camara={self.camera_id}")
                            
                            # Comprobar cooldown
                            last_ts = self._last_event_ts.get(ev_type)
                            if last_ts is None or (ts - last_ts).total_seconds() >= self.cooldown_seconds:
                                self._last_event_ts[ev_type] = ts
                                event_info = {
                                    "type": ev_type,
                                    "confidence": conf,
                                    "metadata": {"bbox": det.get("bbox_xyxy")}
                                }
                                break # Solo 1 evento extraido por frame para simplificar

                if event_info is None:
                    continue

                logger.info("[INFO] Enviando evento al backend...")
                clip_path = self.clip_extractor.extract(
                    event_timestamp=ts,
                    event_type=event_info["type"],
                    camera_id=self.camera_id,
                )
                from .hasher import hash_file

                hash_sha256 = hash_file(clip_path) if clip_path else ""
                payload = {
                    "type": event_info["type"],
                    "camera_id": self.camera_id,
                    "timestamp": ts,
                    "clip_path": clip_path,
                    "hash_sha256": hash_sha256,
                    "confidence": float(event_info.get("confidence", 0.0)),
                    "metadata": event_info.get("metadata", {}),
                    "module": self.get_module(),
                }

                try:
                    maybe_coro = self.on_event(payload)
                    if asyncio.iscoroutine(maybe_coro):
                        fut = asyncio.run_coroutine_threadsafe(maybe_coro, loop)
                        # No bloquear: loguear fallos cuando termine.
                        def _log_future(f):
                            exc = f.exception()
                            if exc is not None:
                                logger.error("VisionDetector: on_event coroutina falló: %s", exc)

                        fut.add_done_callback(_log_future)
                except Exception:
                    logger.exception("VisionDetector: on_event falló (sync/submit)")
        finally:
            cap.release()
            self._capture = None
            self.running = False

    def stop(self):
        self.running = False

def _yolo_results_to_detections(results: list[Any], model_names: dict[int, str]) -> list[dict[str, Any]]:
    """Convierte outputs de ultralytics a un formato simple."""
    if not results:
        return []
    r0 = results[0]
    boxes = getattr(r0, "boxes", None)
    if boxes is None:
        return []
    if len(boxes) == 0:
        return []

    detections: list[dict[str, Any]] = []
    # boxes.cls/conf/xyxy: tensores.
    cls_list = boxes.cls
    conf_list = boxes.conf
    xyxy = boxes.xyxy
    for i in range(len(boxes)):
        cls_id = int(cls_list[i].item())
        conf = float(conf_list[i].item())
        x1, y1, x2, y2 = xyxy[i].tolist()
        detections.append(
            {
                "class_id": cls_id,
                "class_name": model_names.get(cls_id, str(cls_id)),
                "confidence": conf,
                "bbox_xyxy": [float(x1), float(y1), float(x2), float(y2)],
            }
        )
    return detections
