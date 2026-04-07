from datetime import datetime, timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import TimeSlot
from app.schemas import TimeSlot as TimeSlotSchema, TimeSlotCreate, ErrorResponse

router = APIRouter(prefix="/timeslots", tags=["Time Slots"])


@router.get(
    "",
    response_model=list[TimeSlotSchema],
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
)
def list_time_slots(
    owner_id: Annotated[str, Query(description="ID владельца (обязательно)")],
    date_from: Annotated[datetime | None, Query(description="Начальная дата")] = None,
    date_to: Annotated[datetime | None, Query(description="Конечная дата")] = None,
    db: Session = Depends(get_db),
):
    """
    Получить список доступных временных слотов.
    """
    query = db.query(TimeSlot).filter(
        TimeSlot.owner_id == owner_id, TimeSlot.is_booked.is_(False)
    )

    if date_from:
        query = query.filter(TimeSlot.start_time >= date_from)
    if date_to:
        query = query.filter(TimeSlot.start_time <= date_to)

    return query.all()


@router.post(
    "",
    response_model=TimeSlotSchema,
    status_code=201,
    responses={
        400: {"model": ErrorResponse},
        409: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
def create_time_slot(data: TimeSlotCreate, db: Session = Depends(get_db)):
    """
    Создать новый временной слот (30 минут).
    """
    # Check for existing slot at the same time
    existing_slot = (
        db.query(TimeSlot)
        .filter(
            TimeSlot.owner_id == data.owner_id, TimeSlot.start_time == data.start_time
        )
        .first()
    )

    if existing_slot:
        raise HTTPException(
            status_code=409,
            detail={
                "code": "CONFLICT",
                "message": "Time slot already exists for this owner at this time",
            },
        )

    # Create time slot with 30 minute duration
    end_time = data.start_time + timedelta(minutes=30)

    time_slot = TimeSlot(
        owner_id=data.owner_id,
        start_time=data.start_time,
        end_time=end_time,
        is_booked=False,
    )

    db.add(time_slot)
    db.commit()
    db.refresh(time_slot)

    return time_slot


@router.delete(
    "/{id}",
    status_code=204,
    responses={
        404: {"model": ErrorResponse},
        409: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
def delete_time_slot(id: str, db: Session = Depends(get_db)):
    """
    Удалить временной слот (только если не забронирован).
    """
    time_slot = db.query(TimeSlot).filter(TimeSlot.id == id).first()

    if not time_slot:
        raise HTTPException(
            status_code=404,
            detail={"code": "NOT_FOUND", "message": "Time slot not found"},
        )

    if time_slot.is_booked:
        raise HTTPException(
            status_code=409,
            detail={"code": "CONFLICT", "message": "Cannot delete booked time slot"},
        )

    db.delete(time_slot)
    db.commit()
