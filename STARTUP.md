# Study Buddy — Clean Rebuild & Startup Guide (Docker, Project‑Specific)

This guide **removes Docker state**, **rebuilds fresh**, and brings up all services so you can open the app in the browser.

> ⚠️ **Destructive warning:** The “Nuclear cleanup” removes *all* Docker containers/images/volumes on your machine, not just this project. If you want to keep other Docker data, use the **Selective cleanup** section instead.

---

## Project structure (what this guide assumes)

```
FinalTeamProject/
├─ docker-compose.yml
├─ backend/
│  ├─ dockerfile            # lowercase, used by compose
│  ├─ package.json
│  ├─ prisma/
│  │  └─ schema.prisma
│  └─ src/...
├─ frontend/
│  ├─ dockerfile            # lowercase, used by compose
│  ├─ package.json
│  └─ src/...
└─ Flask-endpoints/
   ├─ Dockerfile            # capital D (OK)
   └─ app.py, requirements.txt, ...
```

> Your `docker-compose.yml` points to **lowercase** `dockerfile` for **backend** and **frontend**, and **Dockerfile** for Flask. If your filenames differ, adjust the compose file or rename the files. See **Step 2**.

---

## 0) Close anything using the project ports
Shut down local dev servers (`npm run dev`, Flask, etc.) and close terminals that might hold ports **5173**, **3001**, or **5000**.

---

## 1) Cleanup options

### A) Nuclear cleanup (everything in Docker)
**Windows PowerShell**
```powershell
docker compose down --volumes --remove-orphans

docker ps -aq | % { docker rm -f $_ }        # remove ALL containers
docker images -q | % { docker rmi -f $_ }    # remove ALL images
docker system prune -af --volumes            # remove ALL caches & volumes
```

**macOS/Linux (bash)**
```bash
docker compose down --volumes --remove-orphans

docker rm -f $(docker ps -aq) 2>/dev/null || true
docker rmi -f $(docker images -q) 2>/dev/null || true
docker system prune -af --volumes
```

### B) Selective cleanup (only this project)
From the project root:
```powershell
docker compose down --volumes --remove-orphans
```
(Then proceed to Step 2.)

---

## 2) Verify compose uses the correct Dockerfiles

Show the effective config:
```powershell
docker compose config
```
You should see (key bits):
```
backend.build.context: C:\FinalTeamProject\backend
backend.build.dockerfile: dockerfile
frontend.build.context: C:\FinalTeamProject\frontend
frontend.build.dockerfile: dockerfile
flask.build.context: C:\FinalTeamProject\Flask-endpoints
flask.build.dockerfile: Dockerfile
```

If compose says `dockerfile: dockerfile` for backend/frontend, ensure these files exist:
```
backend\dockerfile
frontend\dockerfile
```
If you want to use `Dockerfile` (capital D) instead, either rename the files or change compose:
```yaml
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
```

> **Tip:** `dockerfile` path is **relative to the build.context**, not to the compose file. Don’t mix `context: ./backend` with `dockerfile: backend/Dockerfile`.

---

## 3) Build everything fresh & start

From the project root (where `docker-compose.yml` lives):
```powershell
docker compose up -d --build --force-recreate
```

This will start:
- **db** (Postgres 16)
- **backend** (Node/Express @ **http://localhost:3001**)
- **flask** (Flask @ **http://localhost:5000**)
- **frontend** (Vite @ **http://localhost:5173**)

> Your compose mounts the source code into containers and mounts a volume at `/app/node_modules`. Because of that, installs done at image build time can be hidden. The compose `command` should install dependencies at container start (see Step 6).

---

## 4) Verify containers & watch logs

```powershell
docker compose ps
```
Expected (example):
```
NAME                 SERVICE    STATUS          PORTS
studybuddy_db        db         Up (healthy)    5432/tcp
studybuddy_backend   backend    Up              0.0.0.0:3001->3001/tcp
studybuddy_flask     flask      Up              0.0.0.0:5000->5000/tcp
studybuddy_frontend  frontend   Up              0.0.0.0:5173->5173/tcp
```

Tail logs if anything looks off:
```powershell
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f flask
docker compose logs -f db
```

Health check:
```powershell
curl http://localhost:3001/health
```

---

## 5) Open the app
- Frontend: **http://localhost:5173/**
- Backend (health): **http://localhost:3001/health**
- Flask (root): **http://localhost:5000/** (or your endpoints)

If the browser is blank, press **F12 → Console** and fix the **first** red error (import/export mismatch, undefined vars, etc.).

---

## 6) Backend notes (Prisma & runtime installs)

Because your compose **bind-mounts** the backend at `/app` and a volume at `/app/node_modules`, ensure the backend service runs installs and Prisma generation **at container start**. Your compose should have a command like:

```yaml
command: >
  sh -lc "
    (npm ci || npm install) &&
    npx prisma generate &&
    (npx prisma migrate deploy || npx prisma db push) &&
    npm run dev
  "
```

Manual one-liners if needed:
```powershell
docker compose exec studybuddy_backend sh -lc "npx prisma generate"
docker compose exec studybuddy_backend sh -lc "npx prisma migrate deploy || npx prisma db push"
```

If you see:
- `@prisma/client did not initialize` → run `prisma generate` inside the backend container.
- `relation does not exist` / Prisma `P2021` → run `migrate deploy` or `db push`.
- DB connection issues inside Docker → `DATABASE_URL` host must be **db**, not localhost:
  ```
  postgresql://postgres:postgres@db:5432/studybuddy?schema=public
  ```

---

## 7) Frontend notes (Vite proxy, Dev server)

Ensure `frontend/vite.config.js` proxies API requests to the **backend service name** (Docker network), not localhost:

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // 0.0.0.0 inside container
    proxy: {
      "/api": {
        target: "http://backend:3001",
        changeOrigin: true,
        secure: false
      }
    }
  }
});
```

If you prefer calling the backend directly from the browser (no proxy), use `http://localhost:3001/api/...` in your fetch calls.

---

## 8) Common errors & quick fixes

- **`failed to read dockerfile: open dockerfile: no such file or directory`**  
  Your compose expects `backend/dockerfile` and/or `frontend/dockerfile`. Create them (or update compose to use `Dockerfile`). Check with `docker compose config`.

- **Port already in use**
  ```powershell
  netstat -ano | findstr :5173
  taskkill /PID <PID> /F
  ```

- **Blank page in the browser**
  - Open DevTools → **Console**, fix the first error.
  - Enable ESLint `no-undef` to catch undefined variables at build time.
  - Linux is **case-sensitive**; fix import path casing (e.g., `StudySpacePage` vs `StudyspacePage`).

- **Hot reload doesn’t reflect changes**
  - With bind mounts, changes should reflect. If not, restart that service:
    ```powershell
    docker compose restart frontend
    ```

---

## 9) Useful commands

```powershell
# Rebuild a single service
docker compose up -d --build backend

# Follow logs for one service
docker compose logs -f frontend

# Exec into a container
docker compose exec studybuddy_backend sh

# Stop everything
docker compose down

# Stop and remove volumes too (project-only cleanup)
docker compose down --volumes --remove-orphans
```

---

**Done!** After following these steps, the app should be reachable at **http://localhost:5173/** with a healthy backend and database.
