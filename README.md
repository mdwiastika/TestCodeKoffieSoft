# KoffieSoft Task Management Web Application

A full-stack task management application designed for small teams, built as a technical assessment.

Prioritizes correctness, simplicity, maintainability, calm and accessible UI/UX, and transparent documentation.

---

## Tech Stack

- **Backend:** Python 3.11+ (verified on 3.14.5), FastAPI, SQLAlchemy 2.0 (ORM), Alembic (migrations), Pydantic v2 + `pydantic-settings`, PostgreSQL (via `psycopg` v3 binary driver), pytest, Uvicorn.
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui inspired primitives, TanStack Query v5, React Hook Form + Zod v3, Lucide React.
- **Infrastructure:** Docker Compose (PostgreSQL 16 Alpine).

---

## Project Structure & Git Repositories

Per specification, both `/backend` and `/frontend` maintain their own isolated Git repositories with standardized conventional commit histories (`feat(...)`, `fix(...)`, `chore(...)`).

```text
.
├── docker-compose.yml       # PostgreSQL 16 container definition
├── README.md                # Main documentation (this file)
├── AI_NOTES.md              # AI development trajectory & disclosure notes
├── AGENTS.md                # Original prompt instructions & constraints
├── /backend                 # Backend service (own git repository)
│   ├── app/
│   │   ├── main.py          # FastAPI app, CORS, router registrations
│   │   ├── config.py        # Settings loaded via pydantic-settings
│   │   ├── database.py      # Engine, sessionmaker, Base, get_db dependency
│   │   ├── models/          # SQLAlchemy 2.0 models (Member, Task)
│   │   ├── schemas/         # Pydantic v2 schemas (requests, responses, filters)
│   │   ├── routers/         # REST routers (members.py, tasks.py, dashboard.py)
│   │   └── services/        # Business logic (keeps routers thin)
│   ├── alembic/             # Database schema migrations
│   ├── tests/               # Pytest suite (20 tests covering CRUD, 404, 409, 422, overdue rules)
│   ├── seed.py              # Sample dataset loader
│   ├── requirements.txt     # Pinned Python dependencies
│   ├── .env.example         # Backend environment template
│   └── pytest.ini           # Pytest configuration
└── /frontend                # Frontend application (own git repository)
    ├── src/
    │   ├── api/             # API client & TanStack Query mutation/query hooks
    │   ├── components/      # UI components (dialogs, tables, cards, drawer, forms)
    │   ├── pages/           # Dashboard, TasksPage, MembersPage
    │   ├── lib/             # Helpers (cn, date formatting)
    │   └── types/           # TypeScript data interfaces
    ├── .env.example         # Frontend environment template
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.ts
```

---

## Prerequisites

Before starting, ensure you have the following installed on your machine:
- **Docker Desktop** (running)
- **Python 3.11+** (tested on Python 3.14.5)
- **Node.js v20+** (tested on Node v24.11.0 and npm 11.6.1)
- **PowerShell** (Windows) or bash (macOS/Linux)

---

## Environment Variables

### Backend (`backend/.env`)
Copy `backend/.env.example` to `backend/.env`:
```ini
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/taskmanagement
TEST_DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/taskmanagement_test
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000
ENVIRONMENT=development
```

### Frontend (`frontend/.env`)
Copy `frontend/.env.example` to `frontend/.env`:
```ini
VITE_API_URL=http://127.0.0.1:8000
```

---

## Step-by-Step Setup Guide

### 1. Start PostgreSQL
From the project root directory, start PostgreSQL using Docker Compose:
```powershell
docker compose up -d
```
Verify the container is healthy:
```powershell
docker ps
```

### 2. Setup Backend & Virtual Environment
Navigate to `/backend`, create a Python virtual environment, and install dependencies:
```powershell
cd "backend"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

### 3. Run Database Migrations
Apply Alembic migrations to create the schema (never bypass Alembic with `create_all` in production/dev):
```powershell
.\.venv\Scripts\alembic.exe upgrade head
```

### 4. Seed Sample Data
Load realistic sample members and tasks:
```powershell
python seed.py
```
*Note: Includes 4 team members and 8 realistic tasks (overdue tasks, past-due completed tasks, unassigned tasks, and future deliverables).*

### 5. Run Backend Tests
Execute the pytest suite (uses the isolated `taskmanagement_test` database):
```powershell
pytest -v
```
All 20 tests should pass.

### 6. Start the Backend API Server
Start the Uvicorn server:
```powershell
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- API Docs (Swagger UI): `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/health`

### 7. Setup & Run Frontend
In a separate terminal, navigate to `/frontend`:
```powershell
cd "frontend"
npm install
npm run dev
```
Open `http://127.0.0.1:5173` in your browser.

---

## Architecture Notes & Key Trade-offs

1. **Thin Routers & Service Layer Separation:**
   - Routers in `backend/app/routers/` handle HTTP deserialization, query parameters, status codes, and dependency injection (`get_db`).
   - Business rules, queries, and entity logic live entirely in `backend/app/services/` (`MemberService`, `TaskService`, `DashboardService`).
   - **Trade-off:** Adds an extra file layer per entity, but makes endpoint code readable, reusable, and straightforward to unit-test without running full HTTP stacks.

2. **Foreign Key `ON DELETE SET NULL` on `tasks.assignee_id`:**
   - When a team member is deleted, tasks assigned to them have `assignee_id` automatically set to `NULL` via the database foreign key constraint.
   - **Reasoning:** In a project tracking system, deleting a team member should never silently cascade-delete company tasks or project deliverables. Unassigned tasks can be picked up or reassigned by anyone on the team.

3. **Check Constraints vs. Native PostgreSQL Enums:**
   - Instead of PostgreSQL native types (`CREATE TYPE task_status ...`), standard `String(50)` columns with database `CheckConstraint("status IN ('To Do', 'In Progress', 'Done')")` and `CheckConstraint("priority IN ('Low', 'Medium', 'High')")` were used.
   - **Reasoning:** Native enum types in PostgreSQL lock tables during migrations when adding or reordering values and complicate Alembic autogenerate rollback scripts. CheckConstraints provide the exact same strict data integrity at the database layer while being effortless to alter in Alembic.

4. **Overdue Task Rule Definition:**
   - A task is overdue if and only if `due_date < today` **AND** `status != 'Done'`.
   - Completed tasks (`Done`) with past deadlines are **never marked overdue**.
   - Verified in backend SQL queries (`DashboardService`), Pydantic response models (`computed_field` in `TaskResponse`), frontend badge indicators, and automated pytest tests.

5. **Single-Query Dashboard Aggregation:**
   - `GET /dashboard` uses SQL `CASE` statements inside aggregate counts (`func.count(case(...))`) to calculate `total`, `todo`, `in_progress`, `done`, and `overdue` in a single SQL round-trip to PostgreSQL.

6. **Responsive UX: Desktop Table vs. Mobile Cards & Drawer:**
   - On desktop (>= 768px), tasks and members are laid out in clean tabular form with hover quick actions.
   - On mobile (< 768px down to 360px), tasks automatically render as cards with badges, meta icons, and a quick-status selector. Filter controls collapse into a mobile sheet/drawer with an active filter badge counter, eliminating horizontal scrolling.

7. **Four UI States Everywhere:**
   - Every view handles: **Loading** (pulse skeletons), **Empty** (contextual icon, explanation, and action button), **Error** (error card with retry button), and **Success** (toast alerts).

---

## Known Limitations & Future Improvements

1. **No Authentication / Multi-Tenancy:**
   - As specified in the assessment scope, authentication and user logins are out of scope. In a production enterprise system, JWT or session-based authentication with role-based access control (RBAC) would be implemented.
2. **Pagination for Very Large Datasets:**
   - Current endpoints return lists ordered by creation date. For teams with thousands of tasks, cursor-based or limit-offset pagination should be added.
3. **Real-time WebSockets / SSE:**
   - Dashboard counts and task updates currently refetch on mutation or manual refresh; WebSockets or Server-Sent Events could push live task updates to colleagues in real time.

---

## AI Usage Disclosure

- **Tool Used:** Google Gemini 3.8 Flash (High) via Antigravity Coding Agent.
- **Concrete Example of AI Assistance:**
  During Step 4/5 while running the pytest test suite, Pydantic's `email-validator` strictly rejected the test fixture email domain `sarah@skynet.local` because RFC 6762 classifies `.local` as a reserved multicast DNS (mDNS) domain. The agent diagnosed the root cause from the traceback, installed `email-validator` in `requirements.txt`, and updated the test suites and seed data to standard RFC-compliant domain names (`@koffiesoft.com`, `@example.com`), allowing all 20 tests to pass.
- Detailed step-by-step logs and decision history are documented in `AI_NOTES.md`.
