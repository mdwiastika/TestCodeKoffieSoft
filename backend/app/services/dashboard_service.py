from datetime import date
from sqlalchemy import func, case, and_
from sqlalchemy.orm import Session
from app.models.task import Task
from app.schemas.dashboard import DashboardStatsResponse


class DashboardService:
    @staticmethod
    def get_stats(db: Session) -> DashboardStatsResponse:
        today = date.today()

        stats = (
            db.query(
                func.count(Task.id).label("total"),
                func.count(
                    case((Task.status == "To Do", Task.id), else_=None)
                ).label("todo"),
                func.count(
                    case((Task.status == "In Progress", Task.id), else_=None)
                ).label("in_progress"),
                func.count(
                    case((Task.status == "Done", Task.id), else_=None)
                ).label("done"),
                func.count(
                    case(
                        (
                            and_(Task.due_date < today, Task.status != "Done"),
                            Task.id,
                        ),
                        else_=None,
                    )
                ).label("overdue"),
            )
            .first()
        )

        return DashboardStatsResponse(
            total=stats.total or 0,
            todo=stats.todo or 0,
            in_progress=stats.in_progress or 0,
            done=stats.done or 0,
            overdue=stats.overdue or 0,
        )
