from datetime import date, datetime
from typing import Optional, Literal, List
from pydantic import BaseModel, Field, ConfigDict, computed_field
from app.schemas.member import MemberResponse

TaskStatusLiteral = Literal["To Do", "In Progress", "Done"]
TaskPriorityLiteral = Literal["Low", "Medium", "High"]


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Title of the task")
    description: Optional[str] = Field(None, description="Detailed description of the task")
    assignee_id: Optional[int] = Field(None, description="ID of the assigned team member")
    status: TaskStatusLiteral = Field(default="To Do", description="Current status of the task")
    priority: TaskPriorityLiteral = Field(default="Medium", description="Priority level of the task")
    due_date: Optional[date] = Field(None, description="Due date (YYYY-MM-DD)")


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255, description="Updated title")
    description: Optional[str] = Field(None, description="Updated description")
    assignee_id: Optional[int] = Field(None, description="Updated assignee ID (or None/null to unassign)")
    status: Optional[TaskStatusLiteral] = Field(None, description="Updated status")
    priority: Optional[TaskPriorityLiteral] = Field(None, description="Updated priority")
    due_date: Optional[date] = Field(None, description="Updated due date")


class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    assignee_id: Optional[int] = None
    status: str
    priority: str
    due_date: Optional[date] = None
    created_at: datetime
    assignee: Optional[MemberResponse] = None

    model_config = ConfigDict(from_attributes=True)

    @computed_field
    @property
    def is_overdue(self) -> bool:
        if not self.due_date:
            return False
        if self.status == "Done":
            return False
        return self.due_date < date.today()


class PaginatedTaskResponse(BaseModel):
    items: List[TaskResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
