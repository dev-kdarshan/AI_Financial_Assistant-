from fastapi import FastAPI
from app.routes import router

app = FastAPI(
    title="AIFA Report Service",
    version="2.0.0"
)

app.include_router(router)


@app.get("/")
async def root():
    return {
        "service": "AIFA Report Service",
        "status": "ok",
        "endpoint": "POST /generate-report"
    }


@app.get("/health")
def health():
    return {"status": "healthy"}