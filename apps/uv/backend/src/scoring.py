"""Golf scoring logic — pure functions, no DB access.

Net scoring uses the player's handicap directly as the playing handicap
(no slope / course-rating adjustment). Handicap strokes are allocated per
hole by stroke index, which is what makes Stableford possible.
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Hole:
    """A single hole's fixed data plus the strokes a player took on it."""
    par: int
    stroke_index: int  # 1 (hardest) .. 18 (easiest)
    strokes: int


def strokes_received(stroke_index: int, handicap: int) -> int:
    """How many handicap strokes a player gets on a hole.

    Every hole gets floor(handicap / 18); holes whose stroke index falls
    within the remainder get one extra. Negative (plus) handicaps give
    strokes back on the hardest holes.
    """
    holes = 18
    base = handicap // holes
    remainder = handicap % holes  # Python's % keeps this in 0..17 even for negatives
    extra = 1 if stroke_index <= remainder else 0
    return base + extra


def stableford_points(par: int, net_strokes: int) -> int:
    """Points for a hole given its par and the player's net (post-handicap) strokes."""
    return max(0, par - net_strokes + 2)


def score_round(holes: list[Hole], handicap: float) -> dict:
    """Compute totals for a completed round.

    Handicap is rounded to the nearest whole stroke for per-hole allocation
    (the snapshot float is preserved separately on the round).
    """
    playing_hc = round(handicap)
    gross_total = sum(h.strokes for h in holes)
    stableford_total = 0
    for h in holes:
        recv = strokes_received(h.stroke_index, playing_hc)
        net_hole = h.strokes - recv
        stableford_total += stableford_points(h.par, net_hole)

    net_total = gross_total - handicap
    return {
        "gross_total": gross_total,
        "net_total": round(net_total, 1),
        "stableford_total": stableford_total,
    }
