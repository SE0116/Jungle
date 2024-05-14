from passlib.context import CryptContext # 비밀번호 암호화
from sqlalchemy.orm import Session
from domain.user.user_schema import UserCreate
from models import User

# 비밀번호 암호화
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_user(db: Session, user_create: UserCreate):
    """
    회원 가입 함수
    - db: DB 세션 객체
    - user: UserCreate 스키마로 정의한 회원 가입 정보
    """
    db_user = User(
        username=user_create.username,
        password=pwd_context.hash(user_create.password1), # 비밀번호 암호화해서 저장
        email=user_create.email
    ) 
    db.add(db_user)
    db.commit()
    
def get_existing_user(db: Session, user_create: UserCreate):
    """
    중복 회원 예외 처리 함수
    - db: DB 세션 객체
    - return: 중복된 사용자 모델 객체
    """
    return db.query(User).filter(
        (User.username == user_create.username) | (User.email == user_create.email)
    ).first() # 중복된 회원 정보가 있으면 첫 번째 정보를 리턴

def get_user(db: Session, username: str):
    """
    로그인 함수
    - db: DB 세션 객체
    - username: 로그인 시 입력한 아이디
    - return: 해당 아이디의 사용자 모델 객체
    """
    return db.query(User).filter(User.username == username).first()
    