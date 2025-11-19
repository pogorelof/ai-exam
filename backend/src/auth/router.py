from typing import Annotated
from fastapi import APIRouter, Depends, Form, HTTPException
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from pwdlib import PasswordHash
from sqlalchemy.orm import Session

import logging

from src.auth.jwt import create_access_token
from src.auth.models import User
from src.auth.schemas import AccessToken
from src.db import SessionDep


router = APIRouter(prefix="/auth")
log = logging.getLogger(__name__)
password_hash = PasswordHash.recommended()

@router.post("/token", response_model=AccessToken)
def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], 
          session: SessionDep):
    user = session.query(User).filter(User.username == form_data.username).first()
    if not user:
        raise HTTPException(status_code=403, detail="Username not found")
    if not password_hash.verify(form_data.password, user.hashed_password):
        raise HTTPException(status_code=403, detail="Invalid credentials")
    payload = {
        "sub": str(user.id)
    }
    return create_access_token(payload)


@router.post("/register")
def register(
    session: SessionDep,
    username: str = Form(),
    password: str = Form()
):
    hashed_password = password_hash.hash(password)
    user_to_db = User(username=username, 
                      hashed_password=hashed_password)
    
    log.info(f"Try to register '{username}'.")

    session.add(user_to_db)
    session.commit()
    session.refresh(user_to_db)

    log.info(f"Success register '{username}'.")

    return {
        "message": "Success!"
    }