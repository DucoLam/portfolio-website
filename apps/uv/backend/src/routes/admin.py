import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, update
from ..database import get_db
from ..models import MemberToken, User
from ..schemas import MemberTokenResponse, MemberResponse
from ..dependencies import require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/tokens", response_model=MemberTokenResponse)
def generate_token(
    db: Session = Depends(get_db),
    admin: dict = Depends(require_admin),
):
    admin_user = db.scalar(select(User).where(User.username == admin["sub"]))
    token = MemberToken(
        token=secrets.token_urlsafe(32),
        created_by=admin_user.id,
    )
    db.add(token)
    db.commit()
    db.refresh(token)

    return MemberTokenResponse(
        id=token.id,
        token=token.token,
        used_by_username=None,
        created_at=token.created_at,
    )


@router.get("/tokens", response_model=list[MemberTokenResponse])
def list_tokens(
    db: Session = Depends(get_db),
    admin: dict = Depends(require_admin),
):
    tokens = db.scalars(select(MemberToken).order_by(MemberToken.created_at.desc())).all()

    out = []
    for t in tokens:
        used_by_username = None
        if t.used_by:
            user = db.scalar(select(User).where(User.id == t.used_by))
            used_by_username = user.username if user else None
        out.append(MemberTokenResponse(
            id=t.id,
            token=t.token,
            used_by_username=used_by_username,
            created_at=t.created_at,
        ))
    return out


@router.get("/members", response_model=list[MemberResponse])
def list_members(
    db: Session = Depends(get_db),
    admin: dict = Depends(require_admin),
):
    users = db.scalars(
        select(User)
        .where(User.is_admin == False)  # noqa: E712
        .order_by(User.created_at.asc())
    ).all()
    return [MemberResponse(id=u.id, username=u.username, created_at=u.created_at) for u in users]


@router.delete("/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_member(
    user_id: int,
    db: Session = Depends(get_db),
    admin: dict = Depends(require_admin),
):
    user = db.scalar(select(User).where(User.id == user_id, User.is_admin == False))  # noqa: E712
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")

    # Release any tokens this member used so they can be tracked clearly
    db.execute(update(MemberToken).where(MemberToken.used_by == user_id).values(used_by=None))
    db.delete(user)
    db.commit()
