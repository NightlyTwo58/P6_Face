***Facial Recognition App***

**Installation & Running**
*Unforutunately, the Docker container is still WIP. You'll have to manually install with pip.*  
For dependencies:  
~~~pip install -r backend/requirements.txt~~~  

You must also have ~~~npm~~~ and ~~~node.js~~~ installed, amongst other things, in order for the frontend to run.  


To run:  
Open two terminals and navigate to the frontend and backend folder respectively. In the frontend terminal:
~~~npm start~~~
In the backend terminal:
~~~uvicorn main:app --reload --host 127.0.0.1 --port 8000~~~

The webpage should open in your browser, and if you have a camera, it might work!
