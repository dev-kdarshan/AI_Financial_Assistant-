from fastapi import FastAPI
from .routes import router

app = FastAPI(
    title="AIFA Notification Service"
)

app.include_router(
    router,
    prefix="/notify"
)


@app.get("/")
def root():

    return {
        "message": "Notification Service Running"
    }