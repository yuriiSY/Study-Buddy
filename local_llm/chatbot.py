import uuid
from flask_cors import CORS
import psycopg2 as db
from psycopg2 import sql
from flask import Flask, request, jsonify
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_postgres import PGVector;
from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama.llms import OllamaLLM
from langchain_text_splitters import RecursiveCharacterTextSplitter
import requests


# ---------------- CONFIG ----------------
VECTOR_FILE = "vectors.json"            # Pre-generated vector store
EMBED_MODEL_NAME = "all-MiniLM-L6-v2"
OLLAMA_MODEL = "llama3.2:3b"            # Multimodal model
OLLAMA_BASE_URL = "http://ollama-chatbot:11434"  # Ollama server URL

TABLE_NAME = "langchain_pg_embedding"  # pgvector table name


#---------Flask App Setup---------
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# ---------- Connect to pgvector ----------
print("Connecting to PostgreSQL (pgvector)...")
try:
    conn = db.connect(
        host="postgres-pgvector",
        port=5432,
        dbname="mydb",
        user="admin",
        password="secret"
    )
    print("Connected to PostgreSQL!")
except Exception as e:
    print("Failed to connect:", e)
    raise

# Load embedding model
embeddings = HuggingFaceEmbeddings(model_name=EMBED_MODEL_NAME)
EMBED_DIM = len(embeddings.embed_query("test"))
print(f"Embedding dimension: {EMBED_DIM}")

# ---------- PGVector (from_params + embed_dim) ----------
vector_store = None
def get_vector_store():
    global vector_store
    if vector_store is None:
        vector_store = PGVector(
            connection="postgresql+psycopg2://admin:secret@postgres-pgvector:5432/mydb",
            collection_name=TABLE_NAME,
            embeddings=embeddings,
            distance_strategy="cosine",
            embedding_length=EMBED_DIM,        
        )
    return vector_store

def retrieve_by_file_ids(file_ids, query, k=4):
    """Retrieve top-k chunks from given file_ids only."""
    store = get_vector_store()
    if not file_ids:
        return []
    # LangChain filter: metadata.file_id IN (...)
    filter_cond = {"file_id": {"$in": file_ids}}
    docs = store.similarity_search(query, k=k, filter=filter_cond)
    return [doc.page_content for doc in docs]


 # ---------- LLM (direct /api/chat call) ----------
PROMPT_TEMPLATE = """
You are a helpful AI. Use the CONTEXT from the selected files to answer.

CONTEXT:
{context}

QUESTION:
{question}

End with: SOURCE: [file(s)]
"""
prompt = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)

def ollama_chat(context: str, question: str) -> str:
    """
    Calls Ollama REST API v0.1.32 /api/chat endpoint inside Docker.
    Returns the response text or error string.
    """
    url = f"{OLLAMA_BASE_URL}/api/chat"
    
    payload = {
        "model": OLLAMA_MODEL,
        "messages": [
            {
                "role": "system",
                "content": PROMPT_TEMPLATE.format(context=context, question=question)
            }
        ],
        "stream": False
    }

    try:
        response = requests.post(url, json=payload, timeout=60)
        response.raise_for_status()  # Raises HTTPError for 4xx/5xx responses
        data = response.json()

        # v0.1.32 returns 'message' object
        return data.get("message", {}).get("content", "No content in response.")

    except requests.exceptions.HTTPError as http_err:
        return f"HTTP error: {http_err}"
    except requests.exceptions.ConnectionError as conn_err:
        return f"Connection error: {conn_err}"
    except requests.exceptions.Timeout as timeout_err:
        return f"Timeout error: {timeout_err}"
    except Exception as e:
        return f"Unexpected error: {e}"
    
# ------------------- ENDPOINTS -------------------

@app.route('/', methods=['GET'])
def health():
    return jsonify({"status": "ok"}), 200


@app.route('/upload-files', methods=['POST'])
def upload_files():
    if 'files' not in request.files:
        return jsonify({"error": "Missing 'files'"}), 400

    files = request.files.getlist('files')
    if not files:
        return jsonify({"error": "No files selected"}), 400

    store = get_vector_store()
    results = []

    for file in files:
        if not file.filename:
            continue
        raw_text = file.stream.read().decode("utf-8", errors="ignore")
        if not raw_text.strip():
            continue

        file_id = str(uuid.uuid4())
        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = splitter.split_text(raw_text)

        texts = chunks
        metadatas = [{
            "file_id": file_id,
            "file_name": file.filename,
            "chunk_index": i
        } for i in range(len(chunks))]
        ids = [str(uuid.uuid4()) for _ in chunks]

        store.add_texts(texts=texts, metadatas=metadatas, ids=ids)
        results.append({
            "file_name": file.filename,
            "file_id": file_id,
            "chunks": len(chunks)
        })

    return jsonify({"uploaded": results}), 201
# List all file_ids and names
@app.route('/file-ids', methods=['GET'])
def list_file_ids():
    try:
        cur = conn.cursor()  # ← Use the global `conn` from startup
        cur.execute(sql.SQL("""
            SELECT DISTINCT langchain_pg_embedding.cmetadata->>'file_id' AS file_id,
                   langchain_pg_embedding.cmetadata->>'file_name' AS file_name
            FROM {table}
            ORDER BY file_name
        """).format(table=sql.Identifier(TABLE_NAME)))
        rows = cur.fetchall()
        cur.close()

        files = [{"file_id": r[0], "file_name": r[1]} for r in rows]
        return jsonify({"files": files})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Ask question using multiple file_ids
@app.route('/ask', methods=['POST'])
def ask():
    data = request.get_json()
    question = data.get("question", "").strip()
    file_ids = data.get("file_ids", [])

    context_chunks = retrieve_by_file_ids(file_ids, question, k=6)
    context = "\n---\n".join(context_chunks) if context_chunks else "No relevant context."

    answer = ollama_chat(context, question)

    return jsonify({
        "question": question,
        "answer": answer,
        "file_ids_used": file_ids,
        "chunks": len(context_chunks)
    })


if __name__ == "__main__":
    print("Starting Flask API")
    app.run(host="0.0.0.0", port=3000, debug=True)
