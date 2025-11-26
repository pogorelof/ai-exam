from pydantic import BaseModel


class ThemeCreate(BaseModel):
    name: str
    is_test: bool
    class_id: int
    question_numbers: int

class TestQuestionOptionReturn(BaseModel):
    text: str

class TestQuestionReturn(BaseModel):
    text: str
    options: list[TestQuestionOptionReturn]

class ThemeReturn(BaseModel):
    name: str
    questions: list[TestQuestionReturn]
    