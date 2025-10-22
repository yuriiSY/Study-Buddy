from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.get("/health")
def health():
    return jsonify(status="ok"), 200

@app.post("/api/ai/ask")
def ai_ask():
    data = request.get_json(silent=True) or {}
    prompt = (data.get("prompt") or "").strip()
    if not prompt:
        return jsonify(error="Missing 'prompt'"), 400

    api_key = (os.getenv("OPENAI_API_KEY") or "").strip()
    if not api_key:
        return jsonify(answer=f"(mock) You asked: '{prompt}'. Set OPENAI_API_KEY for real responses.", provider="mock"), 200

    try:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
        body = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": "You are a helpful study buddy."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.2
        }
        r = requests.post(url, headers=headers, json=body, timeout=30)
        r.raise_for_status()
        return jsonify(answer=r.json()["choices"][0]["message"]["content"], provider="openai"), 200
    except Exception as e:
        return jsonify(error=str(e)), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)