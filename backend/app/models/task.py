import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Date,
    DateTime,
    ForeignKey,
    CheckConstraint,
)
from sqlalchemy.orm import relationship
from app.database import Base


class TaskStatus(str, enum.Enum):
    TODO = "To Do"
    IN_PROGRESS = "In Progress"
    DONE = "Done"


class TaskPriority(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class Task(Base):
    __tablename__ = "tasks"
    __table_args__ = (
        CheckConstraint(
            "status IN ('To Do', 'In Progress', 'Done')",
            name="check_task_status",
        ),
        CheckConstraint(
            "priority IN ('Low', 'Medium', 'High')",
            name="check_task_priority",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    assignee_id = Column(
        Integer,
        ForeignKey("team_members.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    status = Column(
        String(50),
        nullable=False,
        default=TaskStatus.TODO.value,
        index=True,
    )
    priority = Column(
        String(50),
        nullable=False,
        default=TaskPriority.MEDIUM.value,
    )
    due_date = Column(Date, nullable=True, index=True)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    assignee = relationship("Member", back_populates="tasks")

    def __repr__(self) -> str:
        return f"<Task(id={self.id}, title='{self.title}', status='{self.status}', priority='{self.priority}')>"
