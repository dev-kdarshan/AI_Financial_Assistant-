from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

from app.chart_renderer import (
    generate_pie_chart,
    generate_bar_chart,
    generate_trend_chart
)

from app.ai_insights import generate_ai_insights

from app.pdf_generator import generate_pdf_report

router = APIRouter()


class Expense(BaseModel):
    category: str
    amount: float


class MonthlyData(BaseModel):
    day: str
    amount: float


class ReportRequest(BaseModel):
    user_id: str
    monthly_income: float
    expenses: List[Expense]
    monthly_trend: List[MonthlyData]


@router.post("/generate-report")
async def generate_report(data: ReportRequest):

    expenses = [
        expense.dict()
        for expense in data.expenses
    ]

    monthly_trend = [
        trend.dict()
        for trend in data.monthly_trend
    ]

    pie_chart = generate_pie_chart(expenses)

    bar_chart = generate_bar_chart(expenses)

    trend_chart = generate_trend_chart(
        monthly_trend
    )

    ai_data = generate_ai_insights(
        monthly_income=data.monthly_income,
        expenses=expenses
    )

    pdf_path = generate_pdf_report(
        user_id=data.user_id,
        monthly_income=data.monthly_income,
        expenses=expenses,
        ai_data=ai_data,
        pie_chart=pie_chart,
        bar_chart=bar_chart,
        trend_chart=trend_chart
    )

    return {
        "message": "Professional financial report generated",
        "pdf_path": pdf_path
    }