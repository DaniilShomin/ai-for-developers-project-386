from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import Base, TimeSlot

DATABASE_URL = "sqlite:///./bookings.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def generate_time_slots(db, owner_id: str, days_ahead: int = 14):
    """Generate time slots for the next N days (09:00 - 18:00, 30 min intervals)"""
    now = datetime.now()
    existing_count = db.query(TimeSlot).filter(TimeSlot.owner_id == owner_id).count()

    if existing_count > 0:
        return  # Don't regenerate if slots exist

    slots_created = 0
    for day_offset in range(days_ahead):
        date = now + timedelta(days=day_offset)
        # Create slots from 09:00 to 18:00
        for hour in range(9, 18):
            # :00 slot
            start_time = date.replace(hour=hour, minute=0, second=0, microsecond=0)
            end_time = start_time + timedelta(minutes=30)
            slot = TimeSlot(
                owner_id=owner_id,
                start_time=start_time,
                end_time=end_time,
                is_booked=False,
            )
            db.add(slot)
            slots_created += 1

            # :30 slot
            start_time = date.replace(hour=hour, minute=30, second=0, microsecond=0)
            end_time = start_time + timedelta(minutes=30)
            slot = TimeSlot(
                owner_id=owner_id,
                start_time=start_time,
                end_time=end_time,
                is_booked=False,
            )
            db.add(slot)
            slots_created += 1

    db.commit()
    print(f"Created {slots_created} time slots for owner_id={owner_id}")


def init_db():
    Base.metadata.create_all(bind=engine)
    # Generate initial time slots
    db = SessionLocal()
    try:
        generate_time_slots(db, owner_id="owner-1", days_ahead=14)
    finally:
        db.close()
