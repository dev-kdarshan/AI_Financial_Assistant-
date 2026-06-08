# app/main.py

from fastapi import FastAPI
from .routes import router

app = FastAPI(title="OCR Service")

app.include_router(router, prefix="/ocr")


@app.get("/")
def root():
    return {"message": "OCR Service Running"}