from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime

# --- Auth Schemas ---
class UserSignUp(BaseModel):
    email: EmailStr
    password: str
    confirm_password: str
    full_name: str

class UserSignIn(BaseModel):
    email: EmailStr
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Any

class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- Detection Schemas ---
class PotholeItem(BaseModel):
    bbox: List[float]  # [x1, y1, x2, y2]
    confidence: float
    severity: str  # "Low", "Medium", "High"
    estimated_size_cm2: float

class DetectionCreate(BaseModel):
    title: Optional[str] = "Road Scan"
    source_type: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_name: Optional[str] = None

class DetectionOut(BaseModel):
    id: int
    user_id: int
    title: str
    source_type: str
    original_filepath: str
    processed_filepath: str
    pothole_count: int
    avg_confidence: float
    high_severity_count: int
    medium_severity_count: int
    low_severity_count: int
    total_estimated_area_cm2: float
    latitude: Optional[float]
    longitude: Optional[float]
    location_name: Optional[str]
    detections_json: Optional[List[dict]]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Map Schemas ---
class MapMarker(BaseModel):
    id: int
    latitude: float
    longitude: float
    location_name: Optional[str]
    pothole_count: int
    highest_severity: str
    processed_filepath: str
    created_at: datetime

# --- Admin Schemas ---
class SystemStatsOut(BaseModel):
    total_users: int
    total_detections: int
    total_potholes_found: int
    high_severity_potholes: int
    medium_severity_potholes: int
    low_severity_potholes: int
    avg_confidence: float
    system_cpu_percent: float
    system_ram_percent: float

class RetrainRequest(BaseModel):
    dataset_name: str
    dataset_url: Optional[str] = None
    epochs: int = 10
