from sqlalchemy import create_engine
from sqlmodel import Session, SQLModel

sqlite_file_name = "api/database/scoreboard.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)


# Define the users table
# users_table = Table(
#     "users",
#     metadata,
#     Column("id", Integer, primary_key=True, autoincrement=True),
#     Column("username", String, nullable=False, unique=True),
#     Column("password", String, nullable=False),
# )
#
# # Define the csv_data table with user_id and file_type
# csv_data_table = Table(
#     "csv_data",
#     metadata,
#     Column("id", Integer, primary_key=True, autoincrement=True),
#     Column("user_id", Integer, ForeignKey("users.id"), nullable=False),
#     Column("filename", String, nullable=False),
#     Column("upload_timestamp", String, nullable=False),
#     Column("row_data", String, nullable=False),
#     Column("file_type", String, nullable=False)  # 'csv' or 'excel'
# )

def create_db_and_tables():
    # Create all tables defined in the metadata
    SQLModel.metadata.create_all(bind=engine)

def get_session():
    """Generates a database session to be used in route functions."""
    with Session(engine) as session:
        yield session

# Create the tables when the module is imported
# create_db_and_tables()