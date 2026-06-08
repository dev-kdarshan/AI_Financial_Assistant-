import re
from datetime import datetime

NOISE_WORDS = {
    "invoice", "tax", "bill", "gst", "original", "recipient",
    "address", "phone", "email", "web", "www", "bank", "ifsc",
    "account", "details", "terms", "conditions", "supply"
}


def clean_text(text: str):
    text = re.sub(r'[^A-Za-z0-9\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def extract_amount(text: str):
    # find all currency-like numbers
    matches = re.findall(r'\d{1,3}(?:,\d{3})*\.\d{2}', text)
    values = [float(m.replace(",", "")) for m in matches]

    if not values:
        return None

    # remove very small numbers (like qty 1.00, 2.00)
    values = [v for v in values if v > 10]

    if not values:
        return None

    # return the largest → typically total
    return max(values)

def extract_date(text: str):
    patterns = [
        r'\d{2}-[A-Za-z]{3}-\d{4}',   # 04-Mar-2020
        r'\d{2}/\d{2}/\d{4}',         # 04/03/2020
        r'\d{2}-\d{2}-\d{4}',         # 04-03-2020
    ]

    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            raw = match.group()

            # normalize to YYYY-MM-DD if possible
            for fmt in ("%d-%b-%Y", "%d/%m/%Y", "%d-%m-%Y"):
                try:
                    return datetime.strptime(raw, fmt).strftime("%Y-%m-%d")
                except:
                    pass

            return raw  # fallback

    return None


def score_line(line: str, idx: int):
    score = 0

    # 1. earlier lines are better
    score += max(0, 10 - idx)

    # 2. penalize too many digits
    if len(re.findall(r'\d', line)) > 3:
        score -= 3

    words = line.split()

    # 3. ideal length (2–6 words)
    if 2 <= len(words) <= 6:
        score += 3
    else:
        score -= 2

    # 4. uppercase ratio
    upper_ratio = sum(1 for c in line if c.isupper()) / max(len(line), 1)
    if upper_ratio > 0.5:
        score += 2

    # 5. long sentence penalty
    if len(words) > 10:
        score -= 4

    # 6. generic noise words
    if any(w in line.lower() for w in NOISE_WORDS):
        score -= 3

    return score


def extract_merchant(text: str):
    lines = [clean_text(l) for l in text.split("\n") if l.strip()]

    # focus on header region
    candidates = lines[:10]

    scored = []
    for idx, line in enumerate(candidates):
        if len(line) < 4:
            continue
        s = score_line(line, idx)
        scored.append((s, line))

    if not scored:
        return None

    # pick best score
    scored.sort(reverse=True, key=lambda x: x[0])
    merchant = scored[0][1]

    return merchant.upper()


def parse_receipt(text: str):
    amount = extract_amount(text)
    date = extract_date(text)
    merchant = extract_merchant(text)

    return {
        "merchant": merchant,
        "amount": amount,
        "date": date,
        "category": None,  # handled by AI service later
    }