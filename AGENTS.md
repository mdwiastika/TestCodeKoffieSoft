# AGENTS.md — Project Instructions for the AI Coding Agent

Read this file fully before doing anything. Follow it for the whole project.

## 1. Project goal

Build a **Task Management web application for a small team** (take-home technical assessment).
Priorities, in order: **works correctly > easy to run and understand > good UI/UX > extras.**
A small, reliable, well-documented app beats a large one that is hard to run or explain.

The developer must be able to **explain every part of the code** in a follow-up interview.
So: keep the code simple, readable, and explain non-obvious decisions briefly as you go.

## 2. Scope

### Must have
- **Team members:** create, list, update. Required: `name`, `email` (unique, valid format).
- **Tasks:** create, list, view, update, delete.
  - `title` (required), `description` (optional)
  - `assignee_id` (optional, FK to team member)
  - `status`: `To Do` | `In Progress` | `Done`
  - `priority`: `Low` | `Medium` | `High`
  - `due_date` (optional), `created_at` (set by server)
- **Dashboard:** total tasks, counts per status, overdue tasks
  (overdue = `due_date < today` AND `status != Done`).
- **Search and filter:** search by title; filter by status, priority, assignee.
  Must be usable on small screens.

### Out of scope (do NOT build unless asked)
- Authentication / login / roles.
- Real-time features, notifications, file uploads, drag-and-drop boards.
- Deployment. (Optional; do not spend time on it.)

## 3. Tech stack (do not swap without asking)

**Backend:** Python 3.11+, FastAPI, SQLAlchemy 2.0 (ORM), Alembic (migrations),
Pydantic v2, PostgreSQL, pytest, uvicorn.
**Frontend:** React + Vite + TypeScript, Tailwind CSS, shadcn/ui components,
TanStack Query (data fetching), React Hook Form + Zod (forms), lucide-react (icons).
**Infra:** docker-compose for PostgreSQL only; `.env` for configuration.

Do not add libraries that are not needed. Ask before adding a new dependency.

## 4. Repository structure

```
/backend
  /app
    main.py            # FastAPI app, CORS, router registration
    config.py          # settings from environment
    database.py        # engine, session, Base
    models/            # SQLAlchemy models
    schemas/           # Pydantic schemas (request/response)
    routers/           # members.py, tasks.py, dashboard.py
    services/          # business logic (keep routers thin)
  /alembic             # migrations
  /tests
  seed.py              # sample data
  requirements.txt
  .env.example
/frontend
  /src
    /api               # API client + TanStack Query hooks
    /components        # reusable UI pieces
    /pages             # Dashboard, Tasks, Members
    /lib
  .env.example
docker-compose.yml
README.md
AI_NOTES.md
AGENTS.md
```

## 5. Backend rules

- Routers are thin; put logic in `services/`. Use dependency injection for the DB session.
- **Database constraints:** NOT NULL on required fields, UNIQUE on `team_members.email`,
  FK `tasks.assignee_id -> team_members.id`, status/priority restricted by enum or CHECK,
  indexes on `tasks.status`, `tasks.assignee_id`, `tasks.due_date`.
- Deleting a member who has tasks: set the tasks' `assignee_id` to NULL
  (`ON DELETE SET NULL`). Document this in the README.
- **Validation:** Pydantic schemas with clear error messages.
- **Status codes:** 200 OK, 201 Created, 204 No Content (delete), 404 Not Found,
  409 Conflict (duplicate email), 422 Validation error. Never return 500 for user mistakes.
- **Consistent error shape** for all errors, for example:
  `{"detail": "Human readable message"}`.
- **Endpoints (REST):**
  - `GET/POST /members`, `GET/PATCH/DELETE /members/{id}`
  - `GET/POST /tasks`, `GET/PATCH/DELETE /tasks/{id}`
  - `GET /tasks?search=&status=&priority=&assignee_id=` (filters are combinable)
  - `GET /dashboard` -> `{total, todo, in_progress, done, overdue}`
- Use timezone-aware datetimes for `created_at`.
- Schema is created ONLY through Alembic migrations (`alembic upgrade head`).
  Never use `Base.metadata.create_all()` as the setup path.
- Provide `seed.py` that loads sample members and tasks (include overdue and unassigned cases).

## 6. Frontend rules

**Design direction:** clean, modern, calm, and consistent. Prioritize clarity over decoration.
- One consistent design system: spacing scale, one primary color, neutral grays,
  consistent border radius and typography. Use shadcn/ui components rather than custom ones.
- **Dashboard:** summary cards (Total, To Do, In Progress, Done, Overdue) with clear numbers;
  overdue card visually distinct (e.g. red accent).
- **Task list:** table on desktop, **card list on mobile**. Show title, assignee, status badge,
  priority badge, due date. Overdue tasks clearly marked (not by color alone: add text/icon).
- **Filter bar:** search box + selects (status, priority, assignee) + "Clear filters".
  On small screens collapse filters into a sheet/drawer.
- **Forms:** in a dialog or side sheet; inline validation messages; disabled submit while saving.
- **Every data view handles four states:** loading (skeletons), empty (helpful message + action),
  error (message + retry), success (toast).
- Confirm before destructive actions (delete).
- Accessibility basics: labels on inputs, visible focus states, sufficient contrast,
  keyboard-usable dialogs, semantic HTML.
- Responsive from 360px width up. No horizontal page scroll.
- API base URL comes from `VITE_API_URL`. No hardcoded URLs.
- Keep components small and separated by responsibility (UI vs data fetching vs types).

## 6b. Design skills (if installed)

If a design skill (for example `design-taste-frontend`) is available in `.agents/skills/`
or `.agent/skills/`, read it before building the frontend and use it for visual quality.

**Precedence:** if a design skill conflicts with this file, THIS FILE wins.
- Keep the UI calm, simple, and consistent. No heavy animations, parallax, or visual effects.
- Do not add new dependencies just because a skill suggests them (animation libraries,
  extra UI kits, icon packs). Reuse shadcn/ui, Tailwind, and lucide-react.
- Readability, accessibility, and responsiveness come before visual flair.
- If a reference image is provided, follow its layout, spacing, and tone.
- Verify the result in the browser at 360px, 768px, and 1280px widths and fix any problems.

## 7. How you must work

1. **Work in small steps**, in this order: database models + migration -> API -> tests ->
   frontend -> README/docs. After each step, summarize what you did and stop for review.
2. **Do not overbuild.** If something is not in the scope above, ask first.
3. If a requirement is ambiguous, **ask a short question** instead of guessing.
4. **Run things before saying "done":** migrations, the server, the tests, and the frontend build.
   Report the real result, including failures. Never claim something works without running it.
5. Never commit secrets. Provide `.env.example` files only.
6. Write clear commit-sized changes; keep code formatted and typed.
7. When you make a non-obvious design decision, add a one or two line comment or note why.
8. Maintain `AI_NOTES.md`: after each step, append what you did, what you were unsure about,
   and any bug you found and fixed. This is used for the AI-usage disclosure.

## 8. Tests (keep small but useful)

Backend pytest covering at least: create/update/delete task, member email uniqueness (409),
validation errors (422), filtering and search, and dashboard counts including the overdue rule
(Done tasks are never overdue). Use a separate test database or transaction rollback.

## 9. README requirements (keep it honest)

Prerequisites, environment variables, how to start PostgreSQL (docker compose),
how to run migrations, how to seed data, how to run backend and frontend, how to run tests,
architecture notes and trade-offs, known limitations, AI tools used with one concrete example.
If a feature is incomplete, say so plainly and state what would be done next.

## 10. Definition of done

- Fresh clone + README steps = app runs with seeded data on a clean machine.
- All core workflows work end to end in the browser.
- Tests pass. No console errors in the browser.
- UI works at mobile width and desktop width.
- README and AI_NOTES.md are complete and accurate.
