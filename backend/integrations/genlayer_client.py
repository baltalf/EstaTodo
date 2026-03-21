import json
import logging
import asyncio
from pathlib import Path
from datetime import datetime

from core.config import settings

logger = logging.getLogger(__name__)

# Valid verdict values
VERDICT_ROBO_CONFIRMADO = "ROBO_CONFIRMADO"
VERDICT_FALSA_ALARMA = "FALSA_ALARMA"
VERDICT_REQUIERE_REVISION = "REQUIERE_REVISION"
VALID_VERDICTS = {VERDICT_ROBO_CONFIRMADO, VERDICT_FALSA_ALARMA, VERDICT_REQUIERE_REVISION}


class GenLayerClient:
    def __init__(self):
        self.simulator_url = settings.GENLAYER_SIMULATOR_URL
        self.contract_address = settings.GENLAYER_CONTRACT_ADDRESS
        self.deployed_path = Path(__file__).resolve().parent.parent.parent / "genlayer" / "deployed.json"

        if self.deployed_path.exists() and not self.contract_address:
            try:
                with open(self.deployed_path, "r") as f:
                    data = json.load(f)
                    self.contract_address = data.get("contract_address")
            except Exception as e:
                logger.warning(f"Could not load genlayer/deployed.json: {e}")

    def is_configured(self) -> bool:
        return bool(self.simulator_url)

    async def request_verdict(
        self,
        hash_sha256: str,
        incident_description: str,
        event_type: str,
        ipfs_cid: str = "",
    ) -> str:
        """
        Solicita veredicto al LLM de Genlayer usando descripción textual + CID IPFS.
        Retorna: ROBO_CONFIRMADO | FALSA_ALARMA | REQUIERE_REVISION
        """
        ipfs_line = (
            f"Video disponible en IPFS: ipfs://{ipfs_cid}"
            if ipfs_cid
            else "Video en storage local (IPFS no configurado)."
        )

        prompt = f"""
Sos un perito forense especializado en fraudes logísticos en Argentina.

Se registró el siguiente incidente en un camión de carga:

{incident_description}

Hash SHA-256 del video de evidencia (verificado en Avalanche L1): {hash_sha256}
{ipfs_line}

Basándote en esta descripción, determiná si se trata de:
- ROBO_CONFIRMADO: hay evidencia clara de robo o manipulación ilegal de carga
- FALSA_ALARMA: el sistema detectó movimiento pero no hay indicios de robo
- REQUIERE_REVISION: la descripción no es suficiente para determinar

Respondé ÚNICAMENTE con uno de estos tres valores exactos, sin explicación.
"""
        logger.info(
            f"[Genlayer] Prompt preparado para {event_type}, "
            f"hash={hash_sha256[:16]}..., ipfs={'sí' if ipfs_cid else 'no'}"
        )

        if not self.is_configured():
            logger.info("[Genlayer] Simulador no configurado — devolviendo mock REQUIERE_REVISION")
            await asyncio.sleep(1.5)
            return VERDICT_REQUIERE_REVISION

        try:
            import genlayer as gl  # type: ignore
            logger.warning("[Genlayer] SDK disponible pero integración no implementada — usando mock")
        except ImportError:
            logger.warning("[Genlayer] SDK no instalado — usando mock")

        await asyncio.sleep(2)

        # Demo mock logic: deterministic by event_type
        if event_type in ("ROBO", "UNAUTHORIZED_ACCESS", "APERTURA_NO_AUTORIZADA"):
            return VERDICT_ROBO_CONFIRMADO
        elif event_type in ("FALL", "MANIPULACION_CARGA"):
            return VERDICT_REQUIERE_REVISION
        return VERDICT_FALSA_ALARMA

    async def get_verdict(self, hash_sha256: str) -> dict:
        if not self.is_configured():
            return {
                "verdict": VERDICT_REQUIERE_REVISION,
                "event_type": "MOCK",
                "timestamp": datetime.utcnow().isoformat(),
            }
        return {}


genlayer_client = GenLayerClient()
