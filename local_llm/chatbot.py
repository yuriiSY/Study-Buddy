import os
import json
import base64
from io import BytesIO
from PIL import Image
import numpy as np
from sentence_transformers import SentenceTransformer
from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama.llms import OllamaLLM

# ---------------- CONFIG ----------------
VECTOR_FILE = "vectors.json"            # Pre-generated vector store
EMBED_MODEL_NAME = "all-MiniLM-L6-v2"   # Embedding model for queries
OLLAMA_MODEL = "llama3.2:3b"            # Multimodal model
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434") 
# ----------------------------------------

def image_to_base64(path, max_size=(1024, 1024)):
    """Convert an image to base64 for Ollama multimodal model."""
    if not os.path.exists(path):
        raise FileNotFoundError(f"Image not found: {path}")
    img = Image.open(path)
    img.thumbnail(max_size)
    buffered = BytesIO()
    img.save(buffered, format="JPEG")
    return base64.b64encode(buffered.getvalue()).decode("utf-8")

def cosine_similarity(a, b):
    """Compute cosine similarity between two vectors."""
    a = np.array(a)
    b = np.array(b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

# ---------- Load Embedding Model ----------
print("Loading embedding model...")
emb_model = SentenceTransformer(EMBED_MODEL_NAME)

# ---------- Load and Retrieve Vectors ----------
def load_vectors():
    """Load embeddings from JSON file."""
    if not os.path.exists(VECTOR_FILE):
        raise FileNotFoundError(f"Vector file not found: {VECTOR_FILE}. Run embedding.py first.")
    with open(VECTOR_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def retrieve(query, k=4):
    """Retrieve top-k most similar chunks for the given query."""
    data = load_vectors()
    q_emb = emb_model.encode(query, convert_to_numpy=True).tolist()
    sims = [(cosine_similarity(q_emb, d["embedding"]), d["text"]) for d in data]
    sims.sort(reverse=True, key=lambda x: x[0])
    return [t for _, t in sims[:k]]

# ---------- Setup Ollama LLM ----------
print("Connecting to Ollama model...")
print(f"Using base URL: {OLLAMA_BASE_URL}")
llm = OllamaLLM(
    model=OLLAMA_MODEL,
    base_url=OLLAMA_BASE_URL,
    temperature=0.1,
    verbose=True  # For debugging
)

# Template prompt
template = """
You are a helpful local AI assistant.

Use the CONTEXT (from the user's text file) to answer the QUESTION clearly and practically.
If the context does not fully answer the question, fill the missing explanation using your own knowledge.
Clearly mark added information as "💡 ADDED BY MODEL".

CONTEXT:
{context}

QUESTION:
{question}

If an image is provided, consider it as visual input (image_base64 variable may contain it).

End your response with:
SOURCE: [file|model|file+model]
"""

prompt = ChatPromptTemplate.from_template(template)
chain = prompt | llm

def answer_question(question, image_path=None):
    """Generate answer with context + optional image."""
    try:
        context_chunks = retrieve(question)
        context = "\n---\n".join(context_chunks) if context_chunks else "No relevant context found."
        inputs = {"context": context, "question": question}
        if image_path:
            image_b64 = image_to_base64(image_path)
            inputs["images"] = [image_b64]
        print("🤖 Thinking...")
        #print(f"DEBUG: Inputs sent to LLM: {inputs}")
        result = chain.invoke(inputs)
        print(f"DEBUG: LLM response: {result}")
        return result
    except Exception as e:
        #print(f"DEBUG: Error details: {str(e)}")
        return f"Error generating response: {str(e)}"

# ---------- Main interactive loop ----------
if __name__ == "__main__":
    try:
        print("\n Local LLM ready! Ask questions about your text file.\n")
        while True:
            q = input("Ask a question (or type 'exit'): ").strip()
            if q.lower() in ["exit", "quit"]:
                break
            img = input("Optional image path (press enter to skip): ").strip() or None
            if img and not os.path.exists(img):
                print(f" Image not found: {img}")
                img = None
            ans = answer_question(q, img)
            print("\n--- ANSWER ---\n")
            print(ans)
            print("\n--------------\n")
    except KeyboardInterrupt:
        print("\n Exiting...")
    except Exception as e:
        print(f" Setup error: {str(e)}")