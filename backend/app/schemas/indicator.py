from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class IndicatorCreate(BaseModel):
    value: str = Field(
        min_length=2,
        max_length=500,
    )

    indicator_type: str = Field(
        min_length=2,
        max_length=50,
    )

    severity_score: int = Field(
        default=0,
        ge=0,
        le=100,
    )

    source: str = Field(
        min_length=2,
        max_length=100,
    )

    description: str | None = None


class IndicatorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    value: str
    indicator_type: str
    severity_score: int
    severity: str
    source: str
    status: str
    description: str | None
    created_at: datetime