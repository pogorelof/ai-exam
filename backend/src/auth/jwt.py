from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jwt import ExpiredSignatureError, InvalidTokenError

from src.auth.models import User
from src.auth.schemas import AccessToken
from src.db import SessionDep

SECRET_KEY = "5f51f0a843728c24a0f88406e6b66b82ffc5a86bef5247ccfd4d1909b13bc63a"
EXPIRES_TIME_MINUTE = 86400
ALHORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


def create_access_token(data: dict) -> AccessToken:
    to_encode = data.copy()
    to_encode.update(
        {"exp": datetime.now(timezone.utc) + timedelta(minutes=EXPIRES_TIME_MINUTE)}
    )
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALHORITHM)
    return AccessToken(access_token=token)


def get_current_user(
    session: SessionDep, token: Annotated[str, Depends(oauth2_scheme)]
) -> User:
    try:
        decoded_token: dict = jwt.decode(token, SECRET_KEY, algorithms=[ALHORITHM])
        user_id: int | None = decoded_token.get("sub")
        if not user_id:
            raise HTTPException(status_code=403, detail="No sub field")
    except ExpiredSignatureError:
        raise HTTPException(status_code=403, detail="Expired token")
    except InvalidTokenError:
        raise HTTPException(status_code=403, detail="Invalid token error")

    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=403, detail="Entity not found")

    return user


CurrentUserDep = Annotated[User, Depends(get_current_user)]
