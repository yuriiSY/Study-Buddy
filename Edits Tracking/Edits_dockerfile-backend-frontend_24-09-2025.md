# FinalTeamProject — Changes Made & Rationale
_Last updated: 2025-09-24 19:00 UTC_

This document records the **concrete changes** we introduced to make the project run cleanly in Docker (Postgres + pgAdmin + Backend, optional Frontend), and **why** each change was required.

---

## 1) Added a backend Dockerfile (Node 20 slim)
**File:** `backend/Dockerfile`  
**What we did:**
- Base image: `node:20-slim`
- Installed system dependency Prisma needs (`openssl`).
- Copied `package*.json` then ran `npm ci` for deterministic installs.
- Copied the rest of the app and ran `npx prisma generate` at build time.
- Exposed port `5000` and `CMD ["npm","run","dev"]` for dev workflow.

**Why:**
- `node:20-slim` is smaller than full Debian, reducing surface area and vulnerabilities while remaining compatible with Prisma.
- Generating Prisma client during build guarantees the client exists in the image (useful when not bind-mounting the source).

---

## 2) Extended `backend/docker-compose.yml` to add the backend service
**File:** `backend/docker-compose.yml`  
**What we did:**
- Kept your existing `postgres` + `pgadmin` services.
- Added a new `backend` service that **builds** from `backend/Dockerfile`, exposes `5000:5000`, and depends on Postgres.
- Ensured environment comes from `backend/.env`.

**Why:**
- One `docker compose up` now starts the API and database together.
- `depends_on` ensures Postgres is reachable as `postgres` hostname on the Compose network.

---

## 3) Moved Prisma client bootstrap to `src/`
**File moved:** `backend/prismaClient.js` → `backend/src/prismaClient.js`  
**Why:**
- Your `userController.js` imported via `../prismaClient.js` (relative to `src/controllers`), which resolves to `src/prismaClient.js`. Moving the file eliminated `ERR_MODULE_NOT_FOUND` on startup.

---

## 4) Adjusted volumes to avoid masking the runtime Prisma client
**Change:** Removed the anonymous volume entry `- /app/node_modules` from the `backend` service.  
**Why:**
- An anonymous volume at `/app/node_modules` hides the `node_modules` created at build time. That caused `@prisma/client did not initialize yet` and `nodemon: not found`. Removing that line lets you choose either:
  - **Bind mount** only (`- .:/app`) and then run `npm ci` inside the container once (puts `node_modules` on the host), **or**
  - Use a **named volume** (e.g., `node_modules:/app/node_modules`) initialized with `npm ci` once, keeping deps in Docker.

---

## 5) Ensured the Prisma generator output is compatible with `@prisma/client`
**What we suggested:** In `backend/prisma/schema.prisma`, remove any custom `generator client.output` path so that the default client is generated under `node_modules/@prisma/client` (works with `import { PrismaClient } from "@prisma/client"`).  
**Why:**
- If a custom output is set, `@prisma/client` won’t contain the generated client and your imports must change. Using the default output keeps imports simple and standard.

---

## 6) Created `backend/.env` for runtime configuration
**File:** `backend/.env`  
**What we added:**
```ini
PORT=5000
DATABASE_URL="postgresql://admin:secret@postgres:5432/mydb?schema=public"
```
**Why:**
- Prisma requires `DATABASE_URL`. Using the Compose service hostname (`postgres`) makes the backend work consistently inside Docker. If you run the backend outside Docker, use `localhost` instead.

---

## 7) (Optional) Added a Frontend container
**File:** `frontend/Dockerfile` (if created) and `frontend` service in `backend/docker-compose.yml`.  
**Why:**
- Allows `docker compose up` to bring up **frontend + backend + db + pgAdmin** together, serving the built Vite app on port `5173`.

---

## 8) Cleaned up deprecated Compose metadata
**Change:** Removed obsolete top-level `version:` key from `docker-compose.yml`.  
**Why:**
- With the modern Compose Specification, `version` is ignored. Removing it avoids warnings.

---

## 9) Dev workflow decisions documented
- Bind mounts (`- .:/app`) are kept so you can live-edit in VS Code.
- Initializing dependencies inside the running container (`npm ci`) ensures `nodemon` and the Prisma client exist in the same filesystem the app uses at runtime.
- Prisma workflows (`npx prisma generate` and `npx prisma migrate dev`) are run **inside** the backend container so they operate on the same `node_modules` and DB.

---

## Summary
These changes align the repo with a predictable Docker dev flow: **compose up → generate/migrate in container → code/hot-reload with bind mount**. This prevents path and client‑generation errors and makes service startup reproducible across machines.
