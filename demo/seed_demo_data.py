import asyncio
import hashlib
import os
import sys
from pathlib import Path

# Add the backend root to sys.path so we can import from it normally
project_root = Path(__file__).resolve().parent.parent
backend_root = project_root / "backend"
if str(backend_root) not in sys.path:
    sys.path.append(str(backend_root))

from db.database import async_session_maker, init_db
from db.models import Event, BlockchainStatus

async def seed_data():
    await init_db()
    
    def generate_hash():
        return hashlib.sha256(os.urandom(32)).hexdigest()
        
    def generate_tx():
        return "0x" + os.urandom(32).hex()
        
    events = [
        Event(
            type="FALL",
            camera_id="CAM-TRK-01",
            hash_sha256=generate_hash(),
            blockchain_tx=generate_tx(),
            blockchain_status=BlockchainStatus.CONFIRMED,
            genlayer_verdict="ROBO_CONFIRMADO",
            incident_description="Operario detectado manipulando pallets sin autorización dentro del trailer. Movimiento sospechoso hacia la salida trasera. Confianza: 89%",
            module="CARGO"
        ),
        Event(
            type="FALL",
            camera_id="CAM-TRK-02",
            hash_sha256=generate_hash(),
            blockchain_tx=generate_tx(),
            blockchain_status=BlockchainStatus.CONFIRMED,
            genlayer_verdict=None,
            incident_description="Movimiento detectado en zona de carga. Requiere análisis adicional.",
            module="CARGO"
        ),
        Event(
            type="FALL",
            camera_id="CAM-TRK-03",
            hash_sha256=generate_hash(),
            blockchain_tx=generate_tx(),
            blockchain_status=BlockchainStatus.CONFIRMED,
            genlayer_verdict="FALSA_ALARMA",
            incident_description="Operario realizando tarea autorizada de revisión de inventario. Sin indicios de irregularidad.",
            module="CARGO"
        )
    ]
    
    async with async_session_maker() as session:
        for event in events:
            session.add(event)
        await session.commit()
    
    print("Seed data successfully inserted!")

if __name__ == "__main__":
    asyncio.run(seed_data())
