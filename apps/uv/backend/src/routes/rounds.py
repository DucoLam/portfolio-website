from datetime import datetime, date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import Course, CourseHole, Round, HoleScore, User
from ..schemas import (
    SubmitRoundRequest,
    RoundResponse,
    AttestRequest,
    LeaderboardEntry,
)
from .. import scoring

router = APIRouter(prefix="/api/rounds", tags=["rounds"])
leaderboard_router = APIRouter(prefix="/api/leaderboard", tags=["leaderboard"])


def _username(db: Session, user_id: int) -> str:
    u = db.scalar(select(User).where(User.id == user_id))
    return u.username if u else "?"


def _serialize(db: Session, r: Round) -> RoundResponse:
    course = db.scalar(select(Course).where(Course.id == r.course_id))
    return RoundResponse(
        id=r.id,
        player_username=_username(db, r.player_id),
        course_id=r.course_id,
        course_name=course.name if course else "?",
        played_on=r.played_on,
        handicap=r.handicap,
        gross_total=r.gross_total,
        net_total=r.net_total,
        stableford_total=r.stableford_total,
        status=r.status,
        marker_username=_username(db, r.marker_id),
        created_at=r.created_at,
    )


@router.post("", response_model=RoundResponse, status_code=status.HTTP_201_CREATED)
def submit_round(
    body: SubmitRoundRequest,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    player = db.scalar(select(User).where(User.username == user["sub"]))

    course = db.scalar(select(Course).where(Course.id == body.course_id))
    if not course:
        raise HTTPException(status_code=404, detail="Baan niet gevonden")

    marker = db.scalar(select(User).where(User.id == body.marker_id))
    if not marker:
        raise HTTPException(status_code=404, detail="Marker niet gevonden")
    if marker.id == player.id:
        raise HTTPException(status_code=400, detail="Je kunt niet je eigen marker zijn")

    course_holes = db.scalars(
        select(CourseHole).where(CourseHole.course_id == course.id)
    ).all()
    if len(course_holes) != 18:
        raise HTTPException(status_code=400, detail="Baan heeft geen 18 holes")
    hole_meta = {h.hole_number: h for h in course_holes}

    submitted = {h.hole_number: h.strokes for h in body.holes}
    if sorted(submitted) != list(range(1, 19)):
        raise HTTPException(status_code=400, detail="Vul alle 18 holes in")

    holes = [
        scoring.Hole(
            par=hole_meta[n].par,
            stroke_index=hole_meta[n].stroke_index,
            strokes=submitted[n],
        )
        for n in range(1, 19)
    ]
    totals = scoring.score_round(holes, body.handicap)

    rnd = Round(
        player_id=player.id,
        course_id=course.id,
        played_on=body.played_on,
        handicap=body.handicap,
        gross_total=totals["gross_total"],
        net_total=totals["net_total"],
        stableford_total=totals["stableford_total"],
        status="pending",
        marker_id=marker.id,
    )
    db.add(rnd)
    db.flush()

    for n in range(1, 19):
        db.add(HoleScore(round_id=rnd.id, hole_number=n, strokes=submitted[n]))

    # The submit endpoint doubles as the player's handicap update.
    player.handicap = body.handicap

    db.commit()
    db.refresh(rnd)
    return _serialize(db, rnd)


@router.get("/mine", response_model=list[RoundResponse])
def my_rounds(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    player = db.scalar(select(User).where(User.username == user["sub"]))
    rounds = db.scalars(
        select(Round).where(Round.player_id == player.id).order_by(Round.played_on.desc())
    ).all()
    return [_serialize(db, r) for r in rounds]


@router.get("/pending", response_model=list[RoundResponse])
def rounds_to_attest(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    me = db.scalar(select(User).where(User.username == user["sub"]))
    rounds = db.scalars(
        select(Round)
        .where(Round.marker_id == me.id, Round.status == "pending")
        .order_by(Round.created_at.desc())
    ).all()
    return [_serialize(db, r) for r in rounds]


@router.post("/{round_id}/attest", response_model=RoundResponse)
def attest_round(
    round_id: int,
    body: AttestRequest,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    me = db.scalar(select(User).where(User.username == user["sub"]))
    rnd = db.scalar(select(Round).where(Round.id == round_id))
    if not rnd:
        raise HTTPException(status_code=404, detail="Ronde niet gevonden")
    if rnd.marker_id != me.id:
        raise HTTPException(status_code=403, detail="Alleen de marker kan deze ronde bevestigen")
    if rnd.status != "pending":
        raise HTTPException(status_code=409, detail="Deze ronde is al beoordeeld")

    rnd.status = "confirmed" if body.action == "confirm" else "disputed"
    rnd.attested_at = datetime.utcnow()
    db.commit()
    db.refresh(rnd)
    return _serialize(db, rnd)


# ── Leaderboard ──────────────────────────────────────────────────────

_METRICS = {
    # key: (aggregate column, lower_is_better)
    "net_best": (func.min(Round.net_total), True),
    "net_avg": (func.avg(Round.net_total), True),
    "stbl_best": (func.max(Round.stableford_total), False),
    "stbl_avg": (func.avg(Round.stableford_total), False),
}


@leaderboard_router.get("", response_model=list[LeaderboardEntry])
def leaderboard(
    metric: str = Query("net_best"),
    scope: str = Query("season"),  # season | all
    course: int | None = Query(None),
    db: Session = Depends(get_db),
    _: dict = Depends(get_current_user),
):
    if metric not in _METRICS:
        raise HTTPException(status_code=400, detail="Onbekende metric")
    agg, lower_is_better = _METRICS[metric]

    stmt = (
        select(
            User.username,
            agg.label("value"),
            func.count(Round.id).label("rounds_count"),
        )
        .join(User, User.id == Round.player_id)
        .where(Round.status == "confirmed")
        .group_by(User.username)
    )

    if scope == "season":
        stmt = stmt.where(Round.played_on >= date(date.today().year, 1, 1))
    if course is not None:
        stmt = stmt.where(Round.course_id == course)

    rows = db.execute(stmt).all()
    ranked = sorted(rows, key=lambda r: r.value, reverse=not lower_is_better)

    return [
        LeaderboardEntry(
            rank=i + 1,
            player_username=row.username,
            value=round(float(row.value), 1),
            rounds_count=row.rounds_count,
        )
        for i, row in enumerate(ranked)
    ]
