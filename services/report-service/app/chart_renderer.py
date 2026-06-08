import matplotlib.pyplot as plt
import uuid
import os

CHART_DIR = "reports/charts"

os.makedirs(CHART_DIR, exist_ok=True)


def generate_pie_chart(expenses):

    labels = [
        expense["category"]
        for expense in expenses
    ]

    amounts = [
        expense["amount"]
        for expense in expenses
    ]

    path = f"{CHART_DIR}/pie_{uuid.uuid4()}.png"

    plt.figure(figsize=(8, 8))

    plt.pie(
        amounts,
        labels=labels,
        autopct="%1.1f%%",
        startangle=140
    )

    plt.title(
        "Expense Distribution Analysis",
        fontsize=18,
        fontweight="bold"
    )

    plt.tight_layout()

    plt.savefig(
        path,
        dpi=300,
        bbox_inches="tight"
    )

    plt.close()

    return path


def generate_bar_chart(expenses):

    categories = [
        expense["category"]
        for expense in expenses
    ]

    amounts = [
        expense["amount"]
        for expense in expenses
    ]

    path = f"{CHART_DIR}/bar_{uuid.uuid4()}.png"

    plt.figure(figsize=(10, 6))

    bars = plt.bar(
        categories,
        amounts
    )

    plt.title(
        "Category Expense Comparison",
        fontsize=18,
        fontweight="bold"
    )

    plt.xlabel(
        "Expense Categories",
        fontsize=12
    )

    plt.ylabel(
        "Amount (₹)",
        fontsize=12
    )

    plt.grid(
        axis="y",
        linestyle="--",
        alpha=0.4
    )

    for bar in bars:

        height = bar.get_height()

        plt.text(
            bar.get_x() + bar.get_width()/2,
            height + 200,
            f"₹{int(height)}",
            ha="center",
            fontsize=10,
            fontweight="bold"
        )

    plt.tight_layout()

    plt.savefig(
        path,
        dpi=300,
        bbox_inches="tight"
    )

    plt.close()

    return path


def generate_trend_chart(monthly_trend):

    days = [
        item["day"]
        for item in monthly_trend
    ]

    amounts = [
        item["amount"]
        for item in monthly_trend
    ]

    average_spending = sum(amounts) / len(amounts)

    path = f"{CHART_DIR}/trend_{uuid.uuid4()}.png"

    plt.figure(figsize=(12, 6))

    plt.plot(
        days,
        amounts,
        marker="o",
        linewidth=3
    )

    plt.axhline(
        y=average_spending,
        linestyle="--",
        label=f"Average Spending ₹{int(average_spending)}"
    )

    plt.title(
        "Daily Spending Trend Analysis",
        fontsize=18,
        fontweight="bold"
    )

    plt.xlabel(
        "Days",
        fontsize=12
    )

    plt.ylabel(
        "Daily Expense (₹)",
        fontsize=12
    )

    plt.xticks(rotation=45)

    plt.grid(
        linestyle="--",
        alpha=0.5
    )

    plt.legend()

    plt.tight_layout()

    plt.savefig(
        path,
        dpi=300,
        bbox_inches="tight"
    )

    plt.close()

    return path