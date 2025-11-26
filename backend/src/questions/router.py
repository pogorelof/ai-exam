from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from src.classes.models import Class, members_of_class
from src.questions.models import TestOptions, TestQuestion, Theme
from src.auth.schemas import RoleEnum
from src.auth.jwt import CurrentUserDep
from src.db import SessionDep
from src.questions.schemas import TestQuestionOptionReturn, ThemeCreate, TestQuestionReturn, TestQuestionOptionReturn, ThemeReturn


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
        for i in range(data.question_numbers):
            test_question = TestQuestion(text=f"Test Question #{i}",
                                         theme_id=theme_id)
            session.add(test_question)
            session.flush()
            session.refresh(test_question)
            test_question_id = test_question.id
            for j in range(4):
                if j == 2:
                    test_option = TestOptions(text=f"Option #{i}",
                                          test_question_id=test_question_id,
                                          is_correct=True)
                else:
                    test_option = TestOptions(text=f"Option #{j}",
                                          test_question_id=test_question_id,
                                          is_correct=False)
                session.add(test_option)
                session.flush()
                session.refresh(test_option)
    session.commit()
    return {
        "message": "Successfull"
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