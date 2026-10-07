"""Customer order and farmer fulfillment routes."""

from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Order, OrderItem, Product, User
from app.schemas import (
    FarmerOrderItemResponse,
    OrderCreate,
    OrderResponse,
    OrderStatusUpdate,
)
from app.security import get_current_customer, get_current_farmer

router = APIRouter(tags=["orders"])
STATUS_ORDER = ("pending", "confirmed", "preparing", "ready", "delivered")


@router.post("/orders", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    customer: User = Depends(get_current_customer),
) -> Order:
    product_ids = [item.product_id for item in order_data.items]
    products = {
        product.id: product
        for product in db.scalars(
            select(Product).where(Product.id.in_(product_ids)).with_for_update()
        ).all()
    }
    missing_id = next((product_id for product_id in product_ids if product_id not in products), None)
    if missing_id is not None:
        db.rollback()
        raise HTTPException(404, f"Product {missing_id} not found.")

    total = Decimal("0.00")
    order_items: list[OrderItem] = []
    for requested_item in order_data.items:
        product = products[requested_item.product_id]
        if requested_item.quantity > product.stock:
            db.rollback()
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                f"Insufficient stock for product {product.id}.",
            )
        subtotal = product.price * requested_item.quantity
        total += subtotal
        product.stock -= requested_item.quantity
        order_items.append(
            OrderItem(
                product=product,
                quantity=requested_item.quantity,
                price=product.price,
                subtotal=subtotal,
            )
        )

    order = Order(
        customer_id=customer.id,
        total_amount=total,
        delivery_address=order_data.delivery_address,
        items=order_items,
    )
    try:
        db.add(order)
        db.commit()
        db.refresh(order)
        return db.scalars(
            select(Order)
            .where(Order.id == order.id)
            .options(joinedload(Order.items))
        ).unique().one()
    except SQLAlchemyError as error:
        db.rollback()
        raise HTTPException(500, "Unable to create the order.") from error


@router.get("/orders", response_model=list[OrderResponse])
def list_customer_orders(
    db: Session = Depends(get_db),
    customer: User = Depends(get_current_customer),
) -> list[Order]:
    return list(
        db.scalars(
            select(Order)
            .where(Order.customer_id == customer.id)
            .options(joinedload(Order.items))
            .order_by(Order.created_at.desc())
        ).unique().all()
    )


@router.get("/orders/{order_id}", response_model=OrderResponse)
def get_customer_order(
    order_id: int,
    db: Session = Depends(get_db),
    customer: User = Depends(get_current_customer),
) -> Order:
    order = db.scalars(
        select(Order).where(Order.id == order_id).options(joinedload(Order.items))
    ).unique().first()
    if order is None:
        raise HTTPException(404, "Order not found.")
    if order.customer_id != customer.id:
        raise HTTPException(403, "You can only access your own orders.")
    return order


@router.get("/farmer/orders", response_model=list[FarmerOrderItemResponse])
def list_farmer_orders(
    db: Session = Depends(get_db),
    farmer: User = Depends(get_current_farmer),
) -> list[dict[str, object]]:
    items = db.scalars(
        select(OrderItem)
        .join(OrderItem.order)
        .join(OrderItem.product)
        .where(Product.farmer_id == farmer.id)
        .options(joinedload(OrderItem.order), joinedload(OrderItem.product))
        .order_by(Order.created_at.desc())
    ).all()
    return [
        {
            "order_id": item.order_id,
            "customer_id": item.order.customer_id,
            "delivery_address": item.order.delivery_address,
            "product": item.product,
            "quantity": item.quantity,
            "price": item.price,
            "subtotal": item.subtotal,
            "status": item.order.status,
            "created_at": item.order.created_at,
        }
        for item in items
    ]


@router.put("/farmer/orders/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    status_data: OrderStatusUpdate,
    db: Session = Depends(get_db),
    farmer: User = Depends(get_current_farmer),
) -> Order:
    order = db.scalars(
        select(Order)
        .where(Order.id == order_id)
        .options(joinedload(Order.items).joinedload(OrderItem.product))
    ).unique().first()
    if order is None:
        raise HTTPException(404, "Order not found.")
    if not any(item.product.farmer_id == farmer.id for item in order.items):
        raise HTTPException(403, "You can only update orders containing your products.")

    current = order.status
    requested = status_data.status
    if requested == "cancelled":
        if current in ("delivered", "cancelled"):
            raise HTTPException(400, "Invalid order status transition.")
    elif current not in STATUS_ORDER or requested not in STATUS_ORDER:
        raise HTTPException(400, "Invalid order status transition.")
    elif STATUS_ORDER.index(requested) != STATUS_ORDER.index(current) + 1:
        raise HTTPException(400, "Invalid order status transition.")

    order.status = requested
    try:
        db.commit()
        db.refresh(order)
    except SQLAlchemyError as error:
        db.rollback()
        raise HTTPException(500, "Unable to update the order status.") from error
    return order
