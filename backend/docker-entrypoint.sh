#./frontend/docker-entrypoint.sh
#!/usr/bin/env bash
set -e

# Run DB migrations
npx prisma migrate deploy

# Start the app
npm run start