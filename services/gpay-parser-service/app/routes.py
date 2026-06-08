# app/routes.py

from fastapi import APIRouter, UploadFile, File
import shutil
import os

from .html_parser import parse_html

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/parse")
async def parse_gpay(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    transactions = parse_html(content)

    return {
        "count": len(transactions),
        "data": transactions
    }