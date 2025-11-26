from typing import Annotated
from fastapi import APIRouter, Depends, Form, HTTPException
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from pwdlib import PasswordHash
from sqlalchemy import or_
from sqlalchemy.orm import Session

from src.auth.jwt import create_access_token
from src.auth.models import User
from src.auth.schemas import AccessToken, RoleEnum, UserRegister
from src.db import SessionDep


router = APIRouter(prefix="/auth", tags=["Auth"])
password_hash = PasswordHash.recommended()

@router.post("/token", response_model=AccessToken)
def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], 
          session: SessionDep):
    user = session.query(User).filter(User.username == form_data.username).first()
    if not user:
        raise HTTPException(status_code=403, detail="Username not found")
    if not password_hash.verify(form_data.password, str(user.hashed_password)):
        raise HTTPException(status_code=403, detail="Invalid credentials")
    payload = {
        "sub": str(user.id),
        "role": user.role
    }
    return create_access_token(payload)


@router.post("/register")
def register(
    session: SessionDep,
    data: Annotated[UserRegister, Form()]
):
    hashed_password = password_hash.hash(data.password)
    if session.query(User).where(or_(User.username == data.username, User.email == data.email)).first():
        raise HTTPException(status_code=400, detail="login or email already exists")
    user_to_db = User(username=data.username, 
                      hashed_password=hashed_password,
                      first_name=data.first_name,
                      last_name=data.last_name,
                      email=data.email,
                      role=data.role)
    
    session.add(user_to_db)
    session.commit()
    session.refresh(user_to_db)

    return {
        "message": "Success!"
    }