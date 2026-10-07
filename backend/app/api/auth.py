import html
import importlib.util
import logging
import os
from pathlib import Path
import secrets
from sqlalchemy import or_
if importlib.util.find_spec("dotenv") is not None:
    from dotenv import load_dotenv
else:
    def load_dotenv(*args, **kwargs):
        return False

BASE_DIR = Path(__file__).resolve().parents[3]
load_dotenv(BASE_DIR / ".env")
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

from backend.app.core.database import get_database # type: ignore
from backend.app.core.security import (
    ALGORITHM,
    SECRET_KEY,
    create_access_token,
    generate_one_time_token,
    hash_one_time_token,
    hash_password,
    verify_password,
)
from backend.app.models.auth_token import AuthToken
from backend.app.models.user import User
from backend.app.schemas.user import (
    GoogleLoginRequest,
    EmailVerificationRequest,
    ForgotPasswordRequest,
    MessageResponse,
    ResetPasswordRequest,
    TokenResponse,
    UserCreate,
    UserResponse,
)
from backend.app.services.email import send_email


logger = logging.getLogger(__name__)

# IMPORTANT:
# router must be created BEFORE any @router.post / @router.get decorators.
router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login",
)

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:3000",
).rstrip("/")

EMAIL_VERIFICATION_MINUTES = 30
PASSWORD_RESET_MINUTES = 15

GOOGLE_CLIENT_ID = os.getenv(
    "GOOGLE_CLIENT_ID",
    "",
)


# ============================================================
# HELPERS
# ============================================================

def token_has_expired(auth_token: AuthToken) -> bool:
    expires_at = auth_token.expires_at

    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(
            tzinfo=timezone.utc,
        )

    return expires_at <= datetime.now(timezone.utc)


def create_auth_token(
    database: Session,
    user_id: int,
    purpose: str,
    minutes: int,
) -> str:
    raw_token = generate_one_time_token()
    token_hash = hash_one_time_token(raw_token)

    auth_token = AuthToken(
        user_id=user_id,
        token_hash=token_hash,
        purpose=purpose,
        expires_at=datetime.now(timezone.utc)
        + timedelta(minutes=minutes),
    )

    database.add(auth_token)
    database.commit()

    return raw_token


def get_valid_auth_token(
    database: Session,
    raw_token: str,
    purpose: str,
) -> Optional[AuthToken]:

    token_hash = hash_one_time_token(raw_token)

    auth_token = (
        database.query(AuthToken)
        .filter(
            AuthToken.token_hash == token_hash,
            AuthToken.purpose == purpose,
        )
        .first()
    )

    if auth_token is None:
        return None

    if token_has_expired(auth_token):
        return None

    return auth_token


# ============================================================
# REGISTER
# ============================================================

@router.post(
    "/register",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_user(
    user_data: UserCreate,
    database: Session = Depends(get_database),
):
    username = user_data.username.strip()
    email = user_data.email.strip().lower()

    existing_username = (
        database.query(User)
        .filter(User.username == username)
        .first()
    )

    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists.",
        )

    existing_email = (
        database.query(User)
        .filter(User.email == email)
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered.",
        )

    user = User(
        username=username,
        email=email,
        hashed_password=hash_password(user_data.password),
        is_active=False,
    )

    database.add(user)
    database.commit()
    database.refresh(user)

    verification_token = create_auth_token(
        database=database,
        user_id=user.id,
        purpose="email_verification",
        minutes=EMAIL_VERIFICATION_MINUTES,
    )

    verification_url = (
        f"{FRONTEND_URL}/verify-email"
        f"?token={verification_token}"
    )

    email_body = f"""
    <html>
        <body>
            <h2>Verify your ThreatLens account</h2>

            <p>Hello {html.escape(username)},</p>

            <p>
                Thank you for registering with ThreatLens.
                Please verify your email address.
            </p>

            <p>
                <a href="{html.escape(verification_url)}">
                    Verify Email
                </a>
            </p>

            <p>
                This link will expire in
                {EMAIL_VERIFICATION_MINUTES} minutes.
            </p>
        </body>
    </html>
    """

    try:
        send_email(
            to_email=email,
            subject="Verify your ThreatLens account",
            html_body=email_body,
        )
    except Exception as exc:
        logger.exception(
            "Email verification delivery failed: %s",
            exc,
        )

    return {
        "message": "Registration successful. Please verify your email."
    }


# ============================================================
# VERIFY EMAIL
# ============================================================

@router.post(
    "/verify-email",
    response_model=MessageResponse,
)
def verify_email(
    request_data: EmailVerificationRequest,
    database: Session = Depends(get_database),
):
    auth_token = get_valid_auth_token(
        database=database,
        raw_token=request_data.token,
        purpose="email_verification",
    )

    if auth_token is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification link is invalid or expired.",
        )

    user = database.get(
        User,
        auth_token.user_id,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    user.is_active = True

    database.delete(auth_token)
    database.commit()

    return {
        "message": "Email verified successfully."
    }


# ============================================================
# FORGOT PASSWORD
# ============================================================

@router.post(
    "/forgot-password",
    response_model=MessageResponse,
)
def forgot_password(
    request_data: ForgotPasswordRequest,
    database: Session = Depends(get_database),
):
    email = request_data.email.strip().lower()

    user = (
        database.query(User)
        .filter(User.email == email)
        .first()
    )

    # Do not reveal whether the email exists.
    if user is None:
        return {
            "message": "If the account exists, a password reset link has been sent."
        }

    reset_token = create_auth_token(
        database=database,
        user_id=user.id,
        purpose="password_reset",
        minutes=PASSWORD_RESET_MINUTES,
    )

    reset_url = (
        f"{FRONTEND_URL}/reset-password"
        f"?token={reset_token}"
    )

    email_body = f"""
    <html>
        <body>
            <h2>Reset your ThreatLens password</h2>

            <p>
                We received a request to reset your
                ThreatLens account password.
            </p>

            <p>
                <a href="{html.escape(reset_url)}">
                    Reset Password
                </a>
            </p>

            <p>
                This link will expire in
                {PASSWORD_RESET_MINUTES} minutes.
            </p>

            <p>
                If you did not request this,
                you can safely ignore this email.
            </p>
        </body>
    </html>
    """

    try:
        send_email(
            to_email=email,
            subject="Reset your ThreatLens password",
            html_body=email_body,
        )
    except Exception as exc:
        logger.exception(
            "Password reset email delivery failed: %s",
            exc,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password reset email could not be sent.",
        )

    return {
        "message": "If the account exists, a password reset link has been sent."
    }


# ============================================================
# RESET PASSWORD
# ============================================================

@router.post(
    "/reset-password",
    response_model=MessageResponse,
)
def reset_password(
    request_data: ResetPasswordRequest,
    database: Session = Depends(get_database),
):
    auth_token = get_valid_auth_token(
        database=database,
        raw_token=request_data.token,
        purpose="password_reset",
    )

    if auth_token is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reset link is invalid or expired.",
        )

    if len(request_data.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters.",
        )

    user = database.get(
        User,
        auth_token.user_id,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    user.hashed_password = hash_password(
        request_data.new_password
    )

    database.delete(auth_token)
    database.commit()

    return {
        "message": "Your password has been reset successfully."
    }


# ============================================================
# GOOGLE LOGIN
# ============================================================

@router.post(
    "/google",
    response_model=TokenResponse,
)
def google_login(
    request_data: GoogleLoginRequest,
    database: Session = Depends(get_database),
):
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google authentication is not configured.",
        )

    try:
        google_user = id_token.verify_oauth2_token(
            request_data.credential,
            google_requests.Request(),
            GOOGLE_CLIENT_ID,
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google credential.",
        )

    google_email = google_user.get("email")

    if not google_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account email was not provided.",
        )

    google_email = google_email.strip().lower()

    user = (
        database.query(User)
        .filter(User.email == google_email)
        .first()
    )

    if user is None:
        google_name = (
            google_user.get("name")
            or google_email.split("@")[0]
        )

        username = google_name.strip()

        existing_username = (
            database.query(User)
            .filter(User.username == username)
            .first()
        )

        if existing_username:
            username = (
                google_email.split("@")[0]
            )

        user = User(
            username=username,
            email=google_email,
            hashed_password=hash_password(
    secrets.token_urlsafe(32)
),
            is_active=True,
        )

        database.add(user)
        database.commit()
        database.refresh(user)

    else:
        if not user.is_active:
            user.is_active = True
            database.commit()

    token = create_access_token(user.id)

    return {
        "access_token": token,
        "token_type": "bearer",
    }

# ============================================================
# GUEST LOGIN
# ============================================================

@router.post(
    "/guest",
    response_model=TokenResponse,
)
def guest_login(
    database: Session = Depends(get_database),
):
    guest_id = secrets.token_hex(6)

    username = f"guest_{guest_id}"
    email = f"{username}@guest.threatlens.local"

    user = User(
        username=username,
        email=email,
        hashed_password=hash_password(
            secrets.token_urlsafe(32)
        ),
        is_active=True,
        is_guest=True,
    )

    database.add(user)
    database.commit()
    database.refresh(user)

    token = create_access_token(user.id)

    return {
        "access_token": token,
        "token_type": "bearer",
    }
# ============================================================
# CHANGE PASSWORD
# ============================================================

@router.post(
    "/change-password",
    response_model=MessageResponse,
)
def change_password(
    current_password: str,
    new_password: str,
    database: Session = Depends(get_database),
    current_user: User = Depends(
        lambda token=Depends(oauth2_scheme),
        database=Depends(get_database): get_current_user(
            token,
            database,
        )
    ),
):
    if not verify_password(
        current_password,
        current_user.hashed_password,
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )

    if len(new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters.",
        )

    current_user.hashed_password = hash_password(
        new_password
    )

    database.commit()

    return {
        "message": "Password changed successfully."
    }
# ============================================================
# LOGIN
# ============================================================

@router.post(
    "/login",
    response_model=TokenResponse,
)
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    database: Session = Depends(get_database),
):
    login_value = form_data.username.strip().lower()

    user = (
        database.query(User)
        .filter(
            or_(
                User.username.ilike(login_value),
                User.email.ilike(login_value),
            )
        )
        .first()
    )

    if not user or not verify_password(
        form_data.password,
        user.hashed_password,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Verify your email before signing in",
        )

    token = create_access_token(user.id)

    return {
        "access_token": token,
        "token_type": "bearer",
    }




# ============================================================
# CURRENT USER
# ============================================================
def get_current_user(
    token: str = Depends(oauth2_scheme),
    database: Session = Depends(get_database),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={
            "WWW-Authenticate": "Bearer"
        },
    )

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise credentials_exception

        user_id = int(user_id)

    except (
        jwt.PyJWTError,
        ValueError,
        TypeError,
    ):
        raise credentials_exception

    user = database.get(
        User,
        user_id,
    )

    if user is None:
        raise credentials_exception

    return user


# ============================================================
# CURRENT USER ENDPOINT
# ============================================================

@router.get(
    "/me",
    response_model=UserResponse,
)
def read_current_user(
    token: str = Depends(oauth2_scheme),
    database: Session = Depends(get_database),
):
    return get_current_user(
        token,
        database,
    )