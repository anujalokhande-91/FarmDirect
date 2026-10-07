"""Password security helpers for the FarmDirect backend."""

from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pwdlib import PasswordHash
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import User

password_hash = PasswordHash.recommended()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


def hash_password(password: str) -> str:
    """Return a secure one-way hash for a password."""

    return password_hash.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    """Check a plain password against its stored secure hash."""

    return password_hash.verify(password, hashed_password)


def create_access_token(user: User) -> str:
    """Create a signed JWT containing only the user's identity and role."""

    if not settings.jwt_secret:
        raise RuntimeError("JWT authentication is not configured.")

    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.jwt_access_token_expire_minutes
    )
    payload = {
        "sub": str(user.id),
        "role": user.role,
        "exp": expires_at,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict[str, object]:
    """Decode and validate a signed JWT access token."""

    if not settings.jwt_secret:
        raise RuntimeError("JWT authentication is not configured.")

    return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])


def _authentication_error() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate authentication credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    token: Annotated[str | None, Depends(oauth2_scheme)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    """Load the user identified by a valid Bearer access token."""

    if not token:
        raise _authentication_error()

    try:
        payload = decode_access_token(token)
        subject = payload.get("sub")
        user_id = int(subject) if isinstance(subject, str) else None
    except (JWTError, RuntimeError, TypeError, ValueError):
        raise _authentication_error() from None

    if user_id is None:
        raise _authentication_error()

    user = db.scalar(select(User).where(User.id == user_id))
    if user is None:
        raise _authentication_error()

    return user


def get_current_customer(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Require that the authenticated user has the customer role."""

    if current_user.role != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Customer access is required.",
        )
    return current_user


def get_current_farmer(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Require that the authenticated user has the farmer role."""

    if current_user.role != "farmer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Farmer access is required.",
        )
    return current_user
