from fastapi import APIRouter, HTTPException, Depends, status, Form
from sqlalchemy.orm import Session
from sqlalchemy import select, insert
from api.database.db import get_session, users_table
from api.entities import User

router = APIRouter()

# Dependency to get the current user (accept username as query parameter)
async def get_current_user(username: str, session: Session = Depends(get_session)) -> User:
    query = select(users_table).where(users_table.c.username == username)
    result = session.execute(query).fetchone()
    if not result:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return User(id=result.id, username=result.username, password=result.password)

@router.post("/signup")
async def signup(
    username: str = Form(...),
    password: str = Form(...),
    session: Session = Depends(get_session)
) -> User:
    # Check if the username already exists
    query = select(users_table).where(users_table.c.username == username)
    if session.execute(query).fetchone():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")
    
    # Create the new user
    new_user = {"username": username, "password": password}  # In a real app, hash the password
    result = session.execute(insert(users_table).values(new_user))
    session.commit()
    
    # Fetch the newly created user
    user_id = result.inserted_primary_key[0]
    query = select(users_table).where(users_table.c.id == user_id)
    user_row = session.execute(query).fetchone()
    return User(id=user_row.id, username=user_row.username, password=user_row.password)

@router.post("/login")
async def login(
    username: str = Form(...),
    password: str = Form(...),
    session: Session = Depends(get_session)
) -> User:
    query = select(users_table).where(users_table.c.username == username, users_table.c.password == password)
    result = session.execute(query).fetchone()
    if not result:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
    return User(id=result.id, username=result.username, password=result.password)