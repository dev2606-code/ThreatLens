import html
import os
from datetime import datetime, timedelta, timezone
from typing import Optional
import logging
import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import (
    OAuth2PasswordBearer,
    OAuth2PasswordRequestForm,
)
from sqlalchemy.orm import Session
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from backend.app.core.database import get_database
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

def token_has_expired(auth_token: AuthToken) -> bool:
    expires_at = auth_token.expires_at

    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(
            tzinfo=timezone.utc,
        )

    return expires_at <= datetime.now(timezone.utc)


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
    email = str(user_data.email).strip().lower()

    existing_username = (
        database.query(User)
        .filter(User.username == username)
        .first()
    )

    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists",
        )

    existing_email = (
        database.query(User)
        .filter(User.email == email)
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already exists",
        )

    user = User(
        username=username,
        email=email,
        hashed_password=hash_password(
            user_data.password,
        ),
        is_active=False,
    )

    database.add(user)
    database.commit()
    database.refresh(user)

    raw_token, token_hash = generate_one_time_token()

    verification_token = AuthToken(
        user_id=user.id,
        token_hash=token_hash,
        purpose="email_verification",
        expires_at=(
            datetime.now(timezone.utc)
            + timedelta(
                minutes=EMAIL_VERIFICATION_MINUTES,
            )
        ),
    )

    database.add(verification_token)
    database.commit()

    verification_url = (
        f"{FRONTEND_URL}/verify-email"
        f"?token={raw_token}"
    )

    safe_username = html.escape(user.username)
    safe_url = html.escape(
        verification_url,
        quote=True,
    )

    email_content = f"""
    <div style="font-family:Arial,sans-serif;
                max-width:560px;margin:auto;
                padding:32px;background:#080c14;
                color:#e2e8f0;border-radius:16px;">
      <h2 style="color:#a78bfa;">
        Verify your ThreatLens account
      </h2>

      <p>Hello {safe_username},</p>

      <p>
        Confirm your email address to activate your
        ThreatLens account.
      </p>

      <a href="{safe_url}"
         style="display:inline-block;
                margin:20px 0;padding:12px 20px;
                background:#7c3aed;color:white;
                text-decoration:none;border-radius:10px;">
        Verify email
      </a>

      <p style="font-size:12px;color:#64748b;">
        This link expires in 30 minutes.
      </p>
    </div>
    """

    try:
        send_email(
            recipient=user.email,
            subject="Verify your ThreatLens account",
            html_content=email_content,
        )

    except Exception as error:
        logger.exception(
            "Verification email delivery failed: %s",
            type(error).__name__,
        )

        database.delete(verification_token)
        database.delete(user)
        database.commit()

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Verification email could not be sent",
        ) from error

    return {
        "message": (
            "Account created. Check your email "
            "to activate it."
        ),
    }

@router.post(
    "/verify-email",
    response_model=MessageResponse,
)
def verify_email(
    request_data: EmailVerificationRequest,
    database: Session = Depends(get_database),
):
    token_hash = hash_one_time_token(
        request_data.token,
    )

    auth_token = (
        database.query(AuthToken)
        .filter(
            AuthToken.token_hash == token_hash,
            AuthToken.purpose == "email_verification",
            AuthToken.used_at.is_(None),
        )
        .first()
    )

    if auth_token is None or token_has_expired(
        auth_token
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification link is invalid or expired",
        )

    user = database.get(
        User,
        auth_token.user_id,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    user.is_active = True
    auth_token.used_at = datetime.now(timezone.utc)

    database.commit()

    return {
        "message": "Email verified successfully",
    }
@router.post(
    "/forgot-password",
    response_model=MessageResponse,
)
def forgot_password(
    request_data: ForgotPasswordRequest,
    database: Session = Depends(get_database),
):
    email = str(request_data.email).strip().lower()

    user = (
        database.query(User)
        .filter(User.email == email)
        .first()
    )

    # Always return the same message so the endpoint
    # does not reveal whether an email is registered.
    success_message = (
        "If an account with that email exists, "
        "a password reset link has been sent."
    )

    if user is None:
        return {"message": success_message}

    raw_token, token_hash = generate_one_time_token()

    reset_token = AuthToken(
        user_id=user.id,
        token_hash=token_hash,
        purpose="password_reset",
        expires_at=(
            datetime.now(timezone.utc)
            + timedelta(
                minutes=PASSWORD_RESET_MINUTES,
            )
        ),
    )

    database.add(reset_token)
    database.commit()

    reset_url = (
        f"{FRONTEND_URL}/reset-password"
        f"?token={raw_token}"
    )

    safe_username = html.escape(user.username)
    safe_url = html.escape(
        reset_url,
        quote=True,
    )

    email_content = f"""
    <div style="font-family:Arial,sans-serif;
                max-width:560px;margin:auto;
                padding:32px;background:#080c14;
                color:#e2e8f0;border-radius:16px;">
      <h2 style="color:#a78bfa;">
        Reset your ThreatLens password
      </h2>

      <p>Hello {safe_username},</p>

      <p>
        We received a request to reset your
        ThreatLens account password.
      </p>

      <a href="{safe_url}"
         style="display:inline-block;
                margin:20px 0;padding:12px 20px;
                background:#7c3aed;color:white;
                text-decoration:none;border-radius:10px;">
        Reset password
      </a>

      <p style="font-size:12px;color:#64748b;">
        This link expires in 15 minutes and can
        only be used once.
      </p>
    </div>
    """

    try:
        send_email(
            recipient=user.email,
            subject="Reset your ThreatLens password",
            html_content=email_content,
        )
    except Exception as error:
        logger.exception(
            "Password reset email delivery failed: %s",
            type(error).__name__,
        )

        database.delete(reset_token)
        database.commit()

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Password reset email could not be sent",
        ) from error

    return {"message": success_message}


@router.post(
    "/reset-password",
    response_model=MessageResponse,
)
def reset_password(
    request_data: ResetPasswordRequest,
    database: Session = Depends(get_database),
):
    token_hash = hash_one_time_token(
        request_data.token,
    )

    auth_token = (
        database.query(AuthToken)
        .filter(
            AuthToken.token_hash == token_hash,
            AuthToken.purpose == "password_reset",
            AuthToken.used_at.is_(None),
        )
        .first()
    )

    if auth_token is None or token_has_expired(
        auth_token
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reset link is invalid or expired",
        )

    user = database.get(
        User,
        auth_token.user_id,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    user.hashed_password = hash_password(
        request_data.new_password,
    )

    auth_token.used_at = datetime.now(timezone.utc)

    database.commit()

    return {
        "message": "Your password has been reset successfully.",
    }
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
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google login is not configured",
        )

    try:
        google_user = id_token.verify_oauth2_token(
            request_data.credential,
            google_requests.Request(),
            GOOGLE_CLIENT_ID,
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google credential",
        )

    email = str(
        google_user.get("email", "")
    ).strip().lower()

    email_verified = google_user.get(
        "email_verified",
        False,
    )

    if not email or not email_verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google email is not verified",
        )

    user = (
        database.query(User)
        .filter(User.email == email)
        .first()
    )

    if user is None:
        google_subject = str(
            google_user.get("sub", "")
        )

        base_username = (
            email.split("@")[0]
            .replace(".", "_")
            .replace("-", "_")
        )

        username = (
            f"{base_username}_"
            f"{google_subject[-6:]}"
        )

        user = User(
            username=username[:50],
            email=email,
            hashed_password=hash_password(
                generate_one_time_token()[0]
            ),
            is_active=True,
        )

        database.add(user)
        database.commit()
        database.refresh(user)

    elif not user.is_active:
        user.is_active = True
        database.commit()

    access_token = create_access_token(user.id)

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }

@router.post(
    "/login",
    response_model=TokenResponse,
)
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    database: Session = Depends(get_database),
):
    user = (
        database.query(User)
        .filter(User.username == form_data.username)
        .first()
    )

    if not user or not verify_password(
        form_data.password,
        user.hashed_password,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
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


def get_current_user(
    token: str = Depends(oauth2_scheme),
    database: Session = Depends(get_database),
) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        subject: Optional[str] = payload.get("sub")

        if subject is None:
            raise credentials_error

        user_id = int(subject)
    except (jwt.InvalidTokenError, ValueError):
        raise credentials_error

    user = database.get(User, user_id)

    if user is None or not user.is_active:
        raise credentials_error

    return user


@router.get(
    "/me",
    response_model=UserResponse,
)
def read_current_user(
    current_user: User = Depends(get_current_user),
):
    return current_user