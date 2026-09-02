from langgraph.graph import MessagesState
from typing import Optional

class AgentState(MessagesState):
    retrieved_docs: list
    route: str
    search_query: str
    github_result: Optional[str]
    leetcode_result: Optional[str]


