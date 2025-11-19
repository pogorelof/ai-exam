from sqlalchemy import Column, Integer, String, Enum

from src.auth.schemas import RoleEnum
from src.db import Base


class User(Base):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String)
    hashed_password = Column(String)
    # student/teacher
    role = Column(Enum(RoleEnum), nullable=False)
