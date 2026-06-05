# portfolio-website

Personal portfolio for [ducolam.com](https://ducolam.com).

## Structure

```
apps/
  bun/frontend/    # React + Vite + Tailwind (Bun)
  uv/backend/      # FastAPI (uv)
```

## Frontend

Requires [Bun](https://bun.sh).

```bash
cd apps/bun/frontend
bun install
bun dev
```

Runs at `http://localhost:5173`.

## Backend

Requires [uv](https://docs.astral.sh/uv).

```bash
cd apps/uv/backend
uv sync
uv run uvicorn src.main:app --reload
```

Runs at `http://localhost:8000`. Health check: `GET /api/health`.

## Deploy

The full stack runs via Docker Compose. Push to `main` and the self-hosted GitHub Actions runner on the server deploys automatically.

To deploy manually:

```bash
docker compose up -d --build
```
