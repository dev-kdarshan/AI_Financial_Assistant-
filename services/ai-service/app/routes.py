from fastapi import APIRouter

from .schemas import AIQuery

from .rag_pipeline import (
    run_rag_pipeline
)

from .vector_store import client

from .vector_store import (
    get_user_collection
)

router = APIRouter()


@router.post("/ask")
def ask_ai(data: AIQuery):

    result = run_rag_pipeline(
        data.user_id,
        data.question,
        data.expenses
    )

    return {
        "success": True,
        "response": result
    }


@router.get("/debug/{user_id}")
def debug_user_vectors(user_id: str):

    collection = get_user_collection(
        user_id
    )

    data = collection.get(
        include=["documents", "embeddings"]
    )

    embeddings = data.get(
        "embeddings"
    )

    if embeddings is None:
        embeddings = []

    return {

        "user_id": user_id,

        "count": collection.count(),

        "documents": data.get(
            "documents"
        ),

        "ids": data.get(
            "ids"
        ),

        "embeddings_preview": [

            emb[:10].tolist()

            for emb in embeddings
        ]
    }

    collection = get_user_collection(
        user_id
    )

    data = collection.get(
    include=["documents", "embeddings"]
    )

    return {
        "user_id": user_id,
        "count": collection.count(),
        "documents": data.get("documents"),
        "ids": data.get("ids"),
        "embeddings_preview": [
            emb[:10].tolist()
            for emb in embeddings
        ]
    }


@router.get("/stats/{user_id}")
def stats(user_id: str):

    collection = get_user_collection(
        user_id
    )

    return {
        "user_id": user_id,
        "vector_count": collection.count()
    }

@router.get("/admin/collections")
def get_all_collections():

    collections = client.list_collections()

    result = []

    for col in collections:

        result.append({
            "name": col.name,
            "count": col.count()
        })

    return {
        "total_users": len(result),
        "collections": result
    }

@router.get("/admin/all-data")
def get_all_data():

    collections = client.list_collections()

    result = []

    for col in collections:

        data = col.get(
            include=["documents"]
        )

        result.append({

            "user_collection": col.name,

            "count": col.count(),

            "documents": data.get(
                "documents"
            )
        })

    return {
        "total_users": len(result),
        "data": result
    }

@router.get("/admin/stats")
def global_stats():

    collections = client.list_collections()

    total_vectors = 0

    users = []

    for col in collections:

        count = col.count()

        total_vectors += count

        users.append({
            "user": col.name,
            "vectors": count
        })

    return {

        "total_users": len(users),

        "total_vectors": total_vectors,

        "users": users
    }