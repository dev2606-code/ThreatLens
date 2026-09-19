import hashlib
import secrets
from typing import Tuple
import os

from datetime import datetime, timedelta, timezone

import jwt

from pwdlib import PasswordHash


SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "development-only-change-this-key",
)

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    return password_hash.verify(
        plain_password,
        hashed_password,
    )


def create_access_token(user_id: int) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES,
    )

    payload = {
        "sub": str(user_id),
        "exp": expires_at,
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )
def generate_one_time_token() -> Tuple[str, str]:
    raw_token = secrets.token_urlsafe(48)
    token_hash = hash_one_time_token(raw_token)

    return raw_token, token_hash


def hash_one_time_token(token: str) -> str:
    return hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()