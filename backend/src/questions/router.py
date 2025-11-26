from fastapi import APIRouter, HTTPException
from openai import OpenAI
from sqlalchemy import select

from src.ai.service import create_test_questions
from src.classes.models import Class, members_of_class
from src.questions.models import TestOptions, TestQuestion, Theme
from src.auth.schemas import RoleEnum
from src.auth.jwt import CurrentUserDep
from src.db import SessionDep
from src.questions.schemas import ThemeCreate, TestQuestionReturn, TestQuestionOptionReturn, ThemeReturn


router = APIRouter(prefix="/question", tags=["Question"])

@router.post("/create")
def create_theme(data: ThemeCreate,
                 session: SessionDep,
                 user: CurrentUserDep
):
    if user.role != RoleEnum.teacher:
        raise HTTPException(status_code=403, detail="Don`t have enough permission")
    class_obj = session.get(Class, data.class_id)
    if not class_obj:
        raise HTTPException(status_code=400, detail="Class not found")
    if class_obj.owner != user:
        raise HTTPException(status_code=400, detail="This is not your class")
    
    theme = Theme(name=data.name,
                  is_test=data.is_test,
                  class_id=data.class_id)
    session.add(theme)
    session.flush()
    session.refresh(theme)
    theme_id = theme.id

    if data.is_test:
        client = OpenAI(api_key=user.ai_token.token)
        questions_dict = create_test_questions(client, data.name, data.question_numbers)

        for question in questions_dict["questions"]:
            test_question = TestQuestion(text=question["question"],
                                         theme_id=theme_id)
            session.add(test_question)
            session.flush()
            session.refresh(test_question)
            test_question_id = test_question.id
            for option in question["options"]:
                test_option = TestOptions(text=option["option"],
                                          test_question_id=test_question_id,
                                          is_correct=option["is_correct"])
                session.add(test_option)
                session.flush()
                session.refresh(test_option)
    session.commit()
    return {
        "theme_id": theme.id
    }

@router.get("/{theme_id}", response_model=ThemeReturn)
def get_theme(theme_id: int, session: SessionDep, user: CurrentUserDep):
    theme = session.get(Theme, theme_id)
    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")
    if user.role == RoleEnum.teacher:
        if theme.class_obj.owner != user:
            raise HTTPException(status_code=403, detail="You don`t have access to this theme")
    else:
        members_stmt = select(members_of_class.c.student_id).where(members_of_class.c.class_id == theme.class_id)
        members = [row[0] for row in session.execute(members_stmt)]
        if user.id not in members:
            raise HTTPException(status_code=403, detail="You don`t have access to this theme")
        
    questions: list[TestQuestionReturn] = []
    for question in theme.test_questions:
        options: list[TestQuestionOptionReturn] = []
        for option in question.options:
            options.append(TestQuestionOptionReturn(text=option.text))
        questions.append(TestQuestionReturn(text=question.text,
                                             options=options))

    return ThemeReturn(
        name=theme.name,
        questions=questions
    )

@router.get("/class/{class_id}")
def questions_of_class(class_id: int, session: SessionDep):
    class_obj = session.get(Class, class_id)
    return class_obj.themes