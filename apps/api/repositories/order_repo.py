import uuid
from datetime import datetime, timezone
from typing import Optional

from models.domain import Order
from repositories.json_repo import read_json, write_json

FILE = "orders.json"


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def find_all() -> list[Order]:
    return [Order(**o) for o in read_json(FILE)]


def find_by_id(order_id: str) -> Optional[Order]:
    return next((o for o in find_all() if o.id == order_id), None)


def create(data: dict) -> Order:
    now = _now()
    order = Order(
        id=str(uuid.uuid4()),
        created_at=now,
        updated_at=now,
        **data,
    )
    orders = [o.model_dump() for o in find_all()]
    orders.append(order.model_dump())
    write_json(FILE, orders)
    return order


def update(order_id: str, updates: dict) -> Optional[Order]:
    orders = find_all()
    updated = None
    raw = []
    for o in orders:
        if o.id == order_id:
            dumped = o.model_dump()
            dumped.update(updates)
            dumped["updated_at"] = _now()
            updated = Order(**dumped)
            raw.append(updated.model_dump())
        else:
            raw.append(o.model_dump())
    if updated:
        write_json(FILE, raw)
    return updated
