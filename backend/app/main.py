import os
import sys
from pathlib import Path

# Ensure the backend root directory is in sys.path when running app/main.py directly
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models import User, Detection
from app.security import hash_password
from app.api import auth, detection, map as map_api, admin, reports

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_TITLE,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for React frontend (Supports local dev, GitHub Pages https, and Vercel/cloud deployments)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static directory for serving uploaded & annotated images/videos
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(detection.router, prefix=settings.API_PREFIX)
app.include_router(map_api.router, prefix=settings.API_PREFIX)
app.include_router(admin.router, prefix=settings.API_PREFIX)
app.include_router(reports.router, prefix=settings.API_PREFIX)

@app.on_event("startup")
def seed_initial_data():
    """
    Seed initial admin user and sample pothole detections for demonstration.
    """
    db = SessionLocal()
    try:
        # Check if users exist
        user_count = db.query(User).count()
        if user_count == 0:
            admin_user = User(
                email="admin@potholeguard.ai",
                hashed_password=hash_password("admin123"),
                full_name="System Administrator",
                role="admin"
            )
            demo_user = User(
                email="user@potholeguard.ai",
                hashed_password=hash_password("user123"),
                full_name="Road Inspector Alex",
                role="user"
            )
            db.add(admin_user)
            db.add(demo_user)
            db.commit()
            db.refresh(admin_user)
            db.refresh(demo_user)

            # Sample Detections across global countries (USA, India, UK, Germany, Japan, Australia, Brazil)
            sample_locations = [
                {"title": "Mumbai Coastal Highway Pothole", "lat": 19.0760, "lng": 72.8777, "loc": "Mumbai, India", "cnt": 4, "hi": 2, "med": 1, "low": 1, "conf": 94.2, "src": "image"},
                {"title": "New York 5th Ave Cavity", "lat": 40.7128, "lng": -74.0060, "loc": "New York, USA", "cnt": 3, "hi": 1, "med": 1, "low": 1, "conf": 92.4, "src": "image"},
                {"title": "London Piccadilly Circus Crack", "lat": 51.5074, "lng": -0.1278, "loc": "London, UK", "cnt": 2, "hi": 0, "med": 1, "low": 1, "conf": 89.5, "src": "video"},
                {"title": "Berlin Alexanderplatz Depression", "lat": 52.5200, "lng": 13.4050, "loc": "Berlin, Germany", "cnt": 5, "hi": 2, "med": 2, "low": 1, "conf": 91.8, "src": "image"},
                {"title": "Tokyo Shibuya Crossing Defect", "lat": 35.6762, "lng": 139.6503, "loc": "Tokyo, Japan", "cnt": 1, "hi": 0, "med": 0, "low": 1, "conf": 96.1, "src": "camera"},
                {"title": "Sydney Harbor Approach Crater", "lat": -33.8688, "lng": 151.2093, "loc": "Sydney, Australia", "cnt": 3, "hi": 1, "med": 2, "low": 0, "conf": 88.7, "src": "video"},
                {"title": "São Paulo Paulista Ave Pothole", "lat": -23.5505, "lng": -46.6333, "loc": "São Paulo, Brazil", "cnt": 6, "hi": 3, "med": 2, "low": 1, "conf": 93.0, "src": "image"},
                {"title": "San Francisco Bay Bridge Cavity", "lat": 37.7749, "lng": -122.4194, "loc": "San Francisco, USA", "cnt": 2, "hi": 1, "med": 1, "low": 0, "conf": 95.0, "src": "image"},
            ]

            for idx, loc_data in enumerate(sample_locations):
                det = Detection(
                    user_id=demo_user.id,
                    title=loc_data["title"],
                    source_type=loc_data["src"],
                    original_filename=f"sample_{idx+1}.jpg",
                    original_filepath=os.path.join(settings.UPLOAD_DIR, f"sample_{idx+1}.jpg"),
                    processed_filepath=os.path.join(settings.UPLOAD_DIR, f"sample_{idx+1}.jpg"),
                    pothole_count=loc_data["cnt"],
                    avg_confidence=loc_data["conf"],
                    high_severity_count=loc_data["hi"],
                    medium_severity_count=loc_data["med"],
                    low_severity_count=loc_data["low"],
                    total_estimated_area_cm2=round(loc_data["cnt"] * 480.0, 1),
                    latitude=loc_data["lat"],
                    longitude=loc_data["lng"],
                    location_name=loc_data["loc"],
                    detections_json=[
                        {
                            "bbox": [100.0, 150.0, 320.0, 380.0],
                            "confidence": loc_data["conf"],
                            "severity": "High" if loc_data["hi"] > 0 else "Medium",
                            "estimated_size_cm2": 620.5
                        }
                    ],
                    status="completed",
                    created_at=datetime.datetime.utcnow() - datetime.timedelta(days=idx)
                )
                db.add(det)
            db.commit()
    finally:
        db.close()

from fastapi.responses import FileResponse

frontend_dist_dir = os.path.abspath(os.path.join(settings.BASE_DIR, "..", "frontend", "dist"))
frontend_assets_dir = os.path.join(frontend_dist_dir, "assets")

if os.path.exists(frontend_assets_dir):
    app.mount("/assets", StaticFiles(directory=frontend_assets_dir), name="frontend_assets")

@app.get("/api/status")
@app.get("/api/health")
def api_status():
    return {
        "status": "online",
        "system": settings.PROJECT_NAME,
        "title": settings.PROJECT_TITLE,
        "version": settings.VERSION,
        "docs": "/docs"
    }

if os.path.exists(os.path.join(frontend_dist_dir, "index.html")):
    @app.get("/favicon.svg", include_in_schema=False)
    def favicon():
        fav_path = os.path.join(frontend_dist_dir, "favicon.svg")
        if os.path.exists(fav_path):
            return FileResponse(fav_path)
        return FileResponse(os.path.join(frontend_dist_dir, "index.html"))

    @app.get("/icons.svg", include_in_schema=False)
    def icons():
        icon_path = os.path.join(frontend_dist_dir, "icons.svg")
        if os.path.exists(icon_path):
            return FileResponse(icon_path)
        return FileResponse(os.path.join(frontend_dist_dir, "index.html"))

    @app.api_route("/{full_path:path}", methods=["GET", "HEAD"], include_in_schema=False)
    def serve_frontend_spa(full_path: str):
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json") or full_path.startswith("redoc") or full_path.startswith("uploads"):
            return None
        candidate = os.path.join(frontend_dist_dir, full_path)
        if full_path and os.path.isfile(candidate):
            return FileResponse(candidate)
        return FileResponse(os.path.join(frontend_dist_dir, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "status": "online",
            "system": settings.PROJECT_NAME,
            "title": settings.PROJECT_TITLE,
            "version": settings.VERSION,
            "docs": "/docs"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

