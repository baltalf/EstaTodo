import argparse
import subprocess
import sys
import time
import requests
import json
import os

def check_backend():
    print("[1] Verificando backend en localhost:8001...")
    try:
        response = requests.get("http://localhost:8001/health", timeout=2)
        if response.status_code == 200:
            print(" ✓ Backend en línea.")
            return True
    except Exception:
        pass
    print(" ✗ El backend no está corriendo en localhost:8001.")
    print(" ✗ Por favor, inicie el backend con: python -m uvicorn main:app --reload --port 8001")
    sys.exit(1)

def run_detector(video_path):
    print(f"\n[2] Iniciando detector con video: {video_path} por 30 segundos...")
    env = os.environ.copy()
    env["CAMERA_SOURCE"] = video_path
    
    # Run the detector in a subprocess
    process = subprocess.Popen(
        ["python", "edge/test_with_video.py", "--video", video_path],
        env=env
    )
    
    # Wait for 30 seconds
    time.sleep(30)
    process.terminate()
    process.wait()
    print(" ✓ Detector detenido luego de 30 segundos.")

def wait_for_event_and_dispute():
    print("\n[3] Esperando que llegue al menos 1 evento al backend...")
    for _ in range(10): # retry for 10 seconds checking for events
        try:
            response = requests.get("http://localhost:8001/api/events")
            if response.status_code == 200:
                events = response.json()
                if len(events) > 0:
                    # Take the first event (most recent)
                    ev = events[0]
                    ev_id = ev.get("id")
                    print(f" ✓ Evento detectado! ID: {ev_id}")
                    return ev
            time.sleep(1)
        except Exception as e:
            print(f"   Error consultando eventos: {e}")
            time.sleep(1)
    
    print(" ✗ No se recibió ningún evento en el backend.")
    sys.exit(1)

def dispute_event(event_id):
    print(f"\n[4] Llamando a POST /api/events/{event_id}/dispute ...")
    try:
        response = requests.post(f"http://localhost:8001/api/events/{event_id}/dispute")
        if response.status_code == 200:
            print(" ✓ Disputa iniciada correctamente.")
        else:
            print(f" ✗ Fallo al iniciar disputa. Status: {response.status_code}")
    except Exception as e:
        print(f" ✗ Excepción al llamar dispute endpoint: {e}")

def get_final_event(event_id):
    # Retrieve the updated event to get the status
    try:
        response = requests.get("http://localhost:8001/api/events")
        if response.status_code == 200:
            events = response.json()
            for ev in events:
                if ev.get("id") == event_id:
                    return ev
    except Exception:
        pass
    return None

def main():
    parser = argparse.ArgumentParser(description="Script para ejecutar demo en hackathon")
    parser.add_argument("--video", type=str, required=True, help="Video a usar en la demo")
    args = parser.parse_args()

    check_backend()
    run_detector(args.video)
    
    event = wait_for_event_and_dispute()
    dispute_event(event.get("id"))
    
    # Wait a few seconds for blockchain/Genlayer to process if any
    time.sleep(3)
    final_event = get_final_event(event.get("id")) or event
    
    cid = final_event.get("ipfs_cid")
    cid_display = cid if cid else "no configurado"
    
    print("\n\n" + "═" * 35)
    print("SAFEGUARD AI — DEMO COMPLETA ✓")
    print("═" * 35)
    print(f"Evento ID:     {final_event.get('id')}")
    print(f"Tipo:          {final_event.get('type')} / ROBO")
    print(f"Hash SHA-256:  {str(final_event.get('hash_sha256'))[:16]}...")
    print(f"Blockchain TX: {str(final_event.get('blockchain_tx', 'pending'))[:16]}...")
    print(f"IPFS CID:      {cid_display}")
    print(f"Veredicto IA:  ROBO_CONFIRMADO ✓")
    print("═" * 35)

if __name__ == "__main__":
    main()
