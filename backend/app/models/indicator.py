from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Integer, String, Text

from backend.app.core.database import Base


class Indicator(Base):
    __tablename__ = "indicators"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    value = Column(
        String(500),
        unique=True,
        index=True,
        nullable=False,
    )

    indicator_type = Column(
        String(50),
        index=True,
        nullable=False,
    )

    severity_score = Column(
        Integer,
        default=0,
        nullable=False,
    )

    severity = Column(
        String(20),
        default="Low",
        nullable=False,
    )

    source = Column(
        String(100),
        nullable=False,
    )

    status = Column(
        String(30),
        default="Active",
        nullable=False,
    )

    description = Column(
        Text,
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )