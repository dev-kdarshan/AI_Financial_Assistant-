import numpy as np


def predict_next_month(expenses):

    amounts = [e.amount for e in expenses]

    if not amounts:
        return 0

    avg = np.mean(amounts)

    prediction = avg * len(amounts)

    return round(prediction, 2)