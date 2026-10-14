import os
import sys
import subprocess
import threading
import time
import webbrowser
from pathlib import Path

# Fix Windows console encoding for Unicode/emojis
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

BACKEND_DIR = Path(__file__).resolve().parent
ROOT_DIR = BACKEND_DIR.parent
FRONTEND_DIR = ROOT_DIR / "frontend"

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

def start_frontend_dev_server():
    try:
        if (FRONTEND_DIR / "node_modules").exists():
            subprocess.Popen(
                ["npm.cmd", "run", "dev", "--", "--host", "127.0.0.1", "--port", "5173"],
                cwd=str(FRONTEND_DIR),
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                shell=True
            )
    except Exception:
        pass

def open_browser():
    time.sleep(2.5)
    try:
        import urllib.request
        try:
            with urllib.request.urlopen("http://127.0.0.1:5173/", timeout=1) as resp:
                if resp.status == 200:
                    webbrowser.open("http://localhost:5173")
                    return
        except Exception:
            pass
        webbrowser.open("http://localhost:8000")
    except Exception:
        pass

if __name__ == "__main__":
    os.chdir(str(BACKEND_DIR))

    print("\n" + "=" * 65)
    print("   [POTHOLEGUARD] AI Road Monitoring Platform")
    print("=" * 65)
    print("   Starting Backend & Frontend Services...")
    print("   Web Application:   http://localhost:5173  (or http://localhost:8000)")
    print("   Backend API:       http://localhost:8000")
    print("   Swagger Docs:      http://localhost:8000/docs")
    print("   Admin Login:       admin@potholeguard.ai / admin123")
    print("   Inspector Login:   user@potholeguard.ai  / user123")
    print("=" * 65 + "\n")

    threading.Thread(target=start_frontend_dev_server, daemon=True).start()
    threading.Thread(target=open_browser, daemon=True).start()

    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)