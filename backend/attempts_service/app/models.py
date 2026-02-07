import uuid
from sqlalchemy import Column, String, DateTime, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class Episode(Base):
    __tablename__ = "episodes"

    episode_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(String, index=True)
    start_time = Column(DateTime, default=func.now())
    end_time = Column(DateTime, nullable=True)
    dominant_competency = Column(String, nullable=True)
    resolution_type = Column(String, nullable=True)

class Attempt(Base):
    __tablename__ = "attempts"

    attempt_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(String, index=True)
    timestamp = Column(DateTime, default=func.now())

    mode = Column(String)
    code_hash = Column(String)

    analysis = Column(JSON)
    mentor_action = Column(JSON)

    episode_id = Column(UUID(as_uuid=True), ForeignKey("episodes.episode_id"))
