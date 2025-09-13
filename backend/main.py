from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import face_recognition
import numpy as np
import os

app = FastAPI(title="Face Recognition API")


origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def load_known_faces(data_dir):
    known_faces = {}
    for filename in os.listdir(data_dir):
        if filename.lower().endswith((".jpg", ".jpeg", ".png")):
            print(f"Found face: {filename}")
            name = os.path.splitext(filename)[0]
            path = os.path.join(data_dir, filename)
            image = face_recognition.load_image_file(path)
            encodings = face_recognition.face_encodings(image)
            if not encodings:
                print(f"Warning: No face found in {filename}")
                continue
            known_faces[name] = encodings[0]
    return known_faces

known_faces = load_known_faces("data")

@app.post("/recognize")
async def recognize(file: UploadFile = File(...)):
    try:
        image = face_recognition.load_image_file(file.file)
        encodings = face_recognition.face_encodings(image)
        if len(encodings) == 0:
            return JSONResponse({"result": "No face detected"}, status_code=200)

        query = encodings[0]

        # Compare with known faces
        results = {name: float(np.linalg.norm(query - emb)) for name, emb in known_faces.items()}

        if not results:
            return JSONResponse({"result": "No known faces loaded"}, status_code=200)

        best_match = min(results, key=results.get)
        distance = results[best_match]

        if distance < 0.6:
            return {"result": best_match, "distance": distance, "distances": results}
        else:
            return {"result": "Unknown", "distances": results}

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
