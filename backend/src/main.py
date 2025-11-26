from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.db import init_tables
from src.auth.jwt import CurrentUserDep
from src.auth.schemas import UserPublic

from src.auth import router as auth_router
from src.classes import router as class_router
from src.questions import router as question_router
from src.ai import router as ai_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,     
    allow_methods=["*"],      
    allow_headers=["*"],  
)

init_tables()

app.include_router(auth_router.router)
app.include_router(class_router.router)
app.include_router(question_router.router)
app.include_router(ai_router.router)

@app.get("/me", response_model=UserPublic)
def me(current_user: CurrentUserDep):
    return current_user
