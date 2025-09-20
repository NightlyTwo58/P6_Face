import os
import sys
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

# FACES_DIR = Path(__file__).parent / "data"
# FACES_DIR.mkdir(exist_ok=True)


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
    # Load unknown image
    unknown = face_recognition.load_image_file(file.file)
    unknown_encs = face_recognition.face_encodings(unknown)
    if not unknown_encs:
        return {"result": "No face detected in target image"}

    # Load known faces from disk
    known_encs, names = load_known_faces()

    # Load any uploaded known faces in-memory
    for kf in known_faces:
        img = face_recognition.load_image_file(kf.file)
        encs = face_recognition.face_encodings(img)
        if encs:
            known_encs.append(encs[0])
            names.append(kf.filename.rsplit(".", 1)[0])

    if not known_encs:
        return {"result": "No known faces available"}

    # Compute distances
    results = face_recognition.face_distance(known_encs, unknown_encs[0])
    best_idx = results.argmin()

    return {
        "result": names[best_idx],
        "distance": float(results[best_idx]),
        "distances": {names[i]: float(d) for i, d in enumerate(results)}
    }


@app.get("/faces")
async def list_faces():
    return {"faces": [f.name for f in FACES_DIR.glob("*.jpg")]}


@app.post("/faces/upload")
async def upload_face(file: UploadFile = File(...)):
    out_path = FACES_DIR / file.filename
    with out_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"message": f"Face {file.filename} uploaded."}


@app.delete("/faces/delete/{filename}")
async def delete_face(filename: str):
    path = FACES_DIR / filename
    if not path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    os.remove(path)
    return {"message": f"{filename} deleted"}

app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
