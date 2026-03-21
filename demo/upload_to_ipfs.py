import httpx
import asyncio
import os
from pathlib import Path
from dotenv import load_dotenv

# Resolve paths
ROOT_DIR = Path(__file__).parent.parent
env_path = ROOT_DIR / "backend" / ".env"
load_dotenv(env_path)

PINATA_JWT = os.getenv("PINATA_JWT")
VIDEOS = [
    ("video_robo.mp4", "demo-robo-001"),
    ("video_normal.mp4", "demo-normal-002"),
    ("video_inconcluso.mp4", "demo-inconcluso-003"),
]

async def upload(filename: str):
    path = ROOT_DIR / filename
    if not path.exists():
        print(f"❌ No encontrado: {path}")
        return None
    
    print(f"⬆ Subiendo {filename} a Pinata...")
    
    async with httpx.AsyncClient(timeout=120) as client:
        with open(path, "rb") as f:
            response = await client.post(
                "https://api.pinata.cloud/pinning/pinFileToIPFS",
                headers={"Authorization": f"Bearer {PINATA_JWT}"},
                files={"file": (filename, f, "video/mp4")},
                data={"pinataMetadata": '{"name":"' + filename + '"}'}
            )
    
    if response.status_code == 200:
        cid = response.json().get("IpfsHash")
        url = f"https://gateway.pinata.cloud/ipfs/{cid}"
        print(f"✅ {filename}")
        print(f"   CID: {cid}")
        print(f"   URL: {url}")
        return cid
    else:
        print(f"❌ Error {response.status_code}: {response.text}")
        return None

async def main():
    if not PINATA_JWT:
        print(f"❌ PINATA_JWT no configurado en {env_path}")
        return
    
    print("SafeGuard AI — Upload a IPFS/Pinata")
    print("=" * 40)
    
    results = {}
    for filename, event_id in VIDEOS:
        cid = await upload(filename)
        if cid:
            results[event_id] = cid
    
    print("\n" + "=" * 40)
    print("Agregar al .env del backend:")
    for event_id, cid in results.items():
        print(f"IPFS_{event_id.replace('-','_').upper()}={cid}")

if __name__ == "__main__":
    asyncio.run(main())
