from fastapi import APIRouter, Depends

router = APIRouter()

@router.get('/me')
def get_user():
    return {'message': 'This is user route'}
