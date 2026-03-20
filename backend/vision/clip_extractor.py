"""
Extrae un clip .mp4 del buffer circular de frames alrededor de un evento.

Para el Día 1:
- Guardamos los últimos `clip_seconds` segundos ante el timestamp del evento.
"""

from __future__ import annotations

from collections import deque
from datetime import datetime, timedelta
from pathlib import Path
from typing import Deque, Tuple

import cv2

from core.config import settings


class ClipExtractor:
    def __init__(
        self,
        frame_buffer: Deque[Tuple[datetime, "cv2.Mat"]],
        *,
        clip_seconds: float = 10.0,
    ) -> None:
        self.frame_buffer = frame_buffer
        self.clip_seconds = float(clip_seconds)
        self._fourcc = cv2.VideoWriter_fourcc(*"mp4v")

    def extract(
        self,
        *,
        event_timestamp: datetime,
        event_type: str,
        camera_id: str,
    ) -> str:
        start_ts = event_timestamp - timedelta(seconds=self.clip_seconds)

        frames: list[Tuple[datetime, "cv2.Mat"]] = [
            (ts, frame) for ts, frame in self.frame_buffer if start_ts <= ts <= event_timestamp
        ]
        frames.sort(key=lambda x: x[0])

        if not frames:
            raise RuntimeError("ClipExtractor: buffer sin frames para el rango del evento")

        first_ts, first_frame = frames[0]
        last_ts, last_frame = frames[-1]
        height, width = first_frame.shape[:2]

        duration = max(0.0001, (last_ts - first_ts).total_seconds())
        if len(frames) <= 1:
            fps = 30.0
        else:
            fps = (len(frames) - 1) / duration
            # Limitar fps para evitar valores extremos por gaps grandes.
            fps = float(max(5.0, min(60.0, fps)))

        # Asegurar directorio de salida.
        storage_dir = Path(settings.CLIP_STORAGE_PATH)
        storage_dir.mkdir(parents=True, exist_ok=True)

        ts_str = event_timestamp.strftime("%Y%m%d_%H%M%S")
        safe_camera_id = str(camera_id).replace(":", "_").replace("/", "_")
        filename = f"{safe_camera_id}_{event_type}_{ts_str}.mp4"
        out_path = storage_dir / filename

        writer = cv2.VideoWriter(str(out_path), self._fourcc, fps, (int(width), int(height)))
        if not writer.isOpened():
            raise RuntimeError(f"ClipExtractor: VideoWriter no pudo abrirse en {out_path}")

        for _, frame in frames:
            writer.write(frame)

        writer.release()
        return str(out_path)

