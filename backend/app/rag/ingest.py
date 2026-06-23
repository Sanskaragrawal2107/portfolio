from app.rag.loader import load_markdown_files
from app.rag.chunker import chunk_documents
from app.rag.embedder import get_embedding
from app.db.supabase import supabase

docs=load_markdown_files()
chunks=chunk_documents(docs)

print(f"Chunks: {len(chunks)}")

for chunk in chunks:
    embedding=get_embedding(
        chunk["content"]
    )
    supabase.table(
        "documents"
    ).insert(
        {
            "content":chunk["content"],
            "source":chunk['source'],
            "chunk_index":chunk['chunk_idx'],
            "embedding":embedding
        }
    ).execute()

print("done")