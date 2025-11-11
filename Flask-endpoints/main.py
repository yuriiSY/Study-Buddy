import uuid
import time
import requests
from flask_cors import CORS
import psycopg2 as db
from flask import Flask, request, jsonify
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_postgres import PGVector
from langchain_text_splitters import RecursiveCharacterTextSplitter
import os,io
import base64
from PIL import Image
import fitz
# Import PDF processing library
try:
    import pdfplumber
    PDF_SUPPORT = True
except ImportError:
    PDF_SUPPORT = False
    print("PDF support disabled: install pdfplumber")

# ---------------- CONFIG ----------------
EMBED_MODEL_NAME = "all-MiniLM-L6-v2"
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "llava:latest")
OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://ollama:11434")
TABLE_NAME = "langchain_pg_embedding"

# Hosted DB credentials
DB_HOST = os.environ.get("DB_HOST")
DB_PORT = os.environ.get("DB_PORT")
DB_NAME = os.environ.get("DB_NAME")
DB_USER = os.environ.get("DB_USER")
DB_PASSWORD = os.environ.get("DB_PASSWORD")

#---------Flask App Setup---------
app = Flask(__name__)
CORS(app)

# ---------- Connect to hosted PostgreSQL ----------
print("Connecting to hosted PostgreSQL...")
try:
    conn = db.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        sslmode="require"
    )
    print("Connected to PostgreSQL!")
except Exception as e:
    print("Failed to connect:", e)
    raise

# Load embedding model
embeddings = HuggingFaceEmbeddings(model_name=EMBED_MODEL_NAME)
EMBED_DIM = len(embeddings.embed_query("test"))
print(f"Embedding dimension: {EMBED_DIM}")

# ---------- PGVector ----------
vector_store = None
def get_vector_store():
    global vector_store
    if vector_store is None:
        vector_store = PGVector(
            connection=f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?sslmode=require",
            collection_name=TABLE_NAME,
            embeddings=embeddings,
            distance_strategy="cosine",
            embedding_length=EMBED_DIM
        )
    return vector_store

def retrieve_by_file_ids(file_ids, query, k=4):
    store = get_vector_store()
    if not file_ids:
        return []
    filter_cond = {"file_id": {"$in": file_ids}}
    docs = store.similarity_search(query, k=k, filter=filter_cond)
    return [doc.page_content for doc in docs]

# ---------------- PDF PROCESSING FUNCTION ----------------

def extract_text_from_pdf(file_stream):
    """Extract text from PDF file"""
    text = ""
    try:
        with pdfplumber.open(file_stream) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text.strip()
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
        return ""
    
def extract_images_from_pdf(file_stream):
    """Extract images from PDF using PyMuPDF"""
    images = []
    try:
        doc = fitz.open(stream=file_stream.read(), filetype="pdf")
        for page_num in range(len(doc)):
            page = doc[page_num]
            image_list = page.get_images()
            
            for img_index, img in enumerate(image_list):
                xref = img[0]
                pix = fitz.Pixmap(doc, xref)
                
                if pix.n - pix.alpha < 4:  # RGB
                    img_data = pix.tobytes("png")
                    img_pil = Image.open(io.BytesIO(img_data))
                    images.append(img_pil)
                
                pix = None
        doc.close()
    except Exception as e:
        print(f"Error extracting images from PDF: {e}")
    return images

def process_file_content(file, filename):
    """Process different file types and extract text and images"""
    file_extension = filename.lower().split('.')[-1] if '.' in filename else ''
    
    if file_extension == 'pdf':
        if not PDF_SUPPORT:
            return None, "PDF support not available. Install pdfplumber.", []
        # For now, just extract text - we'll add image extraction later
        return extract_text_from_pdf(io.BytesIO(file.read())), None, []
        
    elif file_extension in ['png', 'jpg', 'jpeg', 'gif', 'bmp']:
        # We'll process images in the ask endpoint
        return "Image file - content will be processed during Q&A", None, []
            
    elif file_extension == 'txt':
        # For text files
        return file.stream.read().decode("utf-8", errors="ignore"), None, []
    else:
        # Try to process as text file for other extensions
        try:
            return file.stream.read().decode("utf-8", errors="ignore"), None, []
        except:
            return None, f"Unsupported file type: {file_extension}", []

        
# ---------- LLM (Ollama API call) ----------

def ollama_chat(context: str, question: str,images: list = None, max_wait_sec: int = 120) -> str:
    url = f"{OLLAMA_BASE_URL}/api/chat"
    payload = {
        "model": OLLAMA_MODEL,
        "messages": [
            {
                "role": "system", 
                "content": "You are a helpful AI using stdent notes as a context you teach students. Use your knowledge/logic to explain in simple way only if required. Use the provided context to answer questions. never ever answer question unrelated to notes. Always cite your sources."
            },
            {
                "role": "user",
                "content": f"CONTEXT:\n{context}\n\nQUESTION:\n{question}\n\nAnswer based on the context above. End with: SOURCE: [file(s)]"
            }
        ],
        "stream": False
    }
     # Add images to the payload if available
    if images and len(images) > 0:
        import base64
        image_b64_list = []
        for img in images:
            try:
                img_byte_arr = io.BytesIO()
                img.save(img_byte_arr, format='PNG')
                img_b64 = base64.b64encode(img_byte_arr.getvalue()).decode('utf-8')
                image_b64_list.append(img_b64)
            except Exception as e:
                print(f"Error converting image to base64: {e}")
                continue
        
        if image_b64_list:
            payload["messages"][1]["images"] = image_b64_list
            print(f"📸 Sending request with {len(image_b64_list)} images to Llava")


    print(f"Sending request to Ollama at: {url}")

    try:
        response = requests.post(url, json=payload, timeout=max_wait_sec)
        print(f"Ollama response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            if "message" in data and "content" in data["message"]:
                content = data["message"]["content"]
                image_info = f" with {len(images)} images" if images else ""
                print(f"Successfully extracted content from {OLLAMA_MODEL}{image_info}")
                return content
            else:
                print(f" Unexpected response structure: {data}")
                return "Error: Could not extract response content from Ollama"
        else:
            error_msg = f"Ollama API returned status {response.status_code}: {response.text}"
            print(error_msg)
            return error_msg

            
    except requests.exceptions.ConnectionError as e:
        error_msg = f"Cannot connect to Ollama at {url}: {e}"
        print(error_msg)
        return error_msg
    except requests.exceptions.Timeout as e:
        error_msg = f"Ollama API timeout: {e}"
        print(error_msg)
        return error_msg
    except requests.exceptions.RequestException as e:
        error_msg = f"Ollama API request error: {e}"
        print(error_msg)
        return error_msg
    except Exception as e:
        error_msg = f"Unexpected error: {e}"
        print(error_msg)
        return error_msg
    
# ---------- OLLAMA HEALTH CHECK ----------
def wait_for_ollama():
    """Wait for Ollama and Llava to be ready"""
    max_retries = 30
    for i in range(max_retries):
        try:
            response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
            if response.status_code == 200:
                models = response.json()
                model_names = [model['name'] for model in models.get('models', [])]
                
                if any('llava' in name.lower() for name in model_names):
                    print("Ollama ready with Llava model!")
                    return True
                else:
                    print(f"⏳ Ollama ready, waiting for Llava... ({i+1}/{max_retries})")
        except Exception as e:
            print(f"⏳ Waiting for Ollama... ({i+1}/{max_retries}) - Error: {e}")
        
        time.sleep(2)
    
    print("Ollama/Llava not ready within timeout")
    return False

# Wait for Ollama before first request
def check_ollama_on_startup():
    print("Starting up... waiting for Ollama with Llava")
    wait_for_ollama()
    
# ------------------- ENDPOINTS --------------------------------------------------------
@app.route('/', methods=['GET'])
def health():
    try:
        # Check Ollama status
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        models = response.json()
        llava_ready = any('llava' in model['name'].lower() for model in models.get('models', []))
        
        return jsonify({
            "status": "ok", 
            "ollama": "connected",
            "llava_ready": llava_ready,
            "model": OLLAMA_MODEL
        }), 200
    except:
        return jsonify({"status": "ok", "ollama": "disconnected"}), 200

@app.route('/upload-files', methods=['POST'])
def upload_files():
    if 'files' not in request.files:
        return jsonify({"error": "Missing 'files'"}), 400

    files = request.files.getlist('files')
    if not files:
        return jsonify({"error": "No files selected"}), 400

    store = get_vector_store()
    results = []
    errors = []

    for file in files:
        if not file.filename:
            continue

        print(f"Processing file: {file.filename}")

        # Extract text and images based on file type - NOW 3 VALUES
        raw_text, error, images = process_file_content(file, file.filename)
        
        if error:
            errors.append({"file_name": file.filename, "error": error})
            continue
            
        if not raw_text or not raw_text.strip():
            # For image files, raw_text might be "Image file" but that's okay
            if not images:
                errors.append({"file_name": file.filename, "error": "No extractable text content"})
                continue

        print(f"Extracted {len(raw_text)} characters and {len(images)} images from {file.filename}")

        # Process the text (images are handled separately during Q&A)
        file_id = str(uuid.uuid4())
        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = splitter.split_text(raw_text)

        texts = chunks
        metadatas = [{
            "file_id": file_id, 
            "file_name": file.filename, 
            "chunk_index": i,
            "file_type": file.filename.lower().split('.')[-1] if '.' in file.filename else 'unknown',
            "has_images": len(images) > 0  # Store if file has images
        } for i in range(len(chunks))]
        ids = [str(uuid.uuid4()) for _ in chunks]

        # Store in vector database
        store.add_texts(texts=texts, metadatas=metadatas, ids=ids)
        results.append({
            "file_name": file.filename, 
            "file_id": file_id, 
            "chunks": len(chunks),
            "file_type": file.filename.lower().split('.')[-1] if '.' in file.filename else 'unknown',
            "images_found": len(images)  # Add images info to response
        })

    response_data = {"uploaded": results}
    if errors:
        response_data["errors"] = errors

    return jsonify(response_data), 201

@app.route('/file-ids', methods=['GET'])
def list_file_ids():
    try:
        cur = conn.cursor()
        cur.execute(f"""
            SELECT DISTINCT {TABLE_NAME}.cmetadata->>'file_id' AS file_id,
                            {TABLE_NAME}.cmetadata->>'file_name' AS file_name
            FROM {TABLE_NAME}
            ORDER BY file_name
        """)
        rows = cur.fetchall()
        cur.close()
        conn.commit()
        files = [{"file_id": r[0], "file_name": r[1]} for r in rows]
        return jsonify({"files": files})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

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
        "chunks": len(context_chunks),
        "model_used": OLLAMA_MODEL 
    })
    
if __name__ == "__main__":
    print("Starting Flask API")
    check_ollama_on_startup()
    app.run(host="0.0.0.0", port=3000, debug=True)
