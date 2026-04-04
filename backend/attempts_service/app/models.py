import uuid
from sqlalchemy import Column, String, DateTime, JSON, ForeignKey, Float, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class Episode(Base):
    __tablename__ = "episodes"

    episode_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    #session_id = Column(String, index=True)
    attempt_id = Column(UUID(as_uuid=True), primary_key=True)
    start_time = Column(DateTime, default=func.now())
    end_time = Column(DateTime, nullable=True)
    dominant_competency = Column(String, nullable=True)
    resolution_type = Column(String, nullable=True)

class Attempt(Base):
    __tablename__ = "attempts"
    __table_args__ = {"schema": "attempts", "extend_existing": True}
    attempt_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, index=True)
    timestamp = Column(DateTime, default=func.now())

    mode = Column(String)
    code_hash = Column(String)

    analysis = Column(JSON)
    mentor_action = Column(JSON)

    skill_scores = Column(JSON)      # нормализованные skill score
    total_score = Column(Float)
    is_correct = Column(Boolean)
    learning_session_id = Column(String, index=True, nullable=True)
    condition = Column(String, index=True, nullable=True)
    episode_id = Column(UUID(as_uuid=True), ForeignKey("episodes.episode_id"))
