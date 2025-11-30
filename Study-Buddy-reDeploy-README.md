# Study Buddy – AWS Deployment (Git Pull & Redeploy)

This document describes how to pull the latest code and redeploy all services on the production EC2 instance.

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
