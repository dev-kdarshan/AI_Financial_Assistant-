from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

MODEL = os.getenv("GROQ_MODEL")


def generate_ai_insights(trends, prediction):

    prompt = f"""
    Analyze this financial data.

    Trends:
    {trends}

    Prediction:
    {prediction}

    Give:
    - spending insights
    - unusual patterns
    - savings advice

    Return ONLY 3 short bullet points.
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
            temperature=0.3
        )

        text = (
            response.choices[0]
            .message.content
            .strip()
        )

        insights = [
            line.strip("-• ")
            for line in text.split("\n")
            if line.strip()
        ]

        return insights

    except Exception as e:
        print("AI INSIGHTS ERROR:", e)

        return [
            "Unable to generate AI insights"
        ]