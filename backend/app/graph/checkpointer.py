from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from psycopg_pool import AsyncConnectionPool
import os
from app.env import load_app_env

load_app_env()

DB_URI = os.getenv("DATABASE_URL")

# Use a resilient connection pool with active health checking (check_connection)
# and connection recycling to prevent stale socket errors from Supabase pooler idle disconnects.
pool = AsyncConnectionPool(
    conninfo=DB_URI,
    max_size=5,
    min_size=1,
    max_idle=180.0,
    max_lifetime=600.0,
    check=AsyncConnectionPool.check_connection,
    kwargs={
        "autocommit": True,
        "prepare_threshold": 0,
    },
    open=False,  # We open it manually in the lifespan
)

checkpointer = None
