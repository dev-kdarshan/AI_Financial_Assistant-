from fastapi import FastAPI

from .routes import router

app = FastAPI(
    title="AIFA AI Service"
)

app.include_router(
    router,
    prefix="/ai"
)


@app.get("/")
def root():

    return {
        "message": "AI Service Running"
    }