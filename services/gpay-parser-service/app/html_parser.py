from bs4 import BeautifulSoup
import re


# -----------------------------------
# Extract Amount
# -----------------------------------

def extract_amount(text):
    match = re.search(r'₹\s?([\d,]+\.\d{2})', text)

    if match:
        return float(match.group(1).replace(",", ""))

    return None


# -----------------------------------
# Extract Transaction Type + Flow
# -----------------------------------

def extract_type(text):
    t = text.lower()

    if "paid" in t:
        return "paid", "debit"

    elif "sent" in t:
        return "sent", "debit"

    elif "received" in t:
        return "received", "credit"

    return "unknown", None


# -----------------------------------
# Extract Recipient
# -----------------------------------

def extract_recipient(text):

    # Paid to XYZ
    match = re.search(
        r'(?:to|from)\s([A-Za-z0-9 &\.\-]+?)(?:\susing|\s₹|\sApr|\sMay|\sJun|\sJul|\sAug|\sSep|\sOct|\sNov|\sDec)',
        text
    )

    if match:
        return match.group(1).strip()

    return None


# -----------------------------------
# Extract Transaction ID
# -----------------------------------

def extract_transaction_id(text):

    # Remove masked bank account references
    cleaned = re.sub(
        r'Bank Account\sX+[\d]+',
        '',
        text,
        flags=re.IGNORECASE
    )

    # Extract after "Details:"
    match = re.search(
        r'Details:\s([A-Za-z0-9+/=]+)',
        cleaned
    )

    if match:
        return match.group(1)

    return None


# -----------------------------------
# Extract Status
# -----------------------------------

def extract_status(text):
    t = text.lower()

    if "completed" in t:
        return "Completed"

    elif "failed" in t:
        return "Failed"

    elif "pending" in t:
        return "Pending"

    return None


# -----------------------------------
# Extract DateTime
# -----------------------------------

def extract_datetime(text):

    match = re.search(
        r'[A-Za-z]{3}\s\d{1,2},\s\d{4},.*?IST',
        text
    )

    if match:
        return match.group().replace('\u202f', ' ')

    return None


# -----------------------------------
# Noise Filter
# -----------------------------------

def is_noise(text):

    t = text.lower()

    noise_patterns = [
        "ads",
        "google ads",
        "visited",
        "voucher",
        "offer",
        "reward",
        "scratch card",
        "promotion",
        "cashback offer",
        "play store"
    ]

    return any(pattern in t for pattern in noise_patterns)


# -----------------------------------
# Main Parser
# -----------------------------------

def parse_html(content: str):

    soup = BeautifulSoup(content, "lxml")

    transactions = []

    # recursive=False helps avoid nested duplicate divs
    blocks = soup.find_all("div", recursive=False)

    # fallback if above returns empty
    if not blocks:
        blocks = soup.find_all("div")

    for block in blocks:

        text = block.get_text(" ", strip=True)

        # Skip empty blocks
        if not text:
            continue

        # Must contain money
        if "₹" not in text:
            continue

        # Skip ads / promotions
        if is_noise(text):
            continue

        amount = extract_amount(text)

        # Invalid amount
        if not amount:
            continue

        txn_type, flow = extract_type(text)

        datetime_val = extract_datetime(text)

        # Skip incomplete fragments
        if not datetime_val:
            continue

        recipient = extract_recipient(text)

        txn_id = extract_transaction_id(text)

        status = extract_status(text)

        transaction = {
            "product": "Google Pay",
            "type": txn_type,
            "flow": flow,
            "description": text,
            "amount": amount,
            "recipient": recipient,
            "datetime": datetime_val,
            "transaction_id": txn_id,
            "status": status
        }

        transactions.append(transaction)

    # -----------------------------------
    # Deduplicate Transactions
    # -----------------------------------

    unique_transactions = []
    seen = set()

    for txn in transactions:

        key = (
            txn["amount"],
            txn["datetime"],
            txn["type"],
            txn["transaction_id"]
        )

        if key not in seen:
            seen.add(key)
            unique_transactions.append(txn)

    return unique_transactions