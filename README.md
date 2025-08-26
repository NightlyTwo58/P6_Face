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

You need to run both the frontend and backend simultaneously in separate terminals. Navigate to their respective folders before running these commands.

1. Backend:

   ```uvicorn main:app --reload --host 127.0.0.1 --port 8000```

2. Frontend:

Put images of faces you wish to recognize in the backend/data/ folder.

   ```npm start```

The React app should open automatically in your browser. If your device has a camera, you can start using it to capture images and send them to the backend for recognition.
