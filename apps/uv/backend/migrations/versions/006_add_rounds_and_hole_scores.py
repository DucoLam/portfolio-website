"""add rounds and hole_scores

Revision ID: 006
Revises: 005
Create Date: 2026-06-24
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "006"
down_revision: Union[str, None] = "005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "rounds",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("player_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("course_id", sa.Integer(), sa.ForeignKey("courses.id"), nullable=False),
        sa.Column("played_on", sa.Date(), nullable=False),
        sa.Column("handicap", sa.Float(), nullable=False),
        sa.Column("gross_total", sa.Integer(), nullable=False),
        sa.Column("net_total", sa.Float(), nullable=False),
        sa.Column("stableford_total", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(20), server_default="pending", nullable=False),
        sa.Column("marker_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("attested_at", sa.DateTime(), nullable=True),
        sa.Column("photo_url", sa.String(500), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "hole_scores",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "round_id",
            sa.Integer(),
            sa.ForeignKey("rounds.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("hole_number", sa.Integer(), nullable=False),
        sa.Column("strokes", sa.Integer(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("hole_scores")
    op.drop_table("rounds")
