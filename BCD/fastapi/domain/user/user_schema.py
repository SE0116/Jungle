"""
회원 가입 스키마
"""
from pydantic import BaseModel, EmailStr, field_validator
from pydantic_core.core_schema import FieldValidationInfo

class UserCreate(BaseModel):
    username: str
    password1: str
    password2: str
    email: EmailStr # EmailStr: 해당 값이 이메일 형식과 일치하는지 검증하기 위해 사용
    
    @field_validator('username', 'password1', 'password2', 'email')
    def not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('빈 값은 허용되지 않습니다.')
        return v
    
    @field_validator('password2')
    def password_match(cls, v, info: FieldValidationInfo):
        # UserCreate의 속성들이 딕셔너리 형태로 info.data에 저장되어 있음
        if 'password1' in info.data and v != info.data['password1']:
            raise ValueError('비밀번호가 일치하지 않습니다.')
        return v
    
class Token(BaseModel):
    access_token: str
    token_type: str
    username: str

