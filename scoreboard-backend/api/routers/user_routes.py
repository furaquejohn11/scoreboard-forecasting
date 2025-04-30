from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import io

from api.entities import User

router = APIRouter()


# TODO: Create a login and signup. Check the entities and dtos folder for reference
@router.post("/login")
async def login() -> User:
    ...

@router.post("/signup")
async def signup() -> User:
    ...
