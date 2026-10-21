from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, PaginatedTaskResponse
from app.services.task_service import TaskService

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("", response_model=PaginatedTaskResponse)
def list_tasks(
    page: int = Query(1, ge=1, description="Page number, 1-indexed"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search tasks by title"),
    task_status: Optional[str] = Query(None, alias="status", description="Filter by status ('To Do', 'In Progress', 'Done')"),
    priority: Optional[str] = Query(None, description="Filter by priority ('Low', 'Medium', 'High')"),
    assignee_id: Optional[int] = Query(None, description="Filter by assignee member ID"),
    db: Session = Depends(get_db),
):
    items, total, total_pages = TaskService.get_paginated(
        db,
        page=page,
        page_size=page_size,
        search=search,
        task_status=task_status,
        priority=priority,
        assignee_id=assignee_id,
    )
    return PaginatedTaskResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(task_in: TaskCreate, db: Session = Depends(get_db)):
    return TaskService.create(db, task_in)


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db)):
    return TaskService.get_by_id(db, task_id)


@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_in: TaskUpdate,
    db: Session = Depends(get_db),
):
    return TaskService.update(db, task_id, task_in)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    TaskService.delete(db, task_id)
    return None
