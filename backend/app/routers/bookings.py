from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Booker, Booking, TimeSlot
from app.schemas import (
    Booking as BookingSchema,
    BookingWithDetails,
    BookingCreate,
    ErrorResponse,
    BookingStatus,
)

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.get(
    "",
    response_model=list[BookingWithDetails],
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
)
def list_bookings(
    owner_id: Annotated[str | None, Query(description="ID владельца")] = None,
    booker_id: Annotated[str | None, Query(description="ID записывающегося")] = None,
    status: Annotated[
        BookingStatus | None, Query(description="Статус бронирования")
    ] = None,
    db: Session = Depends(get_db),
):
    """
    Получить список бронирований с деталями.
    """
    query = db.query(Booking).options(
        joinedload(Booking.time_slot), joinedload(Booking.booker)
    )

    if owner_id:
        query = query.join(TimeSlot).filter(TimeSlot.owner_id == owner_id)
    if booker_id:
        query = query.filter(Booking.booker_id == booker_id)
    if status:
        query = query.filter(Booking.status == status)

    return query.all()


@router.post(
    "",
    response_model=BookingSchema,
    status_code=201,
    responses={
        400: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        409: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
def create_booking(data: BookingCreate, db: Session = Depends(get_db)):
    """
    Создать новое бронирование.
    """
    # Check if time slot exists
    time_slot = db.query(TimeSlot).filter(TimeSlot.id == data.time_slot_id).first()
    if not time_slot:
        raise HTTPException(
            status_code=404,
            detail={"code": "NOT_FOUND", "message": "Time slot not found"},
        )

    # Check if time slot is already booked
    if time_slot.is_booked:
        raise HTTPException(
            status_code=409,
            detail={"code": "CONFLICT", "message": "Time slot already booked"},
        )

    # Find or create booker by email
    booker = db.query(Booker).filter(Booker.email == data.booker_email).first()
    if not booker:
        booker = Booker(
            name=data.booker_name, email=data.booker_email, phone=data.booker_phone
        )
        db.add(booker)
        db.flush()

    # Create booking
    booking = Booking(
        time_slot_id=data.time_slot_id,
        booker_id=booker.id,
        notes=data.notes,
        status="confirmed",
    )

    # Mark time slot as booked
    time_slot.is_booked = True

    db.add(booking)
    db.commit()
    db.refresh(booking)

    return booking


@router.get(
    "/{id}",
    response_model=BookingWithDetails,
    responses={404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
)
def get_booking(id: str, db: Session = Depends(get_db)):
    """
    Получить детали конкретного бронирования.
    """
    booking = (
        db.query(Booking)
        .options(joinedload(Booking.time_slot), joinedload(Booking.booker))
        .filter(Booking.id == id)
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=404,
            detail={"code": "NOT_FOUND", "message": "Booking not found"},
        )

    return booking


@router.delete(
    "/{id}",
    response_model=BookingSchema,
    responses={
        404: {"model": ErrorResponse},
        409: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
def cancel_booking(id: str, db: Session = Depends(get_db)):
    """
    Отменить бронирование (soft delete).
    """
    booking = db.query(Booking).filter(Booking.id == id).first()

    if not booking:
        raise HTTPException(
            status_code=404,
            detail={"code": "NOT_FOUND", "message": "Booking not found"},
        )

    if booking.status == "cancelled":
        raise HTTPException(
            status_code=409,
            detail={"code": "CONFLICT", "message": "Booking already cancelled"},
        )

    # Update booking status
    booking.status = "cancelled"

    # Free the time slot
    time_slot = db.query(TimeSlot).filter(TimeSlot.id == booking.time_slot_id).first()
    if time_slot:
        time_slot.is_booked = False

    db.commit()
    db.refresh(booking)

    return booking
