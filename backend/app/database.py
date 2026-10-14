import logging
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

logger = logging.getLogger("potholeguard.database")

def get_db_engine():
    try:
        engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
        # Test connection
        connection = engine.connect()
        connection.close()
        logger.info(f"Connected to PostgreSQL database at {settings.POSTGRES_SERVER}")
        return engine
    except Exception as e:
        logger.warning(f"Could not connect to PostgreSQL ({e}). Falling back to SQLite database for seamless runtime.")
        sqlite_url = f"sqlite:///{settings.BASE_DIR}/potholeguard.db"
        engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})
        return engine

engine = get_db_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
