from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from middleware.auth import get_optional_admin, require_admin
from models.domain import Product, ProductStatus
from repositories import product_repo
from services import cloudinary_service

router = APIRouter(prefix="/products", tags=["products"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"}


@router.get("", response_model=list[Product])
def get_products(is_admin: bool = Depends(get_optional_admin)):
    if is_admin:
        return product_repo.find_all()
    return product_repo.find_active()


@router.get("/{product_id}", response_model=Product)
def get_product(product_id: str):
    product = product_repo.find_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("", response_model=Product, status_code=201)
async def create_product(
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    image: UploadFile = File(...),
    _: dict = Depends(require_admin),
):
    errors = []
    if not name.strip():
        errors.append("name is required")
    if not description.strip():
        errors.append("description is required")
    if price <= 0:
        errors.append("price must be a positive number")
    if image.content_type not in ALLOWED_IMAGE_TYPES:
        errors.append("image must be a valid image type (jpeg, png, webp, gif, avif)")
    if errors:
        raise HTTPException(status_code=400, detail={"errors": errors})

    file_bytes = await image.read()
    try:
        url, public_id = await cloudinary_service.upload_image(file_bytes, image.content_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to upload image")

    return product_repo.create({
        "name": name.strip(),
        "description": description.strip(),
        "price": price,
        "image_path": url,
        "cloudinary_public_id": public_id,
        "status": ProductStatus.active,
    })


@router.patch("/{product_id}", response_model=Product)
async def update_product(
    product_id: str,
    name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    price: Optional[float] = Form(None),
    status: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    _: dict = Depends(require_admin),
):
    product = product_repo.find_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    errors = []
    if name is not None and not name.strip():
        errors.append("name must be a non-empty string")
    if price is not None and price <= 0:
        errors.append("price must be a positive number")
    if status is not None and status not in ("active", "inactive"):
        errors.append('status must be "active" or "inactive"')
    if image and image.content_type not in ALLOWED_IMAGE_TYPES:
        errors.append("image must be a valid image type")
    if errors:
        raise HTTPException(status_code=400, detail={"errors": errors})

    updates = {}
    if name is not None:
        updates["name"] = name.strip()
    if description is not None:
        updates["description"] = description.strip()
    if price is not None:
        updates["price"] = price
    if status is not None:
        updates["status"] = ProductStatus(status)

    if image:
        file_bytes = await image.read()
        try:
            url, public_id = await cloudinary_service.upload_image(file_bytes, image.content_type)
        except Exception:
            raise HTTPException(status_code=500, detail="Failed to upload image")
        # Delete old Cloudinary asset
        if product.cloudinary_public_id:
            await cloudinary_service.delete_image(product.cloudinary_public_id)
        updates["image_path"] = url
        updates["cloudinary_public_id"] = public_id

    return product_repo.update(product_id, updates)
