from typing import Annotated
from fastapi import Depends
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker, declarative_base

sqlite_url = "sqlite:///db.db"

engine = create_engine(url=sqlite_url)
Base = declarative_base()
SessionLocal = sessionmaker(bind=engine)

def get_session():
    with SessionLocal() as session:
        yield session

def init_tables():
    Base.metadata.create_all(engine)

def create_entity_in_db(entity, session: Session):
    session.add(entity)
    session.commit()
    session.refresh(entity)


SessionDep = Annotated[Session, Depends(get_session)]