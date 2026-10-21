from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class MemberBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Full name of the team member")
    email: EmailStr = Field(..., description="Unique and valid email address")


class MemberCreate(MemberBase):
    pass


class MemberUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255, description="Updated name")
    email: Optional[EmailStr] = Field(None, description="Updated unique email address")


class MemberResponse(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MemberOptionResponse(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class PaginatedMemberResponse(BaseModel):
    items: List[MemberResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
