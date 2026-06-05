import json
import re
import urllib.request

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user, require_admin
from ..models import Video
from ..schemas import AddVideoRequest, VideoResponse

router = APIRouter(prefix="/api/archief", tags=["archief"])

_YT_PATTERN = re.compile(
    r'(?:youtube\.com/(?:watch\?v=|embed/|shorts/)|youtu\.be/)([a-zA-Z0-9_-]{11})'
)


def _extract_id(url: str) -> str | None:
    m = _YT_PATTERN.search(url)
    return m.group(1) if m else None


def _fetch_title(youtube_id: str) -> str | None:
    try:
        oembed = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={youtube_id}&format=json"
        req = urllib.request.Request(oembed, headers={"User-Agent": "TigrisSilvae/1.0"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            return json.loads(resp.read()).get("title")
    except Exception:
        return None


@router.get("/videos", response_model=list[VideoResponse])
def list_videos(
    db: Session = Depends(get_db),
    _: dict = Depends(get_current_user),
):
    return db.scalars(select(Video).order_by(Video.created_at.desc())).all()


@router.post("/videos", response_model=VideoResponse, status_code=status.HTTP_201_CREATED)
def add_video(
    body: AddVideoRequest,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    youtube_id = _extract_id(body.url)
    if not youtube_id:
        raise HTTPException(status_code=400, detail="Ongeldige YouTube URL")

    title = _fetch_title(youtube_id)

    video = Video(
        youtube_id=youtube_id,
        title=title,
        added_by_username=user["sub"],
    )
    db.add(video)
    db.commit()
    db.refresh(video)
    return video


@router.delete("/videos/{video_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_video(
    video_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    video = db.scalar(select(Video).where(Video.id == video_id))
    if not video:
        raise HTTPException(status_code=404, detail="Video niet gevonden")
    db.delete(video)
    db.commit()
