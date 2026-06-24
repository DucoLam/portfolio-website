from datetime import datetime, date
from typing import Optional, Literal
from pydantic import BaseModel, ConfigDict, Field


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
    handicap: Optional[float] = None


class MemberTokenResponse(BaseModel):
    id: int
    token: str
    used_by_username: Optional[str]
    created_at: datetime


class MemberResponse(BaseModel):
    id: int
    username: str
    created_at: datetime


class VideoResponse(BaseModel):
    id: int
    youtube_id: str
    title: Optional[str]
    added_by_username: str
    created_at: datetime


class AddVideoRequest(BaseModel):
    url: str


# ── Courses ──────────────────────────────────────────────────────────

class CourseHoleIn(BaseModel):
    hole_number: int = Field(ge=1, le=18)
    par: int = Field(ge=3, le=6)
    stroke_index: int = Field(ge=1, le=18)
    distance: Optional[int] = None


class CreateCourseRequest(BaseModel):
    name: str
    holes: list[CourseHoleIn]


class CourseHoleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    hole_number: int
    par: int
    stroke_index: int
    distance: Optional[int]


class CourseResponse(BaseModel):
    id: int
    name: str
    par_total: int
    holes: list[CourseHoleResponse]


# ── Rounds ───────────────────────────────────────────────────────────

class HoleScoreIn(BaseModel):
    hole_number: int = Field(ge=1, le=18)
    strokes: int = Field(ge=1, le=20)


class SubmitRoundRequest(BaseModel):
    course_id: int
    played_on: date
    handicap: float
    marker_id: int
    holes: list[HoleScoreIn]


class RoundResponse(BaseModel):
    id: int
    player_username: str
    course_id: int
    course_name: str
    played_on: date
    handicap: float
    gross_total: int
    net_total: float
    stableford_total: int
    status: str
    marker_username: str
    created_at: datetime


class AttestRequest(BaseModel):
    action: Literal["confirm", "dispute"]


# ── Leaderboard ──────────────────────────────────────────────────────

class LeaderboardEntry(BaseModel):
    rank: int
    player_username: str
    value: float
    rounds_count: int


class PlayerResponse(BaseModel):
    id: int
    username: str
