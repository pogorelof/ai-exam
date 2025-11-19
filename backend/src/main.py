from fastapi import FastAPI
from src.db import init_tables
from src.auth.jwt import CurrentUserDep
from src.auth.schemas import UserPublic
from src.auth import router as auth_router

app = FastAPI()

init_tables()

app.include_router(auth_router.router)

@app.get("/me", response_model=UserPublic)
def me(current_user: CurrentUserDep):
    return current_user
