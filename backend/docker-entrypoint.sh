#!/bin/sh
set -e

# Ensure Prisma Client exists (harmless if already generated)
npx prisma generate >/dev/null 2>&1 || true

# Apply schema (deploy migrations if present; else push)
if npx prisma migrate deploy; then
  echo "Migrations deployed."
else
  echo "No migrations found, running db push."
  npx prisma db push
fi

# Start the server (use nodemon in dev, node in prod)
if [ "$NODE_ENV" = "production" ]; then
  node server.js
else
  npx nodemon --legacy-watch server.js
fi