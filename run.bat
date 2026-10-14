@echo off
title PotholeGuard Launcher
echo ===================================================
echo       PotholeGuard AI Infrastructure Platform
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Backend environment...
if not exist "backend\.venv\Scripts\python.exe" (
    echo Creating Python virtual environment in backend\.venv ...
    python -m venv backend\.venv
    echo Installing backend dependencies...
    backend\.venv\Scripts\pip.exe install -r backend\requirements.txt
)

echo [2/3] Checking Frontend dependencies...
if not exist "frontend\node_modules" (
    echo Installing npm dependencies in frontend...
    cd frontend && npm install && cd ..
)

echo [3/3] Launching Backend and Frontend services...
echo.

start "PotholeGuard Backend API (FastAPI)" cmd /k "cd /d ""%~dp0backend"" && .\.venv\Scripts\python.exe app.py"

timeout /t 3 /nobreak >nul

start "PotholeGuard Frontend (Vite React)" cmd /k "cd /d ""%~dp0frontend"" && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo Opening browser at http://localhost:5173 ...
start http://localhost:5173

echo.
echo ===================================================
echo   PotholeGuard is running!
echo   - Frontend: http://localhost:5173
echo   - Backend:  http://localhost:8000
echo   - Swagger:  http://localhost:8000/docs
echo ===================================================
echo Press any key to exit this launcher window (services keep running).
pause >nul
