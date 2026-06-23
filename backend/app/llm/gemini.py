from langchain_openai import ChatOpenAI

llm=ChatOpenAI(
    model='gpt-4.1-mini',
    streaming=True
)