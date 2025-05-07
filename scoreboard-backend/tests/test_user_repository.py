import pytest
from fastapi import HTTPException
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
from api.repositories.user_repository import UserRepository
from api.dtos.user_dto import UserCreate, UserLogin, UserRead
from api.entities import User

@pytest.fixture
def session():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session

@pytest.fixture
def user_repository(session):
    return UserRepository(session)

@pytest.fixture
def test_user_data():
    return UserCreate(
        username="testuser",
        password="testpass123",
        firstname="Test",
        lastname="User"
    )

def test_signup_success(user_repository, test_user_data):
    # Act
    user = user_repository.signup(test_user_data)
    
    # Assert
    assert user.username == test_user_data.username
    assert user.firstname == test_user_data.firstname
    assert user.lastname == test_user_data.lastname
    assert user.hashed_password != test_user_data.password  # Password should be hashed

def test_signup_duplicate_username(user_repository, test_user_data):
    # Arrange
    user_repository.signup(test_user_data)
    
    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        user_repository.signup(test_user_data)
    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Username is already taken"

def test_login_success(user_repository, test_user_data):
    # Arrange
    user_repository.signup(test_user_data)
    login_data = UserLogin(username=test_user_data.username, password=test_user_data.password)
    
    # Act
    user_read = user_repository.login(login_data)
    
    # Assert
    assert isinstance(user_read, UserRead)
    assert user_read.username == test_user_data.username
    assert user_read.firstname == test_user_data.firstname
    assert user_read.lastname == test_user_data.lastname

def test_login_invalid_username(user_repository, test_user_data):
    # Arrange
    user_repository.signup(test_user_data)
    login_data = UserLogin(username="wronguser", password=test_user_data.password)
    
    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        user_repository.login(login_data)
    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Invalid username or password"

def test_login_invalid_password(user_repository, test_user_data):
    # Arrange
    user_repository.signup(test_user_data)
    login_data = UserLogin(username=test_user_data.username, password="wrongpass")
    
    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        user_repository.login(login_data)
    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Invalid username or password" 