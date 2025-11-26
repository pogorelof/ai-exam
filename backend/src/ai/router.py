from typing import Annotated
from fastapi import APIRouter, Body, HTTPException
from sqlalchemy.exc import IntegrityError

from src.ai.schemas import TokenBase
from src.ai.models import UserToken
from src.auth.jwt import CurrentUserDep
from src.db import SessionDep, create_entity_in_db


router = APIRouter(prefix="/ai", tags=["AI"])

@router.get("/token/get", response_model=TokenBase)
def token_get(user: CurrentUserDep):
    token_obj = user.ai_token
    if not token_obj:
        raise HTTPException(status_code=404, detail="You don`t have openai token")
    return token_obj

@router.post("/token/save")
def token_save_or_update(data: TokenBase, session: SessionDep, user: CurrentUserDep):
    user_token = UserToken(token=data.token, user=user)
    create_entity_in_db(user_token, session)
    return {
        "message": "Token has been saved"
    }
