from enum import Enum
from pydantic import BaseModel


class RoleEnum(str, Enum):
    student = "student"
    teacher = "teacher"

class AccessToken(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserPublic(BaseModel):
    id: int
    username: str    
    role: str    