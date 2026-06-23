import sys
import asyncio

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

# Monkeypatch uvicorn before it imports/runs the event loop to force SelectorEventLoop on Windows
import uvicorn.loops.asyncio
original_loop_factory = uvicorn.loops.asyncio.asyncio_loop_factory
uvicorn.loops.asyncio.asyncio_loop_factory = lambda use_subprocess=False: asyncio.SelectorEventLoop

import uvicorn

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=False)
