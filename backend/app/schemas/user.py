from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
)


class UserCreate(BaseModel):
    username: str = Field(
        min_length=3,
        max_length=50,
    )
    email: EmailStr
    password: str = Field(
        min_length=8,
        max_length=128,
    )


class UserResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int
    username: str
    email: str
    is_active: bool
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


class EmailVerificationRequest(BaseModel):
    token: str = Field(min_length=32)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=32)
    new_password: str = Field(
        min_length=8,
        max_length=128,
    )


class GoogleLoginRequest(BaseModel):
    credential: str = Field(min_length=20)


class MessageResponse(BaseModel):
    message: str