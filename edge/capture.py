#!/usr/bin/env python3
import cv2
import hashlib
import time
from datetime import datetime

# Módulo A (Edge) - SafeGuard capture simulation
# This script connects to a mock RTSP stream, extracts frames, detects events
# (simulated via time/randomness for MVP Phase 1) and calculates the SHA-256 hash.

def simulate_event_detection(frame):
    # En un entorno real, YOLOv8 detectaría caída o apertura de puerta
    pass

def calculate_hash(file_paths):
    hasher = hashlib.sha256()
    for file_path in file_paths:
        with open(file_path, 'rb') as f:
            buf = f.read()
            hasher.update(buf)
    return hasher.hexdigest()

def main():
    print("[MÓDULO A] Iniciando Edge AI Capture (Mock RTSP)...")
    
    # Simulate an event triggering after a few frames
    print("[MÓDULO A] Analizando stream de video...")
    time.sleep(2)
    print("\n[!] Evento detectado: PERSON_FALL")
    print("[MÓDULO A] Extrañendo 3 keyframes...")
    
    # Mock extracting 3 keyframes
    import os
    os.makedirs("storage/frames/mock_event", exist_ok=True)
    frames = ["storage/frames/mock_event/1.jpg", "storage/frames/mock_event/2.jpg", "storage/frames/mock_event/3.jpg"]
    
    # Escribir frames falsos para poder hashear
    for f in frames:
        with open(f, "wb") as file:
            file.write(b"mock_frame_data")
            
    # Calculate SHA-256 evidence
    evidence_hash = calculate_hash(frames)
    timestamp = datetime.now().isoformat()
    camera_id = "CAM-LOG-001"
    
    print(f"\n[EVIDENCIA COMPILADA]")
    print(f"Camara: {camera_id}")
    print(f"Timestamp: {timestamp}")
    print(f"Hash SHA-256: {evidence_hash}")
    
    # Aquí es donde el Edge enviaría esto al Backend (Fase D) para que interaccione
    # con Avalanche L1 (Fase B)
    print("\n[MÓDULO A] Transmitiendo hash y metadata al Orquestador (FastAPI)...")
    
if __name__ == "__main__":
    main()
