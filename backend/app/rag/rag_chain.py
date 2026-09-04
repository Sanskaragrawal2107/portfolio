from openai import OpenAI
from app.rag.retriever import retrieve

client=OpenAI()

def answer_question(question):
    docs=retrieve(question)
    content="\n\n".join(
        doc['content'] for doc in docs
    )

    prompt=f"""
You are Sanskar's AI portfolio assistant.

Answer ONLY from the provided context.

If the answer is not in the context,
say you do not know.

Whenever someone asks for the name of your college, you have to say, "My college is Acropolis Institute of Technology and Research, Indore."

Context:

{content}

Question:

{question}

"""
    
    response=client.chat.completions.create(
        model="gpt-5.6-luna",
        messages=[
            {
                "role":"user",
                "content":prompt
            }
        ]
    )
    return response.choices[0].message.content