import uuid
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    ChangePasswordRequest,
    ResetPasswordRequest
)
from app.services.auth_service import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user,
    create_reset_token,
    verify_reset_token
)
from app.services.email_service import send_password_reset_email

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email or password. Please verify your credentials."
        )

    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email or password. Please verify your credentials."
        )

    access_token = create_access_token(data={"sub": user.id, "email": user.email})

    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        is_first_time_login=user.is_first_time_login,
        user={
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "companyName": user.company_name,
            "role": getattr(user, "role", "client"),
            "industry": user.industry,
            "currency": user.currency,
            "isFirstTimeLogin": user.is_first_time_login,
        }
    )

@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    clean_email = payload.email.strip().lower()
    user = db.query(User).filter(User.email == clean_email).first()
    
    if user:
        reset_token = create_reset_token(user_id=user.id, email=user.email)
        portal_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000")
        try:
            send_password_reset_email(
                to_email=user.email,
                client_name=user.name or "User",
                reset_token=reset_token,
                portal_url=portal_url
            )
            logger.info(f"Password reset link generated and dispatched for {clean_email}")
        except Exception as e:
            logger.error(f"Failed to dispatch password reset email for {clean_email}: {e}")

    # Always return a polite success message to prevent user enumeration
    return ForgotPasswordResponse(
        message=f"If an account exists for {clean_email}, a password reset link has been dispatched.",
        success=True
    )

@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    if len(payload.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters long."
        )

    token_data = verify_reset_token(payload.token)
    if not token_data or not token_data.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reset link is invalid or has expired. Please request a new one."
        )

    user = db.query(User).filter(User.id == token_data["sub"]).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account associated with this token was not found."
        )

    user.hashed_password = get_password_hash(payload.new_password)
    user.is_first_time_login = False
    db.commit()

    return {"message": "Your password has been successfully reset. You may now log in.", "success": True}

@router.post("/change-password")
def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if len(payload.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters long."
        )

    # If not first-time login, verify current password
    if not current_user.is_first_time_login and payload.current_password:
        if not verify_password(payload.current_password, current_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password entered is incorrect."
            )

    current_user.hashed_password = get_password_hash(payload.new_password)
    current_user.is_first_time_login = False
    db.commit()

    return {"message": "Password successfully updated. You may now access the client portal.", "success": True}
