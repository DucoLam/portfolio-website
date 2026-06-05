import secrets
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..models import MemberToken, User
from ..schemas import MemberTokenResponse
from ..dependencies import require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/tokens", response_model=MemberTokenResponse)
async def generate_token(
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_admin),
):
    admin_user = await db.scalar(select(User).where(User.username == admin["sub"]))
    token = MemberToken(
        token=secrets.token_urlsafe(32),
        created_by=admin_user.id,
    )
    db.add(token)
    await db.commit()
    await db.refresh(token)

    return MemberTokenResponse(
        id=token.id,
        token=token.token,
        used_by_username=None,
        created_at=token.created_at,
    )


@router.get("/tokens", response_model=list[MemberTokenResponse])
async def list_tokens(
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_admin),
):
    result = await db.execute(select(MemberToken).order_by(MemberToken.created_at.desc()))
    tokens = result.scalars().all()

    out = []
    for t in tokens:
        used_by_username = None
        if t.used_by:
            user = await db.scalar(select(User).where(User.id == t.used_by))
            used_by_username = user.username if user else None
        out.append(MemberTokenResponse(
            id=t.id,
            token=t.token,
            used_by_username=used_by_username,
            created_at=t.created_at,
        ))
    return out
