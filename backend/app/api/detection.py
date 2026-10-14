import os
import uuid
import shutil
import base64
import cv2
import numpy as np
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database import get_db
from app.models import User, Detection
from app.schemas import DetectionOut
from app.security import get_current_user
from app.services.yolo_service import yolo_service
from app.config import settings

router = APIRouter(prefix="/detection", tags=["Pothole Detection"])

@router.post("/image", response_model=DetectionOut)
async def detect_image(
    file: UploadFile = File(...),
    title: Optional[str] = Form("Road Scan"),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    location_name: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File uploaded must be an image (JPEG, PNG, WebP)")

    # Save original image
    ext = os.path.splitext(file.filename)[1] or ".jpg"
    orig_filename = f"orig_{uuid.uuid4().hex[:10]}{ext}"
    orig_filepath = os.path.join(settings.UPLOAD_DIR, orig_filename)

    with open(orig_filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Perform YOLO Pothole Detection & Severity Analysis
    result = yolo_service.detect_potholes_in_image(orig_filepath)

    # Default location fallback if not provided
    if latitude is None or longitude is None:
        latitude = 37.7749 + (np.random.rand() - 0.5) * 0.05
        longitude = -122.4194 + (np.random.rand() - 0.5) * 0.05
        if not location_name:
            location_name = "Highway 101, Sector 4"

    new_detection = Detection(
        user_id=current_user.id,
        title=title,
        source_type="image",
        original_filename=file.filename,
        original_filepath=orig_filepath,
        processed_filepath=result["processed_filepath"],
        pothole_count=result["pothole_count"],
        avg_confidence=result["avg_confidence"],
        high_severity_count=result["high_severity_count"],
        medium_severity_count=result["medium_severity_count"],
        low_severity_count=result["low_severity_count"],
        total_estimated_area_cm2=result["total_estimated_area_cm2"],
        latitude=latitude,
        longitude=longitude,
        location_name=location_name,
        detections_json=result["detections"],
        status="completed"
    )

    db.add(new_detection)
    db.commit()
    db.refresh(new_detection)

    return new_detection

@router.post("/video", response_model=DetectionOut)
async def detect_video(
    file: UploadFile = File(...),
    title: Optional[str] = Form("Road Video Scan"),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    location_name: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="File uploaded must be a video (MP4, AVI, WebM)")

    ext = os.path.splitext(file.filename)[1] or ".mp4"
    orig_filename = f"orig_vid_{uuid.uuid4().hex[:10]}{ext}"
    orig_filepath = os.path.join(settings.UPLOAD_DIR, orig_filename)

    with open(orig_filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Process Video Frames
    result = yolo_service.process_video(orig_filepath)

    if latitude is None or longitude is None:
        latitude = 37.7749 + (np.random.rand() - 0.5) * 0.05
        longitude = -122.4194 + (np.random.rand() - 0.5) * 0.05
        if not location_name:
            location_name = "Main Expressway, Route 66"

    new_detection = Detection(
        user_id=current_user.id,
        title=title,
        source_type="video",
        original_filename=file.filename,
        original_filepath=orig_filepath,
        processed_filepath=result["processed_filepath"],
        pothole_count=result["pothole_count"],
        avg_confidence=result["avg_confidence"],
        high_severity_count=result["high_severity_count"],
        medium_severity_count=result["medium_severity_count"],
        low_severity_count=result["low_severity_count"],
        total_estimated_area_cm2=round(float(result["pothole_count"] * 450.0), 1),
        latitude=latitude,
        longitude=longitude,
        location_name=location_name,
        detections_json=[],
        status="completed"
    )

    db.add(new_detection)
    db.commit()
    db.refresh(new_detection)

    return new_detection

@router.post("/frame")
async def detect_live_frame(
    frame_data: dict,  # {"image_base64": "data:image/jpeg;base64,..."}
    current_user: User = Depends(get_current_user)
):
    """
    Real-time frame inference endpoint for Web Camera stream.
    Decodes base64 frame, detects potholes, and returns bounding boxes + annotated image.
    """
    try:
        raw_b64 = frame_data.get("image_base64", "")
        if "," in raw_b64:
            raw_b64 = raw_b64.split(",")[1]
        
        img_bytes = base64.b64decode(raw_b64)
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            raise HTTPException(status_code=400, detail="Could not decode image frame")

        # Temporary save frame to process with yolo_service
        temp_path = os.path.join(settings.UPLOAD_DIR, f"temp_frame_{uuid.uuid4().hex[:8]}.jpg")
        cv2.imwrite(temp_path, img)

        result = yolo_service.detect_potholes_in_image(temp_path)

        # Read back processed image to base64
        with open(result["processed_filepath"], "rb") as f:
            proc_b64 = base64.b64encode(f.read()).decode("utf-8")

        # Cleanup temporary file
        if os.path.exists(temp_path):
            os.remove(temp_path)

        return {
            "pothole_count": result["pothole_count"],
            "avg_confidence": result["avg_confidence"],
            "high_severity_count": result["high_severity_count"],
            "medium_severity_count": result["medium_severity_count"],
            "low_severity_count": result["low_severity_count"],
            "detections": result["detections"],
            "annotated_image_base64": f"data:image/jpeg;base64,{proc_b64}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Frame detection error: {str(e)}")

@router.get("/history", response_model=List[DetectionOut])
def get_detection_history(
    search: Optional[str] = Query(None),
    severity: Optional[str] = Query(None), # "High", "Medium", "Low"
    source: Optional[str] = Query(None),   # "image", "video", "camera"
    sort_by: Optional[str] = Query("newest"), # "newest", "oldest", "confidence"
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "admin":
        query = db.query(Detection)
    else:
        query = db.query(Detection).filter(Detection.user_id == current_user.id)

    if search:
        query = query.filter(
            (Detection.title.ilike(f"%{search}%")) | 
            (Detection.location_name.ilike(f"%{search}%"))
        )

    if severity:
        if severity == "High":
            query = query.filter(Detection.high_severity_count > 0)
        elif severity == "Medium":
            query = query.filter(Detection.medium_severity_count > 0)
        elif severity == "Low":
            query = query.filter(Detection.low_severity_count > 0)

    if source:
        query = query.filter(Detection.source_type == source)

    if sort_by == "oldest":
        query = query.order_by(Detection.created_at.asc())
    elif sort_by == "confidence":
        query = query.order_by(Detection.avg_confidence.desc())
    else:
        query = query.order_by(Detection.created_at.desc())

    return query.all()

@router.get("/{detection_id}", response_model=DetectionOut)
def get_detection_detail(
    detection_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "admin":
        det = db.query(Detection).filter(Detection.id == detection_id).first()
    else:
        det = db.query(Detection).filter(Detection.id == detection_id, Detection.user_id == current_user.id).first()
    if not det:
        raise HTTPException(status_code=404, detail="Detection record not found")
    return det

@router.delete("/{detection_id}")
def delete_detection(
    detection_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    det = db.query(Detection).filter(Detection.id == detection_id).first()
    if not det:
        raise HTTPException(status_code=404, detail="Detection record not found")

    if det.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this detection")

    # Delete physical files
    if os.path.exists(det.original_filepath):
        try:
            os.remove(det.original_filepath)
        except Exception:
            pass
    if os.path.exists(det.processed_filepath):
        try:
            os.remove(det.processed_filepath)
        except Exception:
            pass

    db.delete(det)
    db.commit()
    return {"message": "Detection deleted successfully"}
