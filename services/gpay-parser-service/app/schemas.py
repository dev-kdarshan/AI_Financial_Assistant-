from pydantic import BaseModel
from typing import Optional

class Transaction(BaseModel):
    date: Optional[str]
    amount: Optional[float]
    type: Optional[str]  # debit / credit
    counterparty: Optional[str]
    source: str = "gpay"
    note: Optional[str]