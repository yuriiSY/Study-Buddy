# AI Study Buddy
AI Study Buddy is a web app that helps students study more effectively. It is currently deployed at:

👉 **https://thestudybuddyaiproject.online**

The system is split into:
- **Frontend (React + Vite)** – hosted on **AWS EC2**, served by **Nginx** over HTTPS  
- **AI Service (FastAPI / Python)** – hosted on the **same EC2 instance**, behind Nginx  
- **Core Backend API (Node/Express)** – hosted as a **Render Web Service**, with auto-deploys from GitHub `main`
---
## Features (Short Overview)
- **Upload Notes:** PDFs, text, and images.
- **AI Processing:** Summaries, quizzes, and question answering from your notes.
- **Quizzes & Practice:** Auto-generated questions from your materials.
- **Pomodoro Timer:** Focus sessions with work/break cycles.
- **Gamification:** Points, badges, leaderboard.
- **Weak-spot Analysis:** Highlights topics you’re struggling with.
- **AI Tutor Chat:** Ask questions about modules and uploaded content.
- **Study Partners + Community:** Match with others and use Q&A/forum style discussion.
---
## Tech Stack & Architecture
### Frontend (AWS EC2)
- **React** SPA built with **Vite**
- Built assets in `frontend/dist`
- Served by **Nginx** from `/var/www/study-buddy`
- Public entrypoint: **https://thestudybuddyaiproject.online**

### FastAPI / Python AI Service (AWS EC2)
- Lives in `Flask-endpoints/`
- Runs as a **Docker service** on the EC2 instance (e.g. `flask-api` container)
- Exposes HTTP on a local port (e.g. `http://127.0.0.1:3000`)
- Reverse-proxied by Nginx under an internal path (for example `/pypi` or `/ai`)

### Backend API (Node/Express on Render)
- Source code in `backend/`
- Deployed as a **Render Web Service** from the same GitHub repo  
- Render:
  - Pulls from **branch `main`**.
  - Can auto-deploy on each push to that branch. :contentReference[oaicite:0]{index=0}  
  - Exposes a URL like `https://<your-service>.onrender.com` over HTTPS, with free TLS certificates managed by Render. :contentReference[oaicite:1]{index=1}  
- The frontend and FastAPI service use this Render URL, e.g.:
  - `REACT_APP_BACKEND_URL=https://<your-service>.onrender.com`
  - `BACKEND_BASE_URL=https://<your-service>.onrender.com`

### Database
- **PostgreSQL**
  - Dev: via Docker (e.g. `postgres-pgvector` in `docker-compose.yml`)
  - Prod: managed Postgres (Render or another managed provider)
---

## Redeployment
### in your local Study-Buddy clone
git add .
git commit -m "Some message"
git push origin main
### ssh into ec2
ssh -i /path/to/key.pem ubuntu@thestudybuddyaiproject.online
cd ~/Study-Buddy
git fetch origin
git checkout main
git pull origin main
### local changes to stash
git status
git restore <file>         # or, if you don't care:
git reset --hard origin/main
### fastAPI
cd ~/Study-Buddy/Flask-endpoints
//Add docker-compose.yml file
nano docker-compose.yml
//Restart with fresh build
docker-compose down
docker-compose up -d --build
//Check logs
docker-compose logs -f
//Quick health check
curl -v http://localhost:3000/health
curl -vk https://thestudybuddyaiproject.online/ai/health
docker-compose ps
docker-compose logs -f
### frontend
cd ~/Study-Buddy/frontend
npm install          //only needed when deps change, but safe to run
npm run build
### nginx web root
sudo rm -rf /var/www/study-buddy/*
sudo cp -r dist/* /var/www/study-buddy/
//reload nginx
sudo nginx -t
sudo systemctl reload nginx
//Check if nginx serving SPA properly
curl -vk https://thestudybuddyaiproject.online

## Repository Layout
```text
Study-Buddy/
  backend/          # Node/Express backend API (Render Web Service)
  frontend/         # React + Vite SPA (deployed on EC2 / Nginx)
  Flask-endpoints/  # Python FastAPI AI service (Docker on EC2)
  docker-compose.yml