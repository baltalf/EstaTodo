from web3 import Web3
from eth_account import Account
from core.config import settings
import os

SUBSCRIPTION_ABI = [
    {
        "inputs": [
            {"name": "email", "type": "string"},
            {"name": "empresa", "type": "string"},
            {"name": "plan", "type": "string"},
            {"name": "amount", "type": "uint256"},
            {"name": "mpPaymentId", "type": "string"}
        ],
        "name": "registerSubscription",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"name": "email", "type": "string"}],
        "name": "isActive",
        "outputs": [{"name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    }
]

async def register_subscription_onchain(
    email: str, 
    empresa: str, 
    plan: str, 
    amount: float,
    payment_id: str,
    contract_address: str
):
    try:
        w3 = Web3(Web3.HTTPProvider(settings.AVALANCHE_RPC_URL))
        if not w3.is_connected():
            print("Avalanche no disponible — skip blockchain")
            return None
            
        account = Account.from_key(settings.AVALANCHE_PRIVATE_KEY)
        contract = w3.eth.contract(
            address=Web3.to_checksum_address(contract_address),
            abi=SUBSCRIPTION_ABI
        )
        
        tx = contract.functions.registerSubscription(
            email, empresa, plan, 
            int(amount * 100),  # cents
            payment_id
        ).build_transaction({
            'from': account.address,
            'nonce': w3.eth.get_transaction_count(account.address),
            'gas': 200000,
            'gasPrice': w3.to_wei('25', 'gwei'),
            'chainId': int(settings.AVALANCHE_CHAIN_ID)
        })
        
        signed = account.sign_transaction(tx)
        tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        
        print(f"✅ Suscripción registrada on-chain: {tx_hash.hex()}")
        return tx_hash.hex()
        
    except Exception as e:
        print(f"Avalanche error (non-fatal): {e}")
        return None
