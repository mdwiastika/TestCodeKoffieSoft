from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.models.task import Task
from app.models.member import Member
from app.schemas.task import TaskCreate, TaskUpdate


class TaskService:
    @staticmethod
    def get_all(
        db: Session,
        search: Optional[str] = None,
        task_status: Optional[str] = None,
        priority: Optional[str] = None,
        assignee_id: Optional[int] = None,
    ) -> List[Task]:
        query = db.query(Task).options(joinedload(Task.assignee))

        if search and search.strip():
            query = query.filter(Task.title.ilike(f"%{search.strip()}%"))

        if task_status and task_status.strip():
            query = query.filter(Task.status == task_status.strip())

        if priority and priority.strip():
            query = query.filter(Task.priority == priority.strip())

        if assignee_id is not None:
            query = query.filter(Task.assignee_id == assignee_id)

        return query.order_by(Task.created_at.desc()).all()

    @staticmethod
    def get_by_id(db: Session, task_id: int) -> Task:
        task = (
            db.query(Task)
            .options(joinedload(Task.assignee))
            .filter(Task.id == task_id)
            .first()
        )
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Task with ID {task_id} not found",
            )
        return task

    @staticmethod
    def create(db: Session, task_in: TaskCreate) -> Task:
        if task_in.assignee_id is not None:
            member = (
                db.query(Member).filter(Member.id == task_in.assignee_id).first()
            )
            if not member:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Assigned team member with ID {task_in.assignee_id} not found",
                )

        new_task = Task(
            title=task_in.title.strip(),
            description=task_in.description.strip() if task_in.description else None,
            assignee_id=task_in.assignee_id,
            status=task_in.status,
            priority=task_in.priority,
            due_date=task_in.due_date,
        )
        db.add(new_task)
        db.commit()
        db.refresh(new_task)
        return TaskService.get_by_id(db, new_task.id)

    @staticmethod
    def update(db: Session, task_id: int, task_in: TaskUpdate) -> Task:
        task = TaskService.get_by_id(db, task_id)
        update_data = task_in.model_dump(exclude_unset=True)

        if "assignee_id" in update_data:
            new_assignee_id = update_data["assignee_id"]
            if new_assignee_id is not None:
                member = (
                    db.query(Member).filter(Member.id == new_assignee_id).first()
                )
                if not member:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Assigned team member with ID {new_assignee_id} not found",
                    )
            task.assignee_id = new_assignee_id

        if "title" in update_data and update_data["title"] is not None:
            task.title = update_data["title"].strip()

        if "description" in update_data:
            desc = update_data["description"]
            task.description = desc.strip() if desc else None

        if "status" in update_data and update_data["status"] is not None:
            task.status = update_data["status"]

        if "priority" in update_data and update_data["priority"] is not None:
            task.priority = update_data["priority"]

        if "due_date" in update_data:
            task.due_date = update_data["due_date"]

        db.commit()
        db.refresh(task)
        return TaskService.get_by_id(db, task.id)

    @staticmethod
    def delete(db: Session, task_id: int) -> None:
        task = TaskService.get_by_id(db, task_id)
        db.delete(task)
        db.commit()
