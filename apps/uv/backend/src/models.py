from datetime import datetime, date
from typing import Optional
from sqlalchemy import String, DateTime, Date, Boolean, Integer, Float, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column
from .database import Base


class Video(Base):
    __tablename__ = "videos"

    id: Mapped[int] = mapped_column(primary_key=True)
    youtube_id: Mapped[str] = mapped_column(String(20), nullable=False)
    title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    added_by_username: Mapped[str] = mapped_column(String(50), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    handicap: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )


class MemberToken(Base):
    __tablename__ = "member_tokens"

    id: Mapped[int] = mapped_column(primary_key=True)
    token: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    used_by: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )


class CourseHole(Base):
    __tablename__ = "course_holes"

    id: Mapped[int] = mapped_column(primary_key=True)
    course_id: Mapped[int] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"), nullable=False
    )
    hole_number: Mapped[int] = mapped_column(Integer, nullable=False)  # 1–18
    par: Mapped[int] = mapped_column(Integer, nullable=False)
    stroke_index: Mapped[int] = mapped_column(Integer, nullable=False)  # 1–18
    distance: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)


class Round(Base):
    __tablename__ = "rounds"

    id: Mapped[int] = mapped_column(primary_key=True)
    player_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id"), nullable=False)
    played_on: Mapped[date] = mapped_column(Date, nullable=False)
    handicap: Mapped[float] = mapped_column(Float, nullable=False)  # snapshot at submit
    gross_total: Mapped[int] = mapped_column(Integer, nullable=False)
    net_total: Mapped[float] = mapped_column(Float, nullable=False)
    stableford_total: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(
        String(20), default="pending", nullable=False
    )  # pending | confirmed | disputed
    marker_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    attested_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    photo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)  # phase 2
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )


class HoleScore(Base):
    __tablename__ = "hole_scores"

    id: Mapped[int] = mapped_column(primary_key=True)
    round_id: Mapped[int] = mapped_column(
        ForeignKey("rounds.id", ondelete="CASCADE"), nullable=False
    )
    hole_number: Mapped[int] = mapped_column(Integer, nullable=False)
    strokes: Mapped[int] = mapped_column(Integer, nullable=False)
