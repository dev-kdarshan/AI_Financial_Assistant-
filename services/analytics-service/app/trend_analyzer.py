from collections import defaultdict


def analyze_trends(expenses):

    total_spent = 0
    category_breakdown = defaultdict(float)

    for exp in expenses:

        total_spent += exp.amount

        category_breakdown[exp.category] += exp.amount

    return {
        "total_spent": round(total_spent, 2),
        "category_breakdown": dict(category_breakdown)
    }