from web3 import Web3
from eth_account import Account
import json
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

RPC_URL = os.getenv("AVALANCHE_RPC_URL")
PRIVATE_KEY = os.getenv("AVALANCHE_PRIVATE_KEY")

w3 = Web3(Web3.HTTPProvider(RPC_URL))

account = Account.from_key(PRIVATE_KEY)

print(f"Deploying from: {account.address}")
print(f"Connected to: {RPC_URL}")
print(f"Chain ID: {w3.eth.chain_id}")

import solcx

# Instalar solc si no está
try:
    solcx.install_solc('0.8.20')
except:
    pass

solcx.set_solc_version('0.8.20')

# Leer el contrato
from pathlib import Path
contract_path = Path(__file__).parent / "SubscriptionRegistry.sol"
contract_source = contract_path.read_text()

# Compilar
compiled = solcx.compile_source(
    contract_source,
    output_values=['abi', 'bin'],
    solc_version='0.8.20'
)

contract_id = '<stdin>:SubscriptionRegistry'
contract_interface = compiled[contract_id]

abi = contract_interface['abi']
bytecode = contract_interface['bin']

# Deploy
Contract = w3.eth.contract(abi=abi, bytecode=bytecode)

nonce = w3.eth.get_transaction_count(account.address)
tx = Contract.constructor().build_transaction({
    'from': account.address,
    'nonce': nonce,
    'gas': 2000000,
    'gasPrice': w3.to_wei('25', 'gwei'),
    'chainId': 99372
})

signed_tx = account.sign_transaction(tx)
tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
print(f"TX enviada: {tx_hash.hex()}")

receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
contract_address = receipt['contractAddress']

print(f"✅ Contrato deployado en: {contract_address}")
print(f"Agregar al .env: SUBSCRIPTION_CONTRACT_ADDRESS={contract_address}")

# Guardar ABI
import json
abi_path = Path(__file__).parent / "SubscriptionRegistry.abi.json"
abi_path.write_text(json.dumps(abi, indent=2))
print(f"ABI guardado en: {abi_path}")
