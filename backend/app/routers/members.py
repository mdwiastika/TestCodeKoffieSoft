from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.member import (
    MemberCreate,
    MemberUpdate,
    MemberResponse,
    MemberOptionResponse,
    PaginatedMemberResponse,
)
from app.services.member_service import MemberService

router = APIRouter(prefix="/members", tags=["Members"])


@router.get("", response_model=PaginatedMemberResponse)
def list_members(
    page: int = Query(1, ge=1, description="Page number, 1-indexed"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
):
    items, total, total_pages = MemberService.get_paginated(
        db, page=page, page_size=page_size
    )
    return PaginatedMemberResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/options", response_model=List[MemberOptionResponse])
def get_member_options(db: Session = Depends(get_db)):
    return MemberService.get_options(db)


@router.post("", response_model=MemberResponse, status_code=status.HTTP_201_CREATED)
def create_member(member_in: MemberCreate, db: Session = Depends(get_db)):
    return MemberService.create(db, member_in)


@router.get("/{member_id}", response_model=MemberResponse)
def get_member(member_id: int, db: Session = Depends(get_db)):
    return MemberService.get_by_id(db, member_id)


@router.patch("/{member_id}", response_model=MemberResponse)
def update_member(
    member_id: int,
    member_in: MemberUpdate,
    db: Session = Depends(get_db),
):
    return MemberService.update(db, member_id, member_in)


@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_member(member_id: int, db: Session = Depends(get_db)):
    MemberService.delete(db, member_id)
    return None
