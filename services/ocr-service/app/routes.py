from fastapi import APIRouter, UploadFile, File
import shutil
import os

from .ocr_engine import extract_text_from_image
from .parser import parse_receipt

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/extract")
async def extract_receipt(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    text = extract_text_from_image(file_path)
    parsed = parse_receipt(text)

    return {
        **parsed,
        "raw_text": text
    }