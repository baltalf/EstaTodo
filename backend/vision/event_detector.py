"""
Decisor de eventos a partir de detecciones de YOLOv8.

Contrato:
- input: detections (lista de dicts con clase/id/conf y bbox en pixel)
- output: dict de evento (serializable) o None
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Any, Optional


def bbox_iou(a_xyxy: list[float], b_xyxy: list[float]) -> float:
    """IoU básico entre cajas [x1,y1,x2,y2] en píxeles."""
    ax1, ay1, ax2, ay2 = a_xyxy
    bx1, by1, bx2, by2 = b_xyxy

    inter_x1 = max(ax1, bx1)
    inter_y1 = max(ay1, by1)
    inter_x2 = min(ax2, bx2)
    inter_y2 = min(ay2, by2)

    inter_w = max(0.0, inter_x2 - inter_x1)
    inter_h = max(0.0, inter_y2 - inter_y1)
    inter_area = inter_w * inter_h

    a_area = max(0.0, ax2 - ax1) * max(0.0, ay2 - ay1)
    b_area = max(0.0, bx2 - bx1) * max(0.0, by2 - by1)
    denom = a_area + b_area - inter_area
    if denom <= 0.0:
        return 0.0
    return inter_area / denom


@dataclass(frozen=True)
class _Classes:
    person_ids: set[int]
    helmet_ids: set[int]
    vest_ids: set[int]
    no_helmet_ids: set[int]
    no_vest_ids: set[int]
    vehicle_ids: set[int]
    fall_ids: set[int]


class EventDetector:
    def __init__(
        self,
        model_names: dict[int, str],
        *,
        cooldown_seconds: float = 10.0,
        iou_threshold: float = 0.1,
    ) -> None:
        self.iou_threshold = float(iou_threshold)
        self.cooldown_seconds = float(cooldown_seconds)
        self._last_event_ts: dict[str, datetime] = {}

        # Mapeo tolerante a nombres (COCO + guardchain/Construction-Site-Safety).
        normalized_names = {cid: (name or "").strip().lower().replace(" ", "").replace("-", "") for cid, name in model_names.items()}

        person_ids = {cid for cid, name in normalized_names.items() if name in {"person"}}
        if 0 in normalized_names:
            person_ids.add(0)

        helmet_ids = {cid for cid, name in normalized_names.items() if name in {"helmet", "casco", "hardhat"}}
        vest_ids = {cid for cid, name in normalized_names.items() if name in {"vest", "chaleco", "safetyvest"}}
        no_helmet_ids = {cid for cid, name in normalized_names.items() if name in {"nohardhat", "no-hardhat"}}
        no_vest_ids = {cid for cid, name in normalized_names.items() if name in {"nosafetyvest", "no-safetyvest"}}
        vehicle_ids = {cid for cid, name in normalized_names.items() if name in {"vehicle", "truck", "machinery"}}
        fall_ids = {cid for cid, name in normalized_names.items() if name in {"fall", "caida", "caída", "falling"}}

        self._classes = _Classes(
            person_ids=person_ids,
            helmet_ids=helmet_ids,
            vest_ids=vest_ids,
            no_helmet_ids=no_helmet_ids,
            no_vest_ids=no_vest_ids,
            vehicle_ids=vehicle_ids,
            fall_ids=fall_ids,
        )

    def _cooldown_ok(self, event_type: str, ts: datetime) -> bool:
        last_ts = self._last_event_ts.get(event_type)
        if last_ts is None:
            return True
        return (ts - last_ts).total_seconds() >= self.cooldown_seconds

    def _mark_event(self, event_type: str, ts: datetime) -> None:
        self._last_event_ts[event_type] = ts

    def analyze(
        self,
        detections: list[dict[str, Any]],
        timestamp: datetime,
        module: str = "FACTORY",
    ) -> Optional[dict[str, Any]]:
        """
        detections: [{"class_id": int, "confidence": float, "bbox_xyxy": [x1,y1,x2,y2]}]
        module: "FACTORY" (person/PPE) o "CARGO" (vehicle/truck).
        """
        # Prioridad: FALL > NO_HELMET > NO_VEST > CARGO events
        fall_event = self._maybe_fall(detections, timestamp)
        if fall_event is not None:
            return fall_event

        if module == "FACTORY":
            no_helmet_event = self._maybe_no_helmet(detections, timestamp)
            if no_helmet_event is not None:
                return no_helmet_event

            no_vest_event = self._maybe_no_vest(detections, timestamp)
            if no_vest_event is not None:
                return no_vest_event

        if module == "CARGO":
            cargo_event = self._maybe_cargo(detections, timestamp)
            if cargo_event is not None:
                return cargo_event

        return None

    def _maybe_fall(self, detections: list[dict[str, Any]], timestamp: datetime) -> Optional[dict[str, Any]]:
        if not self._classes.fall_ids:
            return None
        fall_dets = [d for d in detections if d.get("class_id") in self._classes.fall_ids]
        if not fall_dets:
            return None
        if not self._cooldown_ok("FALL", timestamp):
            return None

        best = max(fall_dets, key=lambda d: float(d.get("confidence", 0.0)))
        self._mark_event("FALL", timestamp)
        return {
            "type": "FALL",
            "confidence": float(best.get("confidence", 0.0)),
            "metadata": {
                "fall_bbox": best.get("bbox_xyxy"),
            },
        }

    def _maybe_no_helmet(self, detections: list[dict[str, Any]], timestamp: datetime) -> Optional[dict[str, Any]]:
        # Clase directa NO-Hardhat (guardchain).
        if self._classes.no_helmet_ids:
            no_helmet_dets = [d for d in detections if d.get("class_id") in self._classes.no_helmet_ids]
            if no_helmet_dets:
                if not self._cooldown_ok("NO_HELMET", timestamp):
                    return None
                best = max(no_helmet_dets, key=lambda d: float(d.get("confidence", 0.0)))
                self._mark_event("NO_HELMET", timestamp)
                return {"type": "NO_HELMET", "confidence": float(best.get("confidence", 0.0)), "metadata": {"bbox": best.get("bbox_xyxy")}}

        # Modo persona sin casco solapado (si modelo tiene helmet).
        if not self._classes.helmet_ids:
            return None

        persons = [d for d in detections if d.get("class_id") in self._classes.person_ids]
        if not persons:
            return None

        helmets = [d for d in detections if d.get("class_id") in self._classes.helmet_ids]
        unmatched_persons: list[dict[str, Any]] = []
        for p in persons:
            p_bbox = p.get("bbox_xyxy")
            if not p_bbox:
                continue
            has_overlap = False
            for h in helmets:
                h_bbox = h.get("bbox_xyxy")
                if not h_bbox:
                    continue
                if bbox_iou(p_bbox, h_bbox) >= self.iou_threshold:
                    has_overlap = True
                    break
            if not has_overlap:
                unmatched_persons.append(p)

        if not unmatched_persons:
            return None

        if not self._cooldown_ok("NO_HELMET", timestamp):
            return None

        best_person = max(unmatched_persons, key=lambda d: float(d.get("confidence", 0.0)))
        self._mark_event("NO_HELMET", timestamp)
        return {
            "type": "NO_HELMET",
            "confidence": float(best_person.get("confidence", 0.0)),
            "metadata": {"unmatched_person_bboxes": [p.get("bbox_xyxy") for p in unmatched_persons], "helmet_detections": len(helmets)},
        }

    def _maybe_no_vest(self, detections: list[dict[str, Any]], timestamp: datetime) -> Optional[dict[str, Any]]:
        # Clase directa NO-Safety Vest (guardchain).
        if self._classes.no_vest_ids:
            no_vest_dets = [d for d in detections if d.get("class_id") in self._classes.no_vest_ids]
            if no_vest_dets:
                if not self._cooldown_ok("NO_VEST", timestamp):
                    return None
                best = max(no_vest_dets, key=lambda d: float(d.get("confidence", 0.0)))
                self._mark_event("NO_VEST", timestamp)
                return {"type": "NO_VEST", "confidence": float(best.get("confidence", 0.0)), "metadata": {"bbox": best.get("bbox_xyxy")}}

        if not self._classes.vest_ids:
            return None

        persons = [d for d in detections if d.get("class_id") in self._classes.person_ids]
        if not persons:
            return None

        vests = [d for d in detections if d.get("class_id") in self._classes.vest_ids]
        if vests:
            return None

        if not self._cooldown_ok("NO_VEST", timestamp):
            return None

        best_person = max(persons, key=lambda d: float(d.get("confidence", 0.0)))
        self._mark_event("NO_VEST", timestamp)
        return {"type": "NO_VEST", "confidence": float(best_person.get("confidence", 0.0)), "metadata": {"missing_vest": True, "person_bbox": best_person.get("bbox_xyxy")}}

    def _maybe_cargo(self, detections: list[dict[str, Any]], timestamp: datetime) -> Optional[dict[str, Any]]:
        """CARGO: detecta vehicle/truck (evento UNAUTHORIZED_ACCESS si hay vehículo)."""
        if not self._classes.vehicle_ids:
            return None

        vehicles = [d for d in detections if d.get("class_id") in self._classes.vehicle_ids]
        if not vehicles:
            return None

        if not self._cooldown_ok("UNAUTHORIZED_ACCESS", timestamp):
            return None

        best = max(vehicles, key=lambda d: float(d.get("confidence", 0.0)))
        self._mark_event("UNAUTHORIZED_ACCESS", timestamp)
        return {"type": "UNAUTHORIZED_ACCESS", "confidence": float(best.get("confidence", 0.0)), "metadata": {"vehicle_bbox": best.get("bbox_xyxy"), "cargo_detection": True}}

