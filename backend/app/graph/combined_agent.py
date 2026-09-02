import asyncio
import os
from langsmith import traceable
from langchain_core.messages import AIMessage, HumanMessage
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain.agents import create_agent
from app.env import load_app_env
from app.llm.gemini import llm

load_app_env()

GITHUB_USERNAME = os.getenv("GITHUB_USERNAME", "Sanskaragrawal2107")
LEETCODE_USERNAME = os.getenv("LEETCODE_USERNAME", "sanskaragrawal")


async def _run_github(question: str) -> str:
    """Creates a fresh GitHub MCP client + agent and answers ONLY GitHub questions."""
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
    agent = create_agent(
        model=llm,
        tools=tools,
        system_prompt=f"""
You are Sanskar's GitHub assistant.
Sanskar's GitHub username is: {GITHUB_USERNAME}

CRITICAL RULES:
1. ALWAYS call a GitHub tool first to fetch live data. NEVER make up numbers.
2. You ONLY answer GitHub questions. DO NOT mention LeetCode at all.
3. Answer in first person: "I have 67 repositories." not "Sanskar has 67 repositories."
4. Report EXACT numbers from tool output — no rounding, no approximating.
"""
    )
    result = await agent.ainvoke({
        "messages": [
            HumanMessage(
                content=(
                    f"Answer ONLY the GitHub part of this question. "
                    f"GitHub username is {GITHUB_USERNAME}. "
                    f"Call a tool first. "
                    f"Question: {question}"
                )
            )
        ]
    })
    return result["messages"][-1].content


async def _run_leetcode(question: str) -> str:
    """Creates a fresh LeetCode MCP client + agent and answers ONLY LeetCode questions."""
    client = MultiServerMCPClient(
        {
            "leetcode": {
                "url": "https://leetcode-mcp.fastmcp.app/mcp",
                "transport": "streamable_http",
                "headers": {
                    "Authorization": f"Bearer {os.getenv('LEETCODE_MCP_TOKEN')}"
                }
            }
        }
    )
    tools = await client.get_tools()
    agent = create_agent(
        model=llm,
        tools=tools,
        system_prompt=f"""
You are Sanskar's LeetCode assistant.
Sanskar's LeetCode username is: {LEETCODE_USERNAME}

CRITICAL RULES:
1. ALWAYS call get_user_profile with username="{LEETCODE_USERNAME}" FIRST before answering.
2. You ONLY answer LeetCode questions. DO NOT mention GitHub at all.
3. NEVER guess or approximate numbers. Use EXACT numbers from the tool response only.
4. Answer in first person: "I have solved 312 problems." not "Sanskar has solved 312 problems."
"""
    )
    result = await agent.ainvoke({
        "messages": [
            HumanMessage(
                content=(
                    f"Answer ONLY the LeetCode part of this question. "
                    f"You MUST call get_user_profile with username='{LEETCODE_USERNAME}' first. "
                    f"Question: {question}"
                )
            )
        ]
    })
    return result["messages"][-1].content


@traceable
async def combined_node(state):
    """
    Runs GitHub and LeetCode agents with completely separate fresh MCP clients
    (no shared singletons, no state bleed) and merges their responses.
    """
    # Extract the latest human message
    last_human_msg = ""
    for msg in reversed(state["messages"][-6:]):
        if msg.type == "human":
            last_human_msg = msg.content
            break

    # Run both with completely isolated clients — no singleton, no state bleed
    github_text, leetcode_text = await asyncio.gather(
        _run_github(last_human_msg),
        _run_leetcode(last_human_msg)
    )

    merged_content = (
        f"### GitHub Stats\n{github_text.strip()}\n\n"
        f"---\n\n"
        f"### LeetCode Stats\n{leetcode_text.strip()}"
    )

    return {
        "messages": [AIMessage(content=merged_content)]
    }
