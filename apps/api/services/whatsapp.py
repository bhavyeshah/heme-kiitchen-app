import logging
import os

import httpx

logger = logging.getLogger(__name__)

GRAPH_API_VERSION = "v18.0"


async def send_template(phone: str, template_name: str, components: list) -> None:
    token = os.getenv("WHATSAPP_ACCESS_TOKEN")
    phone_number_id = os.getenv("WHATSAPP_PHONE_NUMBER_ID")

    if not token:
        logger.warning("[WhatsApp] WHATSAPP_ACCESS_TOKEN not set — skipping notification")
        return
    if not phone_number_id:
        logger.warning("[WhatsApp] WHATSAPP_PHONE_NUMBER_ID not set — skipping notification")
        return

    url = f"https://graph.facebook.com/{GRAPH_API_VERSION}/{phone_number_id}/messages"
    payload = {
        "messaging_product": "whatsapp",
        "to": phone,
        "type": "template",
        "template": {
            "name": template_name,
            "language": {"code": "en"},
            "components": components,
        },
    }

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                url,
                json=payload,
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                },
                timeout=10.0,
            )
            resp.raise_for_status()
        logger.info("[WhatsApp] Sent %s to %s", template_name, phone)
    except Exception as exc:
        logger.error("[WhatsApp] Failed to send %s to %s: %s", template_name, phone, exc)


async def send_order_placed(customer_name: str, phone: str) -> None:
    await send_template(phone, "order_placed", [
        {"type": "body", "parameters": [{"type": "text", "text": customer_name}]},
    ])


async def send_order_status_update(
    customer_name: str, phone: str, old_status: object, new_status: object
) -> None:
    await send_template(phone, "order_status_update", [
        {"type": "body", "parameters": [
            {"type": "text", "text": customer_name},
            {"type": "text", "text": str(old_status.value if hasattr(old_status, "value") else old_status)},
            {"type": "text", "text": str(new_status.value if hasattr(new_status, "value") else new_status)},
        ]},
    ])


async def send_order_completed(
    customer_name: str, phone: str, old_status: object, new_status: object
) -> None:
    await send_template(phone, "order_completed", [
        {"type": "body", "parameters": [
            {"type": "text", "text": customer_name},
            {"type": "text", "text": str(old_status.value if hasattr(old_status, "value") else old_status)},
            {"type": "text", "text": str(new_status.value if hasattr(new_status, "value") else new_status)},
        ]},
    ])


async def send_order_cancelled(customer_name: str, phone: str) -> None:
    await send_template(phone, "order_cancelled", [
        {"type": "body", "parameters": [{"type": "text", "text": customer_name}]},
    ])
