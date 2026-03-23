from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# SQLite 데이터베이스 생성
SQLALCHEMY_DATABASE_URL = "sqlite:///./dartb.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# 설정 모델
class Setting(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True, nullable=False)
    value = Column(String, nullable=False)
    description = Column(String)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# 관리자 모델
class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# 멤버 모델
class Member(Base):
    __tablename__ = "members"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    generation = Column(Integer, nullable=False, index=True)  # 기수
    position = Column(String)  # 직책 (총괄팀장, 운영팀장 등)
    major = Column(String)  # 전공
    student_id = Column(String)  # 학번
    email = Column(String)
    github = Column(String)
    linkedin = Column(String)
    instagram = Column(String)
    profile_image_url = Column(String)
    is_executive = Column(Boolean, default=False)  # 임원 여부
    is_active = Column(Boolean, default=True)  # 활성 멤버 여부
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    notes = Column(Text)  # 추가 메모


# 데이터베이스 초기화
def init_db():
    Base.metadata.create_all(bind=engine)


# 데이터베이스 세션 의존성
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

