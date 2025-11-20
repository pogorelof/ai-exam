from sqlalchemy import insert, select, delete
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from fastapi.routing import APIRouter

from src.auth.models import User
from src.auth.schemas import RoleEnum, UserPublic
from src.classes.models import Class, request_to_class, members_of_class
from src.db import SessionDep, create_entity_in_db
from src.auth.jwt import CurrentUserDep
from src.classes.schemas import ClassBase, ClassPublic, RequestPublic, MembersShow, ResponseToRequestEnum


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
def delete_class(class_id: int, current_user: CurrentUserDep, session: SessionDep):
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

@router.get("/", summary="Get all classes of authorized teacher or student. Depends the role.", response_model=list[ClassPublic])
def get_all_classes(current_user: CurrentUserDep, session: SessionDep):
    if current_user.role == RoleEnum.teacher:
        return current_user.classes
    else:
        get_student_classes_stmt = select(members_of_class.c.class_id).where(members_of_class.c.student_id==current_user.id)
        classes_ids = [row.class_id for row in session.execute(get_student_classes_stmt)]
        classes = session.query(Class).where(Class.id.in_(classes_ids)).all()
        return classes
        

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
            response_model=MembersShow)
def show_requests(class_id: int, current_user: CurrentUserDep, session: SessionDep):
    if current_user.role != RoleEnum.teacher:
        raise HTTPException(status_code=403, detail="Don`t have enough permission")
    class_from_db = session.get(Class, class_id)
    if class_from_db.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="It's not your class")
    
    stmt = select(request_to_class.c.student_id).where(request_to_class.c.class_id == class_id)
    students_ids: list[int] = [row.student_id for row in session.execute(stmt)]
    students = session.query(User).where(User.id.in_(students_ids)).all()
    return MembersShow(type="requests",
                       class_obj=class_from_db, 
                       students=students)

@router.post("/request/{answer}/{class_id}/{student_id}")
def accept_request(answer: ResponseToRequestEnum,class_id: int, student_id: int, current_user: CurrentUserDep, session: SessionDep):
    if current_user.role != RoleEnum.teacher:
        raise HTTPException(status_code=403, detail="Don`t have enough permission")
    class_from_db = session.get(Class, class_id)
    if class_from_db.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="It's not your class")
    check_request_stmt = select(request_to_class).where(request_to_class.c.class_id == class_id,
                                                          request_to_class.c.student_id == student_id)
    if not session.execute(check_request_stmt).first():
        raise HTTPException(status_code=400, detail="There no request from student")
    
    try:
        add_to_class_statement = insert(members_of_class).values(student_id=student_id, class_id=class_id)
        delete_from_requests_statement = delete(request_to_class).where(request_to_class.c.class_id == class_id,
                                                                        request_to_class.c.student_id == student_id)
        if answer == ResponseToRequestEnum.accept:
            session.execute(delete_from_requests_statement)
            session.execute(add_to_class_statement)
            session.commit()
            message = "Student successfully join to the class"
        elif answer == ResponseToRequestEnum.reject:
            session.execute(delete_from_requests_statement)
            session.commit()
            message = "You rejected a student"
    except IntegrityError:
        return RequestPublic(student=session.get(User, student_id),
                         class_obj=class_from_db,
                         status="Student is on the class")

    return RequestPublic(student=session.get(User, student_id),
                         class_obj=class_from_db,
                         status=message)

@router.get("/members/{class_id}", response_model=MembersShow)
def get_members_of_class(class_id: int, session: SessionDep):
    get_members_stmt = select(members_of_class.c.student_id).where(members_of_class.c.class_id==class_id)
    students_ids = [row.student_id for row in session.execute(get_members_stmt)]
    students = session.query(User).where(User.id.in_(students_ids)).all()
    return MembersShow(type="members",
                       class_obj=session.get(Class, class_id), 
                       students=students)

#TODO: leave from class(student)
#TODO: kick from class(teacher)