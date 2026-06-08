from groq import Groq

from dotenv import load_dotenv

import os
import json

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

MODEL = os.getenv("GROQ_MODEL")


def generate_ai_insights(
    monthly_income,
    expenses
):

    total_expense = sum(
        expense["amount"]
        for expense in expenses
    )

    savings = monthly_income - total_expense

    savings_rate = (
        round((savings / monthly_income) * 100, 2)
        if monthly_income > 0
        else 0 
    )

    prompt = f"""
    You are an AI financial advisor.

    Analyze the following user financial data.

    Monthly Income:
    ₹{monthly_income}

    Total Expenses:
    ₹{total_expense}

    Savings:
    ₹{savings}

    Savings Rate:
    {savings_rate}%

    Expense Breakdown:
    {json.dumps(expenses, indent=2)}

    Generate:
    1. financial score out of 100
    2. 5 professional financial insights
    3. 4 savings recommendations
    4. predicted next month expense
    5. predicted next month savings
    6. financial risk level

    Return ONLY valid JSON.

    Example format:

    {{
      "financial_score": 82,
      "insights": [],
      "recommendations": [],
      "prediction": {{
        "predicted_expense": 18000,
        "predicted_savings": 35000,
        "risk_level": "Low"
      }}
    }}
    """

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.5
    )

    content = response.choices[0].message.content

    print(content)

    content = content.strip()

    if content.startswith("```json"):
        content = content.replace(
            "```json",
            ""
        )

    if content.endswith("```"):
        content = content[:-3]

    content = content.strip()

    ai_data = json.loads(content)

    ai_data["total_expense"] = total_expense
    ai_data["savings"] = savings
    ai_data["savings_rate"] = savings_rate

    return ai_data