from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import face_recognition
import shutil
from pathlib import Path
import os
import sys

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

app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")

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


@app.post("/recognize")
async def recognize(file: UploadFile = File(...)):
    tmp_path = Path(FACES_DIR) / "temp.jpg"
    with tmp_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    unknown = face_recognition.load_image_file(str(tmp_path))
    unknown_encs = face_recognition.face_encodings(unknown)
    if not unknown_encs:
        raise HTTPException(status_code=400, detail="No face detected")

    known_encs, names = load_known_faces()
    results = face_recognition.face_distance(known_encs, unknown_encs[0]) if known_encs else []

    if not results:
        return {"result": "No known faces", "distances": {}}

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


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000)
