import logging
import os
from io import BytesIO

import cloudinary
import cloudinary.uploader

logger = logging.getLogger(__name__)


def _configure():
    cloudinary.config(
        cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
        api_key=os.getenv("CLOUDINARY_API_KEY"),
        api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    )


async def upload_image(file_bytes: bytes, mime_type: str) -> tuple[str, str]:
    _configure()
    result = cloudinary.uploader.upload(
        BytesIO(file_bytes),
        folder="heme-kiitchen/products",
        resource_type="image",
    )
    return result["secure_url"], result["public_id"]


async def delete_image(public_id: str) -> None:
    _configure()
    try:
        cloudinary.uploader.destroy(public_id)
    except Exception as exc:
        logger.error("[Cloudinary] Failed to delete asset %s: %s", public_id, exc)
