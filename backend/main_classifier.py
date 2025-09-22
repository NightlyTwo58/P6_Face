from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from io import BytesIO
import numpy as np
import traceback
import json

with open("data/class_names.json") as f:
    class_names = json.load(f)

model = load_model("face_model.h5")

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

@app.post("/recognize")
async def recognize(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        img = image.load_img(BytesIO(contents), target_size=(128,128))
        x = image.img_to_array(img)
        x = np.expand_dims(x, axis=0)
        x = x / 255.0
        
        # Predict
        pred = model.predict(x)
        class_idx = np.argmax(pred[0])
        confidence = float(pred[0][class_idx])
        
        return {
            "result": class_names[class_idx],
            "confidence": confidence,
            "all_probabilities": pred[0].tolist()
        }
    except Exception as e:
        print("ERROR in /recognize:", e)
        traceback.print_exc()
        return JSONResponse({"error": str(e)}, status_code=500)
