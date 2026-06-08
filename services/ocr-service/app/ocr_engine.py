import easyocr

reader = easyocr.Reader(['en'], gpu=False)

def extract_text_from_image(image_path: str) -> str:
    results = reader.readtext(image_path, detail=0)
    return "\n".join(results)