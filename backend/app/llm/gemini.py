import os
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI

from app.env import load_app_env

load_app_env()

openai_key = os.getenv("OPENAI_API_KEY")
gemini_key = os.getenv("GEMINI_API_KEY")
gemini_model = os.getenv("GEMINI_MODEL", "gemini-flash-lite-latest")

openai_model = os.getenv("OPENAI_MODEL", "gpt-5.6-luna")

openai_llm = ChatOpenAI(
    model=openai_model,
    reasoning_effort="none",
    streaming=True,
    api_key=openai_key
)

gemini_llm = ChatGoogleGenerativeAI(
    model=gemini_model,
    google_api_key=gemini_key,
    streaming=True
)

llm = openai_llm.with_fallbacks([gemini_llm])