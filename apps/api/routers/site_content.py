from fastapi import APIRouter, Depends, HTTPException

from middleware.auth import require_admin
from models.domain import PatchSiteContentPayload, SiteContent
from repositories import site_content_repo

router = APIRouter(prefix="/site-content", tags=["site-content"])


@router.get("/", response_model=SiteContent)
def get_site_content():
    return site_content_repo.get()


@router.patch("/", response_model=SiteContent)
def update_site_content(
    payload: PatchSiteContentPayload,
    _: dict = Depends(require_admin),
):
    errors = []
    if payload.tagline is not None:
        if not payload.tagline.strip():
            errors.append("tagline must be a non-empty string")
        elif len(payload.tagline) > 150:
            errors.append("tagline must be 150 characters or fewer")
    if payload.description is not None and len(payload.description) > 500:
        errors.append("description must be 500 characters or fewer")
    if payload.highlights is not None:
        for i, h in enumerate(payload.highlights):
            if len(h) > 80:
                errors.append(f"highlights[{i}] must be 80 characters or fewer")
    if errors:
        raise HTTPException(status_code=400, detail={"errors": errors})

    partial = payload.model_dump(exclude_unset=True)
    if "tagline" in partial:
        partial["tagline"] = partial["tagline"].strip()
    return site_content_repo.update(partial)
