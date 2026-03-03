# EcoFieldOps (WIP)

Modern geospatial operations platform inspired by my work at Gaia Ecologie. EcoFieldOps combines a React + Mapbox GL front end with a GraphQL API powered by Node.js, Apollo Server, PostgreSQL (Drizzle ORM), and OpenAI-backed summarization jobs. The goal is to show how I build data-heavy field dashboards that map missions, collect reports, and ship AI-assisted insights.

## Current workspace layout

```
apps/
  api/      # Apollo GraphQL gateway (TypeGraphQL, Drizzle-ready)
  web/      # React + Vite front end with Mapbox shell
  worker/   # BullMQ queue processor + OpenAI summarization stub
packages/
  shared/   # Zod schemas + shared TypeScript types
scripts/    # seed + automation helpers
```

Turborepo + npm workspaces orchestrate builds/tests across packages.

## Getting started

```bash
# 1. Install dependencies (root)
npm install

# 2. Copy env templates (root + apps)
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/worker/.env.example apps/worker/.env
cp apps/web/.env.example apps/web/.env

# 3. Launch infrastructure
Docker Desktop & then:
docker compose up -d

# 4. Run everything in dev mode
default: npm run dev   # turbo spawns api + web + worker

# or run individual packages
npm run dev --workspace=@ecofieldops/api
npm run dev --workspace=@ecofieldops/web
npm run dev --workspace=@ecofieldops/worker
```

The front end expects `VITE_API_URL` + `VITE_MAPBOX_TOKEN` in `apps/web/.env` and currently renders a Mapbox shell pointed at Amsterdam.

## Database + schema workflow

`apps/api` now ships with Drizzle ORM + migrations:

```bash
# from repo root
npm run db:generate --workspace=@ecofieldops/api   # generate SQL from schema
npm run db:push --workspace=@ecofieldops/api       # apply schema to Postgres

# seed demo org/missions/reports
npm run seed
```

Schema tables:
- `organizations`, `missions`, `users`
- `field_reports` (with severity enum + AI insights JSONB)
- `assets` (S3/LocalStack-backed uploads)

## API status

- `MissionResolver` now exposes `missions` (with basic filters) plus `mission(id)` queries backed by Drizzle.
- `HelloResolver` sticks around as a quick smoke test response.
- Database pool + `db` export live in `apps/api/src/db/client.ts`.
- Next up: implement report mutations + persistence helpers that reuse the new resolver types.

## Worker status

`apps/worker` listens on `report.submitted` BullMQ queue, validates payloads with Zod, and currently logs mock summaries. Roadmap:
- Integrate OpenAI responses + persist to database.
- Emit webhook/notification events.
- Add retry/backoff policies + metrics collection.

## Frontend status

`apps/web` now ships with a Vite + React + Tailwind shell, Mapbox mission map component, and a tiny internal UI kit (buttons, badges, stat cards, sidebar layout). Upcoming tasks:
- Wire Apollo Client to the API once CRUD resolvers land.
- Implement real mission list + filters + detail drawers.
- Build report composer + offline queue.

## Tooling

- npm workspaces + Turborepo for scripts (`npm run dev|build|lint|test`).
- TypeScript everywhere (`tsconfig.base.json`).
- ESLint + Prettier at root.
- Docker Compose for Postgres, Redis, LocalStack (S3).

Check `TODO.md` for detailed milestones.
