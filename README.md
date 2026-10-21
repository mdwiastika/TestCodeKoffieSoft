# KoffieSoft Task Management Web Application

A full-stack task management application designed for small teams, built as a technical assessment.

Prioritizes correctness, simplicity, maintainability, calm and accessible UI/UX, responsive mobile-first design, and transparent documentation.

---

## Tech Stack

- **Backend:** Python 3.11+ (verified on 3.14.5), FastAPI, SQLAlchemy 2.0 (ORM), Alembic (database migrations), Pydantic v2 + `pydantic-settings`, PostgreSQL (via `psycopg` v3 binary driver), pytest, Uvicorn.
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Plus Jakarta Sans typography, shadcn/ui inspired primitives, TanStack Query v5, React Hook Form + Zod v3, Lucide React icons.
- **Infrastructure:** Docker Compose (PostgreSQL 16 Alpine).

---

## Project Structure & Git Repository

The project is structured as a **single unified Git repository** at the root with Conventional Commits scoped by feature (`feat(members)`, `feat(tasks)`, `feat(search)`, `feat(dashboard)`, `feat(branding)`, `fix(...)`, `chore(...)`).

```text
.
├── docker-compose.yml       # PostgreSQL 16 container definition
├── README.md                # Main documentation (this file)
├── AI_NOTES.md              # AI development trajectory & disclosure notes
├── AGENTS.md                # Project instructions & assessment guidelines
├── /backend                 # FastAPI backend service
│   ├── app/
│   │   ├── main.py          # FastAPI app, CORS, router registrations
│   │   ├── config.py        # Settings loaded via pydantic-settings
│   │   ├── database.py      # Engine, sessionmaker, Base, get_db dependency
│   │   ├── models/          # SQLAlchemy 2.0 models (Member, Task)
│   │   ├── schemas/         # Pydantic v2 schemas (requests, responses, pagination)
│   │   ├── routers/         # REST routers (members.py, tasks.py, dashboard.py)
│   │   └── services/        # Business logic & queries (keeps routers thin)
│   ├── alembic/             # Database schema migrations
│   ├── tests/               # Pytest suite (26 tests covering CRUD, pagination, 404, 409, 422, overdue rules)
│   ├── seed.py              # Sample dataset loader (15 members, 35+ tasks)
│   ├── requirements.txt     # Pinned Python dependencies
│   ├── .env.example         # Backend environment template
│   └── pytest.ini           # Pytest configuration
└── /frontend                # React + Vite + TypeScript frontend
    ├── src/
    │   ├── api/             # API client & TanStack Query mutation/query hooks
    │   ├── components/      # UI components (Logo, layout, dialogs, tables, cards, drawer, forms)
    │   ├── pages/           # Dashboard, TasksPage, MembersPage
    │   ├── lib/             # Helpers (cn, date formatting)
    │   └── types/           # TypeScript data interfaces & filter types
    ├── .env.example         # Frontend environment template
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.ts
```

---

## Key Features & Highlights

1. **Team Member Management (`/members`):**
   - Create, list, edit, and delete team members.
   - Strict email uniqueness validation (409 Conflict) and RFC-compliant format verification.
   - Deleting a member safely unassigns their tasks via database-level `ON DELETE SET NULL`.
   - Dedicated un-paginated `GET /members/options` endpoint to reliably populate assignee dropdowns and filter selectors.

2. **Task Management (`/tasks`):**
   - Full CRUD: Title, description, assignee, status (`To Do`, `In Progress`, `Done`), priority (`Low`, `Medium`, `High`), due date, and server-generated timestamps.
   - Quick status transition dropdowns directly on task lists and table rows.
   - Distinct visual overdue indicators (badge with warning icon and alert styling).

3. **Pagination & Deterministic Sorting (Backend + Frontend):**
   - Backend `page` (default 1) and `page_size` (default 10, max 100) query parameters with validation (422 on invalid input).
   - Standardized pagination response: `{"items": [...], "total": int, "page": int, "page_size": int, "total_pages": int}`.
   - Deterministic sorting: Tasks ordered by `created_at desc, id desc`; Members ordered by `name asc, id asc`.
   - Frontend pagination controls: previous/next buttons, page indicators, and total count display. Automatically resets to page 1 on filter or search changes, and preserves filter state across page navigation.
   - Full synchronization with browser URL query strings (`?page=`, `?search=`, `?status=`, `?is_overdue=`, etc.) for seamless refresh and shareable URLs.

4. **Search & Combinable Filtering:**
   - Case-insensitive title search combined seamlessly with status, priority, assignee, and overdue filters.
   - Active filter counter and instant "Clear filters" action.
   - Direct filter pills showing active criteria (such as *Filtered by: Overdue tasks only*).

5. **Mobile-First Dashboard Overview (`/dashboard`):**
   - High-level executive overview, eliminating dense cluttered data tables.
   - 5 KPI summary cards: Total, To Do, In Progress, Done, and Overdue (highlighted with distinctive red styling and icon).
   - **Interactive Overdue Card:** Clicking the Overdue card automatically navigates to `/tasks?is_overdue=true`, displaying exclusively overdue tasks with an active filter pill.
   - **Needs Attention Section:** Displays at most 5 actionable tasks prioritized strictly as overdue items first, followed by tasks due soonest. Includes a calm empty state when all deliverables are on schedule.
   - Overall team completion progress bar (Done vs Total).

6. **Responsive UI & Mobile Navigation:**
   - Desktop view (≥ 768px): Structured tables with quick hover actions, inline filter bars, and horizontal navigation bar.
   - Mobile view (< 768px down to 360px): Compact task cards, slide-over filter sheet/drawer, and mobile hamburger drawer rendered in a portal overlay to prevent visual glitches or background bleeding.
   - Custom original brand identity (`<Logo />` mark + wordmark) and typography powered by **Plus Jakarta Sans**.

---

## Prerequisites

Before running the application, ensure you have the following installed:
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
From the project root directory, launch the PostgreSQL container using Docker Compose:
```powershell
docker compose up -d
```
Verify the container is healthy:
```powershell
docker ps
```

### 2. Setup Backend & Virtual Environment
Navigate to `/backend`, initialize the virtual environment, and install pinned dependencies:
```powershell
cd "backend"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

### 3. Run Database Migrations
Execute Alembic migrations to build the schema:
```powershell
.\.venv\Scripts\alembic.exe upgrade head
```
*(Schema creation strictly relies on migrations; `Base.metadata.create_all()` is never used in setup).*

### 4. Seed Sample Data
Load realistic sample members and tasks:
```powershell
python seed.py
```
*Note: Generates 15 realistic team members and 35+ diverse tasks (overdue items, past-due completed tasks, unassigned tasks, and upcoming deliverables) specifically designed to exercise multi-page pagination.*

### 5. Run Backend Tests
Execute the pytest suite (runs against the isolated `taskmanagement_test` database):
```powershell
pytest -v
```
All **26 tests** will pass:
- Member CRUD, email uniqueness (409), validation errors (422), options list, and pagination.
- Task CRUD, defaults, invalid status/priority (422), unassigning, and deletion.
- Deterministic pagination ordering, out-of-range pages, and query parameter constraints.
- Combinable filters (search, status, priority, assignee, and overdue).
- Dashboard KPI counts, overdue exclusion for Done tasks, and "Needs attention" prioritization.

### 6. Start the Backend API Server
Start the Uvicorn server:
```powershell
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- Interactive Swagger UI: `http://127.0.0.1:8000/docs`
- Health check endpoint: `http://127.0.0.1:8000/health`

### 7. Setup & Run Frontend
In a separate terminal, navigate to `/frontend`:
```powershell
cd "frontend"
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Architecture Notes & Key Trade-offs

1. **Thin Routers & Service Layer Separation:**
   - Routers in `backend/app/routers/` handle HTTP deserialization, query parameters, status codes, and dependency injection (`get_db`).
   - Business rules, queries, and entity logic live entirely in `backend/app/services/` (`MemberService`, `TaskService`, `DashboardService`).
   - **Trade-off:** Adds an extra file layer per entity, but makes endpoint code readable, reusable, and straightforward to unit-test without running full HTTP stacks.

2. **Foreign Key `ON DELETE SET NULL` on `tasks.assignee_id`:**
   - When a team member is deleted, tasks assigned to them have `assignee_id` automatically set to `NULL` via the database foreign key constraint.
   - **Reasoning:** In a project tracking system, deleting a team member should never silently cascade-delete company tasks or project deliverables. Unassigned tasks remain preserved and can be picked up or reassigned by anyone on the team.

3. **Check Constraints vs. Native PostgreSQL Enums:**
   - Instead of PostgreSQL native types (`CREATE TYPE task_status ...`), standard `String(50)` columns with database `CheckConstraint("status IN ('To Do', 'In Progress', 'Done')")` and `CheckConstraint("priority IN ('Low', 'Medium', 'High')")` were used.
   - **Reasoning:** Native enum types in PostgreSQL lock tables during migrations when adding or reordering values and complicate Alembic autogenerate rollback scripts. CheckConstraints provide the exact same strict data integrity at the database layer while being effortless to alter in Alembic.

4. **Overdue Task Rule Definition:**
   - A task is overdue if and only if `due_date < today` **AND** `status != 'Done'`.
   - Completed tasks (`Done`) with past deadlines are **never marked overdue**.
   - Verified in backend SQL queries (`DashboardService`, `TaskService`), Pydantic response models (`computed_field` in `TaskResponse`), frontend badge indicators, and automated pytest tests.

5. **Single-Query Dashboard Aggregation & Needs Attention Filtering:**
   - `GET /dashboard` uses SQL `CASE` statements inside aggregate counts (`func.count(case(...))`) to calculate `total`, `todo`, `in_progress`, `done`, and `overdue` in a single SQL round-trip to PostgreSQL.
   - The "Needs attention" list is queried using a dedicated SQL query limited to 5 records sorted by overdue priority and nearest due date, preventing the dashboard from fetching excessive unneeded task rows.

6. **Responsive UX: Desktop Table vs. Mobile Cards & Drawer:**
   - On desktop (≥ 768px), tasks and members are laid out in clean tabular form with hover quick actions.
   - On mobile (< 768px down to 360px), tasks automatically render as cards with badges, meta icons, and a quick-status selector. Filter controls collapse into a mobile sheet/drawer with an active filter badge counter, eliminating horizontal scrolling.

7. **Four UI States Everywhere:**
   - Every view handles: **Loading** (pulse skeletons), **Empty** (contextual icon, explanation, and action button), **Error** (error card with retry button), and **Success** (toast alerts).

---

## Known Limitations & Future Roadmap

1. **No Authentication / Multi-Tenancy:**
   - As specified in the assessment scope, authentication and user logins are intentionally omitted. In an enterprise production system, JWT or session-based authentication with role-based access control (RBAC) would be implemented.
2. **Real-time WebSockets / SSE:**
   - Dashboard counts and task updates currently refetch on mutation or manual refresh; WebSockets or Server-Sent Events could push live task updates to colleagues in real time.
3. **Bulk Operations:**
   - Bulk status changes or multi-select reassignments for rapid team triage could be added as the team scales.

---

## AI Usage Disclosure

- **Tool Used:** Google Gemini 3.8 Flash (High) via Antigravity Coding Agent.
- **Concrete Example of AI Assistance:**
  During implementation of the overdue task drill-down from the Dashboard, the agent identified that the Overdue summary card previously navigated to `/tasks` without applying query filters. The agent systematically updated the backend service and router to accept `is_overdue: Optional[bool]`, added comprehensive pytest test coverage (`test_tasks_filter_overdue`), updated the frontend URL routing (`/tasks?is_overdue=true`), and created a visual filter pill with quick reset functionality.
- Detailed step-by-step logs and decision history are documented in [`AI_NOTES.md`](AI_NOTES.md).
