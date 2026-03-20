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
    module = Column(String, default="FACTORY")  # FACTORY | CARGO
    genlayer_verdict = Column(String)  # Verdict from GenLayer contract
