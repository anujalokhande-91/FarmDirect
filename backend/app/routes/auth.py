"""Authentication routes for the FarmDirect backend."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import LoginRequest, LoginResponse, RegistrationRequest, RegistrationResponse
from app.security import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post(
    "/register",
    response_model=RegistrationResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_user(
    registration: RegistrationRequest,
    db: Session = Depends(get_db),
) -> User:
    """Create a customer or farmer account."""

    normalized_email = str(registration.email).lower()
    try:
        existing_user = db.scalar(
            select(User).where(func.lower(User.email) == normalized_email)
        )
    except SQLAlchemyError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to check account registration.",
        ) from error

    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = User(
        name=registration.name,
        email=normalized_email,
        password_hash=hash_password(registration.password),
        role=registration.role,
        phone=registration.phone,
    )

    try:
        db.add(user)
        db.commit()
        db.refresh(user)
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        ) from error
    except SQLAlchemyError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create the account.",
        ) from error

    return user


@router.post("/login", response_model=LoginResponse)
def login_user(credentials: LoginRequest, db: Session = Depends(get_db)) -> LoginResponse:
    """Authenticate an account and return a short-lived access token."""

    normalized_email = str(credentials.email).lower()
    user = db.scalar(select(User).where(func.lower(User.email) == normalized_email))
    if user is None or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        access_token = create_access_token(user)
    except RuntimeError as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication is not configured.",
        ) from error

    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=user,
    )


@router.get("/me", response_model=RegistrationResponse)
def read_current_user(current_user: User = Depends(get_current_user)) -> User:
    """Return safe information for the authenticated account."""

    return current_user
