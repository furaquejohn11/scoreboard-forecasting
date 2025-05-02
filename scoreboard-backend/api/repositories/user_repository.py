from fastapi import HTTPException, status
from sqlalchemy import Select
from sqlmodel import Session, select
from typing import cast
from api.entities import User
from api.dtos.user_dto import UserLogin, UserCreate, UserRead
from api.utils.password_utils import hash_password, verify_password

class UserRepository:
    def __init__(self, session: Session):
        self.session = session

    def signup(self, user_data: UserCreate) -> User:
        statement = cast(Select[User], select(User).where(User.username == user_data.username))
        existing_user = self.session.exec(statement).first()

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username is already taken"
            )

        hashed_password = hash_password(user_data.password)

        user = User(
            username=user_data.username,
            hashed_password=hashed_password,
            firstname=user_data.firstname,
            lastname=user_data.lastname
        )

        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        return user

    def login(self, user_data: UserLogin) -> UserRead:
        statement = cast(Select[User], select(User).where(User.username == user_data.username))
        user = self.session.exec(statement).first()

        if not user or not verify_password(user_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid username or password"
            )
        user_read = UserRead(
            id=user.id,
            username=user.username,
            firstname=user.firstname,
            lastname=user.lastname
        )

        return user_read