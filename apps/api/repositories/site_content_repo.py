from models.domain import SiteContent
from repositories.json_repo import read_json, write_json

FILE = "site-content.json"

_DEFAULTS = {
    "tagline": "Handcrafted Jain-friendly dips",
    "description": "No onion, no garlic, no preservatives.",
    "highlights": [],
    "instagram_handle": None,
}


def get() -> SiteContent:
    data = read_json(FILE)
    if isinstance(data, list) or not data:
        return SiteContent(**_DEFAULTS)
    return SiteContent(**{**_DEFAULTS, **data})


def update(partial: dict) -> SiteContent:
    current = get().model_dump()
    current.update({k: v for k, v in partial.items() if v is not None or k == "instagram_handle"})
    write_json(FILE, current)
    return SiteContent(**current)
