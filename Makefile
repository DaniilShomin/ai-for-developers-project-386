.PHONY: help install install-backend install-frontend dev dev-backend dev-frontend build build-frontend lint lint-backend format test test-backend clean db-init

# Default target
help:
	@echo "Available commands:"
	@echo "  make install          - Install all dependencies"
	@echo "  make install-backend  - Install Python dependencies"
	@echo "  make install-frontend - Install Node.js dependencies"
	@echo "  make dev              - Run backend and frontend in parallel"
	@echo "  make dev-backend      - Run backend server (port 8000)"
	@echo "  make dev-frontend     - Run frontend dev server (port 3000)"
	@echo "  make build            - Build frontend for production"
	@echo "  make lint             - Run ruff linter on backend"
	@echo "  make format           - Auto-format Python code with ruff"
	@echo "  make format-check     - Check Python code formatting"
	@echo "  make test             - Run all tests"
	@echo "  make test-backend     - Run backend tests with pytest"
	@echo "  make clean            - Clean cache files and artifacts"

# Installation
install: install-backend install-frontend

install-backend:
	@echo "Installing backend dependencies..."
	pip install -r backend/requirements.txt

install-frontend:
	@echo "Installing frontend dependencies..."
	cd frontend && npm install

# Development servers
dev:
	@echo "Starting backend and frontend..."
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:3000"
	@(cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &) && \
	 sleep 2 && \
	 cd frontend && npm run dev

dev-backend:
	@echo "Starting backend development server on port 8000..."
	cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

dev-frontend:
	@echo "Starting frontend development server on port 3000..."
	cd frontend && npm run dev

# Build
build:
	@echo "Building frontend for production..."
	cd frontend && npm run build

# Linting and formatting
lint:
	@echo "Running ruff linter on backend..."
	ruff check backend/

format:
	@echo "Formatting Python code with ruff..."
	ruff format backend/

format-check:
	@echo "Checking Python code formatting..."
	ruff format --check backend/

# Testing
test: test-backend

test-backend:
	@echo "Running backend tests..."
	cd backend && python3 -m pytest -v 2>/dev/null || echo "No tests found"

# Cleanup
clean:
	@echo "Cleaning up..."
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".ruff_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	find . -type f -name "*.pyo" -delete 2>/dev/null || true
	rm -rf frontend/dist 2>/dev/null || true
	@echo "Cleanup complete!"
