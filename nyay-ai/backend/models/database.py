from sqlalchemy import create_engine, Column, String, JSON, DateTime, Text, Boolean, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import uuid
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./nyay_ai.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Case(Base):
    __tablename__ = "cases"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    case_name = Column(String, nullable=True)          # officer-assigned label
    extracted_data = Column(JSON, nullable=True)
    ipc_sections = Column(JSON, nullable=True)
    missing_fields = Column(JSON, nullable=True)
    conversation_history = Column(JSON, default=list)
    complaint_ready = Column(Boolean, default=False)
    urgency = Column(String, default="low")
    status = Column(String, default="draft")
    complaint_draft = Column(Text, nullable=True)
    transcript = Column(Text, nullable=True)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
    # Safe migration: add new columns if they don't exist yet
    with engine.connect() as conn:
        for col in ["ALTER TABLE cases ADD COLUMN case_name VARCHAR"]:
            try:
                conn.execute(text(col))
                conn.commit()
            except Exception:
                pass  # column already exists
