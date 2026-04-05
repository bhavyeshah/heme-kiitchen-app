from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, field_validator


# ─── Enums ───────────────────────────────────────────────────────────────────

class ProductStatus(str, Enum):
    active = "active"
    inactive = "inactive"


class OrderSource(str, Enum):
    online = "online"
    offline = "offline"


class OrderStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    preparing = "preparing"
    dispatched = "dispatched"
    completed = "completed"
    cancelled = "cancelled"
    declined = "declined"


class DeliveryType(str, Enum):
    pickup = "pickup"
    home_delivery = "home_delivery"


class PaymentMethod(str, Enum):
    COD = "COD"
    UPI = "UPI"


class PaymentStatus(str, Enum):
    unpaid = "unpaid"
    paid = "paid"
    refunded = "refunded"


# ─── Site Content ─────────────────────────────────────────────────────────────

class SiteContent(BaseModel):
    tagline: str
    description: str
    highlights: list[str]
    instagram_handle: Optional[str] = None


class PatchSiteContentPayload(BaseModel):
    tagline: Optional[str] = None
    description: Optional[str] = None
    highlights: Optional[list[str]] = None
    instagram_handle: Optional[str] = None


# ─── Product ──────────────────────────────────────────────────────────────────

class Product(BaseModel):
    id: str
    name: str
    description: str
    price: float
    image_path: str           # Cloudinary CDN URL
    cloudinary_public_id: str
    status: ProductStatus
    created_at: str           # ISO 8601
    updated_at: str           # ISO 8601


class CreateProductPayload(BaseModel):
    name: str
    description: str
    price: float
    status: ProductStatus = ProductStatus.active


class PatchProductPayload(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    status: Optional[ProductStatus] = None


# ─── Order ────────────────────────────────────────────────────────────────────

class OrderItem(BaseModel):
    product_id: str
    name: str         # snapshot at order creation
    unit_price: float # snapshot at order creation
    quantity: int


class Order(BaseModel):
    id: str
    source: OrderSource
    status: OrderStatus
    items: list[OrderItem]
    total_price: float
    customer_name: str
    phone: str                          # stored as +91XXXXXXXXXX
    delivery_type: DeliveryType
    delivery_address: Optional[str]     # required for home_delivery, None for pickup
    delivery_charges_applicable: bool
    payment_method: PaymentMethod
    payment_status: PaymentStatus
    special_instructions: Optional[str] # max 500 chars
    deleted: bool
    deleted_at: Optional[str]           # ISO 8601 or None
    created_at: str                     # ISO 8601
    updated_at: str                     # ISO 8601


class CreateOrderPayload(BaseModel):
    customer_name: str
    phone: str
    delivery_type: DeliveryType
    delivery_address: Optional[str] = None
    payment_method: PaymentMethod
    items: list[dict]
    special_instructions: Optional[str] = None

    @field_validator("special_instructions")
    @classmethod
    def check_instructions_length(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and len(v) > 500:
            raise ValueError("special_instructions must be 500 characters or fewer")
        return v


class PatchOrderPayload(BaseModel):
    status: Optional[OrderStatus] = None
    payment_status: Optional[PaymentStatus] = None
    items: Optional[list[dict]] = None
    customer_name: Optional[str] = None
    phone: Optional[str] = None
    delivery_type: Optional[DeliveryType] = None
    delivery_address: Optional[str] = None
    payment_method: Optional[PaymentMethod] = None
    special_instructions: Optional[str] = None


# ─── Auth ─────────────────────────────────────────────────────────────────────

class LoginPayload(BaseModel):
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AdminStatusResponse(BaseModel):
    isAdmin: bool
