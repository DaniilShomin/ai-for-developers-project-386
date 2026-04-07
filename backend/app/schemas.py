from datetime import datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict, field_validator


def to_camel(string: str) -> str:
    """Convert snake_case to camelCase."""
    components = string.split("_")
    return components[0] + "".join(word.capitalize() for word in components[1:])


# Enums
BookingStatus = Literal["confirmed", "cancelled"]


# ============== Error Schema ==============
class ErrorResponse(BaseModel):
    code: str
    message: str


# ============== Booker Schemas ==============
class Booker(BaseModel):
    model_config = ConfigDict(
        from_attributes=True, alias_generator=to_camel, populate_by_name=True
    )

    id: str
    name: str
    email: str
    phone: str | None = None
    created_at: datetime


# ============== TimeSlot Schemas ==============
class TimeSlot(BaseModel):
    model_config = ConfigDict(
        from_attributes=True, alias_generator=to_camel, populate_by_name=True
    )

    id: str
    owner_id: str
    start_time: datetime
    end_time: datetime
    is_booked: bool
    created_at: datetime


class TimeSlotCreate(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    owner_id: str
    start_time: datetime

    @field_validator("start_time", mode="before")
    @classmethod
    def parse_datetime(cls, value):
        if isinstance(value, str):
            return datetime.fromisoformat(value.replace("Z", "+00:00"))
        return value


# ============== Booking Schemas ==============
class Booking(BaseModel):
    model_config = ConfigDict(
        from_attributes=True, alias_generator=to_camel, populate_by_name=True
    )

    id: str
    time_slot_id: str
    booker_id: str
    notes: str | None = None
    status: BookingStatus
    created_at: datetime


class BookingWithDetails(Booking):
    time_slot: TimeSlot
    booker: Booker


class BookingCreate(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    time_slot_id: str
    booker_name: str
    booker_email: str
    booker_phone: str | None = None
    notes: str | None = None
