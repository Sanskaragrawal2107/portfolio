from pathlib import Path

from dotenv import load_dotenv


ENV_PATH = Path(__file__).resolve().parents[1] / ".env"


def load_app_env():
    load_dotenv(ENV_PATH, override=False)
