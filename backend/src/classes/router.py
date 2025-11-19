from sqlalchemy import insert, select
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from fastapi.routing import APIRouter

from src.auth.models import User
from src.auth.schemas import RoleEnum, UserPublic
from src.classes.models import Class, request_to_class
from src.db import SessionDep, create_entity_in_db
from src.auth.jwt import CurrentUserDep
from src.classes.schemas import ClassBase, ClassPublic, RequestPublic, RequestShow


router = APIRouter(prefix="/class")

# Classes CRUD (Only Teacher)
@router.post("/create")
def create(class_obj: ClassBase, current_user: CurrentUserDep, session: SessionDep):
    if current_user.role != RoleEnum.teacher:
        raise HTTPException(status_code=403, detail="Don`t have enough permission")
    class_to_db = Class(title=class_obj.title, teacher_id=current_user.id)
    try:
        create_entity_in_db(class_to_db, session)
    except IntegrityError:
        raise HTTPException(status_code=400, detail="You already have this title of class")
    return class_to_db

@router.delete("/delete/{class_id}")
def delete(class_id: int, current_user: CurrentUserDep, session: SessionDep):
    class_obj = session.get(Class, class_id)
    if class_obj.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="It's not your class")
    session.delete(class_obj)
    session.commit()
    return {
        "message": f"Class {class_obj.title} successfully deleted"
    }

@router.put("/update/{class_id}")
def update(class_id: int, class_upd: ClassBase, current_user: CurrentUserDep, session: SessionDep):
    if current_user.role != RoleEnum.teacher:
        raise HTTPException(status_code=403, detail="Don`t have enough permission")
    class_from_db = session.get(Class, class_id)
    if class_from_db.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="It's not your class")
    class_from_db.title = class_upd.title
    create_entity_in_db(class_from_db, session)
    return class_from_db

@router.get("/", summary="Get all classes of authorized teacher", response_model=list[ClassPublic])
def get_all_classes(current_user: CurrentUserDep, session: SessionDep):
    return current_user.classes

# Members of classes
@router.post("/request/{class_id}", response_model=RequestPublic)
def request(class_id: int, current_user: CurrentUserDep, session: SessionDep):
    if current_user.role != RoleEnum.student:
        raise HTTPException(status_code=403, detail="Only students can submit requests")
    try:
        statement = insert(request_to_class).values(student_id=current_user.id, class_id=class_id)
        session.execute(statement)
        session.commit()
    except IntegrityError:
        return RequestPublic(student=current_user, 
                             class_obj=session.get(Class, class_id), 
                             status="You already have request to join this class")
    return RequestPublic(student=current_user, 
                        class_obj=session.get(Class, class_id),  
                         status="Request sent")

@router.get("/request/show/{class_id}", 
            summary="Show all requests to the class. For teacher role and class must be yours",
            response_model=RequestShow)
def show_requests(class_id: int, current_user: CurrentUserDep, session: SessionDep):
    if current_user.role != RoleEnum.teacher:
        raise HTTPException(status_code=403, detail="Don`t have enough permission")
    class_from_db = session.get(Class, class_id)
    if class_from_db.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="It's not your class")
    
    stmt = select(request_to_class.c.student_id).where(request_to_class.c.class_id == class_id)
    students_ids: list[int] = [row.student_id for row in session.execute(stmt)]
    students = session.query(User).where(User.id.in_(students_ids)).all()
    return RequestShow(class_obj=class_from_db, 
                       students=students)