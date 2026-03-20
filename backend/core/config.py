from pathlib import Path

from pydantic_settings import BaseSettings

# Resolver ruta al modelo desde backend/
_BACKEND_DIR = Path(__file__).resolve().parent.parent
_DEFAULT_MODEL = (_BACKEND_DIR / ".." / "edge" / "models" / "guardchain.pt").resolve()


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./safeguard.db"
    SECRET_KEY: str = "dev-secret-change-in-prod"
    POLYGON_RPC_URL: str = "https://rpc-amoy.polygon.technology"
    WALLET_PRIVATE_KEY: str = ""
    CONTRACT_ADDRESS: str = ""
    CLIP_STORAGE_PATH: str = "./storage/clips"
    CAMERA_SOURCE: str = "0"
    GUARDCHAIN_MODEL_PATH: str = str(_DEFAULT_MODEL)

    class Config:
        env_file = ".env"

settings = Settings()
