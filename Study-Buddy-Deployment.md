# Study Buddy – Deployment Guide (AWS EC2 + Nginx + Node + FastAPI + Docker)

This document covers:

1. **What is running in production and where.**  
2. **Day-to-day: how to start / restart each part.**  
3. **How to recreate the setup on a new Ubuntu server (summary).**  
4. **How to put it behind a free DuckDNS domain and enable HTTPS with Let’s Encrypt.**

---

## 1. Current Production Setup

**Host**

- AWS EC2, Ubuntu 24.04  
- Public IP (at time of writing): `108.130.178.225`
- Security Group inbound (recommended):
  - **80/TCP** – HTTP from `0.0.0.0/0`
  - **443/TCP** – HTTPS from `0.0.0.0/0`
  - **22/TCP** – SSH from your own IP only  

**Domain (DuckDNS)**

- Example: `studybuddyai.duckdns.org` → points to `108.130.178.225`
- Public app URL:  

  ```text
  http://studybuddyai.duckdns.org
  # or, if DNS is not configured:
  http://108.130.178.225
  ```

**Code layout on the server**

```text
/home/ubuntu/Study-Buddy
  backend/          # Node/Express backend (API + auth + DB)
  frontend/         # Vite React SPA (built and served by Nginx)
  Flask-endpoints/  # Python FastAPI "AI Buddy" (Docker)
```

**Services & ports**

- **Nginx** (reverse proxy + static hosting)
  - Listens on port **80** (and **443** if HTTPS is configured).
  - Serves React build from `/var/www/study-buddy`.
  - Proxies:
    - `/api/` → Node backend at `http://127.0.0.1:5000/`
    - `/pypi/` → Python AI Buddy at `http://127.0.0.1:3000/`
- **Node/Express backend**
  - Directory: `/home/ubuntu/Study-Buddy/backend`
  - Listens on **5000**
  - Managed by **systemd** service: `study-buddy-backend`
- **Python AI Buddy (FastAPI)**
  - Directory: `/home/ubuntu/Study-Buddy/Flask-endpoints`
  - Runs in Docker container `flask-api`
  - Container port **3000**, exposed as host port **3000**

---

## 2. Day-to-Day Operations (“How do I restart things?”)

### 2.1. SSH into the server

From your local machine:

```bash
ssh -i ./mayesha.pem ubuntu@108.130.178.225
# or, once DNS is set:
ssh -i ./mayesha.pem ubuntu@studybuddyai.duckdns.org
```

---

### 2.2. Node backend (Express API)

**Check status**

```bash
sudo systemctl status study-buddy-backend
```

**Restart after code or env changes**

```bash
cd ~/Study-Buddy/backend
sudo systemctl restart study-buddy-backend
```

**View logs**

```bash
journalctl -u study-buddy-backend -f
```

**Health check**

From the server:

```bash
curl -v http://localhost:5000/health
```

From outside (if port 5000 is open to your IP):

```bash
curl -v http://108.130.178.225:5000/health
```

Or via Nginx:

```bash
curl -v http://studybuddyai.duckdns.org/api/health
```

---

### 2.3. Python AI Buddy (FastAPI in Docker)

**Go to the project**

```bash
cd ~/Study-Buddy/Flask-endpoints
```

**See container status**

```bash
docker-compose ps
```

You should see `flask-api` **Up** on port `3000->3000`.

**Restart (no rebuild)**

```bash
docker-compose restart
```

**Rebuild + restart** (after code changes or dependency changes):

```bash
docker-compose down
docker-compose up -d --build
```

**Tail logs**

```bash
docker-compose logs -f
```

**Health check**

From the server:

```bash
curl -v http://localhost:3000/health
# or, through nginx
curl -v http://localhost/pypi/health
```

From outside:

```bash
curl -v http://studybuddyai.duckdns.org/pypi/health
```

---

### 2.4. Frontend (React SPA) + Nginx

**Rebuild frontend after code changes**

```bash
cd ~/Study-Buddy/frontend
npm install               # only if dependencies changed
npm run build
sudo rm -rf /var/www/study-buddy/*
sudo cp -r dist/* /var/www/study-buddy/
```

**Nginx config & reload**

Nginx site file: `/etc/nginx/sites-available/study-buddy` (symlinked in `sites-enabled`).

Typical server block:

```nginx
server {
    listen 80;
    server_name 108.130.178.225 studybuddyai.duckdns.org;

    # React build
    root /var/www/study-buddy;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Node backend (Express)
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

    # Python AI Buddy (FastAPI)
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

**After editing Nginx config**

```bash
sudo nginx -t          # config test
sudo systemctl reload nginx
```

**Check Nginx status**

```bash
sudo systemctl status nginx
```

---

### 2.5. “Everything is down, what do I do?”

1. SSH into the server.
2. Check Nginx:

   ```bash
   sudo systemctl restart nginx
   sudo systemctl status nginx
   ```

3. Ensure backend is running:

   ```bash
   sudo systemctl restart study-buddy-backend
   systemctl status study-buddy-backend
   ```

4. Ensure AI Buddy container is running:

   ```bash
   cd ~/Study-Buddy/Flask-endpoints
   docker-compose up -d
   docker-compose ps
   ```

5. Test:

   ```bash
   curl -v http://localhost/          # should return index.html
   curl -v http://localhost/api/health
   curl -v http://localhost/pypi/health
   ```

If all of those work, the public URL (`http://studybuddyai.duckdns.org` or `http://108.130.178.225`) should load.

---

## 3. Re-creating the Setup on a New Server (Summary)

High-level checklist if you had to rebuild from scratch.

### 3.1. Create EC2 instance + Security Group

- Ubuntu 24.04 LTS
- Security Group inbound rules:
  - 22/TCP from **your IP**
  - 80/TCP from **0.0.0.0/0**
  - 443/TCP from **0.0.0.0/0**
  - Optional temporary rules for 3000/5000 from your IP while debugging

SSH in:

```bash
ssh -i ./mayesha.pem ubuntu@<NEW_EC2_PUBLIC_IP>
```

### 3.2. Install system packages

```bash
sudo apt update
sudo apt install -y nginx docker.io docker-compose git build-essential
sudo systemctl enable docker
sudo systemctl start docker
```

### 3.3. Clone repo

```bash
cd ~
git clone https://github.com/yuriiSY/Study-Buddy.git
cd Study-Buddy
# checkout the desired branch (e.g. aws-demo / main)
git checkout aws-demo   # or main, depending on what you use
```

### 3.4. Backend (Node/Express)

1. Install Node via `nvm` (e.g. Node 20.x):

   ```bash
   curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
   source ~/.bashrc
   nvm install 20
   nvm use 20
   ```

2. Install dependencies and configure env:

   ```bash
   cd ~/Study-Buddy/backend
   npm install
   cp .env.example .env   # if you have an example; otherwise create .env
   # edit .env with DB creds, JWT secret, S3 keys, etc.
   ```

3. Setup Prisma (if using Postgres as in the current setup):

   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

4. Create systemd service `/etc/systemd/system/study-buddy-backend.service`:

   ```ini
   [Unit]
   Description=Study Buddy Backend (Node.js)
   After=network.target

   [Service]
   WorkingDirectory=/home/ubuntu/Study-Buddy/backend
   ExecStart=/home/ubuntu/.nvm/versions/node/v20.19.6/bin/node server.js
   Restart=always
   Environment=NODE_ENV=production
   Environment=PORT=5000

   [Install]
   WantedBy=multi-user.target
   ```

   Then:

   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable study-buddy-backend
   sudo systemctl start study-buddy-backend
   ```

### 3.5. Python AI Buddy (FastAPI)

1. Create `.env` in `Flask-endpoints`:

   ```bash
   cd ~/Study-Buddy/Flask-endpoints
   nano .env
   ```

   Include:

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
   GROQ_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
   ```

2. Start via Docker compose:

   ```bash
   docker-compose up -d --build
   ```

   Ensure ports in `docker-compose.yml` expose `3000:3000`.

### 3.6. Frontend + Nginx

1. Build frontend:

   ```bash
   cd ~/Study-Buddy/frontend
   npm install
   npm run build
   sudo mkdir -p /var/www/study-buddy
   sudo cp -r dist/* /var/www/study-buddy/
   ```

2. Create `/etc/nginx/sites-available/study-buddy` with the server block shown in section **2.4**.

3. Enable the site and reload Nginx:

   ```bash
   sudo ln -s /etc/nginx/sites-available/study-buddy /etc/nginx/sites-enabled/study-buddy
   sudo rm -f /etc/nginx/sites-enabled/default
   sudo nginx -t
   sudo systemctl restart nginx
   ```

Now `http://<NEW_EC2_PUBLIC_IP>` should load the app.

---

## 4. DNS + HTTPS (DuckDNS + Let’s Encrypt)

You can run this setup completely for free with DuckDNS + Let’s Encrypt.

### 4.1. DuckDNS

1. Go to **duckdns.org** and sign in (GitHub/Google/etc.).
2. Create a subdomain, e.g. `studybuddyai`.
3. Set **current ip** to your EC2 public IP (`108.130.178.225`).
4. Verify from the server:

   ```bash
   dig +short studybuddyai.duckdns.org
   # should return your EC2 IP
   ```

5. Add the domain in Nginx `server_name`:

   ```nginx
   server_name 108.130.178.225 studybuddyai.duckdns.org;
   ```

   Then `sudo nginx -t` and `sudo systemctl reload nginx`.

### 4.2. Let’s Encrypt (Certbot + Nginx)

1. Install certbot:

   ```bash
   sudo snap install core
   sudo snap refresh core
   sudo snap install --classic certbot
   sudo ln -s /snap/bin/certbot /usr/bin/certbot
   ```

2. Request a certificate for your DuckDNS domain:

   ```bash
   sudo certbot --nginx -d studybuddyai.duckdns.org
   ```

   - Make sure:
     - `studybuddyai.duckdns.org` points to your EC2 IP (`dig` shows correct IP).
     - Port **80** is open in the EC2 Security Group.

3. If successful, certbot will:
   - Create / update Nginx config for HTTPS (port 443).
   - Obtain certificates stored in `/etc/letsencrypt/`.
   - Configure auto-renew via `certbot.timer`.

   Check renewal status:

   ```bash
   systemctl status certbot.timer
   ```

4. Final URL becomes:

   ```text
   https://studybuddyai.duckdns.org
   ```

   (Browser should show a secure connection with a valid Let’s Encrypt certificate.)

---

## 5. Quick “Cheat Sheet”

- **SSH**

  ```bash
  ssh -i ./mayesha.pem ubuntu@studybuddyai.duckdns.org
  ```

- **Restart backend (Node)**

  ```bash
  sudo systemctl restart study-buddy-backend
  ```

- **Restart AI Buddy (FastAPI)**

  ```bash
  cd ~/Study-Buddy/Flask-endpoints
  docker-compose restart
  ```

- **Rebuild frontend**

  ```bash
  cd ~/Study-Buddy/frontend
  npm run build
  sudo rm -rf /var/www/study-buddy/*
  sudo cp -r dist/* /var/www/study-buddy/
  sudo systemctl reload nginx
  ```

- **Check everything**

  ```bash
  curl -v http://localhost/api/health
  curl -v http://localhost/pypi/health
  ```

This document should now reflect the stack exactly as it’s running on your EC2 box, and give you a clear path to restart things, rebuild, or recreate it on a new server.


# Study Buddy – AWS Deployment (Git Pull & Redeploy)

This section describes how to pull the latest code and redeploy all services on the production EC2 instance.

---

## 1. SSH into the server

From your local machine:

```bash
ssh -i /path/to/key.pem ubuntu@studybuddy.duckdns.org
# or:
# ssh -i /path/to/key.pem ubuntu@<EC2_PUBLIC_IP>
```

---

## 2. Update the repository (aws-demo branch)

```bash
cd ~/Study-Buddy

# Check current branch and local changes
git status

# Fetch latest branches and switch to deployment branch
git fetch origin
git checkout aws-demo
```

### 2.1 Normal case: no local changes

```bash
git pull origin aws-demo
```

### 2.2 If git pull fails because of local changes

Example error:

> error: Your local changes to the following files would be overwritten by merge

You have two options.

**Option A – keep server changes (stash) _[recommended]_**

```bash
# See what was changed
git diff backend/src/app.js

# Stash local edits
git stash push -m "server changes before pulling aws-demo"

# Pull latest code
git pull origin aws-demo

# (Optional) re-apply the stash later
git stash list
git stash apply stash@{0}
```

**Option B – discard server changes for a file**

Use this only if you are sure you do **not** need the local edits.

```bash
# Reset the changed file(s)
git restore backend/src/app.js
# (older git): git checkout -- backend/src/app.js

# Then pull latest code
git pull origin aws-demo
```

---

## 3. Redeploy the Node backend API

```bash
cd ~/Study-Buddy/backend

# Install dependencies (safe to run every time)
npm install

# Apply DB migrations (if schema changed)
npx prisma generate
npx prisma migrate deploy

# Restart systemd service
sudo systemctl restart study-buddy-backend

# Check status and health
sudo systemctl status study-buddy-backend
curl -v http://localhost:5000/health
curl -v http://localhost/api/health
```

---

## 4. Redeploy the Python AI service (Flask/FastAPI)

```bash
cd ~/Study-Buddy/Flask-endpoints

# Rebuild and restart Docker container
docker-compose down
docker-compose up -d --build

# Check containers
docker-compose ps

# Health checks
curl -v http://localhost:3000/health
curl -v http://localhost/pypi/health
```

---

## 5. Rebuild and deploy the frontend

```bash
cd ~/Study-Buddy/frontend

# Install dependencies
npm install

# Build production assets
npm run build
```

Copy the build output to the Nginx web root:

```bash
sudo rm -rf /var/www/study-buddy/*
sudo cp -r dist/* /var/www/study-buddy/
```

Reload Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 6. Smoke test

From your local machine, open:

- https://studybuddy.duckdns.org

Check:

- Login and basic navigation
- API features that call /api/...
- AI features that call /pypi/...