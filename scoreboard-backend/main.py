from fastapi import FastAPI
from api.routers import user_router

app = FastAPI()

@app.get('/')
def index():
    return {'message': 'API is working'}


app.include_router(user_router, prefix="/api/user", tags=['User'])