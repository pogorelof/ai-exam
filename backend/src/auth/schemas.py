from enum import Enum
from pydantic import BaseModel, Field, computed_field, EmailStr


class RoleEnum(str, Enum):
    student = "student"
    teacher = "teacher"

class AccessToken(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserRegister(BaseModel):
    username: str
    password: str
    first_name: str
    last_name: str
    email: EmailStr
    role: RoleEnum

class UserPublic(BaseModel):
    id: int
    username: str   
    email: str 
    role: str    

    first_name: str = Field(exclude=True)
    last_name: str = Field(exclude=True)
    @computed_field
    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"

    model_config = {
        "from_attributes": True
    }