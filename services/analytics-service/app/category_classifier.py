from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

MODEL = os.getenv("GROQ_MODEL")


VALID_CATEGORIES = [
    "food",
    "travel",
    "shopping",
    "entertainment",
    "bills",
    "health",
    "education",
    "other"
]


def classify_category(description: str):

    if not description:
        return "other"

    prompt = f"""
    Classify this expense into ONLY ONE category.

    Categories:
    {", ".join(VALID_CATEGORIES)}

    Expense:
    {description}

    Return ONLY category name.
    """

    try:

        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0
        )

        category = (
            response.choices[0]
            .message.content
            .strip()
            .lower()
        )

        print("AI CATEGORY:", category)

        if category not in VALID_CATEGORIES:
            return "other"

        return category

    except Exception as e:
        print("GROQ ERROR:", e)
        return "other"