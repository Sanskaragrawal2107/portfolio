from app.llm.gemini import llm
from langsmith import traceable

@traceable
def rewrite_query_nodes(state):
    messages = state["messages"][-6:]

    conversation = "\n".join(
        f"{m.type}: {m.content}"
        for m in messages
    )

    response = llm.invoke(
        f"""
Given the conversation,
rewrite the latest user question
into a standalone search query.

Conversation:

{conversation}

Return ONLY the rewritten query.
"""
    )
    return {
        "search_query": response.content
    }