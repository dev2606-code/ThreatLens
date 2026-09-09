from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Response,
    status,
)
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from backend.app.core.database import get_database
from backend.app.models.indicator import Indicator
from backend.app.schemas.indicator import (
    IndicatorCreate,
    IndicatorResponse,
)

router = APIRouter(
    prefix="/api/indicators",
    tags=["Indicators"],
)


def calculate_severity(score: int) -> str:
    if score >= 90:
        return "Critical"

    if score >= 70:
        return "High"

    if score >= 40:
        return "Medium"

    return "Low"


@router.get(
    "",
    response_model=list[IndicatorResponse],
)
def get_indicators(
    database: Session = Depends(get_database),
):
    statement = select(Indicator).order_by(
        Indicator.severity_score.desc()
    )

    return database.scalars(statement).all()


@router.post(
    "",
    response_model=IndicatorResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_indicator(
    payload: IndicatorCreate,
    database: Session = Depends(get_database),
):
    indicator = Indicator(
        value=payload.value.strip(),
        indicator_type=payload.indicator_type.strip(),
        severity_score=payload.severity_score,
        severity=calculate_severity(payload.severity_score),
        source=payload.source.strip(),
        description=payload.description,
    )

    database.add(indicator)

    try:
        database.commit()
        database.refresh(indicator)

    except IntegrityError:
        database.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This indicator already exists.",
        )

    return indicator
@router.delete(
    "/{indicator_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_indicator(
    indicator_id: int,
    database: Session = Depends(get_database),
):
    indicator = database.get(Indicator, indicator_id)

    if indicator is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Indicator not found.",
        )

    database.delete(indicator)
    database.commit()

    return Response(
        status_code=status.HTTP_204_NO_CONTENT,
    )