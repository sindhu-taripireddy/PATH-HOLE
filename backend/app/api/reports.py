import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Detection
from app.security import get_current_user, User
from app.services.report_service import generate_pdf_report
from app.config import settings

router = APIRouter(prefix="/reports", tags=["Inspection Reports"])

@router.get("/export-pdf/{detection_id}")
def export_pdf_report(
    detection_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "admin":
        detection = db.query(Detection).filter(Detection.id == detection_id).first()
    else:
        detection = db.query(Detection).filter(
            Detection.id == detection_id,
            Detection.user_id == current_user.id
        ).first()

    if not detection:
        raise HTTPException(status_code=404, detail="Detection record not found")

    pdf_filename = f"pothole_report_{detection_id}.pdf"
    pdf_filepath = os.path.join(settings.UPLOAD_DIR, pdf_filename)

    generate_pdf_report(detection, pdf_filepath)

    return FileResponse(
        pdf_filepath,
        media_type="application/pdf",
        filename=pdf_filename
    )
