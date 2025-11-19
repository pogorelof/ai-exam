from pydantic import BaseModel


class ClassBase(BaseModel):
    title: str

class ClassPublic(ClassBase):
    id: int