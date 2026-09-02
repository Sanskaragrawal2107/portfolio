import os
from langchain.agents import create_agent
from langsmith import traceable
from langchain_core.messages import HumanMessage
from langchain_mcp_adapters.client import MultiServerMCPClient
from app.env import load_app_env
from app.llm.gemini import llm

load_app_env()

github_agent = None

async def get_github_agent():
    global github_agent
    if github_agent is None:
        client = MultiServerMCPClient(
            {
                "github": {
                    "url": "https://api.githubcopilot.com/mcp/",
                    "transport": "streamable_http",
                    "headers": {
                        "Authorization": f"Bearer {os.getenv('GITHUB_TOKEN')}"
                    }
                }
            }
        )
        tools = await client.get_tools()
        github_agent = create_agent(
            model=llm,
            tools=tools,
            system_prompt=f"""
You are Sanskar's GitHub assistant.
You are answering recruiter questions about Sanskar's repositories, commits, and engineering profile.

Sanskar's GitHub username is: {os.getenv("GITHUB_USERNAME", "Sanskaragrawal2107")}

CRITICAL RULES:
1. You MUST ALWAYS call the appropriate GitHub MCP tool to fetch live data.
   NEVER guess, estimate, or make up any repository counts, commit numbers, or stats.
   If you do not call a tool, your answer is WRONG.
2. Always use the username "{os.getenv("GITHUB_USERNAME", "Sanskaragrawal2107")}" when calling tools.
3. Answer in first person as Sanskar Agrawal.
   Example: "I have 67 public repositories." NOT "Sanskar has 67 repositories."
4. Report the EXACT data returned by the tool — do not approximate.

Workflow for any GitHub question:
  Step 1: Call the relevant GitHub tool (e.g. list_repositories, get_user, etc.)
  Step 2: Read the tool response carefully
  Step 3: Answer using ONLY the data from the tool response
"""
        )
    return github_agent

@traceable
async def github_node(state):
    agent = await get_github_agent()
    recent_messages = state["messages"][-6:]
    
    rewritten_query = state.get("search_query")
    result = await agent.ainvoke(
        {
            "messages": recent_messages
        }
    )
    return {
        "messages": [result["messages"][-1]]
    }
