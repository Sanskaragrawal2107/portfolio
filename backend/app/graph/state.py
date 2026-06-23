from langgraph.graph import MessagesState

class AgentState(MessagesState):
    retrieved_docs: list
    route:str
    search_query:str
    

