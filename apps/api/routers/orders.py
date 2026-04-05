import asyncio
import re
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request

from middleware.auth import get_optional_admin, require_admin
from models.domain import (
    CreateOrderPayload,
    DeliveryType,
    Order,
    OrderItem,
    OrderSource,
    OrderStatus,
    PatchOrderPayload,
    PaymentMethod,
    PaymentStatus,
)
from repositories import order_repo, product_repo
from services import whatsapp

router = APIRouter(prefix="/orders", tags=["orders"])

TERMINAL_STATUSES = {OrderStatus.completed, OrderStatus.cancelled, OrderStatus.declined}
VALID_STATUSES = list(OrderStatus)


def _validate_indian_phone(phone: str) -> bool:
    return bool(re.match(r"^[6-9]\d{9}$", phone))


def _normalize_phone(phone: str) -> str:
    return f"+91{phone}"


def _calc_delivery_charges(delivery_type: DeliveryType, total_price: float) -> bool:
    if delivery_type == DeliveryType.pickup:
        return False
    return total_price <= 1500


# ── GET /api/orders — admin only ──────────────────────────────────────────────

@router.get("", response_model=list[Order])
def get_orders(
    source: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    payment_status: Optional[str] = Query(None),
    delivery_type: Optional[str] = Query(None),
    deleted: Optional[str] = Query(None),
    _: dict = Depends(require_admin),
):
    orders = order_repo.find_all()

    if deleted == "true":
        orders = [o for o in orders if o.deleted]
    else:
        orders = [o for o in orders if not o.deleted]

    if source:
        orders = [o for o in orders if o.source == source]
    if status:
        orders = [o for o in orders if o.status == status]
    if payment_status:
        orders = [o for o in orders if o.payment_status == payment_status]
    if delivery_type:
        orders = [o for o in orders if o.delivery_type == delivery_type]

    orders.sort(key=lambda o: o.created_at, reverse=True)
    return orders


# ── GET /api/orders/{id} — admin only ────────────────────────────────────────

@router.get("/{order_id}", response_model=Order)
def get_order(order_id: str, _: dict = Depends(require_admin)):
    order = order_repo.find_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


# ── POST /api/orders — public or admin ───────────────────────────────────────

@router.post("", response_model=Order, status_code=201)
async def create_order(
    payload: CreateOrderPayload,
    request: Request,
    is_admin: bool = Depends(get_optional_admin),
):
    errors = []

    if not payload.customer_name or not payload.customer_name.strip():
        errors.append("customer_name is required")

    if not payload.phone or not _validate_indian_phone(payload.phone):
        errors.append("phone must be a valid 10-digit Indian mobile number (starting with 6-9)")

    if payload.delivery_type == DeliveryType.home_delivery and not (payload.delivery_address or "").strip():
        errors.append("delivery_address is required for home delivery")

    if payload.payment_method == PaymentMethod.COD and payload.delivery_type == DeliveryType.home_delivery:
        errors.append("COD is only available for pickup orders; use UPI for home delivery")

    if not payload.items:
        errors.append("items must be a non-empty array")

    if payload.special_instructions and len(payload.special_instructions) > 500:
        errors.append("special_instructions must be 500 characters or fewer")

    if errors:
        raise HTTPException(status_code=400, detail={"errors": errors})

    # Validate and snapshot items
    all_products = product_repo.find_all()
    snapshot_items: list[OrderItem] = []
    item_errors = []

    for item in payload.items:
        product_id = item.get("product_id")
        quantity = item.get("quantity")
        if not product_id or not isinstance(quantity, int) or quantity < 1:
            item_errors.append(f"invalid item: {item}")
            continue
        product = next((p for p in all_products if p.id == product_id), None)
        if not product:
            item_errors.append(f"product {product_id} not found")
        elif product.status != "active":
            item_errors.append(f"product {product_id} is not available")
        else:
            snapshot_items.append(OrderItem(
                product_id=product.id,
                name=product.name,
                unit_price=product.price,
                quantity=quantity,
            ))

    if item_errors:
        raise HTTPException(status_code=400, detail={"errors": item_errors})

    total_price = sum(i.unit_price * i.quantity for i in snapshot_items)
    source = OrderSource.offline if is_admin else OrderSource.online

    order = order_repo.create({
        "source": source,
        "status": OrderStatus.pending,
        "items": [i.model_dump() for i in snapshot_items],
        "total_price": total_price,
        "customer_name": payload.customer_name.strip(),
        "phone": _normalize_phone(payload.phone),
        "delivery_type": payload.delivery_type,
        "delivery_address": payload.delivery_address.strip() if payload.delivery_type == DeliveryType.home_delivery and payload.delivery_address else None,
        "delivery_charges_applicable": _calc_delivery_charges(payload.delivery_type, total_price),
        "payment_method": payload.payment_method,
        "payment_status": PaymentStatus.unpaid,
        "special_instructions": payload.special_instructions.strip() if payload.special_instructions else None,
        "deleted": False,
        "deleted_at": None,
    })

    asyncio.create_task(whatsapp.send_order_placed(order.customer_name, order.phone))
    return order


# ── PATCH /api/orders/{id} — admin only ──────────────────────────────────────

@router.patch("/{order_id}", response_model=Order)
async def update_order(
    order_id: str,
    payload: PatchOrderPayload,
    _: dict = Depends(require_admin),
):
    order = order_repo.find_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.deleted:
        raise HTTPException(status_code=400, detail="Cannot update a deleted order")

    errors = []

    if payload.status is not None:
        if order.status in TERMINAL_STATUSES:
            errors.append(f"cannot update status of a {order.status} order")
        elif payload.status == OrderStatus.declined and order.status != OrderStatus.pending:
            errors.append("only pending orders can be declined")
        elif payload.status == OrderStatus.cancelled and order.status == OrderStatus.pending:
            errors.append("pending orders must be declined, not cancelled")

    is_field_edit = any(
        getattr(payload, f) is not None
        for f in ("items", "customer_name", "phone", "delivery_type", "delivery_address", "payment_method", "special_instructions")
    )
    if is_field_edit and order.status in TERMINAL_STATUSES:
        errors.append("cannot edit a terminal order")

    if payload.phone is not None and not _validate_indian_phone(payload.phone):
        errors.append("phone must be a valid 10-digit Indian mobile number")

    if payload.payment_status is not None and payload.status is None:
        pass  # payment_status standalone update is valid

    if errors:
        raise HTTPException(status_code=400, detail={"errors": errors})

    updates = {}
    if payload.status is not None:
        updates["status"] = payload.status
    if payload.payment_status is not None:
        updates["payment_status"] = payload.payment_status
    if payload.customer_name is not None:
        updates["customer_name"] = payload.customer_name.strip()
    if payload.phone is not None:
        updates["phone"] = _normalize_phone(payload.phone)
    if payload.delivery_type is not None:
        updates["delivery_type"] = payload.delivery_type
    if payload.delivery_address is not None:
        updates["delivery_address"] = payload.delivery_address or None
    if payload.payment_method is not None:
        updates["payment_method"] = payload.payment_method
    if payload.special_instructions is not None:
        updates["special_instructions"] = payload.special_instructions.strip() or None

    if payload.items is not None:
        all_products = product_repo.find_all()
        snapshot_items = []
        for item in payload.items:
            product = next((p for p in all_products if p.id == item.get("product_id")), None)
            if not product:
                raise HTTPException(status_code=400, detail={"errors": [f"product {item.get('product_id')} not found"]})
            snapshot_items.append(OrderItem(
                product_id=product.id,
                name=product.name,
                unit_price=product.price,
                quantity=item["quantity"],
            ))
        updates["items"] = [i.model_dump() for i in snapshot_items]
        updates["total_price"] = sum(i.unit_price * i.quantity for i in snapshot_items)

    # Recalculate delivery charges if relevant fields changed
    delivery_type = updates.get("delivery_type", order.delivery_type)
    total_price = updates.get("total_price", order.total_price)
    if "items" in updates or "delivery_type" in updates:
        updates["delivery_charges_applicable"] = _calc_delivery_charges(delivery_type, total_price)

    old_status = order.status
    updated = order_repo.update(order_id, updates)

    if updated and payload.status is not None and payload.status != old_status:
        new_status = payload.status
        if new_status == OrderStatus.completed:
            asyncio.create_task(whatsapp.send_order_completed(updated.customer_name, updated.phone, old_status, new_status))
        elif new_status == OrderStatus.cancelled:
            asyncio.create_task(whatsapp.send_order_cancelled(updated.customer_name, updated.phone))
        elif new_status in (OrderStatus.confirmed, OrderStatus.dispatched, OrderStatus.declined):
            asyncio.create_task(whatsapp.send_order_status_update(updated.customer_name, updated.phone, old_status, new_status))

    return updated


# ── DELETE /api/orders/{id} — admin only (soft delete) ───────────────────────

@router.delete("/{order_id}", response_model=Order)
def delete_order(order_id: str, _: dict = Depends(require_admin)):
    from datetime import datetime, timezone
    order = order_repo.find_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order_repo.update(order_id, {
        "deleted": True,
        "deleted_at": datetime.now(timezone.utc).isoformat(),
    })
