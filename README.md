# HAL Visitor & Device Access Management Portal (Demo)

## Disclaimer

> **This is an independent demo prototype created for learning and portfolio purposes.**
> 
> This is **NOT** an official HAL (Hindustan Aeronautics Limited) internal system. Internal technologies, infrastructure, architecture, and any confidential code are **not** included. This demo uses a completely separate public technology stack only to recreate the concept of a visitor and device access management workflow observed during an internship experience in a high-security government aerospace environment.

---

## About

A full-stack professional demo web application simulating a **Visitor & Device Access Management Portal** for a high-security aerospace facility. It demonstrates the complete workflow of visitor registration, multi-level approval chains, device entry tracking, and admin review — inspired by similar real-world government enterprise workflows.

---

## Features

### Public Portal
- **Visitor Registration** — Multi-section smart form covering personal, professional, visit, and device details
- **Track Request Status** — 7-stage timeline tracker (Submitted → Approved/Rejected)
- **Auto-generated Request IDs** — Format: `HAL-YYYY-XXXX`
- **Document Upload UI** — ID proof, official letter, device proof

### Admin Portal (Role-based)
- **3 Admin Roles**: Department Manager, Senior Officer, General Manager
- **Dashboard with Analytics** — Total, pending, approved, rejected, devices requested today
- **Department Statistics Chart** — Bar chart visualization using Recharts
- **Request Management** — Approve, reject, forward to next level, add comments
- **Search & Filter** — By status, department, name, request ID
- **Recent Activity Feed** — Live update of latest request changes
- **Toast notifications** for all actions

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Forms | React Hook Form + Zod |
| Animations | Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Node.js + Express 5 |
| Database | PostgreSQL + Drizzle ORM |
| API Layer | OpenAPI 3.1 + Orval codegen |
| Routing | Wouter |
| State | TanStack React Query |

---

## Local Development

### Prerequisites
- Node.js 20+
- pnpm
- PostgreSQL database (set `DATABASE_URL` env variable)

### Setup

```bash
# Install dependencies
pnpm install

# Push database schema
pnpm --filter @workspace/db run push

# Start API server (development)
pnpm --filter @workspace/api-server run dev

# Start frontend (development)
pnpm --filter @workspace/hal-portal run dev
```

### Demo Credentials

| Role | Username | Password |
|---|---|---|
| Department Manager | `dept_manager` | `demo123` |
| Senior Officer | `senior_officer` | `demo123` |
| General Manager | `general_manager` | `demo123` |

---

## Approval Workflow

```
Visitor Submits Request
        ↓
Under Verification (Security)
        ↓
Pending at Department Manager
        ↓
Pending at Senior Officer
        ↓
Pending at General Manager
        ↓
   Approved / Rejected
```

---

## Project Structure

```
artifacts/
  api-server/         # Express 5 REST API
  hal-portal/         # React + Vite frontend
lib/
  db/                 # Drizzle ORM schema (PostgreSQL)
  api-spec/           # OpenAPI 3.1 specification
  api-client-react/   # Generated React Query hooks
  api-zod/            # Generated Zod validation schemas
```

---

## Portfolio Note

This project was built as a portfolio demonstration. The workflow concept is inspired by real-world visitor management systems in high-security government facilities, but all implementation details, code, and architecture are original and created independently.
