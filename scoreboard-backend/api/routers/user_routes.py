from fastapi import APIRouter, HTTPException, Depends, status, Form
from sqlalchemy.orm import Session
from sqlalchemy import select, insert
from api.database.db import get_session
from api.dtos.user_dto import UserCreate, UserLogin, UserRead
from api.entities import User
from api.repositories import UserRepository

router = APIRouter()

# Dependency to get the current user (accept username as query parameter)
# async def get_current_user(username: str, session: Session = Depends(get_session)) -> User:
#     query = select(users_table).where(users_table.c.username == username)
#     result = session.execute(query).fetchone()
#     if not result:
#         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
#     return User(id=result.id, username=result.username, password=result.password)

@router.post("/signup")
def signup(user_data: UserCreate, session: Session = Depends(get_session)) -> User:
    user_repository = UserRepository(session)
    user = user_repository.signup(user_data)
    return user

@router.post("/login")
def login(user_data: UserLogin, session: Session = Depends(get_session)) -> UserRead:
    user_repository = UserRepository(session)
    user = user_repository.login(user_data)
    return user