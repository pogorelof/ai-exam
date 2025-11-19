from sqlalchemy import Column, ForeignKey, Integer, String, Table, UniqueConstraint
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

# Associate table with requests to class from students
request_to_class = Table(
    "request_to_class",
    Base.metadata,
    Column("student_id", ForeignKey("user.id"), primary_key=True),
    Column("class_id", ForeignKey("class.id"), primary_key=True)
)