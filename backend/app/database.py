import os
from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load backend/.env
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
load_dotenv(env_path)

db_user = os.getenv("DB_USER", "postgres")
db_password = os.getenv("DB_PASSWORD", "BSSE2280127")
db_host = os.getenv("DB_HOST", "localhost")
db_port = int(os.getenv("DB_PORT", "5432"))
db_name = os.getenv("DB_NAME", "Finlytics Ai")

# Construct robust SQLAlchemy URL handling spaces cleanly
db_url = URL.create(
    drivername="postgresql+psycopg2",
    username=db_user,
    password=db_password,
    host=db_host,
    port=db_port,
    database=db_name
)

engine = create_engine(
    db_url,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
