"""
모델 클래스를 정의하는 파일
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, JSON, ARRAY
from sqlalchemy.orm import relationship
from database import Base

# database.py에서 정의한 Base 클래스를 상속받아서 모델 클래스를 정의
class User(Base):
    __tablename__ = "user"
    
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False) # 중복 불가 -> 오류 예외 처리 필요(user_crud.py)
    password = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False) # 중복 불가 -> 오류 예외 처리 필요(user_crud.py)


class Image(Base):
    __tablename__ = "image"
    
    id = Column(Integer, primary_key=True)
    image_path = Column(String, nullable=False)
    image_name = Column(String, nullable=False)
    # image_lable_feature = Column(Integer, nullable=True)
    image_lable_rgb = Column(Integer, nullable=True)
    user_id = Column(Integer, ForeignKey("user.id"))
    user = relationship("User", backref="image")
    image_edited = Column(Boolean, default=False)
    class_name = Column(String, nullable=True)
    image_meta = Column(String, nullable=True)


class Album(Base):
    __tablename__ = "album"
    
    id = Column(Integer, primary_key=True)
    album_title = Column(String, nullable=False)
    album_filter = Column(ARRAY(String), nullable=False)
    user_id = Column(Integer, ForeignKey("user.id"))
    user = relationship("User", backref="album")


class AlbumArticle(Base):
    __tablename__ = "album_article"
    
    id = Column(Integer, primary_key=True)
    article_title = Column(String, nullable=False) # 앨범 제목
    article_content = Column(Text, nullable=True)
    ariticle_page = Column(Integer, nullable=True)
    album_id = Column(Integer, ForeignKey("album.id"))
    album = relationship("Album", backref="album_article")
    user_id = Column(Integer, ForeignKey("user.id"))
    user = relationship("User", backref="album_article")
    # image_path = Column(String, nullable=True)

class ImageRemoved(Base):
    __tablename__ = "edited"
    id = Column(Integer, primary_key=True)
    image_path = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("user.id"))
    user = relationship("User", backref="edited")