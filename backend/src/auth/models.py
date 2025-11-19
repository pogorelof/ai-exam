from sqlalchemy import Column, Integer, String, Enum
from sqlalchemy.orm import relationship

from src.auth.schemas import RoleEnum
from src.db import Base


class User(Base):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String)
    hashed_password = Column(String)
    role = Column(Enum(RoleEnum), nullable=False) # student/teacher
    
    classes = relationship("Class", back_populates="owner")
    