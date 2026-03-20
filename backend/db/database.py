"""
DB asíncrona (SQLAlchemy + aiosqlite).

Para el Día 1 usamos SQLite en dev.
"""

from __future__ import annotations

from collections.abc import AsyncGenerator

from core.config import settings
from .models import Base

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# Engine global reutilizable.
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
)

async_session_maker = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)


async def init_db() -> None:
    """Crea tablas si no existen."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """Generador de AsyncSession (compatible con dependencias FastAPI)."""
    async with async_session_maker() as session:
        yield session

