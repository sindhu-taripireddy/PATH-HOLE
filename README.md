# PotholeGuard 🛡️
## AI-Based Real-Time Pothole Detection, Severity Analysis & Geolocation System

PotholeGuard is an enterprise-grade AI computer vision and road infrastructure monitoring platform built using **YOLO**, **OpenCV**, **FastAPI**, **PostgreSQL**, and **React**.

---

### 🚀 Key Features

- **AI Object Detection**: Real-time YOLOv8 object detection with OpenCV feature extraction for road surface cavities.
- **Severity Classification**: Automatic classification of pothole severity (`Low`, `Medium`, `High`) based on relative surface area and contrast depth.
- **Multimodal Scanning**: Supports drag-and-drop Image Upload, Video Processing, and Live Webcam Stream detection.
- **Geolocation & Interactive Map**: Leaflet interactive map rendering color-coded pothole markers across city road coordinates.
- **Inspection PDF Reports**: One-click download of official PDF inspection reports with evidence images and spatial telemetry.
- **Admin Management Panel**: User role administration, system CPU/RAM monitoring, and dataset retraining triggers.
- **PostgreSQL Database**: Persistent storage for users, detection records, bounding box schemas, and GPS coordinates (with seamless SQLite auto-fallback for local out-of-the-box evaluation).

---

### 📂 Project Structure

```
PATH HOLE/
├── backend/
│   ├── app/
│   │   ├── api/             # Auth, Detection, Map, Admin, Reports Endpoints
│   │   ├── services/        # YOLO Inference, Severity Engine, PDF Generator
│   │   ├── config.py        # Environment & Storage Settings
│   │   ├── database.py      # PostgreSQL & Engine Setup
│   │   ├── models.py        # SQLAlchemy ORM Models
│   │   ├── schemas.py       # Pydantic Request/Response Schemas
│   │   ├── security.py      # JWT Auth & Hashing
│   │   └── main.py          # FastAPI Application
│   ├── uploads/             # Annotated Evidence Media Storage
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # Sidebar, Navbar, StatCard, SeverityBadge, Modal, Toast
│   │   ├── pages/           # Dashboard, Detect, Live, Map, History, Reports, Admin, Auth
│   │   ├── services/        # Axios API Client
│   │   ├── context/         # Auth Context & State Provider
│   │   └── App.jsx
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

---

### 🛠️ Quick Setup & Running Instructions

#### ⚡ Option A: One-Click Launch (Windows)
Simply double-click:
```bash
run.bat
```
*(or run `start_backend.bat` and `start_frontend.bat` separately).*

---

#### 🌐 Option B: Manual Setup

#### 1. Backend Setup (FastAPI + Python)
```bash
# Navigate to backend directory
cd backend

# Create & activate virtual environment (optional)
python -m venv .venv
# On Windows:
.venv\Scripts\activate

# Install Python requirements
pip install -r requirements.txt

# Start FastAPI server (Runs on http://localhost:8000)
python app.py
```

#### 2. Frontend Setup (React + Vite + Tailwind)
```bash
# Navigate to frontend directory
cd frontend

# Install node dependencies
npm install

# Start Vite dev server (Runs on http://localhost:5173)
npm run dev
```

---

### 🔑 Demo Account Credentials

| Role | Email | Password |
|---|---|---|
| **System Administrator** | `admin@potholeguard.ai` | `admin123` |
| **Road Inspector** | `user@potholeguard.ai` | `user123` |

---

### 🌐 System Architecture Flow

```
User (Web Client)
  ├── 1. Sign In / Sign Up (JWT Auth)
  ├── 2. Upload Image / Video / Live Camera
  ├── 3. FastAPI Backend Service
  │     ├── YOLOv8 Inference & OpenCV Detection
  │     ├── Severity & Size Area Calculator
  │     └── Geolocation GPS Attachment
  ├── 4. PostgreSQL Database Persistence
  └── 5. Interactive Dashboard, Leaflet Map & PDF Export
```

---

### 🚀 GitHub Pages & Cloud Deployment

#### 1. Enable GitHub Pages Deployment
This repository includes an automated GitHub Actions CI/CD workflow (`.github/workflows/deploy.yml`) that builds and deploys the frontend automatically on every push to `main`.

1. Go to your repository on GitHub: `https://github.com/sindhu-taripireddy/PATH-HOLE`
2. Click on **Settings** tab.
3. In the left sidebar, click **Pages**.
4. Under **Build and deployment** > **Source**, select **GitHub Actions**.
5. Once selected, your site will be published at:
   **`https://sindhu-taripireddy.github.io/PATH-HOLE/`**

#### 2. Backend Hosting (FastAPI + YOLO)
- GitHub Pages hosts static web frontends. To run the full AI object detection and database backend in the cloud, deploy the `backend/` folder to [Render](https://render.com), [Railway](https://railway.app), or [Hugging Face Spaces](https://huggingface.co/spaces).
- In the frontend **Settings** page (or via `.env` `VITE_API_URL`), enter your deployed backend URL (or test against your local running instance at `http://127.0.0.1:8000`).

