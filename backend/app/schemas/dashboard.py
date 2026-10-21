from typing import List
from pydantic import BaseModel, Field
from app.schemas.task import TaskResponse


class DashboardStatsResponse(BaseModel):
    total: int = Field(..., description="Total number of tasks")
    todo: int = Field(..., description="Tasks in 'To Do' status")
    in_progress: int = Field(..., description="Tasks in 'In Progress' status")
    done: int = Field(..., description="Tasks in 'Done' status")
    overdue: int = Field(
        ...,
        description="Tasks where due_date < today and status != 'Done'",
    )
    needs_attention: List[TaskResponse] = Field(
        default_factory=list,
        description="Up to 5 tasks requiring attention: overdue first, then due soonest",
    )
