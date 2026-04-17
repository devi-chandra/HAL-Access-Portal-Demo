# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### HAL Visitor & Device Access Management Portal (`hal-portal`)

A full-stack government enterprise demo portal for managing visitor and device access requests.

**Purpose**: Portfolio demo project inspired by internship workflow observation at a high-security aerospace facility. NOT an official HAL system.

**Pages**:
- `/` — Landing page with hero + 3 portal cards
- `/register` — Multi-section visitor registration form
- `/track` — Request status tracker with 7-step timeline
- `/admin/login` — Role-based admin login
- `/admin` — Admin dashboard with analytics, request management, approvals

**Demo credentials**:
- `dept_manager` / `demo123` — Department Manager
- `senior_officer` / `demo123` — Senior Officer
- `general_manager` / `demo123` — General Manager

**DB Schema**: `lib/db/src/schema/visitorRequests.ts` — `visitor_requests` table

**API Routes**:
- `POST /api/visitors` — Submit new visitor request
- `GET /api/visitors` — List all requests (with filter/search/pagination)
- `GET /api/visitors/:requestId` — Get single request by ID
- `POST /api/visitors/:requestId/action` — Approve/reject/forward
- `POST /api/admin/login` — Admin authentication
- `GET /api/analytics/summary` — Dashboard stats
- `GET /api/analytics/recent` — Recent activity feed
- `GET /api/analytics/departments` — Stats by department
