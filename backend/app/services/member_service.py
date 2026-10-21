import math
from typing import List, Optional, Tuple
from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.member import Member
from app.schemas.member import MemberCreate, MemberUpdate


class MemberService:
    @staticmethod
    def get_all(db: Session) -> List[Member]:
        return db.query(Member).order_by(Member.name.asc(), Member.id.asc()).all()

    @staticmethod
    def get_paginated(
        db: Session,
        page: int = 1,
        page_size: int = 10,
    ) -> Tuple[List[Member], int, int]:
        total = db.query(func.count(Member.id)).scalar() or 0
        total_pages = math.ceil(total / page_size) if total > 0 else 0
        offset = (page - 1) * page_size
        items = (
            db.query(Member)
            .order_by(Member.name.asc(), Member.id.asc())
            .offset(offset)
            .limit(page_size)
            .all()
        )
        return items, total, total_pages

    @staticmethod
    def get_options(db: Session) -> List[Member]:
        return db.query(Member).order_by(Member.name.asc(), Member.id.asc()).all()

    @staticmethod
    def get_by_id(db: Session, member_id: int) -> Member:
        member = db.query(Member).filter(Member.id == member_id).first()
        if not member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Team member with ID {member_id} not found",
            )
        return member

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[Member]:
        return db.query(Member).filter(Member.email == email.strip().lower()).first()

    @staticmethod
    def create(db: Session, member_in: MemberCreate) -> Member:
        normalized_email = member_in.email.strip().lower()
        existing = db.query(Member).filter(Member.email == normalized_email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A team member with this email already exists",
            )

        new_member = Member(
            name=member_in.name.strip(),
            email=normalized_email,
        )
        db.add(new_member)
        db.commit()
        db.refresh(new_member)
        return new_member

    @staticmethod
    def update(db: Session, member_id: int, member_in: MemberUpdate) -> Member:
        member = MemberService.get_by_id(db, member_id)

        update_data = member_in.model_dump(exclude_unset=True)

        if "email" in update_data and update_data["email"] is not None:
            normalized_email = update_data["email"].strip().lower()
            existing = (
                db.query(Member)
                .filter(Member.email == normalized_email, Member.id != member_id)
                .first()
            )
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="A team member with this email already exists",
                )
            member.email = normalized_email

        if "name" in update_data and update_data["name"] is not None:
            member.name = update_data["name"].strip()

        db.commit()
        db.refresh(member)
        return member

    @staticmethod
    def delete(db: Session, member_id: int) -> None:
        member = MemberService.get_by_id(db, member_id)
        db.delete(member)
        db.commit()
