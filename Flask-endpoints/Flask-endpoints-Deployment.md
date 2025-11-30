
# Flask-endpoints Deployment (AWS EC2 + Docker)

This document explains:

1. How the `Flask-endpoints` (FastAPI/Flask) service is deployed on an AWS EC2 instance with Docker.
2. The exact commands to start / restart the service.
3. How to configure the Render-hosted Node backend to call this service.

> **Current deployment:**  
> EC2 public IP: `108.130.178.225`  
> Python API base URL: `http://108.130.178.225`  
> API docs: `http://108.130.178.225/docs`  
> Health check: `http://108.130.178.225/health`  

If the instance is stopped and started, the public IP may change unless an Elastic IP is attached.

---

## 1. Project Layout (relevant parts)

From the repo root:

```text
Study-Buddy/
  backend/           # Node/Express (on Render)
  frontend/          # Vite React frontend
  Flask-endpoints/   # Python FastAPI/Flask API (on EC2 via Docker)
    Dockerfile
    docker-compose.yml
    main.py
    requirements.txt
    .env             # NOT committed – created directly on EC2
```

The Python API is containerised using `Dockerfile` and `docker-compose.yml`.

---

## 2. Environment Variables (.env in Flask-endpoints)

On the EC2 instance, we create a `.env` file inside `Flask-endpoints/` (same directory as `docker-compose.yml` and `Dockerfile`).

Example:

```env
# PostgreSQL (Render-hosted)
DB_HOST=<your_render_db_host>
DB_PORT=5432
DB_NAME=<your_db_name>
DB_USER=<your_db_user>
DB_PASSWORD=<your_db_password>

# AWS / S3 (if used by the app)
AWS_ACCESS_KEY_ID=<your_access_key_id>
AWS_SECRET_ACCESS_KEY=<your_secret_access_key>
AWS_REGION=eu-west-1
S3_BUCKET_NAME=<your_bucket_name>

# Any other app-specific secrets (e.g. LLM keys)
GROQ_API_KEY=<your_groq_api_key>
```

This file is **not** committed to GitHub and is only present on the EC2 instance.

In `docker-compose.yml`, the service must reference this file:

```yaml
services:
  flask-api:
    build: .
    container_name: flask-api
    ports:
      - "80:3000"       # host:container (public:internal)
    env_file:
      - .env
    # ...other options...
```

---

## 3. First-time Deployment on EC2 (one-time setup)

These steps are already done, but documented here for reproducibility.

### 3.1. SSH into the EC2 instance

From your local machine:

```bash
ssh -i ./mayesha.pem ubuntu@108.130.178.225
```

(Use your actual `.pem` path and current EC2 public IP.)

### 3.2. Clone the repo and checkout the deployment branch

On the EC2 instance:

```bash
cd ~
git clone https://github.com/yuriiSY/Study-Buddy.git
cd Study-Buddy
git checkout aws-demo
cd Flask-endpoints
```

### 3.3. Create `.env`

Still in `~/Study-Buddy/Flask-endpoints`:

```bash
nano .env
# paste the env vars described above, then save
```

### 3.4. Install Docker & docker-compose (Ubuntu 24.04)

One-time:

```bash
sudo apt update
sudo apt install -y docker.io docker-compose

sudo systemctl enable docker
sudo systemctl start docker
```

(Optional: run docker without sudo)

```bash
sudo usermod -aG docker ubuntu
# log out and back in after this
```

---

## 4. Building & Starting the Python API (EC2)

### 4.1. Build + start the container

From `~/Study-Buddy/Flask-endpoints` on the EC2 instance:

```bash
docker-compose up -d --build
```

- `--build` ensures a fresh image is built from the latest code.
- `-d` runs the container in the background.

Check status:

```bash
docker-compose ps
```

You should see something like:

```text
Name        Command                              State  Ports
----------------------------------------------------------------------
flask-api   uvicorn main:app --host 0.0.0.0 ...  Up     0.0.0.0:80->3000/tcp
```

Check logs:

```bash
docker-compose logs -f
```

You should see:

```text
INFO:     Uvicorn running on http://0.0.0.0:3000
INFO:     Application startup complete.
```

### 4.2. Verify from EC2 itself

From the EC2 shell:

```bash
curl -v http://localhost/
curl -v http://localhost/docs
curl -v http://localhost/health
```

You should get `HTTP/1.1 200 OK` and HTML/JSON responses.

### 4.3. Verify from outside (internet)

From any machine with internet access (or AWS CloudShell):

```bash
curl -v http://108.130.178.225/docs
curl -v http://108.130.178.225/health
```

These should also return `200 OK`.

---
# Building frontend with nginx
cd ~/Study-Buddy/frontend
npm run build
sudo rm -rf /var/www/study-buddy/*
sudo cp -r dist/* /var/www/study-buddy/
sudo systemctl reload nginx

## 5. Commands to Start / Restart the Service (Day-to-day Use)

Whenever you want to (re)start the Python API:

1. **SSH into EC2**

   ```bash
   ssh -i ./mayesha.pem ubuntu@108.130.178.225
   ```

2. **Navigate to the service folder**

   ```bash
   cd ~/Study-Buddy/Flask-endpoints
   ```

3. **Start or restart the container**

   - If the container is stopped or after instance reboot:

     ```bash
     docker-compose up -d
     ```

   - If you’ve pulled new code and want to rebuild:

     ```bash
     git pull          # optional: bring latest aws-demo changes
     docker-compose down
     docker-compose up -d --build
     ```

4. **Check logs (optional)**

   ```bash
   docker-compose logs -f
   ```

If everything is OK, the API is available at:

- `http://<EC2_PUBLIC_IP>/` (root)
- `http://<EC2_PUBLIC_IP>/docs` (Swagger UI)
- `http://<EC2_PUBLIC_IP>/health` (health check)

---

## 6. Connecting Render Backend to the EC2 Python API

The Node backend running on Render needs to call the Python API on EC2 instead of `localhost`.

### 6.1. Backend code change (use an env variable)

In the **backend** project (locally), find where the Python service is called.  
For example, you might have something like this in one of the service files:

```ts
// BEFORE (example)
const PYTHON_API_URL = "http://localhost:3000";

export async function uploadFiles(payload: any) {
  return axios.post(`${PYTHON_API_URL}/upload-files`, payload);
}
```

Change it to use an environment variable with a local fallback:

```ts
// AFTER (example)
const PYTHON_API_URL =
  process.env.PYTHON_API_URL || "http://localhost:3000";

export async function uploadFiles(payload: any) {
  return axios.post(`${PYTHON_API_URL}/upload-files`, payload);
}
```

You can also centralise this in a shared client, e.g. `backend/src/services/pythonClient.ts`:

```ts
import axios from "axios";

const PYTHON_API_URL =
  process.env.PYTHON_API_URL || "http://localhost:3000";

export const pythonClient = axios.create({
  baseURL: PYTHON_API_URL,
});

// Usage in other files:
// const res = await pythonClient.post("/upload-files", payload);
```

Commit and push these backend code changes to GitHub.

### 6.2. Render environment variable

In the Render dashboard for the backend service:

1. Go to **Settings → Environment**.
2. Add (or update) this variable:

   ```text
   PYTHON_API_URL = http://108.130.178.225
   ```

   (Use the current EC2 public IP; if you later attach an Elastic IP or domain, use that instead.)

3. Save and trigger a **Deploy** / **Rebuild** of the backend service.

Render will now call the EC2 Python API instead of `localhost`.

### 6.3. Test the integration

From the Render backend shell/logs or Postman:

- Call a backend route that internally calls the Python API (e.g. `POST /api/upload-files`).
- The backend should successfully reach `http://108.130.178.225`.

You can also directly verify from the Render environment:

```bash
curl -v http://108.130.178.225/health
```

This should return `200 OK`.

---

## 7. CORS Configuration (Python API)

In `Flask-endpoints/main.py`, CORS should allow:

- Local frontend (Vite dev server)
- Render backend URL

Example:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

origins = [
    "http://localhost:5174",                     # local frontend
    "https://<your-render-backend>.onrender.com" # backend in production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Rebuild and restart the container after editing:

```bash
docker-compose down
docker-compose up -d --build
```

---

## 8. Summary

- **Python API** lives in `Flask-endpoints/`, deployed on EC2 via `docker-compose` on port **80** → `http://<EC2_PUBLIC_IP>/`.
- **To start it:** SSH to EC2 → `cd ~/Study-Buddy/Flask-endpoints` → `docker-compose up -d`.
- **Backend on Render** calls it using `PYTHON_API_URL` set to `http://<EC2_PUBLIC_IP>`.
- **Frontend** talks only to the backend; no direct calls to EC2 are required in production.

This gives you a fully deployed, multi-service Study Buddy application:  
Frontend → Render backend → EC2 Python API → Render PostgreSQL.
