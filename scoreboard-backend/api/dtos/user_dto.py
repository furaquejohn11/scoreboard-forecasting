from pydantic import BaseModel, Field
from typing import Annotated, Optional


class UserBase(BaseModel):
    firstname: Annotated[str, Field(examples=["John"])]
    lastname: Annotated[str, Field(examples=["Doe"])]
    username: Annotated[str, Field(examples=["johndoe"])]


class UserCreate(UserBase):
    password: Annotated[str, Field(min_length=8, examples=["securePassword"])]


class UserRead(UserBase):
    id: int


class UserUpdate(BaseModel):
    username: Annotated[Optional[str], Field(default=None, examples=["newUsername"])]
    firstname: Annotated[Optional[str], Field(default=None, examples=["NewFirstName"])]
    lastname: Annotated[Optional[str], Field(default=None, examples=["NewLastName"])]
    password: Annotated[Optional[str], Field(default=None, min_length=8, examples=["newSecurePassword"])]


class UserLogin(BaseModel):
    username: Annotated[str, Field(examples=["johndoe"])]
    password: Annotated[str, Field(examples=["securePassword"])]
