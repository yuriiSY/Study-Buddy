# AI Study Buddy
AI Study Buddy is a web app that helps students study more effectively. It combines:
- Uploading notes (text, PDFs, images, audio, videos)
- Auto-generated quizzes and practice questions
- A Pomodoro timer
- Rewards, badges, and leaderboards
- Weak-spot analysis based on your notes and performance
- An AI tutor chat
- Study partner matching
- A community Q&A/forum (StackOverflow-style)
The app is built to be fast, scalable, and easy to deploy on cloud infrastructure.
---
## Features
- **Upload Notes**
  - Text, PDFs, and images (lecture slides, handwritten notes).
  - The app extracts and processes content using AI.
- **Audio/Video Support**
  - Upload lecture audio and video.
  - Get transcripts, summaries, or quizzes from the media.
- **Quizzes**
  - Automatically generate practice questions from uploaded material.
  - Helps with spaced repetition and active recall.
- **Pomodoro Timer**
  - Focus timer with work/break cycles.
  - Integrates with rewards/points system.
- **Rewards & Gamification**
  - Points, badges, and leaderboards.
  - Encourages consistent study behaviour.
- **Weak Spot Detection**
  - Tracks performance and note coverage.
  - Highlights topics you need to revisit.
- **AI Tutor**
  - Ask questions directly about your modules or notes.
  - Get explanations, summaries and practice prompts.
- **Study Partners**
  - Find other students studying similar modules/topics.
- **Community Forum**
  - Ask and answer questions.
  - Share resources and tips with other users.
---
## Team
- **Anika Siddiqui Mayesha** – Frontend Developer, AI Engineer  
- **Yurii Sykal** – Backend Developer  
- **Rumaysa Qayyum Babulkhair** – Backend Developer, AI Engineer  
- **Lorenzo Palleschi** – Frontend Developer, Design  
Legacy documentation is also available in the **Documentation** branch of the original project repo.
---
## Tech Stack & Architecture
### Core Technologies
- **Frontend**
  - React SPA built with **Vite**.
  - Uses official React plugin for Vite (Babel / SWC) and ESLint for linting.
- **Backend**
  - Node.js / Express API:
    - Authentication
    - Core business logic
    - Persistence (PostgreSQL via Prisma)
- **AI Service**
  - Python FastAPI/Flask service (`Flask-endpoints`) running in Docker.
  - Handles:
    - File ingestion & processing
    - LLM calls (e.g. GROQ)
    - Quiz generation, text summarisation, etc.
- **Database**
  - PostgreSQL (local via Docker for dev, managed instance in production).
- **Infrastructure**
  - Docker & Docker Compose
  - Nginx (reverse proxy + static file hosting)
  - AWS EC2 (main production deployment)
  - DuckDNS + Let’s Encrypt (HTTPS)
  - Optional: backend on Render + Python API on EC2 (alternative architecture)

### Repository Layout
For the `Study-Buddy` repo, the high-level layout is:

```text
Study-Buddy/
  backend/          # Node/Express backend (API + auth + DB)
  frontend/         # Vite React SPA (built and served in prod by Nginx)
  Flask-endpoints/  # Python FastAPI "AI Buddy" service (Docker)
  docker-compose.yml (and other infra files as needed)
```
In production on EC2, this typically lives under:
```text
/home/ubuntu/Study-Buddy
```
---

## Local Development
### Prerequisites
Install:
- Node.js
- npm
- Docker
### 1. Clone the Repository
```bash
git clone https://github.com/yuriiSY/Study-Buddy.git
cd Study-Buddy
```
### 2. Start Shared Services (Docker)
From the project root (where `docker-compose.yml` is located):
```bash
docker compose up -d
```
### 3. Backend – Node/Express
```bash
cd backend
npm install
```
Create an `.env` file. For local dev, you’ll at minimum need something like:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=<your_local_db_name>
DB_USER=<your_local_db_user>
DB_PASSWORD=<your_local_db_password>
PORT=5000
```
Run the API in dev mode:
```bash
npm run dev
```
Optional Prisma commands:
```bash
npx prisma generate
npx prisma migrate dev
```
### 4. AI Service – Python FastAPI / Flask (`Flask-endpoints`)
```bash
cd ../Flask-endpoints
```
Create a `.env` file in this directory:
```env
DB_HOST=...
DB_PORT=5432
DB_NAME=...
DB_USER=...
DB_PASSWORD=...

AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=eu-west-1
S3_BUCKET_NAME=...

GROQ_API_KEY=...
GROQ_MODEL=...
```
Run via Docker Compose:
```bash
docker compose up -d --build
```
### 5. Frontend – React + Vite
```bash
cd ../frontend
npm install
npm run dev
```
---

## Production Deployment – All-in-One AWS EC2 (EC2 + Nginx + Node + FastAPI + Docker)
This section describes the main production deployment where frontend, backend, and Python AI service all run on a single AWS EC2 instance behind Nginx.
### 1. Example Production Setup
- **Host**
  - AWS EC2, Ubuntu 24.04
- **Security Group**
  - 80/TCP – HTTP from `0.0.0.0/0`
  - 443/TCP – HTTPS from `0.0.0.0/0`
  - 22/TCP – SSH from your IP only
- **Domain (DuckDNS)**
  - `studybuddyai.duckdns.org` → EC2 public IP
Code layout:
```text
/home/ubuntu/Study-Buddy
  backend/
  frontend/
  Flask-endpoints/
```
Services & Ports:
- **Nginx**
  - Serves React build from `/var/www/study-buddy`.
  - Proxies:
    - `/api/` → Node backend `http://127.0.0.1:5000/`
    - `/pypi/` → Python AI Buddy `http://127.0.0.1:3000/`
- **Node Backend**
  - Port: `5000`
  - Managed by `systemd` (`study-buddy-backend`)
- **Python AI Buddy**
  - Docker container `flask-api`
  - Host port `3000`
### 2. Day-to-Day Operations
#### SSH into the Server
```bash
ssh -i ./study-buddy-key.pem ubuntu@studybuddyai.duckdns.org
```
#### Node Backend
```bash
sudo systemctl status study-buddy-backend
sudo systemctl restart study-buddy-backend
journalctl -u study-buddy-backend -f
curl -v http://localhost:5000/health
curl -v http://localhost/api/health
```
#### Python AI Buddy (Docker)
```bash
cd ~/Study-Buddy/Flask-endpoints
docker-compose ps
docker-compose restart
docker-compose down
docker-compose up -d --build
docker-compose logs -f
curl -v http://localhost:3000/health
curl -v http://localhost/pypi/health
```
#### Frontend + Nginx
Rebuild frontend:
```bash
cd ~/Study-Buddy/frontend
npm install
npm run build
sudo rm -rf /var/www/study-buddy/*
sudo cp -r dist/* /var/www/study-buddy/
```
Example Nginx site config (`/etc/nginx/sites-available/study-buddy`):
```nginx
server {
    listen 80;
    server_name 108.130.178.225 studybuddyai.duckdns.org;
    root /var/www/study-buddy;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
    location /api/ {
        proxy_pass http://127.0.0.1:5000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    location /pypi/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
After editing Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```
---
## Updating a Live EC2 Deployment (Git Pull & Redeploy)
### 1. SSH and Pull Latest Code
```bash
ssh -i /path/to/key.pem ubuntu@studybuddy.duckdns.org
cd ~/Study-Buddy
git status
git fetch origin
git checkout main
git pull origin main
```
If there are local changes blocking the pull, either stash or discard:
```bash
git stash push -m "server changes before pulling aws-demo"
# or
git restore backend/src/app.js
```
### 2. Redeploy Backend
```bash
cd ~/Study-Buddy/backend
curl -v http://localhost:5000/health
```
### 3. Redeploy Python AI Service
```bash
cd ~/Study-Buddy/Flask-endpoints
docker-compose down
docker-compose up -d --build
docker-compose ps
curl -v http://localhost:3000/health
```
### 4. Rebuild Frontend
```bash
cd ~/Study-Buddy/frontend
npm install
npm run build
sudo rm -rf /var/www/study-buddy/*
sudo cp -r dist/* /var/www/study-buddy/
sudo nginx -t
sudo systemctl reload nginx