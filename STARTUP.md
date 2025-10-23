# Study Buddy — Clean Rebuild & Startup Guide (Docker)
**Data loss warning:** Using the commands below will remove **all** containers, images, caches, **and volumes** on your machine (not just this project). This will delete any persisted database data. If you want to keep other Docker data, use the *Selective cleanup* variant further below.

---

## Prerequisites
- **Docker Desktop** (Windows/macOS) or **Docker Engine** (Linux) with **Docker Compose v2**
- The Study Buddy repository checked out locally (project root contains `docker-compose.yml`)

> Default exposed ports (according to the compose setup you’ve been using):
> - Frontend (Vite): **http://localhost:5173/**
> - Backend (Node): **http://localhost:3001/**
> - PostgreSQL: internal only (not published)

---

## 0) Close anything that might be using project ports
Close any local dev servers that might still be running (e.g., `npm run dev`) and shut down old terminal shells pointing to the project.

---

## 1) **Nuclear cleanup** — remove everything in Docker

### Windows PowerShell
```powershell
# Stop and remove all containers for this project (if present)
docker compose down --volumes --remove-orphans

# Remove ALL containers on your machine (optional but recommended for a clean slate)
docker ps -aq | ForEach-Object { docker rm -f $_ }

# Remove ALL images on your machine (optional; forces clean rebuilds)
docker images -q | ForEach-Object { docker rmi -f $_ }

# Prune ALL unused data, including volumes and build cache (DESTRUCTIVE)
docker system prune -af --volumes
```

### Bash (macOS/Linux) — equivalent
```bash
# Stop and remove project containers/volumes
docker compose down --volumes --remove-orphans

# Remove ALL containers (optional)
docker rm -f $(docker ps -aq) 2>/dev/null || true

# Remove ALL images (optional)
docker rmi -f $(docker images -q) 2>/dev/null || true

# Prune ALL unused data (DESTRUCTIVE)
docker system prune -af --volumes
```

> ✅ At this point, Docker is clean. If you only want to clean **this project** and keep the rest of your Docker data, skip the “ALL” removal commands and just use `docker compose down --volumes --remove-orphans` inside this repo.

---

## 2) Build everything fresh

From the **project root** (where `docker-compose.yml` lives):

```powershell
# Windows PowerShell (works the same in bash)
docker compose up -d --build --force-recreate
```

This will build fresh images for:
- `frontend` (Vite)
- `backend` (Node/Express)
- `flask` (Python/Flask microservice)
- `db` (PostgreSQL)

> If your services rely on environment files (e.g., `backend/.env`, `flask/.env`), ensure those files exist **before** building.

---

## 3) Verify containers are healthy

```powershell
docker compose ps
```

You should see something like:
```
NAME                  SERVICE    STATUS            PORTS
studybuddy_frontend   frontend   Up                0.0.0.0:5173->5173/tcp
studybuddy_backend    backend    Up                0.0.0.0:3001->3001/tcp
studybuddy_flask      flask      Up                (internal)
studybuddy_db         db         Up (healthy)      5432/tcp
```

Follow logs if anything looks off:
```powershell
docker compose logs -f frontend
docker compose logs -f backend
docker compose logs -f flask
docker compose logs -f db
```

---

## 4) Open the application in the browser

- **Frontend:** http://localhost:5173/
- **Backend (optional check):** http://localhost:3001/  (or your health endpoint if defined)

If the browser shows a blank page, open DevTools → **Console** and fix the **first** red error (usually an import/export mismatch or case-sensitive path issue when running inside Linux containers).

---

## 5) Selective cleanup (if you don’t want to wipe everything in Docker)

Use these instead of the nuclear step:

```powershell
# From project root
docker compose down --volumes --remove-orphans

# (Optional) Remove just this project’s images by name if you want a clean rebuild but keep other images.
# Replace names with your actual image tags if they differ.
docker rmi -f finalteamproject-frontend finalteamproject-backend finalteamproject-flask 2>$null

# Rebuild and start
docker compose up -d --build --force-recreate
```

---

## 6) Common troubleshooting

- **Port already in use**
  ```powershell
  # Who is using port 5173?
  netstat -ano | findstr :5173
  # Kill the PID you see (careful):
  taskkill /PID <PID> /F
  ```

- **Frontend accessible but blank page**
  - Check browser console for the first red error.
  - Inconsistent import/export (default vs. named) or **case mismatch** in file paths will work on Windows but fail in Linux containers.
  - Tail container logs:
    ```powershell
    docker compose logs -f frontend
    ```

- **Changes not reflecting**
  - If you aren’t mounting your source as a volume, rebuild after changes:
    ```powershell
    docker compose up -d --build frontend
    ```

- **Vite not binding inside container**
  - Ensure your `package.json` dev script uses host binding if you run dev servers inside Docker:
    ```json
    "dev": "vite --host"
    ```
  - Rebuild the frontend service after changes to `package.json`:
    ```powershell
    docker compose up -d --build frontend
    ```

---

## 7) Tear down when you’re done

```powershell
docker compose down --volumes --remove-orphans
```

> Remove **all** Docker data again:
```powershell
docker system prune -af --volumes
```

---

**You’re set.** After a clean wipe and fresh build, the app should be available at **http://localhost:5173/**.
