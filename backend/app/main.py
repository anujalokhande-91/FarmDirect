"""Application entry point for the FarmDirect FastAPI backend."""

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import initialize_database, ping_database
from app.models import Order, OrderItem, Product, User  # noqa: F401
from app.routes.auth import router as auth_router
from app.routes.orders import router as orders_router
from app.routes.products import router as products_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Initialize SQLAlchemy metadata before serving requests."""

    initialize_database()
    yield

app = FastAPI(
    title=settings.app_name,
    description=settings.app_description,
    version=settings.app_version,
    lifespan=lifespan,
)

# Keep the development origins explicit until deployment configuration exists.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(products_router)
app.include_router(orders_router)


@app.get("/")
def read_root() -> dict[str, str]:
    """Return a simple message confirming that the API is running."""

    return {"message": "FarmDirect API is running"}


@app.get("/health")
def health_check() -> dict[str, str]:
    """Return the service health status for local checks and future monitoring."""

    return {"status": "healthy"}


@app.get("/database/health")
def database_health_check() -> dict[str, str]:
    """Check PostgreSQL connectivity without exposing connection details."""

    try:
        ping_database()
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error

    return {"status": "healthy", "database": "connected"}