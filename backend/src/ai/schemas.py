from pydantic import BaseModel


class TokenBase(BaseModel):
    token: str
