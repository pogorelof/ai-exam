from sqlalchemy import Column, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship
from src.db import Base


class Class(Base):
    __tablename__ = "class"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    teacher_id = Column(Integer, ForeignKey("user.id"))
    
    owner = relationship("User", back_populates="classes")

    __table_args__ = (
        UniqueConstraint("teacher_id", "title", name="uq_teacher_title"),
    )