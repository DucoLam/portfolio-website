from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class RegisterRequest(BaseModel):
    username: str
    password: str
    member_token: str


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class MeResponse(BaseModel):
    username: str
    is_admin: bool


class MemberTokenResponse(BaseModel):
    id: int
    token: str
    used_by_username: Optional[str]
    created_at: datetime
