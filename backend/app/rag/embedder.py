from openai import OpenAI
from app.env import load_app_env

load_app_env()

client=OpenAI()

def get_embedding(text):
    response=client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )

    return response.data[0].embedding
