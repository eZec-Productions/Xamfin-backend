from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    is_first_time_login: bool
    user: Dict[str, Any]

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ForgotPasswordResponse(BaseModel):
    message: str
    success: bool = True

class ChangePasswordRequest(BaseModel):
    current_password: Optional[str] = None
    new_password: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
