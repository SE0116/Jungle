"""
데이터베이스를 사용하기 위한 변수, 함수를 정의하고,
접속할 데이터베이스의 주소와 사용자, 비밀번호등을 관리
"""
# import contextlib -> 대신 depends를 사용
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# DB 접속 주소
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:1234@xxx.xxx.xxx.xxx/buchida"
# -> sqlite3 DB의 파일을 의미, 프로젝트 루트 디렉토리에 저장한다는 의미
# 커넥션 풀 생성: DB에 접속하는 객체를 일정 갯수만큼 미리 만들어 놓고, 필요할 때마다 꺼내서 사용하는 방식
# check_same_thread=False -> 스레드 안전성을 무시하고, 여러 스레드가 DB에 접근할 수 있도록 함
# -> SQLite는 스레드 안전성을 지원하지 않기 때문에, 이 옵션을 사용해야 함

if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

# DB에 접속하기 위해 필요한 클래스
# autocommit=False -> commit 사인을 줘야만 DB에 반영, rollback 가능
# autocommit=True -> rollback 불가
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# @contextlib.contextmanager -> 대신 Depens를 사용
def get_db():
    """
    컨텍스트 관리자 함수 생성
    : db 세션 객체를 리턴하는 get_db 함수
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
