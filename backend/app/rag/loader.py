from pathlib import Path

def load_markdown_files():
    root = Path(__file__).resolve().parent.parent / "knowledge"
    docs = []

    for file in root.rglob("*.md"):
        content = file.read_text(encoding="utf-8")
        docs.append({
            "source": str(file),
            "content": content
        })

    return docs

docs = load_markdown_files()
print(len(docs))

print(len(docs))