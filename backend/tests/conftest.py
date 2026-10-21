import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.config import settings
from app.database import Base, get_db
from app.main import app
from app.models.member import Member
from app.models.task import Task


def ensure_test_database_exists() -> None:
    test_url = make_url(settings.TEST_DATABASE_URL)
    if test_url.database == make_url(settings.DATABASE_URL).database:
        raise RuntimeError(
            "TEST_DATABASE_URL must point to a different database than DATABASE_URL"
        )
    admin_engine = create_engine(
        test_url.set(database="postgres"), isolation_level="AUTOCOMMIT"
    )
    try:
        with admin_engine.connect() as conn:
            exists = conn.execute(
                text("SELECT 1 FROM pg_database WHERE datname = :name"),
                {"name": test_url.database},
            ).scalar()
            if not exists:
                quoted = conn.dialect.identifier_preparer.quote(test_url.database)
                conn.execute(text(f"CREATE DATABASE {quoted}"))
    finally:
        admin_engine.dispose()


ensure_test_database_exists()

test_engine = create_engine(settings.TEST_DATABASE_URL, pool_pre_ping=True)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    Base.metadata.create_all(bind=test_engine)
    yield


@pytest.fixture(autouse=True)
def clean_db():
    db = TestingSessionLocal()
    try:
        db.query(Task).delete()
        db.query(Member).delete()
        db.commit()
    finally:
        db.close()


@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()