from datetime import datetime, timezone
from sqlalchemy import Column, Float, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from src.db import Base


class Theme(Base):
    __tablename__ = "theme"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    is_test = Column(Boolean)
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    class_id = Column(Integer, ForeignKey("class.id"))

    class_obj = relationship("Class", back_populates="themes")

    open_questions = relationship("OpenQuestion", back_populates="theme")
    test_questions = relationship("TestQuestion", back_populates="theme")

class TestQuestion(Base):
    __tablename__ = "test_questions"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, default="one") # second choice 'multiple'
    text = Column(String)

    theme_id = Column(Integer, ForeignKey("theme.id"))
    theme = relationship("Theme", back_populates="test_questions")

    options = relationship("TestOptions", back_populates="test_question")

class TestOptions(Base):
    __tablename__ = "test_options"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String)
    is_correct = Column(Boolean)

    test_question_id = Column(Integer, ForeignKey("test_questions.id"))
    test_question = relationship("TestQuestion", back_populates="options")

class TestAnswer(Base):
    __tablename__ = "test_answers"

    student_id = Column(Integer, ForeignKey("user.id"), primary_key=True)
    question_id = Column(Integer, ForeignKey("test_questions.id"), primary_key=True)
    answer = Column(String)
    is_correct = Column(Boolean)
    advice = Column(String, default=None)


class OpenQuestion(Base):
    __tablename__ = "open_questions"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String)

    theme_id = Column(Integer, ForeignKey("theme.id"))
    theme = relationship("Theme", back_populates="open_questions")

class OpenAnswer(Base):
    __tablename__ = "open_answers"

    student_id = Column(Integer, ForeignKey("user.id"), primary_key=True)
    question_id = Column(Integer, ForeignKey("open_questions.id"), primary_key=True)
    answer = Column(String)
    is_correct = Column(Boolean)
    advice = Column(String, default=None)


class Result(Base):
    __tablename__ = "results"

    student_id = Column(Integer, ForeignKey("user.id"), primary_key=True)
    theme_id = Column(Integer, ForeignKey("theme.id"), primary_key=True)
    result = Column(Float) # %