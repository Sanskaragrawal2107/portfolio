from langsmith import traceable
from app.llm.gemini import llm

@traceable
def router_node(state):

    recent_messages = state["messages"][-6:]

    conversation = "\n".join(
        f"{msg.type}: {msg.content}"
        for msg in recent_messages
    )

    response = llm.invoke(
        f"""
You are a routing classifier.

Possible routes:

rag
github
leetcode

Look at the entire conversation.

If the user is asking a follow-up question
about a project, experience, achievement,
or information already discussed,
return rag.

return leetcode:
if Questions about

- LeetCode
- contest ranking
- coding activity
- problems solved
- submissions
- accepted solutions
- coding profile

return github:
if questions about repositories, public or private repos, code architectures, git commits, or project codebases on GitHub.
...

Return ONLY one word.

Conversation:

{conversation}
"""
    )

    route = response.content.strip().lower()

    print("ROUTE =", route)

    return {
        "route": route
    }