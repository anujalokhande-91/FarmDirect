"""Pydantic schemas for the FarmDirect API."""

from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class RegistrationRequest(BaseModel):
    """Payload used to create a customer or farmer account."""

    name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(min_length=1)
    role: Literal["customer", "farmer"]
    phone: str | None = Field(default=None, max_length=32)

    @field_validator("name", "email", mode="before")
    @classmethod
    def strip_text(cls, value: object) -> object:
        """Trim surrounding whitespace before validating text fields."""

        return value.strip() if isinstance(value, str) else value


class RegistrationResponse(BaseModel):
    """Safe representation returned after account creation."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    role: Literal["customer", "farmer"]
    phone: str | None
    created_at: datetime


class LoginRequest(BaseModel):
    """Credentials used to authenticate an existing account."""

    email: EmailStr
    password: str = Field(min_length=1)

    @field_validator("email", mode="before")
    @classmethod
    def strip_email(cls, value: object) -> object:
        """Trim surrounding whitespace before validating the email."""

        return value.strip() if isinstance(value, str) else value


class LoginResponse(BaseModel):
    """Access token and safe account information returned after login."""

    access_token: str
    token_type: str
    user: RegistrationResponse


class ProductCreate(BaseModel):
    """Payload used to create a farmer product."""

    name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    price: Decimal = Field(gt=0, max_digits=10, decimal_places=2)
    unit: str = Field(min_length=1, max_length=64)
    category: str = Field(min_length=1, max_length=100)
    image_url: str | None = Field(default=None, max_length=2048)
    stock: int = Field(ge=0)

    @field_validator("name", "unit", "category", mode="before")
    @classmethod
    def strip_required_text(cls, value: object) -> object:
        return value.strip() if isinstance(value, str) else value

    @field_validator("image_url", mode="before")
    @classmethod
    def strip_image_url(cls, value: object) -> object:
        if not isinstance(value, str):
            return value
        return value.strip() or None


class ProductUpdate(ProductCreate):
    """Payload used to replace a farmer product."""


class FarmerPublicResponse(BaseModel):
    """Public farmer information shown with marketplace products."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


class ProductResponse(ProductCreate):
    """Safe product representation returned by the API."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    farmer_id: int
    created_at: datetime
    updated_at: datetime
    farmer: FarmerPublicResponse


class OrderItemCreate(BaseModel):
    """A requested product and quantity for a new order."""

    product_id: int
    quantity: int = Field(gt=0)


class OrderCreate(BaseModel):
    """Customer checkout payload."""

    delivery_address: str = Field(min_length=1, max_length=500)
    items: list[OrderItemCreate] = Field(min_length=1)

    @field_validator("delivery_address", mode="before")
    @classmethod
    def strip_address(cls, value: object) -> object:
        return value.strip() if isinstance(value, str) else value


class OrderItemResponse(BaseModel):
    """An order item with its product snapshot."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    quantity: int
    price: Decimal
    subtotal: Decimal


class OrderResponse(BaseModel):
    """Customer-facing order representation."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_id: int
    total_amount: Decimal
    status: str
    delivery_address: str
    created_at: datetime
    updated_at: datetime
    items: list[OrderItemResponse]


class OrderStatusUpdate(BaseModel):
    """A requested farmer order status transition."""

    status: Literal[
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "delivered",
        "cancelled",
    ]


class FarmerOrderItemResponse(BaseModel):
    """Order item details visible to the owning farmer."""

    order_id: int
    customer_id: int
    delivery_address: str
    product: ProductResponse
    quantity: int
    price: Decimal
    subtotal: Decimal
    status: str
    created_at: datetime
