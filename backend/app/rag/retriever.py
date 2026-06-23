from openai import OpenAI
from app.db.supabase import supabase

client=OpenAI()

def retrieve(query,k=5):
    embedding=client.embeddings.create(
        model='text-embedding-3-small',
        input=query
    ).data[0].embedding

    result=(
        supabase.rpc(
            "match_documents",
            {
                "query_embedding":embedding,
                "match_count":k
            }
        )
        .execute()
    )
    docs = [
        doc
        for doc in result.data
        if doc["similarity"] > 0.30
    ]

    return docs