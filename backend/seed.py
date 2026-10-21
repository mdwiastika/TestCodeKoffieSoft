import os
import sys
from datetime import date, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.member import Member
from app.models.task import Task


def run_seed():
    db = SessionLocal()
    try:
        print("Cleaning up existing data for fresh seed...")
        db.query(Task).delete()
        db.query(Member).delete()
        db.commit()

        print("Seeding team members...")
        members_data = [
            ("Alice Walker", "alice@koffiesoft.com"),
            ("Bob Martin", "bob@koffiesoft.com"),
            ("Charlie Davis", "charlie@koffiesoft.com"),
            ("Diana Prince", "diana@koffiesoft.com"),
            ("Evan Wright", "evan@koffiesoft.com"),
            ("Fiona Gallagher", "fiona@koffiesoft.com"),
            ("George Clark", "george@koffiesoft.com"),
            ("Hannah Abbott", "hannah@koffiesoft.com"),
            ("Ian Malcolm", "ian@koffiesoft.com"),
            ("Julia Roberts", "julia@koffiesoft.com"),
            ("Kevin Bacon", "kevin@koffiesoft.com"),
            ("Laura Croft", "laura@koffiesoft.com"),
            ("Michael Scott", "michael@koffiesoft.com"),
            ("Nora Jones", "nora@koffiesoft.com"),
            ("Oscar Isaac", "oscar@koffiesoft.com"),
            ("Patricia Arquette", "patricia@koffiesoft.com"),
        ]

        members = []
        for name, email in members_data:
            m = Member(name=name, email=email)
            members.append(m)

        db.add_all(members)
        db.commit()

        for m in members:
            db.refresh(m)

        today = date.today()
        d_minus_14 = today - timedelta(days=14)
        d_minus_7 = today - timedelta(days=7)
        d_minus_3 = today - timedelta(days=3)
        d_minus_1 = today - timedelta(days=1)
        d_plus_1 = today + timedelta(days=1)
        d_plus_3 = today + timedelta(days=3)
        d_plus_7 = today + timedelta(days=7)
        d_plus_14 = today + timedelta(days=14)
        d_plus_30 = today + timedelta(days=30)

        tasks_data = [
            ("Fix critical memory leak in payment worker", "Investigate redis queue heap dumps under load", members[0].id, "In Progress", "High", d_minus_3),
            ("Resolve SSL certificate renewal on edge proxy", "Certbot failed auto-renewal due to dns-01 challenge timeout", members[1].id, "To Do", "High", d_minus_1),
            ("Audit legacy database slow queries", "Add compound index on tasks status and due_date", members[2].id, "To Do", "High", d_minus_7),
            ("Migrate auth session cookies to SameSite=Lax", "Cross-site request forgery prevention enhancement", members[3].id, "In Progress", "Medium", d_minus_14),
            ("Update privacy policy compliance banner", "Update footer links for upcoming GDPR audit", members[4].id, "To Do", "Low", d_minus_3),
            ("Export Q3 transactional accounting reports", "Generate CSV archives for external audit review", None, "To Do", "Medium", d_minus_7),
            ("Patch vulnerabilities in base docker images", "Update alpine and debian base images to latest LTS", None, "In Progress", "High", d_minus_1),
            ("Implement OAuth2 authentication flow", "Add GitHub and Google social login providers", members[0].id, "Done", "High", d_minus_7),
            ("Configure local Docker Compose for PostgreSQL", "Set up container service with healthchecks", members[1].id, "Done", "Medium", d_minus_14),
            ("Setup CI workflow with GitHub Actions", "Run linting and pytest test suites automatically", members[2].id, "Done", "High", d_minus_3),
            ("Refactor user settings modal to sheet component", "Improve usability on mobile screen viewports", members[5].id, "Done", "Low", d_minus_1),
            ("Implement mobile navigation drawer", "Responsive slide-out navigation sheet on smaller screens", members[6].id, "In Progress", "High", d_plus_1),
            ("Add pagination to tasks and members API", "Support limit and offset query params with metadata", members[7].id, "In Progress", "High", d_plus_3),
            ("Design sleek original brand logo and favicon", "Vector task mark with modern geometric style", members[8].id, "In Progress", "Medium", d_plus_1),
            ("Build dashboard needs attention section", "Highlight overdue and urgent schedule deliverables", members[9].id, "In Progress", "Medium", d_plus_3),
            ("Add dark mode color variables to Tailwind config", "Define HSL design tokens for theme switching", members[10].id, "To Do", "Low", d_plus_7),
            ("Write API schema documentation in OpenAPI format", "Review all endpoint query parameters and error codes", members[11].id, "To Do", "Medium", d_plus_7),
            ("Benchmark p95 latency on paginated queries", "Ensure response latency remains under 50ms", members[12].id, "To Do", "Medium", d_plus_14),
            ("Implement email notification on assignment", "Trigger background task when user is assigned to a task", members[13].id, "To Do", "Low", d_plus_14),
            ("Add keyboard navigation shortcuts for task dialog", "Support Cmd+Enter to submit and Esc to cancel", members[14].id, "To Do", "Low", d_plus_30),
            ("Integrate Sentry error tracking in frontend", "Capture uncaught React component exceptions", members[0].id, "To Do", "Medium", d_plus_30),
            ("Create onboarding tour for first-time teammates", "Interactive tooltip walkthrough for new members", members[1].id, "To Do", "Low", d_plus_30),
            ("Implement CSV bulk export for task list", "Allow users to download filtered task subsets", members[2].id, "To Do", "Medium", None),
            ("Add filter by date range selector", "Custom date interval picker for due date filtering", members[3].id, "To Do", "Low", None),
            ("Optimize bundle size with tree shaking", "Analyze webpack/vite chunks and remove unused icons", members[4].id, "To Do", "Low", None),
            ("Review accessibility contrast ratios across all badges", "WCAG 2.1 AA level compliance audit", members[5].id, "Done", "Medium", None),
            ("Sanitize user-provided HTML in description fields", "Ensure safe rendering and protect against XSS", members[6].id, "Done", "High", d_minus_7),
            ("Configure rate limiting middleware on API", "Limit requests per IP to protect against abuse", None, "To Do", "High", d_plus_1),
            ("Test database connection pool failover", "Simulate PostgreSQL restart under concurrent load", None, "To Do", "Medium", d_plus_7),
            ("Document local development setup in README", "Step-by-step instructions for clean machine runs", members[7].id, "Done", "Low", d_minus_3),
            ("Conduct code review on member deletion cascade", "Confirm ON DELETE SET NULL behavior on foreign keys", members[8].id, "Done", "High", d_minus_1),
            ("Validate email regex format in Pydantic schema", "Ensure compliance with RFC 5322 standard", members[9].id, "Done", "Medium", d_minus_14),
            ("Draft release notes for version 1.2.0", "Summarize changelog and breaking changes", members[10].id, "To Do", "Low", d_plus_14),
            ("Setup Prometheus metrics exporter for FastAPI", "Track request duration and status code distributions", members[11].id, "To Do", "Medium", d_plus_30),
            ("Implement task archive functionality", "Soft delete mechanism for completed quarterly tasks", members[12].id, "To Do", "Low", None),
            ("Verify responsiveness on iPad Mini viewport", "Check breakpoint behavior at 768px width", members[13].id, "In Progress", "Medium", d_plus_3),
            ("Add automated end-to-end smoke tests", "Playwright test suite for critical user journeys", members[14].id, "To Do", "Medium", d_plus_14),
            ("Optimize Docker multi-stage build caching", "Reduce CI build time by caching dependency layers", members[15].id, "Done", "Low", None),
        ]

        tasks = []
        for title, desc, assignee_id, status, priority, due_date in tasks_data:
            t = Task(
                title=title,
                description=desc,
                assignee_id=assignee_id,
                status=status,
                priority=priority,
                due_date=due_date,
            )
            tasks.append(t)

        db.add_all(tasks)
        db.commit()

        print(f"Successfully seeded {len(members)} members and {len(tasks)} tasks.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
