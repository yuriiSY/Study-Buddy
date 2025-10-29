import os
import json
from sentence_transformers import SentenceTransformer
from langchain.text_splitter import RecursiveCharacterTextSplitter

# ---------------- CONFIG ----------------
TXT_PATH = "docs/my_notes.txt"          # Text file path
VECTOR_FILE = "vectors.json"            # Output vector store (will be created/overwritten)
EMBED_MODEL_NAME = "all-MiniLM-L6-v2"   # Embedding model
# ----------------------------------------

def load_text(path):
    """Read the text file."""
    if not os.path.exists(path):
        raise FileNotFoundError(f"Text file not found: {path}. Please create it.")
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

def chunks_from_text(text, chunk_size=1000, chunk_overlap=200):
    """Split text into overlapping chunks for better retrieval."""
    splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    docs = splitter.split_text(text)
    return docs

def ingest_to_local(txt_path):
    """Read, embed, and save text chunks to local JSON file."""
    print("Ingesting text file...")
    text = load_text(txt_path)
    docs = chunks_from_text(text)

    # Load embedding model
    print(" Loading embedding model...")
    emb_model = SentenceTransformer(EMBED_MODEL_NAME)

    data = []
    for i, chunk in enumerate(docs):
        emb = emb_model.encode(chunk, convert_to_numpy=True).tolist()
        data.append({"id": i, "text": chunk, "embedding": emb})

    # Always create/overwrite vectors.json
    with open(VECTOR_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"✅ Created {len(data)} chunks in {VECTOR_FILE}")

if __name__ == "__main__":
    try:
        ingest_to_local(TXT_PATH)
    except Exception as e:
        print(f"Error during embedding generation: {str(e)}")