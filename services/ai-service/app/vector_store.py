import chromadb

# ---------------------------------
# Persistent Chroma Client
# ---------------------------------

client = chromadb.PersistentClient(
    path="./chroma_db"
)


# ---------------------------------
# Get user collection
# ---------------------------------


def get_user_collection(user_id):

    collection_name = f"user_{user_id}"

    collection = client.get_or_create_collection(
        name=collection_name
    )

    return collection


# ---------------------------------
# Reset user collection
# ---------------------------------


def reset_user_collection(user_id):

    collection_name = f"user_{user_id}"

    try:
        client.delete_collection(collection_name)
    except:
        pass

    return client.get_or_create_collection(
        name=collection_name
    )


# ---------------------------------
# Add embeddings
# ---------------------------------


def add_to_vector_store(
    user_id,
    doc_id,
    embedding,
    document
):

    collection = get_user_collection(
        user_id
    )

    collection.add(
        ids=[doc_id],
        embeddings=[embedding],
        documents=[document]
    )


# ---------------------------------
# Search vectors
# ---------------------------------


def search_vector_store(
    user_id,
    embedding,
    top_k=5
):

    collection = get_user_collection(
        user_id
    )

    count = collection.count()

    if count == 0:
        return []

    k = min(top_k, count)

    results = collection.query(
        query_embeddings=[embedding],
        n_results=k
    )

    docs = results.get("documents", [[]])[0]

    # remove duplicates
    unique_docs = []
    seen = set()

    for doc in docs:

        if doc not in seen:
            seen.add(doc)
            unique_docs.append(doc)

    return unique_docs
