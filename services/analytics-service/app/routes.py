from fastapi import APIRouter

from .schemas import ExpenseInput
from .trend_analyzer import analyze_trends
from .predictor import predict_next_month
from .category_classifier import classify_category
from .ai_insights import generate_ai_insights

router = APIRouter()


@router.post("/analyze")
def analyze(data: ExpenseInput):

    expenses = data.expenses

    # AI category classification
    for exp in expenses:

        if (
            not exp.category
            or exp.category == "other"
        ) and exp.description:

            exp.category = classify_category(
                exp.description
            )

    # Traditional analytics
    trends = analyze_trends(expenses)

    # Predictions
    prediction = predict_next_month(expenses)

    # AI insights
    insights = generate_ai_insights(
        trends,
        prediction
    )

    return {
        "success": True,

        "trends": trends,

        "predictions": {
            "next_month_spend": prediction
        },

        "ai_insights": insights
    }