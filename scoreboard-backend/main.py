from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routers import user_router, file_router
from api.database.db import create_db_and_tables, get_session
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan)


app = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get('/')
def index():
    return {'message': 'API is working'}


app.include_router(user_router, prefix="/api/user", tags=['User'])
app.include_router(file_router, prefix="/api/file", tags=['File'])