from fastapi import FastAPI, UploadFile, File
import face_recognition
import numpy as np

app = FastAPI()

# Pretend database: map "person_name" -> embedding vector
# In real life you’d load from DB or file
known_faces = {
    "Alice": face_recognition.face_encodings(
        face_recognition.load_image_file("known/alice.jpg")
    )[0],
    "Bob": face_recognition.face_encodings(
        face_recognition.load_image_file("known/bob.jpg")
    )[0],
}

@app.post("/recognize")
async def recognize(file: UploadFile = File(...)):
    image = face_recognition.load_image_file(file.file)
    encodings = face_recognition.face_encodings(image)

    if len(encodings) == 0:
        return {"result": "No face detected"}

    query = encodings[0]

    # Compare with known faces
    results = {}
    for name, known_embedding in known_faces.items():
        distance = np.linalg.norm(known_embedding - query)
        results[name] = float(distance)

    best_match = min(results, key=results.get)
    if results[best_match] < 0.6:  # threshold
        return {"result": best_match, "distances": results}
    else:
        return {"result": "Unknown", "distances": results}
