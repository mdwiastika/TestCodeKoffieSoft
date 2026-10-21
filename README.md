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

The project is a **single Git repository** (monorepo) at the root, with Conventional Commits scoped by feature (`feat(members)`, `feat(tasks)`, `feat(search)`, `feat(dashboard)`, `feat(branding)`, `fix(...)`, `chore(...)`).

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
   - Deterministic sorting: tasks ordered by `created_at desc, id desc`; members ordered by `name asc, id asc`.
   - Frontend pagination controls: previous/next buttons, page indicators, and total count display. Automatically resets to page 1 on filter or search changes.
   - Page, search, and filters are synchronized with the browser URL query string (`?page=`, `?search=`, `?status=`, `?is_overdue=`, etc.) so refresh and shared URLs keep the same view.

4. **Search & Combinable Filtering:**
   - Case-insensitive title search combined with status, priority, assignee, and overdue filters.
   - Active filter counter and instant "Clear filters" action.
   - Filter pills showing active criteria (such as *Filtered by: Overdue tasks only*).

5. **Mobile-First Dashboard Overview (`/dashboard`):**
   - High-level overview without dense data tables.
   - 5 KPI summary cards: Total, To Do, In Progress, Done, and Overdue (highlighted with a distinct red style and icon).
   - **Interactive Overdue Card:** clicking it navigates to `/tasks?is_overdue=true`, showing only overdue tasks with an active filter pill.
   - **Needs Attention Section:** at most 5 tasks, overdue first, then soonest due date. Shows a calm empty state when everything is on schedule.
   - Overall completion progress bar (Done vs Total).

6. **Responsive UI & Mobile Navigation:**
   - Desktop (≥ 768px): structured tables with hover quick actions, inline filter bars, and a horizontal navigation bar.
   - Mobile (< 768px down to 360px): compact task cards, slide-over filter drawer, and a hamburger menu that opens a navigation drawer.
   - Original brand identity (`<Logo />` mark + wordmark) and Plus Jakarta Sans typography.

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
```ini
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/taskmanagement
TEST_DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/taskmanagement_test
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000
ENVIRONMENT=development
```

### Frontend (`frontend/.env`)
```ini
VITE_API_URL=http://127.0.0.1:8000
```

Both files are created from the `.env.example` templates in the setup steps below.

---

## Step-by-Step Setup Guide

Commands are shown for PowerShell (Windows). macOS/Linux equivalents are noted where they differ.

### 1. Create the environment files
From the project root:
```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
```
macOS/Linux: `cp backend/.env.example backend/.env && cp frontend/.env.example frontend/.env`

### 2. Start PostgreSQL
From the project root:
```powershell
docker compose up -d
docker ps
```
Verify the container is running and healthy.

### 3. Create the test database
Tests run against a separate database (`taskmanagement_test`) so your development data is never touched. Create it once:
```powershell
docker compose exec db psql -U postgres -c "CREATE DATABASE taskmanagement_test;"
```
If it already exists, the "already exists" message can be ignored.

### 4. Set up the backend
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```
macOS/Linux: activate with `source .venv/bin/activate`.

### 5. Run database migrations
```powershell
alembic upgrade head
```
Schema creation relies strictly on migrations; `Base.metadata.create_all()` is never used.

### 6. Seed sample data
```powershell
python seed.py
```
Generates 15 team members and 35+ tasks (overdue items, past-due completed tasks, unassigned tasks, and upcoming deliverables), enough to exercise multi-page pagination.

### 7. Run backend tests
```powershell
pytest -v
```
All **26 tests** should pass:
- Member CRUD, email uniqueness (409), validation errors (422), options list, and pagination.
- Task CRUD, defaults, invalid status/priority (422), unassigning, and deletion.
- Deterministic pagination ordering, out-of-range pages, and query parameter constraints.
- Combinable filters (search, status, priority, assignee, and overdue).
- Dashboard KPI counts, overdue exclusion for Done tasks, and "Needs attention" prioritization.

### 8. Start the backend API server
```powershell
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- Interactive Swagger UI: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/health`

### 9. Set up and run the frontend
In a separate terminal, from the project root:
```powershell
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| GET / POST | `/members` | List (paginated) / create members |
| GET | `/members/options` | All members as `{id, name}`, not paginated |
| GET / PATCH / DELETE | `/members/{id}` | Read / update / delete a member |
| GET / POST | `/tasks` | List (paginated, filterable) / create tasks |
| GET / PATCH / DELETE | `/tasks/{id}` | Read / update / delete a task |
| GET | `/dashboard` | KPI counts and "needs attention" tasks |

`GET /tasks` query parameters: `page`, `page_size`, `search`, `status`, `priority`, `assignee_id`, `is_overdue`.

Errors use a consistent shape (`{"detail": "..."}`) with appropriate status codes: 201 on create, 204 on delete, 404 not found, 409 duplicate email, 422 validation error.

---

## Architecture Notes & Key Trade-offs

1. **Thin Routers & Service Layer Separation:**
   - Routers in `backend/app/routers/` handle HTTP deserialization, query parameters, status codes, and dependency injection (`get_db`).
   - Business rules, queries, and entity logic live in `backend/app/services/` (`MemberService`, `TaskService`, `DashboardService`).
   - **Trade-off:** adds an extra file layer per entity, but keeps endpoint code readable, reusable, and easy to test.

2. **Foreign Key `ON DELETE SET NULL` on `tasks.assignee_id`:**
   - When a team member is deleted, their tasks keep existing and become unassigned.
   - **Reasoning:** deleting a team member should never silently delete project work. Unassigned tasks can be picked up and reassigned.

3. **Check Constraints vs. Native PostgreSQL Enums:**
   - `String(50)` columns with `CheckConstraint("status IN ('To Do', 'In Progress', 'Done')")` and `CheckConstraint("priority IN ('Low', 'Medium', 'High')")` are used instead of native `CREATE TYPE` enums.
   - **Reasoning:** native enums are harder to alter in migrations (adding or reordering values) and complicate Alembic rollbacks. Check constraints give the same data integrity at the database layer and are easy to change.

4. **Overdue Task Rule:**
   - A task is overdue if and only if `due_date < today` **AND** `status != 'Done'`.
   - Completed tasks with past deadlines are never overdue.
   - Applied consistently in backend queries (`DashboardService`, `TaskService`), the `TaskResponse` computed field, frontend badges, and pytest tests.

5. **Single-Query Dashboard Aggregation:**
   - `GET /dashboard` uses SQL `CASE` inside aggregate counts (`func.count(case(...))`) to compute `total`, `todo`, `in_progress`, `done`, and `overdue` in one round-trip.
   - The "Needs attention" list is a dedicated query limited to 5 rows, sorted by overdue first and then nearest due date, so the dashboard never loads the full task list.

6. **Offset Pagination with Deterministic Ordering:**
   - Lists use `LIMIT/OFFSET` with a stable `ORDER BY` (including `id` as a tie-breaker), so rows do not shift or repeat between pages.
   - **Trade-off:** simple and sufficient for a small team. For very large datasets, cursor-based pagination would avoid slow large offsets.
   - Dropdowns that need every member use `GET /members/options`, so they are never truncated by pagination.

7. **Responsive UX:**
   - Desktop uses tables; mobile uses cards, a filter drawer, and a hamburger navigation drawer, avoiding horizontal scrolling down to 360px.

8. **Four UI States Everywhere:**
   - Every view handles **Loading** (skeletons), **Empty** (explanation and action), **Error** (message with retry), and **Success** (toast).

---

## Known Limitations & Future Roadmap

1. **No Authentication / Multi-Tenancy:**
   - Intentionally omitted per the assessment scope. A production system would add JWT or session-based authentication with role-based access control.
2. **No Automated Frontend Tests:**
   - The backend has an automated test suite; the frontend flows were verified manually (create, edit, delete, assign, search, filter, pagination, dashboard) at 360px, 768px, and 1280px widths. Component and end-to-end tests would be the next step.
3. **No Real-Time Updates:**
   - Lists and dashboard counts refetch after mutations or on manual refresh. WebSockets or Server-Sent Events could push live updates to teammates.
4. **Offset Pagination:**
   - See architecture note 6; cursor-based pagination would be the upgrade path for very large datasets.
5. **Bulk Operations:**
   - Bulk status changes or multi-select reassignment could be added as the team grows.

---

## AI Usage Disclosure

- **Tools used:**
  - **Antigravity** coding agent (model: `<exact model name shown in Antigravity>`) for implementation.
  - **Claude** (Anthropic) for planning, writing agent prompts, and reviewing this documentation.
  - **`<design skill name>`**, an installed agent skill, for frontend visual guidance.
- **Concrete example of AI assistance:**
  While building the Overdue drill-down from the dashboard, the agent noticed that the Overdue summary card navigated to `/tasks` without applying a filter. It added an `is_overdue: Optional[bool]` filter to the backend service and router, added a pytest test (`test_tasks_filter_overdue`), updated the frontend routing to `/tasks?is_overdue=true`, and added a filter pill with a quick reset.
- **Verification:** all generated code was reviewed, the backend test suite was run, and the main flows were tested manually on mobile and desktop widths. I can explain the architecture and the decisions above.
- Step-by-step logs and decision history are in [`AI_NOTES.md`](AI_NOTES.md).