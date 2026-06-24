from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import User
from ..schemas import PlayerResponse

router = APIRouter(prefix="/api/players", tags=["players"])


@router.get("", response_model=list[PlayerResponse])
def list_players(
    db: Session = Depends(get_db),
    _: dict = Depends(get_current_user),
):
    """All members — used to pick a marker when submitting a round."""
    users = db.scalars(select(User).order_by(User.username.asc())).all()
    return [PlayerResponse(id=u.id, username=u.username) for u in users]
