import json
import logging
import os
import sys
from datetime import datetime
from pathlib import Path

from web3 import Web3
from solcx import compile_standard, install_solc

# Logging setup
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# Asegurar que importamos del backend
_BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(_BACKEND_DIR))
from core.config import settings

def main():
    rpc_url = settings.AVALANCHE_RPC_URL
    chain_id = settings.AVALANCHE_CHAIN_ID
    private_key = settings.AVALANCHE_PRIVATE_KEY

    # Use solc version
    solc_version = "0.8.20"
    install_solc(solc_version)

    w3 = Web3(Web3.HTTPProvider(rpc_url))
    if not w3.is_connected():
        logger.error(f"Failed to connect to RPC URL: {rpc_url}")
        sys.exit(1)
    logger.info("Connected to RPC")

    account = w3.eth.account.from_key(private_key)
    logger.info(f"Using account: {account.address}")

    # Compile contract
    contract_file = Path(__file__).parent / "Registry.sol"
    with open(contract_file, "r") as f:
        contract_source = f.read()

    logger.info("Compiling contract...")
    compiled_sol = compile_standard(
        {
            "language": "Solidity",
            "sources": {"Registry.sol": {"content": contract_source}},
            "settings": {"outputSelection": {"*": {"*": ["abi", "metadata", "evm.bytecode", "evm.sourceMap"]}}},
        },
        solc_version=solc_version,
    )

    bytecode = compiled_sol["contracts"]["Registry.sol"]["Registry"]["evm"]["bytecode"]["object"]
    abi = compiled_sol["contracts"]["Registry.sol"]["Registry"]["abi"]

    # Deploy contract
    Registry = w3.eth.contract(abi=abi, bytecode=bytecode)
    nonce = w3.eth.get_transaction_count(account.address)

    logger.info("Estimating gas and building transaction...")
    tx = Registry.constructor().build_transaction({
        "chainId": chain_id,
        "gasPrice": w3.eth.gas_price,
        "from": account.address,
        "nonce": nonce
    })

    logger.info("Signing transaction...")
    signed_tx = w3.eth.account.sign_transaction(tx, private_key=private_key)

    logger.info("Sending transaction...")
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    
    logger.info("Waiting for transaction receipt...")
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

    contract_address = tx_receipt.contractAddress
    logger.info(f"Contract deployed at address: {contract_address}")

    # Save artifact
    output_path = Path(__file__).parent / "deployed.json"
    data = {
        "registry_address": contract_address,
        "deployed_at": datetime.now().isoformat(),
        "chain_id": chain_id,
        "rpc_url": rpc_url,
        "abi": abi
    }
    with open(output_path, "w") as f:
        json.dump(data, f, indent=2)

    logger.info(f"Deployment info saved to {output_path}")

if __name__ == "__main__":
    main()
