### Hexlet tests and linter status:
[![Actions Status](https://github.com/DaniilShomin/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/DaniilShomin/ai-for-developers-project-386/actions)

# Booking System

Full-stack booking application inspired by Cal.com. Allows users to create booking links, share availability, and manage appointments.

## Architecture

- **Frontend**: React + Vite + TypeScript + Mantine UI
- **Backend**: FastAPI + SQLAlchemy + SQLite
- **API Spec**: TypeSpec → OpenAPI generation
- **Testing**: Playwright (E2E) + pytest (backend)

## Quick Start

```bash
# Install all dependencies
make install

# Run development servers (backend :8000 + frontend :3000)
make dev
```

## Development Commands

```bash
# Backend only
make dev-backend        # FastAPI with reload on :8000

# Frontend only  
make dev-frontend       # Vite dev server on :3000

# Code quality
make lint               # Run ruff linter
make format             # Format code with ruff
make test-backend       # Run pytest

# Production
make build              # Build frontend to dist/
```

## Docker Deployment

```bash
# Copy and customize environment
cp .env.docker .env

# Start production stack
docker-compose up -d

# Access
# Frontend: http://localhost
# API: http://localhost:8000
```

## Project Structure

```
├── backend/          # FastAPI application
│   ├── app/
│   │   ├── main.py      # FastAPI entry
│   │   ├── models.py    # SQLAlchemy models
│   │   ├── routers/     # API endpoints
│   │   └── config.py    # Settings
│   └── requirements.txt
├── frontend/         # React application
│   ├── src/
│   │   ├── pages/       # Route components
│   │   ├── components/  # UI components
│   │   └── api/         # API client
│   └── package.json
├── typespec/         # TypeSpec API definitions
├── openapi/          # Generated OpenAPI spec
└── docker-compose.yml
```

## Environment Variables

Copy `.env.example` files and customize:

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite database path | `sqlite:///./bookings.db` |
| `BACKEND_PORT` | API server port | `8000` |
| `ALLOWED_ORIGINS` | CORS origins | `*` |
| `VITE_BACKEND_URL` | Frontend API proxy | `http://localhost:8000` |

## API Endpoints

All routes prefixed with `/api/v1`:

- `GET /owners` - List owners
- `GET /event-types` - List event types
- `POST /bookings` - Create booking
- `GET /timeslots` - Available time slots

## Security Notice

⚠️ **Never commit real API keys or secrets to git.**

- Use `.env` for local secrets (already in `.gitignore`)
- Backup files (`*.un~`, `config.json~`, `.env~`) may contain secrets
- Rotate any exposed API keys immediately

## License

MIT
