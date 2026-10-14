import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="user")  # "user" or "admin"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    detections = relationship("Detection", back_populates="user", cascade="all, delete-orphan")

class Detection(Base):
    __tablename__ = "detections"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, default="Road Detection")
    source_type = Column(String, nullable=False)  # "image", "video", "camera"
    original_filename = Column(String, nullable=True)
    original_filepath = Column(String, nullable=False)
    processed_filepath = Column(String, nullable=False)
    
    pothole_count = Column(Integer, default=0)
    avg_confidence = Column(Float, default=0.0)
    high_severity_count = Column(Integer, default=0)
    medium_severity_count = Column(Integer, default=0)
    low_severity_count = Column(Integer, default=0)
    total_estimated_area_cm2 = Column(Float, default=0.0)
    
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    location_name = Column(String, nullable=True)
    
    # Store list of dicts: [{bbox: [x1, y1, x2, y2], confidence: float, severity: str, estimated_size_cm2: float}]
    detections_json = Column(JSON, nullable=True)
    
    status = Column(String, default="completed")  # "processing", "completed", "failed"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="detections")

class ModelTrainingLog(Base):
    __tablename__ = "model_training_logs"

    id = Column(Integer, primary_key=True, index=True)
    dataset_name = Column(String, nullable=False)
    images_count = Column(Integer, default=0)
    epochs = Column(Integer, default=10)
    status = Column(String, default="completed")  # "in_progress", "completed", "failed"
    metrics_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
