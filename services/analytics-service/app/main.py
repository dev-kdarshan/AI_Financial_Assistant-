from fastapi import FastAPI
from .routes import router

app = FastAPI(
    title="AIFA Analytics Service"
)

app.include_router(
    router,
    prefix="/analytics"
)


@app.get("/")
def root():

    return {
        "message": "Analytics Service Running 🚀"
    }