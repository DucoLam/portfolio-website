import os
import time
import urllib.request
from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends
from icalendar import Calendar

from ..dependencies import get_current_user

router = APIRouter(prefix="/api/agenda", tags=["agenda"])

ICS_URL = os.environ.get("ICS_URL", "")
CACHE_TTL = 900  # 15 minutes

_cache: tuple = ([], 0.0)


def _fetch_and_parse() -> list:
    global _cache
    cached_events, fetched_at = _cache

    if time.time() - fetched_at < CACHE_TTL:
        return cached_events

    if not ICS_URL:
        return []

    try:
        req = urllib.request.Request(
            ICS_URL.replace("webcal://", "https://"),
            headers={"User-Agent": "TigrisSilvae/1.0"},
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            raw = resp.read()

        cal = Calendar.from_ical(raw)
        events = []
        today = date.today()

        for component in cal.walk():
            if component.name != "VEVENT":
                continue

            dtstart = component.get("DTSTART")
            dtend = component.get("DTEND")
            if dtstart is None:
                continue

            start = dtstart.dt
            end = dtend.dt if dtend else None

            all_day = isinstance(start, date) and not isinstance(start, datetime)

            # Skip past events
            start_date = start if all_day else start.date() if isinstance(start, datetime) else start
            if start_date < today:
                continue

            # Normalise datetimes to UTC ISO string; dates to plain ISO date string
            if all_day:
                start_iso = start.isoformat()
                end_iso = end.isoformat() if end else None
            else:
                if isinstance(start, datetime) and start.tzinfo is None:
                    start = start.replace(tzinfo=timezone.utc)
                if isinstance(end, datetime) and end is not None and end.tzinfo is None:
                    end = end.replace(tzinfo=timezone.utc)
                start_iso = start.isoformat()
                end_iso = end.isoformat() if end else None

            events.append({
                "id": str(component.get("UID", "")),
                "title": str(component.get("SUMMARY", "")),
                "start": start_iso,
                "end": end_iso,
                "all_day": all_day,
                "location": str(component.get("LOCATION")) if component.get("LOCATION") else None,
                "description": str(component.get("DESCRIPTION")) if component.get("DESCRIPTION") else None,
            })

        events.sort(key=lambda e: e["start"])
        _cache = (events, time.time())
        return events

    except Exception:
        return cached_events  # serve stale on error rather than crashing


@router.get("/events")
def get_events(_: dict = Depends(get_current_user)):
    return _fetch_and_parse()
