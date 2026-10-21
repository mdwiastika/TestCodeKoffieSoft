from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.member import MemberCreate, MemberUpdate, MemberResponse
from app.services.member_service import MemberService

router = APIRouter(prefix="/members", tags=["Members"])


@router.get("", response_model=List[MemberResponse])
def list_members(db: Session = Depends(get_db)):
    return MemberService.get_all(db)


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
