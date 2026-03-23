from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# 인증 관련 스키마
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class AdminLogin(BaseModel):
    username: str
    password: str


class AdminCreate(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    password: str


class AdminResponse(BaseModel):
    id: int
    username: str
    email: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True


# 멤버 관련 스키마
class MemberBase(BaseModel):
    name: str
    generation: int
    position: Optional[str] = None
    major: Optional[str] = None
    student_id: Optional[str] = None
    email: Optional[str] = None
    github: Optional[str] = None
    linkedin: Optional[str] = None
    instagram: Optional[str] = None
    profile_image_url: Optional[str] = None
    is_executive: bool = False
    is_active: bool = True
    notes: Optional[str] = None


class MemberCreate(MemberBase):
    pass


class MemberUpdate(BaseModel):
    name: Optional[str] = None
    generation: Optional[int] = None
    position: Optional[str] = None
    major: Optional[str] = None
    student_id: Optional[str] = None
    email: Optional[str] = None
    github: Optional[str] = None
    linkedin: Optional[str] = None
    instagram: Optional[str] = None
    profile_image_url: Optional[str] = None
    is_executive: Optional[bool] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None


class MemberResponse(MemberBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# PDF 업로드 관련
class PDFUploadResponse(BaseModel):
    message: str
    members_created: int
    members_updated: int

