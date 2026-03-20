"""
Cliente Web3 para Polygon Amoy Testnet.

TODO para Cursor:
1. connect() — conectar al RPC y validar
2. register_event() — firmar y enviar tx con el hash
3. verify_event() — leer hash del contrato y comparar
"""
import logging
from web3 import Web3
from core.config import settings

logger = logging.getLogger(__name__)

SIMPLE_REGISTRY_ABI = [
    {
        "inputs": [
            {"name": "eventHash", "type": "bytes32"},
            {"name": "eventType", "type": "string"},
            {"name": "cameraId", "type": "string"}
        ],
        "name": "store",
        "outputs": [],
        "type": "function"
    },
    {
        "inputs": [{"name": "eventHash", "type": "bytes32"}],
        "name": "verify",
        "outputs": [
            {"name": "exists", "type": "bool"},
            {"name": "timestamp", "type": "uint256"}
        ],
        "type": "function"
    }
]

class PolygonClient:
    def __init__(self):
        self.w3: Web3 = None
        self.contract = None
        self.account = None

    def connect(self):
        """TODO: Conectar a Polygon Amoy via RPC"""
        raise NotImplementedError

    async def register_event(self, hash_hex: str, event_type: str, camera_id: str) -> str:
        """TODO: Registrar hash. Retorna tx_hash."""
        raise NotImplementedError

    async def verify_event(self, hash_hex: str) -> dict:
        """TODO: Verificar si hash existe. Retorna {exists, timestamp}"""
        raise NotImplementedError

polygon_client = PolygonClient()
