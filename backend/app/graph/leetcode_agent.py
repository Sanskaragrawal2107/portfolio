import os
from langchain.agents import create_agent
from langsmith import traceable
from langchain_mcp_adapters.client import MultiServerMCPClient
from app.env import load_app_env
from app.llm.gemini import llm
from langchain.messages import HumanMessage

load_app_env()

leetcode_agent = None


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

You are answering recruiter questions
about Sanskar's LeetCode profile.

Sanskar's username is:

{os.getenv("LEETCODE_USERNAME")}

Always answer in first person.

Example:

"I have solved 261 problems."

not

"Sanskar has solved 261 problems."

Use tools whenever required.
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
