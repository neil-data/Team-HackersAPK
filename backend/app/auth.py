"""
backend/app/auth.py — Custom JWT authentication.

No third-party auth provider (Firebase, Auth0) per the team's earlier
decision — this is a minimal, hand-rolled JWT flow. Good enough for
demo purposes; for real production use you'd want to add refresh
tokens, rate limiting on /login, and a real user database instead of
the hardcoded demo credential below.
"""

import os
from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel

SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev-only-secret-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8  # 8-hour shift-length token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenPayload(BaseModel):
    sub: str
    exp: datetime


def _hash_password(plain_password: str) -> str:
    return bcrypt.hashpw(plain_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


# --- Demo user store ---
# TODO: replace with a real users table once Postgres is wired up.
_DEMO_USERS = {
    "investigator@cybercell.gov.in": {
        "hashed_password": _hash_password("sentinelscan123"),
        "full_name": "Demo Investigator",
    }
}


def authenticate_user(email: str, password: str) -> Optional[dict]:
    user = _DEMO_USERS.get(email)
    if not user or not verify_password(password, user["hashed_password"]):
        return None
    return {"email": email, "full_name": user["full_name"]}


def create_access_token(subject: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": subject, "exp": expire}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    """Dependency for protected routes: raises 401 if token invalid/expired."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        return email
    except JWTError:
        raise credentials_exception