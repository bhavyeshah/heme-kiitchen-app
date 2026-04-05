import uuid
from datetime import datetime, timezone
from typing import Optional

from models.domain import Product, ProductStatus
from repositories.json_repo import read_json, write_json

FILE = "products.json"


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def find_all() -> list[Product]:
    return [Product(**p) for p in read_json(FILE)]


def find_active() -> list[Product]:
    return [p for p in find_all() if p.status == ProductStatus.active]


def find_by_id(product_id: str) -> Optional[Product]:
    return next((p for p in find_all() if p.id == product_id), None)


def create(data: dict) -> Product:
    now = _now()
    product = Product(
        id=str(uuid.uuid4()),
        created_at=now,
        updated_at=now,
        **data,
    )
    products = [p.model_dump() for p in find_all()]
    products.append(product.model_dump())
    write_json(FILE, products)
    return product


def update(product_id: str, updates: dict) -> Optional[Product]:
    products = find_all()
    updated = None
    raw = []
    for p in products:
        if p.id == product_id:
            dumped = p.model_dump()
            dumped.update(updates)
            dumped["updated_at"] = _now()
            updated = Product(**dumped)
            raw.append(updated.model_dump())
        else:
            raw.append(p.model_dump())
    if updated:
        write_json(FILE, raw)
    return updated
