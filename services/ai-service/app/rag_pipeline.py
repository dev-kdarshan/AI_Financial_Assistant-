import uuid

from .embeddings import (
    generate_embedding
)

from .vector_store import (
    add_to_vector_store,
    search_vector_store,
    reset_user_collection
)

from .llm_client import (
    ask_llm
)


# ---------------------------------
# Remove duplicate expenses
# ---------------------------------


def deduplicate_expenses(expenses):

    unique = []
    seen = set()

    for exp in expenses:

        key = (
            exp.amount,
            exp.category,
            exp.datetime,
            exp.description
        )

        if key not in seen:
            seen.add(key)
            unique.append(exp)

    return unique


# ---------------------------------
# Build expense text
# ---------------------------------


def build_expense_text(expense):

    return f"""
    Amount: ₹{expense.amount}
    Category: {expense.category}
    Date: {expense.datetime}
    Description: {expense.description}
    """


# ---------------------------------
# Main RAG Pipeline
# ---------------------------------


def run_rag_pipeline(
    user_id,
    question,
    expenses
):

    # deduplicate expenses
    expenses = deduplicate_expenses(
        expenses
    )

    # reset only this user's vectors
    reset_user_collection(user_id)

    # -----------------------------
    # Store embeddings
    # -----------------------------

    for expense in expenses:

        text = build_expense_text(
            expense
        )

        embedding = generate_embedding(
            text
        )

        add_to_vector_store(
            user_id=user_id,
            doc_id=str(uuid.uuid4()),
            embedding=embedding,
            document=text
        )

    # -----------------------------
    # Query embedding
    # -----------------------------

    query_embedding = generate_embedding(
        question
    )

    relevant_docs = search_vector_store(
        user_id,
        query_embedding
    )

    context = "\n".join(
        relevant_docs
    )

    # -----------------------------
    # Final Prompt
    # -----------------------------

    prompt = f"""
    You are AIFA,
    an AI financial assistant.

    Use ONLY the provided expense data.

    Expense Data:
    {context}

    User Question:
    {question}

    Give concise,
    intelligent financial insights.
    """

    answer = ask_llm(prompt)

    return {
        "user_id": user_id,
        "question": question,
        "answer": answer,
        "retrieved_context": relevant_docs
    }
