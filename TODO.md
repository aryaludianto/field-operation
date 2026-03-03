# EcoFieldOps TODO

## 0. Repo scaffolding
- [ ] Initialize git repo + license + editorconfig.
- [ ] Set up Turbo/Nx (or pnpm workspaces) for frontend/backend/worker packages.
- [ ] Configure shared tsconfig + lint/prettier rules.

## 1. Backend (GraphQL API)
- [ ] Create `apps/api` with Apollo Server, TypeGraphQL, and Drizzle ORM.
- [ ] Define PostgreSQL schema (missions, mission_logs, field_reports, assets, users, organizations).
- [ ] Seed script with mock missions + report entries (SQL + JSON).
- [x] Implement resolvers for missions list + mission detail queries.
- [ ] Implement report CRUD mutations.
- [ ] Add file upload mutation (sign S3 URL via LocalStack).

## 2. Worker (Summaries + notifications)
- [ ] Spin up `apps/worker` using BullMQ + Redis container.
- [ ] Job pipeline: listen to `report.submitted` → call OpenAI → persist summary & insights table.
- [ ] Optional: push Slack/webhook notification stub.

## 3. Frontend (React + Mapbox)
- [ ] Create Vite React app with Tailwind + component library.
- [ ] Build mission map view (clustered markers, filter pill bar, detail drawer).
- [ ] Implement report composer (rich text + photo uploads + offline queue with localStorage).
- [ ] Add dashboard page with metrics (cards + charts via Tremor/Recharts).
- [ ] Auth skeleton (Supabase/Clerk) with role-based gating.

## 4. Dev tooling
- [ ] Docker Compose for Postgres + Redis + LocalStack.
- [ ] Task scripts (e.g., `pnpm dev`, `pnpm lint`, `pnpm test`).
- [ ] GitHub Actions workflow (lint/test on PRs).

## 5. Docs/demo assets
- [ ] Update README with setup instructions + screenshots/GIFs once UI exists.
- [ ] Create sample data JSON + scripts under `/scripts/seeds`.
- [ ] Record short Loom/GIF of mission map + AI summary pipeline.
