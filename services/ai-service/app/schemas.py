from pydantic import BaseModel
from typing import List


class Expense(BaseModel):
    amount: float
    category: str
    datetime: str
    description: str


class AIQuery(BaseModel):
    user_id: str
    question: str
    expenses: List[Expense]