import os

from langchain_mcp_adapters.client import MultiServerMCPClient

from app.env import load_app_env

load_app_env()


async def get_leetcode_tools():

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

    return await client.get_tools()
