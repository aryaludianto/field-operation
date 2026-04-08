# EcoFieldOps TODO

## 0. Repo scaffolding
- [x] Initialize git repo + license + editorconfig.
- [x] Set up Turbo/Nx (or pnpm workspaces) for frontend/backend/worker packages.
- [x] Configure shared tsconfig + lint/prettier rules.

## 1. Backend (GraphQL API)
- [x] Create `apps/api` with Apollo Server, TypeGraphQL, and Drizzle ORM.
- [x] Define PostgreSQL schema (missions, mission_logs, field_reports, assets, users, organizations).
- [x] Seed script with mock missions + report entries (SQL + JSON).
- [x] Implement resolvers for missions list + mission detail queries.
- [x] Implement report CRUD mutations.
- [x] Add file upload mutation (sign S3 URL via LocalStack).

## 2. Worker (Summaries + notifications)
- [ ] Spin up `apps/worker` using BullMQ + Redis container.
- [ ] Job pipeline: listen to `report.submitted` → call OpenAI → persist summary & insights table.
- [ ] Optional: push Slack/webhook notification stub.

## 3. Frontend (React + Mapbox)
- [x] Create Vite React app with Tailwind + component library.
- [x] Build mission map view (clustered markers, filter pill bar, detail drawer).
- [x] Implement report composer (rich text + photo uploads + offline queue with localStorage).
- [ ] Add dashboard page with metrics (cards + charts via Tremor/Recharts).
- [ ] Auth skeleton (Supabase/Clerk) with role-based gating.

## 4. Dev tooling
- [x] Docker Compose for Postgres + Redis + LocalStack.
- [x] Task scripts (e.g., `pnpm dev`, `pnpm lint`, `pnpm test`).
- [ ] GitHub Actions workflow (lint/test on PRs).

## 5. Docs/demo assets
- [x] Update README with setup instructions + screenshots/GIFs once UI exists.
- [ ] Create sample data JSON + scripts under `/scripts/seeds`.
- [ ] Record short Loom/GIF of mission map + AI summary pipeline.
