from enum import Enum
from pydantic import BaseModel

from src.auth.schemas import UserPublic


class ClassBase(BaseModel):
    title: str

class ClassPublic(ClassBase):
    id: int

    model_config = {
        "from_attributes": True
    }

class RequestPublic(BaseModel):
    student: UserPublic
    class_obj: ClassPublic
    status: str

class MembersShow(BaseModel):
    type: str
    class_obj: ClassPublic
    students: list[UserPublic]

class ResponseToRequestEnum(str, Enum):
    accept = "accept"
    reject = "reject"