from app.llm.gemini import llm

def general_node(state):
    response=llm.invoke(
        state["messages"]
    )
    return {
        "messages":[response]
    }
