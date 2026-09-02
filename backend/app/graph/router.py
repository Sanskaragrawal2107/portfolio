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
You are a routing classifier for a personal portfolio chatbot of Sanskar Agrawal.

Possible routes (return ONLY one of these exact words):

  rag       - Questions about Sanskar's background, experience, skills, projects,
              hackathons, education, achievements, internships, or any portfolio info.

  github    - Questions ONLY about GitHub repositories, commits, code architecture,
              or project codebases on GitHub. NOT LeetCode.

  leetcode  - Questions ONLY about LeetCode profile, problems solved, contest ranking,
              coding activity, submissions, or accepted solutions. NOT GitHub.

  both      - When the user is asking about BOTH GitHub AND LeetCode stats/info
              in the SAME message (e.g. "tell me your github and leetcode stats",
              "how many repos do you have and how many leetcode problems solved").

  general   - ONLY for simple greetings (hi, hello, how are you, thanks, bye)
              that have absolutely no technical or portfolio content.
              Do NOT use this for coding questions, math problems, or anything
              unrelated to Sanskar's portfolio.

CRITICAL RULES:
- If the user asks to write code, solve algorithms, explain programming concepts,
  do math, or anything that is NOT related to Sanskar's portfolio, skills, projects,
  or professional profile → return: rag
  (The generate node will handle the refusal using available context.)
- If the question is about GitHub AND LeetCode simultaneously → return: both
- When in doubt between rag and general → return: rag

Return ONLY one word from the list above. No punctuation, no explanation.

Conversation:

{conversation}
"""
    )

    content = response.content
    if isinstance(content, list):
        text_content = "".join([part if isinstance(part, str) else part.get("text", "") for part in content])
    else:
        text_content = content
    route = text_content.strip().lower()

    # Safety fallback — if the model returns an unexpected value, default to rag
    valid_routes = {"rag", "github", "leetcode", "both", "general"}
    if route not in valid_routes:
        route = "rag"

    print("ROUTE =", route)

    return {
        "route": route
    }