"""seed admin user Duco

Revision ID: 003
Revises: 002
Create Date: 2026-06-05
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from passlib.context import CryptContext

revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def upgrade() -> None:
    users = sa.table(
        "users",
        sa.column("username", sa.String),
        sa.column("password_hash", sa.String),
        sa.column("is_admin", sa.Boolean),
    )
    op.bulk_insert(users, [
        {
            "username": "Duco",
            "password_hash": pwd_context.hash("Gobwio01"),
            "is_admin": True,
        }
    ])


def downgrade() -> None:
    op.execute("DELETE FROM users WHERE username = 'Duco'")
