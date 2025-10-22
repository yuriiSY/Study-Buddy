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