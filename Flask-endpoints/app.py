  from flask import Flask, request, jsonify
  from flask_cors import CORS
  import os, requests
  
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
  
      provider = (os.getenv("AI_PROVIDER","openai") or "openai").lower()
      api_key = (os.getenv("OPENAI_API_KEY") or "").strip()
  
      if not api_key:
          return jsonify(answer=f"(mock) You asked: '{prompt}'. Tip: set OPENAI_API_KEY to enable real responses.", provider="mock"), 200
  
      try:
          if provider == "openai":
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
              content = r.json()["choices"][0]["message"]["content"]
              return jsonify(answer=content, provider="openai"), 200
          return jsonify(error=f"Provider '{provider}' not supported"), 400
      except Exception as e:
          return jsonify(error=str(e)), 500
  
  if __name__ == "__main__":
      app.run(host="0.0.0.0", port=5000)
