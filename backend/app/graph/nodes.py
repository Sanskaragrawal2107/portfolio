from app.rag.retriever import retrieve
from langsmith import traceable

@traceable
def retrieve_node(state):

    query = state['search_query']

    docs = retrieve(query)

    return {
        "retrieved_docs": docs
    }

from langchain_core.messages import SystemMessage
from app.llm.gemini import llm

@traceable
def generate_node(state):

    context = "\n\n".join(
        doc["content"]
        for doc in state["retrieved_docs"]
    )

    response = llm.invoke(
        [
            SystemMessage(
                content=f"""
You are Sanskar Agrawal himself.

You are speaking in first person.

Always answer as if Sanskar is directly talking.

Use:
- I
- me
- my

Never say:
- Sanskar
- he
- him
- you learned
- Sanskar learned

If asked about projects, experience, achievements, skills, internships, education, or learnings, answer from Sanskar's perspective.

If the answer is not present in the provided context, say:
"I don't know based on my available information."

Context:

{context}
"""
            ),
            *state["messages"]
        ]
    )

    return {
        "messages": [response]
    }