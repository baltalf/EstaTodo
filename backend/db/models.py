import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, Float, DateTime, JSON
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

class EventType(str, Enum):
    FALL = "FALL"
    NO_HELMET = "NO_HELMET"
    NO_VEST = "NO_VEST"
    UNAUTHORIZED_ACCESS = "UNAUTHORIZED_ACCESS"
    CLOCK_IN = "CLOCK_IN"
    CLOCK_OUT = "CLOCK_OUT"
    # Logistics events
    ROBO = "ROBO"
    MANIPULACION_CARGA = "MANIPULACION_CARGA"
    APERTURA_NO_AUTORIZADA = "APERTURA_NO_AUTORIZADA"

class BlockchainStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    FAILED = "failed"

class Event(Base):
    __tablename__ = "events"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    type = Column(String, nullable=False)
    camera_id = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    clip_path = Column(String)
    hash_sha256 = Column(String)
    blockchain_tx = Column(String)
    blockchain_status = Column(String, default=BlockchainStatus.PENDING)
    confidence = Column(Float)
    event_metadata = Column(JSON, default={})
    module = Column(String, default="CARGO")  # FACTORY | CARGO
    genlayer_verdict = Column(String)  # ROBO_CONFIRMADO | FALSA_ALARMA | REQUIERE_REVISION
    incident_description = Column(String, nullable=True)  # Textual description for Genlayer
    ipfs_cid = Column(String, nullable=True)   # IPFS CID of the incident clip (Pinata)
    ipfs_url = Column(String, nullable=True)   # Public gateway URL for the clip
