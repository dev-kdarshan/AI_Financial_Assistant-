from pydantic import BaseModel
from typing import Optional

class OCRResponse(BaseModel):
    merchant: Optional[str]
    amount: Optional[float]
    date: Optional[str]
    category: Optional[str]  
    raw_text: str