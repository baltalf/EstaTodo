import json
import logging
from pathlib import Path
from typing import Optional

from web3 import Web3
from web3.middleware import ExtraDataToPOAMiddleware

from core.config import settings

logger = logging.getLogger(__name__)

class AvalancheClient:
    def __init__(self):
        self.w3 = None
        self.account = None
        self.contract = None
        self.contract_address = None
        self.chain_id = settings.AVALANCHE_CHAIN_ID
        
        if not settings.BLOCKCHAIN_ENABLED:
            logger.info("Blockchain is DISABLED in settings.")
            return

        # Conectar a RPC
        self.w3 = Web3(Web3.HTTPProvider(settings.AVALANCHE_RPC_URL))
        # Avalanche requires POA middleware because of extraData length in blocks
        self.w3.middleware_onion.inject(ExtraDataToPOAMiddleware, layer=0)

        if not self.w3.is_connected():
            logger.warning(f"Could not connect to RPC URL: {settings.AVALANCHE_RPC_URL}")
            return
            
        logger.info(f"Connected to Avalanche L1 at {settings.AVALANCHE_RPC_URL}")

        # Cargar cuenta
        pk = settings.AVALANCHE_PRIVATE_KEY
        if not pk:
            logger.warning("No AVALANCHE_PRIVATE_KEY provided.")
            return
        
        self.account = self.w3.eth.account.from_key(pk)
        
        # Intentar cargar ABI y dirección
        deployed_path = Path(__file__).resolve().parent.parent.parent / "contracts" / "deployed.json"
        
        if deployed_path.exists():
            try:
                with open(deployed_path, "r") as f:
                    data = json.load(f)
                    self.contract_address = data.get("registry_address")
                    abi = data.get("abi")
                    
                    if self.contract_address and abi:
                        self.contract = self.w3.eth.contract(address=self.contract_address, abi=abi)
                        logger.info(f"Loaded contract from {self.contract_address}")
                    else:
                        logger.warning("deployed.json is missing required fields.")
            except Exception as e:
                logger.warning(f"Failed to load {deployed_path}: {e}")
        else:
            logger.warning(f"{deployed_path} does not exist. Contract will not be instantiated.")

    def is_connected(self) -> bool:
        return (
            self.w3 is not None and 
            self.w3.is_connected() and 
            self.contract is not None and 
            self.account is not None
        )

    async def register_event(self, event_id: str, camera_id: str, timestamp: str, hash_sha256: str, event_type: str) -> str:
        """
        Store an event on the blockchain.
        Returns the transaction hash as a hex string.
        """
        if not self.is_connected():
            raise RuntimeError("AvalancheClient is not fully connected or configured.")

        # Convert timestamp to uint256 (seconds since epoch)
        from datetime import datetime
        try:
            # Assumes ISO format string timestamp or similar, or epoch
            if isinstance(timestamp, str):
                ts = int(datetime.fromisoformat(timestamp.replace('Z', '+00:00')).timestamp())
            else:
                ts = int(timestamp)
        except Exception:
            # Fallback to current time if parsing fails
            ts = int(datetime.utcnow().timestamp())

        logger.info(f"Registrando hash en Avalanche L1... (hash: {hash_sha256})")

        nonce = self.w3.eth.get_transaction_count(self.account.address)
        
        tx = self.contract.functions.store(
            str(camera_id),
            ts,
            str(hash_sha256),
            str(event_type)
        ).build_transaction({
            "chainId": self.chain_id,
            "gas": 300000,
            "gasPrice": self.w3.eth.gas_price,
            "from": self.account.address,
            "nonce": nonce
        })

        signed_tx = self.w3.eth.account.sign_transaction(tx, private_key=self.account.key)
        tx_hash = self.w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        
        # Esperar 30s max
        try:
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=30)
            if receipt.status != 1:
                raise Exception("Transaction failed (status 0 in receipt)")
                
            tx_hex = tx_hash.hex()
            logger.info(f"TX confirmada: {tx_hex}")
            return tx_hex
        except Exception as e:
            logger.error(f"Error waiting for transaction receipt: {e}")
            raise

    async def verify_hash(self, hash_sha256: str) -> bool:
        """
        Verify if a hash exists on the blockchain.
        """
        if not self.is_connected():
            logger.warning("AvalancheClient is not connected, cannot verify hash.")
            return False
            
        try:
            exists = self.contract.functions.verify(str(hash_sha256)).call()
            return exists
        except Exception as e:
            logger.error(f"Error verifying hash: {e}")
            return False

avalanche_client = AvalancheClient()
