from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Owner
from app.schemas import Owner as OwnerSchema, ErrorResponse

router = APIRouter(prefix="/owner", tags=["Owner"])

DEFAULT_OWNER_ID = "default-owner"


def get_or_create_default_owner(db: Session) -> Owner:
    """Get or create default owner"""
    owner = db.query(Owner).filter(Owner.id == DEFAULT_OWNER_ID).first()
    if not owner:
        owner = Owner(
            id=DEFAULT_OWNER_ID,
            name="Администратор",
            email="admin@booking.local",
            timezone="Europe/Moscow",
            work_start="09:00",
            work_end="18:00",
        )
        db.add(owner)
        db.commit()
        db.refresh(owner)
    return owner


@router.get(
    "",
    response_model=OwnerSchema,
    responses={404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
)
def get_owner(db: Session = Depends(get_db)):
    """
    Получить данные владельца (default owner).
    """
    owner = get_or_create_default_owner(db)
    return owner
