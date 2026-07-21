"""
backend/app/routers/auth.py — Login endpoint.
"""

from fastapi import APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import Depends

from backend.app.auth import authenticate_user, create_access_token, TokenResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    OAuth2PasswordRequestForm expects 'username' and 'password' fields
    (form-encoded, not JSON) — this is what the FastAPI auto-docs
    "Authorize" button expects natively, and what most frontend HTTP
    clients' standard login flow expects too. Frontend should send
    email as 'username'.
    """
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    access_token = create_access_token(subject=user["email"])
    return TokenResponse(access_token=access_token)