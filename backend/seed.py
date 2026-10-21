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
        alice = Member(name="Alice Walker", email="alice@koffiesoft.com")
        bob = Member(name="Bob Martin", email="bob@koffiesoft.com")
        charlie = Member(name="Charlie Davis", email="charlie@koffiesoft.com")
        diana = Member(name="Diana Prince", email="diana@koffiesoft.com")

        db.add_all([alice, bob, charlie, diana])
        db.commit()

        db.refresh(alice)
        db.refresh(bob)
        db.refresh(charlie)
        db.refresh(diana)

        today = date.today()
        yesterday = today - timedelta(days=2)
        last_week = today - timedelta(days=7)
        next_week = today + timedelta(days=5)
        next_month = today + timedelta(days=20)

        print("Seeding tasks...")
        tasks = [
            Task(
                title="Migrate customer auth to OAuth2 provider",
                description="Refactor legacy authentication layer to standard OAuth2 flow.",
                assignee_id=alice.id,
                status="In Progress",
                priority="High",
                due_date=yesterday,
            ),
            Task(
                title="Audit database slow queries and add missing indexes",
                description="Investigate p99 latency spikes on reports queries and index appropriate foreign keys.",
                assignee_id=bob.id,
                status="To Do",
                priority="Medium",
                due_date=last_week,
            ),
            Task(
                title="Setup automated staging deployment pipeline",
                description="Configure GitHub Actions workflow for staging builds on pull request merge.",
                assignee_id=alice.id,
                status="Done",
                priority="High",
                due_date=last_week,
            ),
            Task(
                title="Design mobile filter drawer component",
                description="Implement clean slide-over drawer for task filters on screens under 768px width.",
                assignee_id=charlie.id,
                status="In Progress",
                priority="Medium",
                due_date=next_week,
            ),
            Task(
                title="Draft API documentation and OpenAPI spec",
                description="Review all FastAPI endpoints and verify auto-generated OpenAPI schemas.",
                assignee_id=diana.id,
                status="To Do",
                priority="Low",
                due_date=next_month,
            ),
            Task(
                title="Fix Safari date-picker styling glitch",
                description="Input date control overflows container in WebKit based browsers.",
                assignee_id=None,
                status="To Do",
                priority="High",
                due_date=next_week,
            ),
            Task(
                title="Archive legacy 2025 analytics records",
                description="Export pre-2026 usage analytics to cold storage volume.",
                assignee_id=None,
                status="To Do",
                priority="Low",
                due_date=yesterday,
            ),
            Task(
                title="Configure Docker Compose for local PostgreSQL",
                description="Set up postgres:16-alpine container with healthcheck.",
                assignee_id=bob.id,
                status="Done",
                priority="Medium",
                due_date=None,
            ),
        ]

        db.add_all(tasks)
        db.commit()

        print(f"Successfully seeded {len([alice, bob, charlie, diana])} members and {len(tasks)} tasks.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
