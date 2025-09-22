import os
import sys
import threading
import time
from PyQt5.QtCore import QUrl
from PyQt5.QtWebEngineWidgets import QWebEngineView, QWebEnginePage
from PyQt5.QtWebEngineCore import QWebEngineUrlRequestInfo
from PyQt5.QtWidgets import QApplication, QMainWindow
current_dir = os.path.dirname(os.path.abspath(sys.executable))
sys.path.insert(0, current_dir)

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import face_recognition
import shutil
from pathlib import Path

if getattr(sys, 'frozen', False):
    base_path = sys._MEIPASS
else:
    base_path = os.path.abspath(os.path.dirname(__file__))

app = FastAPI()

# Allow React frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STATIC_DIR = os.path.join(base_path, "static")
FACES_DIR = os.path.join(base_path, "data")
if not os.path.exists(FACES_DIR):
    os.makedirs(FACES_DIR)

def load_known_faces():
    encodings = []
    names = []
    for file in Path(FACES_DIR).glob("*.jpg"):
        img = face_recognition.load_image_file(str(file))
        face_encs = face_recognition.face_encodings(img)
        if face_encs:
            encodings.append(face_encs[0])
            names.append(file.stem)
    return encodings, names

@app.post("/recognize/")
async def recognize(
    file: UploadFile = File(...),
    known_faces: list[UploadFile] = File(default=[])
):
    unknown = face_recognition.load_image_file(file.file)
    unknown_encs = face_recognition.face_encodings(unknown)
    if not unknown_encs:
        return {"result": "No face detected in target image"}

    known_encs, names = load_known_faces()

    for kf in known_faces:
        img = face_recognition.load_image_file(kf.file)
        encs = face_recognition.face_encodings(img)
        if encs:
            known_encs.append(encs[0])
            names.append(kf.filename.rsplit(".", 1)[0])

    if not known_encs:
        return {"result": "No known faces available"}

    results = face_recognition.face_distance(known_encs, unknown_encs[0])
    best_idx = results.argmin()

    return {
        "result": names[best_idx],
        "distance": float(results[best_idx]),
        "distances": {names[i]: float(d) for i, d in enumerate(results)}
    }

@app.get("/faces")
async def list_faces():
    return {"faces": [f.name for f in Path(FACES_DIR).glob("*.jpg")]}

@app.post("/faces/upload")
async def upload_face(file: UploadFile = File(...)):
    out_path = Path(FACES_DIR) / file.filename
    with out_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"message": f"Face {file.filename} uploaded."}

@app.delete("/faces/delete/{filename}")
async def delete_face(filename: str):
    path = Path(FACES_DIR) / filename
    if not path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    os.remove(path)
    return {"message": f"{filename} deleted"}

app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")

def run_fastapi_server():
    """Function to run the FastAPI server."""
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="warning")

class WebEnginePage(QWebEnginePage):
    def __init__(self, parent=None):
        super().__init__(parent)

    def onFeaturePermissionRequested(self, origin, feature):
        if feature == QWebEnginePage.MediaAudioCapture or feature == QWebEnginePage.MediaVideoCapture:
            self.setFeaturePermission(origin, feature, QWebEnginePage.PermissionGrantedByUser)
        else:
            self.setFeaturePermission(origin, feature, QWebEnginePage.PermissionDeniedByUser)

class Browser(QMainWindow):
    """The main application window."""
    def __init__(self, url):
        super().__init__()
        self.browser = QWebEngineView()
        self.browser.setPage(WebEnginePage(self.browser))
        self.browser.setUrl(QUrl(url))
        self.setCentralWidget(self.browser)
        self.setGeometry(100, 100, 1200, 800)
        self.setWindowTitle("Face Recognition App")

def start_app():
    """Main function to start both the server and the GUI."""
    server_thread = threading.Thread(target=run_fastapi_server)
    server_thread.daemon = True
    server_thread.start()

    time.sleep(2)

    app_qt = QApplication(sys.argv)
    browser = Browser("http://127.0.0.1:8000")
    browser.show()
    sys.exit(app_qt.exec_())

if __name__ == "__main__":
    start_app()