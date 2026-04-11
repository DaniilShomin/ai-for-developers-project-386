#!/bin/bash
set -e

# Create data directory with proper permissions
mkdir -p /app/data
chmod 777 /app/data

# Start nginx in background
echo "Starting nginx..."
nginx

# Wait a moment for nginx to initialize
sleep 1

# Start FastAPI backend
echo "Starting FastAPI backend..."
export DATABASE_URL=${DATABASE_URL:-sqlite:////app/data/bookings.db}
export BACKEND_HOST=${BACKEND_HOST:-0.0.0.0}
export BACKEND_PORT=${BACKEND_PORT:-8000}
export API_PREFIX=${API_PREFIX:-/api/v1}
export ALLOWED_ORIGINS=${ALLOWED_ORIGINS:-*}

exec uvicorn app.main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --workers 1
