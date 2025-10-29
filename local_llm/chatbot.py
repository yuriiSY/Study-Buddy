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
OLLAMA_BASE_URL = "http://localhost:11434"  # Ollama server URL

TABLE_NAME = "embeddings"


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
template = """
You are a helpful AI. Use the CONTEXT from the selected files to answer.

CONTEXT:
{context}

QUESTION:
{question}

End with: SOURCE: [file(s)]
"""
prompt = ChatPromptTemplate.from_template(template)

def ollama_chat(context: str, question: str) -> str:
    payload = {
        "model": OLLAMA_MODEL,
        "messages": [
            {"role": "system", "content": prompt.format(context=context, question=question)}
        ],
        "stream": False
    }
    try:
        r = requests.post(f"{OLLAMA_BASE_URL}/api/chat", json=payload, timeout=120)
        r.raise_for_status()
        return r.json()["message"]["content"]
    except Exception as e:
        print(f"Ollama error: {e}")
        return f"Error: {str(e)}"

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
            SELECT DISTINCT metadata->>'file_id' AS file_id,
                   metadata->>'file_name' AS file_name
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
    try:
        data = request.get_json()
        if not data or 'question' not in data:
            return jsonify({"error": "Missing 'question'"}), 400
        question = data['question'].strip()
        file_ids = data.get('file_ids', [])
        if not isinstance(file_ids, list):
            return jsonify({"error": "'file_ids' must be array"}), 400

        context_chunks = retrieve_by_file_ids(file_ids, question, k=6)
        context = "\n---\n".join(context_chunks) if context_chunks else "No relevant context."

        answer = ollama_chat(context, question)          #  CALL

        return jsonify({
            "question": question,
            "answer": answer,
            "file_ids_used": file_ids,
            "chunks": len(context_chunks)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500



if __name__ == "__main__":
    print("Starting Flask API")
    app.run(host="0.0.0.0", port=3000, debug=True)
