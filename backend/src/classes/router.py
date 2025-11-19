from fastapi import HTTPException
from fastapi.routing import APIRouter

from src.auth.schemas import RoleEnum
from src.classes.models import Class
from src.db import SessionDep, create_entity_in_db
from src.auth.jwt import CurrentUserDep
from src.classes.schemas import ClassBase, ClassPublic


router = APIRouter(prefix="/class")

@router.post("/create")
def create(class_obj: ClassBase, current_user: CurrentUserDep, session: SessionDep):
    if current_user.role != RoleEnum.teacher:
        raise HTTPException(status_code=403, detail="Don`t have enough permission")
    class_to_db = Class(title=class_obj.title, teacher_id=current_user.id)
    create_entity_in_db(class_to_db, session)
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
    return session.query(Class).where(Class.teacher_id == current_user.id)