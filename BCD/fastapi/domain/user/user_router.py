from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException # -> HTTPException: 예외처리를 위한 클래스, 중복 회원 등
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer # -> 로그인을 위한 클래스
from jose import jwt, JWTError # -> JWT 토큰 생성을 위한 라이브러리
import secrets
from sqlalchemy.orm import Session
from starlette import status

from database import get_db
from domain.user import user_crud, user_schema
from domain.user.user_crud import pwd_context # ??

# 비밀번호 암호화
ACCESS_TOKEN_EXPIRE_MINUTES = 500 # 토큰 유효 시간
SECRET_KEY = secrets.token_hex(32) # 랜덤한 문자열 64자리
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login") # -> OAuth2PasswordBearer: 로그인을 위한 클래스, tokenUrl: 로그인 경로   

router = APIRouter(
    # prefix="/api/user",
)

@router.post("/signup/submit", status_code=status.HTTP_201_CREATED, tags=["user"])
def user_create(_user_create: user_schema.UserCreate, db: Session = Depends(get_db)):
    
    # 중복 회원 예외 처리
    user = user_crud.get_existing_user(db, user_create=_user_create)
    if user: 
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, 
                              detail="이미 가입된 회원입니다.")
    user_crud.create_user(db, user_create=_user_create)

# response_model: API의 응답값에 대한 스키마를 정의
@router.post("/login", response_model=user_schema.Token, tags=["user"])
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), 
                           db: Session = Depends(get_db)):
# 로그인 api의 입력항목인 username, password를 OAuth2PasswordRequestForm 통해 받아옴

    # 로그인 예외 처리
    user = user_crud.get_user(db, username=form_data.username)
    if not user or not pwd_context.verify(form_data.password, user.password):
    # 회원 가입시 사용했던 pwd_context.hash 함수를 사용해서 비밀번호를 암호화했기 때문에,
    # 로그인 시에는 암호화 되지 않은 비밀번호를 pwd_context.verify 함수를 사용해 암호화해서 비교
        raise HTTPException( # user가 없거나, 비밀번호가 일치하지 않으면 예외 처리
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="아이디 또는 비밀번호가 일치하지 않습니다.",
            headers={"WWW-Authenticate": "Bearer"}, # -> 인증 방식에 대한 추가 정보를 헤더에 담아서 보냄
        )
        
    # JWT 토큰 생성
    data = {
        "sub": user.username, # 사용자명 저장
        "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES) # 토큰 유효 시간 설정
    }
    access_token = jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user.username
    }
    
def get_current_user(token: str = Depends(oauth2_scheme),
                     db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    else:
        user = user_crud.get_user(db, username=username)
        if user is None:
            raise credentials_exception
        return user