# portfolio-website

Personal portfolio for [ducolam.com](https://ducolam.com).

## Structure

```
apps/
  bun/frontend/    # React + Vite + Tailwind (Bun)
  uv/backend/      # FastAPI + PostgreSQL + Alembic (uv)
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

Requires [uv](https://docs.astral.sh/uv) and a running PostgreSQL instance.

```bash
cd apps/uv/backend
uv sync
```

Run migrations:

```bash
uv run alembic upgrade head
```

Start the server:

```bash
uv run uvicorn src.main:app --reload
```

Runs at `http://localhost:8000`.

### Environment variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql+asyncpg://tigris:changeme@localhost:5432/tigris_silvae` | Postgres connection string |
| `SECRET_KEY` | `change-me-in-production` | JWT signing key |
| `MEMBER_TOKEN` | `tigris-secret` | Token required to register a new member |

### Auth endpoints

| Method | Path | Body |
|---|---|---|
| `POST` | `/api/auth/register` | `{ username, password, member_token }` |
| `POST` | `/api/auth/login` | `{ username, password }` |

Both return `{ access_token, token_type }`.

### Adding a migration

After changing a model:

```bash
uv run alembic revision --autogenerate -m "describe the change"
uv run alembic upgrade head
```

## Deploy

Push to `main` — the self-hosted GitHub Actions runner on the server deploys automatically.

To deploy manually:

```bash
docker compose up -d --build
```

> Before deploying, update `SECRET_KEY` and `MEMBER_TOKEN` in `docker-compose.yml` to real secrets.
