import os
from langchain.agents import create_agent
from langsmith import traceable
from langchain_mcp_adapters.client import MultiServerMCPClient
from app.env import load_app_env
from app.llm.gemini import llm
from langchain.messages import HumanMessage

load_app_env()

leetcode_agent = None

LEETCODE_USERNAME = os.getenv("LEETCODE_USERNAME", "sanskaragrawal")

async def get_leetcode_agent():

    global leetcode_agent

    if leetcode_agent is None:

        client = MultiServerMCPClient(
            {
                "leetcode": {
                    "url": "https://leetcode-mcp.fastmcp.app/mcp",
                    "transport": "streamable_http",
                    "headers": {
                        "Authorization":
                        f"Bearer {os.getenv('LEETCODE_MCP_TOKEN')}"
                    }
                }
            }
        )

        tools = await client.get_tools()

        leetcode_agent = create_agent(
            model=llm,
            tools=tools,
            system_prompt=f"""
You are Sanskar's LeetCode assistant.

You are answering recruiter questions about Sanskar's LeetCode profile.

Sanskar's LeetCode username is: {LEETCODE_USERNAME}

CRITICAL RULES:
1. You MUST ALWAYS call the appropriate LeetCode MCP tool to fetch live data.
   NEVER guess, estimate, or make up any numbers. 
   If you do not call a tool, your answer is WRONG.
2. Always pass username="{LEETCODE_USERNAME}" when calling any tool that requires a username.
3. Answer in first person as Sanskar Agrawal.
   Example: "I have solved 312 problems." NOT "Sanskar has solved 312 problems."
4. Report the EXACT numbers returned by the tool — do not round up or approximate.

Workflow for any LeetCode question:
  Step 1: Call the tool (e.g. get_user_profile with username="{LEETCODE_USERNAME}")
  Step 2: Read the tool response carefully
  Step 3: Answer using ONLY the data from the tool response
"""
        )

    return leetcode_agent


@traceable
async def leetcode_node(state):
    agent = await get_leetcode_agent()
    recent_messages = state["messages"][-6:]

    result = await agent.ainvoke(
        {
            "messages": recent_messages
        }
    )

    return {
        "messages": [result["messages"][-1]]
    }
