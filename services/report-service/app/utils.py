def calculate_percentage(amount, total):

    if total == 0:
        return 0

    return round(
        (amount / total) * 100,
        2
    )