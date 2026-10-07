"""SQLAlchemy database setup for the FarmDirect backend."""

from collections.abc import Generator

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings


engine: Engine | None = (
    create_engine(
        settings.database_url,
        pool_pre_ping=True,
        pool_recycle=1800,
    )
    if settings.database_url
    else None
)
SessionLocal = sessionmaker(autoflush=False, autocommit=False)
if engine is not None:
    SessionLocal.configure(bind=engine)


class Base(DeclarativeBase):
    """Base class for future SQLAlchemy models."""


def initialize_database() -> None:
    """Create tables declared by imported SQLAlchemy models."""

    if engine is None:
        raise RuntimeError("PostgreSQL is not configured. Set DATABASE_URL in backend/.env.")

    Base.metadata.create_all(bind=engine)
    inspector = inspect(engine)
    product_columns = {column["name"] for column in inspector.get_columns("products")}
    if "image_url" not in product_columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE products ADD COLUMN image_url VARCHAR(2048)"))


def get_db() -> Generator[Session, None, None]:
    """Yield a database session and always close it after the request."""

    if engine is None:
        raise RuntimeError("PostgreSQL is not configured. Set DATABASE_URL in backend/.env.")

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ping_database() -> None:
    """Verify PostgreSQL connectivity without exposing connection details."""

    try:
        if engine is None:
            raise RuntimeError("PostgreSQL is not configured. Set DATABASE_URL in backend/.env.")
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except (SQLAlchemyError, RuntimeError) as error:
        raise RuntimeError(
            "PostgreSQL is unavailable. Check the local PostgreSQL service "
            "and DATABASE_URL configuration."
        ) from error
