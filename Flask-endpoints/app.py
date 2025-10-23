from flask import Flask, request, jsonify
from flask_cors import CORS
import os

# optional: load .env if present
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

from google import genai

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.get("/health")
def health():
    return jsonify(status="ok"), 200

GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_API_KEY = (os.getenv("GEMINI_API_KEY") or "").strip()

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is missing. Set it in env or .env before starting.")

client = genai.Client(api_key=GEMINI_API_KEY)

@app.post("/api/ai/ask")
def ai_ask():
    data = request.get_json(silent=True) or {}
    prompt = (data.get("prompt") or "").strip()
    if not prompt:
        return jsonify(error="Missing 'prompt'"), 400

    try:
        resp = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt
        )
        return jsonify(answer=resp.text, provider="gemini"), 200
    except Exception as e:
        return jsonify(error=str(e)), 500

if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port)

# --- Auth routes (minimal demo)
from functools import wraps
from flask import request

def require_bearer_token(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return jsonify(error="Missing or invalid token"), 401
        token = auth.split(" ", 1)[1].strip()
        # Simple demo check; replace with real verification (e.g., JWT decode)
        if not token or not token.startswith(("dev_", "token_")):
            return jsonify(error="Invalid token"), 401
        return func(*args, **kwargs)
    return wrapper

@app.post("/api/auth/login")
def login_route():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()
    if not email or not password:
        return jsonify(error="Email and password required"), 400

    # TODO: replace with real credential check
    # For now, accept anything non-empty and return a fake token.
    token = f"dev_{email[:8].replace('@','_')}"
    user = {"email": email}

    return jsonify(token=token, user=user), 200

@app.get("/api/profile")
@require_bearer_token
def profile_route():
    # Demo profile (in real life, look up by token/sub)
    return jsonify(
        email="student@example.com",
        name="Study Buddy",
        plan="free",
    ), 200