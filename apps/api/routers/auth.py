import os

from fastapi import APIRouter, HTTPException, status

from middleware.auth import create_access_token, get_optional_admin
from models.domain import AdminStatusResponse, LoginPayload, TokenResponse
from fastapi import Depends

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginPayload):
    admin_secret = os.getenv("ADMIN_SECRET")
    if not admin_secret:
        raise HTTPException(status_code=500, detail="ADMIN_SECRET not configured")
    if payload.password != admin_secret:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password",
        )
    token = create_access_token({"sub": "admin"})
    return TokenResponse(access_token=token)


@router.post("/logout")
def logout():
    return {"success": True}


@router.get("/me", response_model=AdminStatusResponse)
def me(is_admin: bool = Depends(get_optional_admin)):
    return AdminStatusResponse(isAdmin=is_admin)
