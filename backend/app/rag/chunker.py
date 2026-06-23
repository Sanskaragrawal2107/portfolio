from langchain_text_splitters import RecursiveCharacterTextSplitter

splitter=RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200
)

def chunk_documents(documents):
    chunks=[]
    for doc in documents:
        split=splitter.split_text(doc['content'])
        
        for idx,chunk in enumerate(split):
            chunks.append(
                {
                    "source":doc['source'],
                    "content":chunk,
                    "chunk_idx":idx
                }
            ) 
    return chunks
