from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from ..database import get_db
from ..models import User, MemberToken
from ..schemas import RegisterRequest, LoginRequest, TokenResponse, MeResponse
from ..auth import hash_password, verify_password, create_access_token
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    member_token = db.scalar(
        select(MemberToken).where(
            MemberToken.token == body.member_token,
            MemberToken.used_by == None,  # noqa: E711
        )
    )
    if not member_token:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid or already used member token")

    existing = db.scalar(select(User).where(User.username == body.username))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken")

    user = User(username=body.username, password_hash=hash_password(body.password))
    db.add(user)
    db.delete(member_token)
    db.commit()

    return TokenResponse(access_token=create_access_token(user.username, user.is_admin))


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.username == body.username))
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    return TokenResponse(access_token=create_access_token(user.username, user.is_admin))


@router.get("/me", response_model=MeResponse)
def me(current_user: dict = Depends(get_current_user)):
    return MeResponse(username=current_user["sub"], is_admin=current_user.get("is_admin", False))
