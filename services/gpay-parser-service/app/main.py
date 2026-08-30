# app/main.py

from fastapi import FastAPI
from .routes import router

app = FastAPI(title="GPay Parser Service")

app.include_router(router, prefix="/gpay")


@app.get("/")
def root():
    return {"message": "GPay Parser Running"}

@app.get("/health")
def health():
    return {"status": "healthy"}