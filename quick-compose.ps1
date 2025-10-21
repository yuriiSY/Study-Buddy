# quick-compose-fixed.ps1
# Writes docker-compose + service Dockerfiles + Flask AI API + .env.example (no backup)

function Write-TextFile {
    param([string]$Path, [string]$Content)
    $dir = Split-Path -Parent $Path
    if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
    Set-Content -Path $Path -Value $Content -Encoding UTF8
  }
  
  $compose = @"
  version: "3.9"
  services:
    db:
      image: postgres:16
      container_name: studybuddy_db
      environment:
        POSTGRES_DB: ${DB_NAME:-studybuddy}
        POSTGRES_USER: ${DB_USER:-postgres}
        POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
      ports:
        - "5432:5432"
      volumes:
        - db_data:/var/lib/postgresql/data
      healthcheck:
        test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-postgres} -d ${DB_NAME:-studybuddy}"]
        interval: 5s
        timeout: 5s
        retries: 20
  
    backend:
      build:
        context: ./backend
        dockerfile: dockerfile
      container_name: studybuddy_backend
      env_file:
        - .env
      environment:
        DATABASE_URL: postgresql://${DB_USER:-postgres}:${DB_PASSWORD:-postgres}@db:5432/${DB_NAME:-studybuddy}?schema=public
        PORT: ${BACKEND_PORT:-3001}
        CORS_ALLOWED_ORIGINS: ${CORS_ALLOWED_ORIGINS:-http://localhost:5173}
        NODE_ENV: development
      depends_on:
        db:
          condition: service_healthy
      ports:
        - "${BACKEND_PORT:-3001}:3001"
      volumes:
        - ./backend:/app
        - /app/node_modules
      command: npm run dev
  
    flask:
      build:
        context: ./Flask-endpoints
        dockerfile: Dockerfile
      container_name: studybuddy_flask
      env_file:
        - .env
      environment:
        FLASK_ENV: development
        FLASK_RUN_PORT: 5000
        OPENAI_API_KEY: ${OPENAI_API_KEY:-}
        AI_PROVIDER: ${AI_PROVIDER:-openai}
      depends_on:
        db:
          condition: service_healthy
      ports:
        - "5000:5000"
      volumes:
        - ./Flask-endpoints:/app
      command: python -m flask run --host=0.0.0.0 --port=5000
  
    frontend:
      build:
        context: ./frontend
        dockerfile: dockerfile
      container_name: studybuddy_frontend
      env_file:
        - .env
      environment:
        VITE_API_BASE_URL: ${VITE_API_BASE_URL:-http://localhost:3001}
        VITE_FLASK_BASE_URL: ${VITE_FLASK_BASE_URL:-http://localhost:5000}
        PORT: 5173
      depends_on:
        - backend
        - flask
      ports:
        - "5173:5173"
      volumes:
        - ./frontend:/app
        - /app/node_modules
      command: npm run dev -- --host
  
  volumes:
    db_data:
"@
  Write-TextFile ".\docker-compose.yml" $compose
  
  $backendDockerfile = @"
  FROM node:20-alpine
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci || npm install
  COPY . .
  EXPOSE 3001
  CMD ["npm", "run", "dev"]
"@
  Write-TextFile ".\backend\dockerfile" $backendDockerfile
  Write-TextFile ".\backend\.dockerignore" "node_modules`n.env`n.vscode`n.git`ndist`ncoverage`n"
  
  $frontendDockerfile = @"
  FROM node:20-alpine
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci || npm install
  COPY . .
  EXPOSE 5173
  CMD ["npm", "run", "dev", "--", "--host"]
"@
  Write-TextFile ".\frontend\dockerfile" $frontendDockerfile
  Write-TextFile ".\frontend\.dockerignore" "node_modules`n.env`n.vscode`n.git`ndist`ncoverage`n"
  
  $flaskDockerfile = @"
  FROM python:3.11-slim
  WORKDIR /app
  COPY requirements.txt ./
  RUN pip install --no-cache-dir -r requirements.txt || true
  COPY . .
  ENV FLASK_APP=app.py
  EXPOSE 5000
  CMD ["python", "-m", "flask", "run", "--host=0.0.0.0", "--port=5000"]
"@
  Write-TextFile ".\Flask-endpoints\Dockerfile" $flaskDockerfile
  Write-TextFile ".\Flask-endpoints\requirements.txt" "flask==3.0.3`nflask-cors==4.0.1`nrequests==2.32.3`n"
  
  $flaskApp = @"
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
"@
  Write-TextFile ".\Flask-endpoints\app.py" $flaskApp
  
  $envExample = @"
  NODE_ENV=development
  DB_NAME=studybuddy
  DB_USER=postgres
  DB_PASSWORD=postgres
  BACKEND_PORT=3001
  VITE_API_BASE_URL=http://localhost:3001
  VITE_FLASK_BASE_URL=http://localhost:5000
  CORS_ALLOWED_ORIGINS=http://localhost:5173
  AI_PROVIDER=openai
  # OPENAI_API_KEY=sk-...
"@
  Write-TextFile ".\.env.example" $envExample
  
  Write-Host "Compose + Dockerfiles + AI API written."