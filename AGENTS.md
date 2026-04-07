отвечай на русском

## Git Workflow

- Commit after each task completion
- Commit message format: `feat: <description>` or `fix: <description>`
- Never commit node_modules/, .next/, tsp-output/, vendor/, .env
- Run linter/tests before committing

## Project Architecture

Full-stack booking application (Cal.com-inspired):

- **backend/**: FastAPI + SQLAlchemy + SQLite (bookings.db)
- **frontend/**: React + Vite + TypeScript + Mantine UI
- **typespec/**: TypeSpec → OpenAPI spec generation
- **openapi/**: Generated OpenAPI YAML

## Development Commands (Makefile)

```bash
make install          # Install all deps (backend + frontend)
make dev              # Run backend (8000) + frontend (3000) together
make dev-backend      # FastAPI on :8000 with reload
make dev-frontend     # Vite dev server on :3000
make build            # Production build (frontend/dist)
make lint             # ruff check backend/
make format           # ruff format backend/
make test-backend     # pytest in backend/
make clean            # Remove cache files
```

## Frontend-specific

```bash
cd frontend
npm run dev        # Port 3000, /api proxied to :8000
npm run build      # Output to dist/
```

- **Proxy config**: `vite.config.ts` routes `/api` → `http://localhost:8000`
- **Path alias**: `@/` maps to `src/` (configured in vite.config.ts and tsconfig.json)
- **UI library**: Mantine v7 (@mantine/core, @mantine/dates, @mantine/form)
- **Routing**: React Router v7

## Backend-specific

```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

- **Entry**: `app/main.py` creates FastAPI app, includes routers from `app/routers/`
- **Database**: SQLite at `bookings.db`, SQLAlchemy models in `app/models.py`
- **API prefix**: All routes mounted at `/api/v1`
- **CORS**: Enabled for all origins (`*`)
- **Linter**: ruff (no pyproject.toml, runs via Makefile)

## TypeSpec / OpenAPI

```bash
cd typespec
npm install
npx tsp compile .     # Generates ../openapi/openapi.yaml
```

- **Config**: `tspconfig.yaml` emits to `../openapi/openapi.yaml`
- **Models**: `models.tsp` (Owner, Booker, TimeSlot, Booking)
- **Routes**: `main.tsp`

## Mock API (Prism)

```bash
# From repo root
npm install
npm run prism:mock   # Mock server on :8000 from openapi.yaml
npm run prism:proxy  # Proxy + validation on :8080
```

## Important Constraints

- SQLite: `check_same_thread=False` required for FastAPI async
- API routes: Use `/api/v1/` prefix (not root `/`)
- Frontend builds to `frontend/dist/` (Vite default)
- Python linting: ruff only, no mypy configured

## Testing

- Backend: `cd backend && python3 -m pytest -v`
- No frontend tests configured

## Philosophy

Решай причину а не следствие
