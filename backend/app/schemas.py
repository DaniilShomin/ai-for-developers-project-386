from datetime import datetime, timezone
from typing import Literal
from pydantic import BaseModel, ConfigDict, field_validator, PlainSerializer
from typing import Annotated


def to_camel(string: str) -> str:
    """Convert snake_case to camelCase."""
    components = string.split("_")
    return components[0] + "".join(word.capitalize() for word in components[1:])


def serialize_datetime_utc(dt: datetime) -> str:
    """Serialize datetime to ISO format with Z suffix (UTC)."""
    if dt.tzinfo is None:
        # Treat naive datetime as UTC
        dt = dt.replace(tzinfo=timezone.utc)
    else:
        # Convert to UTC
        dt = dt.astimezone(timezone.utc)
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")


# Annotated type for UTC datetime serialization
UtcDatetime = Annotated[
    datetime, PlainSerializer(serialize_datetime_utc, return_type=str)
]


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
    created_at: UtcDatetime


# ============== TimeSlot Schemas ==============
class TimeSlot(BaseModel):
    model_config = ConfigDict(
        from_attributes=True, alias_generator=to_camel, populate_by_name=True
    )

    id: str
    owner_id: str
    start_time: UtcDatetime
    end_time: UtcDatetime
    is_booked: bool
    created_at: UtcDatetime


class TimeSlotCreate(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    owner_id: str
    start_time: datetime

    @field_validator("start_time", mode="before")
    @classmethod
    def parse_datetime(cls, value):
        if isinstance(value, str):
            # Parse ISO format with or without timezone
            dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
            # Ensure UTC
            if dt.tzinfo is not None:
                dt = dt.astimezone(timezone.utc).replace(tzinfo=None)
            return dt
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
    created_at: UtcDatetime


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
