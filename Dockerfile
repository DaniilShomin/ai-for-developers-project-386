# Multi-stage Dockerfile for Booking Application (CI/CD ready)
# Builds unified container with FastAPI backend + React frontend

# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./
RUN npm ci --silent

# Copy frontend source
COPY frontend/ ./
RUN npm run build

# Stage 2: Production image with Python + nginx
FROM python:3.11-slim-bookworm

# Install nginx and curl (for healthcheck)
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Set working directory
WORKDIR /app

# Copy Python requirements and install dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application
COPY backend/app/ ./app/

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Create data directory for SQLite
RUN mkdir -p /app/data && chmod 777 /app/data

# Create nginx configuration
RUN cat > /etc/nginx/conf.d/default.conf << 'EOF'
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to FastAPI backend
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Remove default nginx site
RUN rm -f /etc/nginx/sites-enabled/default

# Create entrypoint script to start both services
RUN cat > /entrypoint.sh << 'EOF'
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
EOF

RUN chmod +x /entrypoint.sh

# Expose port 80 (nginx)
EXPOSE 80

# Healthcheck endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost/api/v1/health || exit 1

# Start both services
CMD ["/entrypoint.sh"]
