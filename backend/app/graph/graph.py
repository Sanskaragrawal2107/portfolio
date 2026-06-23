from langgraph.graph import StateGraph
from langgraph.graph import START, END
from app.graph.checkpointer import checkpointer
from app.graph.general import general_node
from app.graph.router import router_node
from langsmith import traceable
from app.graph.query_rewriter import rewrite_query_nodes
from app.graph.leetcode_agent import leetcode_node
from app.graph.github_agent import github_node

from app.graph.state import AgentState
from app.graph.nodes import (
    retrieve_node,
    generate_node
)

@traceable
def route_decision(state):
    return state['route']


builder = StateGraph(
    AgentState
)

builder.add_node("rewrite_query", rewrite_query_nodes)
builder.add_node("leetcode_agent", leetcode_node)
builder.add_node("github_agent", github_node) 
builder.add_node("retrieve", retrieve_node)
builder.add_node("router", router_node)
builder.add_node("general", general_node)
builder.add_node("generate", generate_node)

builder.add_edge(START, "router")

builder.add_conditional_edges(
    "router",
    route_decision,
    {
        "rag": "rewrite_query",
        "github": "github_agent", 
        "leetcode": "leetcode_agent",
        "general": "general"
    }
)

builder.add_edge("rewrite_query", "retrieve")
builder.add_edge("leetcode_agent", END)
builder.add_edge("github_agent", END) 
builder.add_edge("retrieve", "generate")
builder.add_edge("generate", END)
builder.add_edge("general", END)