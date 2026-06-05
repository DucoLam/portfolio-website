import json
import os
import time
import urllib.parse
import urllib.request

from fastapi import APIRouter, Depends

from ..dependencies import get_current_user

router = APIRouter(prefix="/api/fotos", tags=["fotos"])

GOOGLE_CLIENT_ID     = os.environ.get("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REFRESH_TOKEN = os.environ.get("GOOGLE_REFRESH_TOKEN", "")
GOOGLE_ALBUM_ID      = os.environ.get("GOOGLE_ALBUM_ID", "")

_token:  dict = {"access_token": None, "expires_at": 0.0}
_cache:  dict = {"photos": [],          "fetched_at": 0.0}
CACHE_TTL = 1800  # 30 min — baseUrls are valid for ~1 h


def _access_token() -> str:
    now = time.time()
    if _token["access_token"] and now < _token["expires_at"] - 60:
        return _token["access_token"]

    data = urllib.parse.urlencode({
        "client_id":     GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "refresh_token": GOOGLE_REFRESH_TOKEN,
        "grant_type":    "refresh_token",
    }).encode()

    req = urllib.request.Request(
        "https://oauth2.googleapis.com/token",
        data=data,
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        r = json.loads(resp.read())

    _token["access_token"] = r["access_token"]
    _token["expires_at"]   = now + r.get("expires_in", 3600)
    return _token["access_token"]


def _fetch_photos() -> list:
    now = time.time()
    if now - _cache["fetched_at"] < CACHE_TTL:
        return _cache["photos"]

    if not all([GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
                GOOGLE_REFRESH_TOKEN, GOOGLE_ALBUM_ID]):
        return []

    try:
        token = _access_token()
        payload = json.dumps({"albumId": GOOGLE_ALBUM_ID, "pageSize": 100}).encode()
        req = urllib.request.Request(
            "https://photoslibrary.googleapis.com/v1/mediaItems:search",
            data=payload,
            headers={
                "Authorization":  f"Bearer {token}",
                "Content-Type":   "application/json",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read())

        photos = [
            {
                "id":         item["id"],
                "thumb_url":  item["baseUrl"] + "=w600-h600-c",
                "full_url":   item["baseUrl"] + "=w2048",
                "filename":   item.get("filename", ""),
                "taken_at":   item.get("mediaMetadata", {}).get("creationTime", ""),
            }
            for item in result.get("mediaItems", [])
        ]

        _cache["photos"]     = photos
        _cache["fetched_at"] = now
        return photos

    except Exception:
        return _cache["photos"]  # serve stale on error


@router.get("/photos")
def get_photos(_: dict = Depends(get_current_user)):
    return _fetch_photos()
