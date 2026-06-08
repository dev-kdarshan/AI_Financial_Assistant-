from pydantic import BaseModel
from typing import List, Optional


class Expense(BaseModel):
    amount: float
    category: Optional[str] = "other"
    datetime: str
    description: Optional[str] = None


class ExpenseInput(BaseModel):
    expenses: List[Expense]