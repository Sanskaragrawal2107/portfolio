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
from app.graph.checkpointer import pool
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from app.env import load_app_env
load_app_env()

from app.graph.graph_factory import create_graph
from app.graph.leetcode_agent import get_leetcode_agent
from app.graph.github_agent import get_github_agent

import httpx

class ChatRequest(BaseModel):
    session_id: str
    message: str

class ContactRequest(BaseModel):
    email: str
    description: str

@asynccontextmanager
async def lifespan(app):
    global graph
    global checkpointer

    # Open the connection pool (handles auto-reconnect if Supabase closes idle connections)
    await pool.open()

    checkpointer = AsyncPostgresSaver(pool)
    await checkpointer.setup()

    graph = create_graph(checkpointer)
    await get_leetcode_agent()
    await get_github_agent()

    yield

    await pool.close()

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

    try:
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
            if node_name in ("github_agent", "leetcode_agent", "generate", "general", "combined_agent"):
                last_node = node_name
                if token.content:
                    val = token.content
                    if isinstance(val, list):
                        text_val = "".join([part if isinstance(part, str) else part.get("text", "") for part in val if isinstance(part, str) or (isinstance(part, dict) and "text" in part)])
                    elif isinstance(val, dict):
                        text_val = val.get("text", "")
                    else:
                        text_val = str(val)
                    yield f"data: {json.dumps({'content': text_val})}\n\n"

        # After all text tokens, emit a component rendering instruction
        component_map = {
            "github_agent": "github_card",
            "leetcode_agent": "leetcode_card",
        }
        comp = component_map.get(last_node)
        if comp:
            yield f'data: {json.dumps({"type": "component", "name": comp})}\n\n'
    except Exception as e:
        import traceback
        traceback.print_exc()
        yield f"data: {json.dumps({'content': 'I encountered a temporary connection issue. Please try asking again!'})}\n\n"

@app.post("/chat/stream")
async def chat_stream(request: ChatRequest):

    return StreamingResponse(
        stream_graph(
            request.message,
            request.session_id
        ),
        media_type="text/event-stream"
    )

@app.post("/api/contact")
async def contact(request: ContactRequest):
    webhook_url = os.getenv("MAKE_WEBHOOK_URL", "")
    if not webhook_url:
        return {"success": False, "error": "Webhook not configured"}
    async with httpx.AsyncClient() as client:
        response = await client.post(
            webhook_url,
            json={
                "email": request.email,
                "description": request.description
            }
        )
    return {"success": response.is_success, "status_code": response.status_code}
