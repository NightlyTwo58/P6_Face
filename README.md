Facial Recognition App
======================

![demo](demo.jpg)  

Installation & Setup
-------------------

Note: The Docker container is still a work in progress. You will need to install dependencies manually.

Backend
-------

1. Make sure you have Python installed (3.10+ recommended).  
2. Install dependencies:

   ```pip install -r backend/requirements.txt```

Frontend
--------

1. Make sure you have Node.js and npm installed.  
2. Navigate to the frontend folder and install dependencies:

   ```npm install```

Running the App
---------------
Put images of faces you wish to recognize in the backend/data/ folder.  

You need to run both the frontend and backend simultaneously in separate terminals. Navigate to their respective folders before running these commands. You also need to create a /data folder under /backend with face photos to be recognized, and addition /train and /test folders if you choose to use the in-house MobileNetV2 algorithm (you'll also have to run model.py to train first).  
 - face_recognition: produces a 128-D encoding vector per face, and you manually compare with known encodings. Flexible but not trainable.  
 - Keras classifier: learns to directly map raw images → class labels. Requires a fixed training dataset and retraining if you add new people.  

1. Backend:
   face_recognition  
   ```uvicorn main:app --reload --host 127.0.0.1 --port 8000```
   in-house training algorithm  
   ```uvicorn main_classifier:app --reload --host 127.0.0.1 --port 8000```
   
3. Frontend:

   ```npm start```

The React app should open automatically in your browser. If your device has a camera, you can start using it to capture images and send them to the backend for recognition.
