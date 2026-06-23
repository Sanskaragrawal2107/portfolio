from supabase import create_client
import os
from app.env import load_app_env

load_app_env()

supabase=create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_ANON_KEY")
)
