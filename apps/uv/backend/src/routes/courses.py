from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user, require_admin
from ..models import Course, CourseHole, Round, User
from ..schemas import CreateCourseRequest, CourseResponse, CourseHoleResponse

router = APIRouter(prefix="/api/courses", tags=["courses"])


def _serialize(db: Session, course: Course) -> CourseResponse:
    holes = db.scalars(
        select(CourseHole)
        .where(CourseHole.course_id == course.id)
        .order_by(CourseHole.hole_number.asc())
    ).all()
    return CourseResponse(
        id=course.id,
        name=course.name,
        par_total=sum(h.par for h in holes),
        holes=[CourseHoleResponse.model_validate(h) for h in holes],
    )


@router.get("", response_model=list[CourseResponse])
def list_courses(
    db: Session = Depends(get_db),
    _: dict = Depends(get_current_user),
):
    courses = db.scalars(select(Course).order_by(Course.name.asc())).all()
    return [_serialize(db, c) for c in courses]


@router.get("/{course_id}", response_model=CourseResponse)
def get_course(
    course_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(get_current_user),
):
    course = db.scalar(select(Course).where(Course.id == course_id))
    if not course:
        raise HTTPException(status_code=404, detail="Baan niet gevonden")
    return _serialize(db, course)


@router.post("", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
def create_course(
    body: CreateCourseRequest,
    db: Session = Depends(get_db),
    admin: dict = Depends(require_admin),
):
    if len(body.holes) != 18:
        raise HTTPException(status_code=400, detail="Een baan moet 18 holes hebben")

    numbers = sorted(h.hole_number for h in body.holes)
    if numbers != list(range(1, 19)):
        raise HTTPException(status_code=400, detail="Holes moeten genummerd zijn 1 t/m 18")

    indexes = sorted(h.stroke_index for h in body.holes)
    if indexes != list(range(1, 19)):
        raise HTTPException(status_code=400, detail="Stroke index moet 1 t/m 18 zijn, elk één keer")

    admin_user = db.scalar(select(User).where(User.username == admin["sub"]))
    course = Course(name=body.name.strip(), created_by=admin_user.id)
    db.add(course)
    db.flush()  # assign course.id before inserting holes

    for h in body.holes:
        db.add(CourseHole(
            course_id=course.id,
            hole_number=h.hole_number,
            par=h.par,
            stroke_index=h.stroke_index,
            distance=h.distance,
        ))
    db.commit()
    db.refresh(course)
    return _serialize(db, course)


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    course = db.scalar(select(Course).where(Course.id == course_id))
    if not course:
        raise HTTPException(status_code=404, detail="Baan niet gevonden")
    if db.scalar(select(Round.id).where(Round.course_id == course_id).limit(1)):
        raise HTTPException(
            status_code=409,
            detail="Kan baan niet verwijderen: er zijn al ronden op gespeeld",
        )
    db.execute(CourseHole.__table__.delete().where(CourseHole.course_id == course_id))
    db.delete(course)
    db.commit()
