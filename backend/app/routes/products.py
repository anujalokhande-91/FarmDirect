"""Product marketplace routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import OrderItem, Product, User
from app.schemas import ProductCreate, ProductResponse, ProductUpdate
from app.security import get_current_farmer

router = APIRouter(prefix="/products", tags=["products"])


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    farmer: User = Depends(get_current_farmer),
) -> Product:
    product = Product(**product_data.model_dump(), farmer_id=farmer.id, farmer=farmer)
    try:
        db.add(product)
        db.commit()
        db.refresh(product)
    except SQLAlchemyError as error:
        db.rollback()
        raise HTTPException(500, "Unable to create the product.") from error
    return product


@router.get("", response_model=list[ProductResponse])
def list_products(db: Session = Depends(get_db)) -> list[Product]:
    return list(
        db.scalars(
            select(Product)
            .options(joinedload(Product.farmer))
            .order_by(Product.created_at.desc())
        ).all()
    )


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)) -> Product:
    product = db.scalars(
        select(Product)
        .where(Product.id == product_id)
        .options(joinedload(Product.farmer))
    ).first()
    if product is None:
        raise HTTPException(404, "Product not found.")
    return product


def _owned_product(product_id: int, farmer: User, db: Session) -> Product:
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(404, "Product not found.")
    if product.farmer_id != farmer.id:
        raise HTTPException(403, "You can only manage your own products.")
    return product


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db),
    farmer: User = Depends(get_current_farmer),
) -> Product:
    product = _owned_product(product_id, farmer, db)
    product.farmer = farmer
    for field, value in product_data.model_dump().items():
        setattr(product, field, value)
    try:
        db.commit()
        db.refresh(product)
    except SQLAlchemyError as error:
        db.rollback()
        raise HTTPException(500, "Unable to update the product.") from error
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    farmer: User = Depends(get_current_farmer),
) -> None:
    product = _owned_product(product_id, farmer, db)
    if db.scalar(select(OrderItem.id).where(OrderItem.product_id == product.id).limit(1)) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This product cannot be deleted because it is part of an existing order.",
        )
    try:
        db.delete(product)
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This product cannot be permanently deleted because it is associated with an existing order.",
        ) from error
    except SQLAlchemyError as error:
        db.rollback()
        raise HTTPException(500, "Unable to delete the product.") from error
