from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

import os
from app.env import load_app_env

load_app_env()

DB_URI = os.getenv("DATABASE_URL")

checkpointer_cm = AsyncPostgresSaver.from_conn_string(
    DB_URI
)

checkpointer = None
