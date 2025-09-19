import sys
import os
import uvicorn
import main
if getattr(sys, 'frozen', False):
    os.chdir(os.path.dirname(sys.executable))

sys.path.insert(0, os.getcwd())
uvicorn.run("main:app", host="127.0.0.1", port=8000)