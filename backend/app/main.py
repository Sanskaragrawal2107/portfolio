import sys
import asyncio

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from fastapi import FastAPI
from pydantic import BaseModel
from langchain_core.messages import HumanMessage
from fastapi.responses import StreamingResponse
import json
from contextlib import asynccontextmanager
from app.graph.checkpointer import  checkpointer_cm
from app.env import load_app_env
load_app_env()

from app.graph.graph_factory import create_graph
from app.graph.leetcode_agent import get_leetcode_agent
from app.graph.github_agent import get_github_agent

class ChatRequest(BaseModel):
    session_id: str
    message: str

@asynccontextmanager
async def lifespan(app):
    global graph
    global checkpointer

    checkpointer = await checkpointer_cm.__aenter__()
    await checkpointer.setup()

    graph = create_graph(checkpointer)
    await get_leetcode_agent()
    await get_github_agent()

    yield

    await checkpointer_cm.__aexit__(None,None,None)    

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

graph = None
checkpointer = None

@app.get('/')
async def root():
    return {
        "status":"running"
    }

@app.post("/chat")
async def chat(request: ChatRequest):

    result =await graph.ainvoke(
        {
            "messages": [
                HumanMessage(
                    content=request.message
                )
            ]
        },
        config={
            "configurable": {
                "thread_id": request.session_id
            }
        }
    )

    return {
        "answer": result["messages"][-1].content
    }

async def stream_graph(message, session_id):
    last_node = None

    async for chunk in graph.astream(
        {
            "messages": [
                HumanMessage(
                    content=message
                )
            ]
        },
        config={
            "configurable": {
                "thread_id": session_id
            }
        },
        stream_mode="messages"
    ):

        token, metadata = chunk

        # Track which agent node is producing the final response
        node_name = metadata.get("langgraph_node", "")
        if node_name in ("github_agent", "leetcode_agent", "generate", "general"):
            last_node = node_name
            if token.content:
                yield f"data: {token.content}\n\n"

    # After all text tokens, emit a component rendering instruction
    component_map = {
        "github_agent": "github_card",
        "leetcode_agent": "leetcode_card",
        "generate": "projects_teaser",
    }
    comp = component_map.get(last_node)
    if comp:
        yield f'data: {json.dumps({"type": "component", "name": comp})}\n\n'

@app.post("/chat/stream")
async def chat_stream(request: ChatRequest):

    return StreamingResponse(
        stream_graph(
            request.message,
            request.session_id
        ),
        media_type="text/event-stream"
    )
