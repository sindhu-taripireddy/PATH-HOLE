import os
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database import get_db
from app.models import Detection
from app.security import get_current_user, User

router = APIRouter(prefix="/map", tags=["Geolocation & Map"])

@router.get("/potholes")
def get_map_potholes(
    severity: Optional[str] = Query(None), # "High", "Medium", "Low"
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Detection).filter(Detection.latitude.isnot(None), Detection.longitude.isnot(None))

    if severity == "High":
        query = query.filter(Detection.high_severity_count > 0)
    elif severity == "Medium":
        query = query.filter(Detection.medium_severity_count > 0)
    elif severity == "Low":
        query = query.filter(Detection.low_severity_count > 0)

    detections = query.all()
    results = []

    for d in detections:
        highest_sev = "Low"
        if d.high_severity_count > 0:
            highest_sev = "High"
        elif d.medium_severity_count > 0:
            highest_sev = "Medium"

        # Extract filename from processed_filepath for serve URL
        filename = os.path.basename(d.processed_filepath)

        results.append({
            "id": d.id,
            "title": d.title,
            "latitude": d.latitude,
            "longitude": d.longitude,
            "location_name": d.location_name or "Unknown Road Sector",
            "pothole_count": d.pothole_count,
            "highest_severity": highest_sev,
            "avg_confidence": d.avg_confidence,
            "processed_image_filename": filename,
            "created_at": d.created_at,
            "high_severity_count": d.high_severity_count,
            "medium_severity_count": d.medium_severity_count,
            "low_severity_count": d.low_severity_count
        })

    return results

@router.get("/location-stats")
def get_location_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    detections = db.query(Detection).all()
    location_dict = {}

    for d in detections:
        loc = d.location_name or "Unassigned Zone"
        if loc not in location_dict:
            location_dict[loc] = {
                "location_name": loc,
                "pothole_count": 0,
                "high_severity": 0,
                "medium_severity": 0,
                "low_severity": 0
            }
        location_dict[loc]["pothole_count"] += d.pothole_count
        location_dict[loc]["high_severity"] += d.high_severity_count
        location_dict[loc]["medium_severity"] += d.medium_severity_count
        location_dict[loc]["low_severity"] += d.low_severity_count

    stats_list = sorted(location_dict.values(), key=lambda x: x["pothole_count"], reverse=True)
    return stats_list[:10]
