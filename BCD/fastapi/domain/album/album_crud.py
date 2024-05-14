from sqlalchemy.orm import Session
from domain.album.album_schema import AlbumCreate, AlbumArticleCreate

from models import Album, AlbumArticle, Image, User


def create_album(db: Session, album_create: AlbumCreate, user: User):
    """
    앨범 생성 함수
    - db: DB 세션 객체
    - album_create: AlbumCreate 스키마로 정의한 앨범 생성 정보
    """
    db_album = Album(
        album_title=album_create.album_title,
        album_filter=album_create.album_filter,
        user=user,
    )
    db.add(db_album)
    db.commit()


def create_album_article(db: Session, album_article_create: AlbumArticleCreate, user: User):
    """
    앨범 아티클 생성 함수
    - db: DB 세션 객체
    - album_article_create: AlbumArticleCreate 스키마로 정의한 앨범 아티클 생성 정보
    """
    db_album_article = AlbumArticle(
        article_title=album_article_create.article_title,
        article_content=album_article_create.article_content,
        # article_page=album_article_create.article_page,
        user=user,
    )
    db.add(db_album_article)
    db.commit()


def get_album(db: Session, album_title: str, user: User):
    """
    앨범 조회 함수
    - db: DB 세션 객체
    - album_title: 앨범 제목
    - return:
    """
    filter = db.query(Album).filter(Album.album_title == album_title).all()

    char_list = filter[0].album_filter
    char_string = ''.join(char_list).replace('{', '').replace('}', '')
    result_list = char_string.split(',')
    # print(result_list)

    album_dict = {"albumTitle": album_title}
    photos_list = []
    seen_timestamps = set()

    for index in result_list:
        q = db.query(Image).filter(Image.class_name.ilike(f'%{index}%')).all()

        for i in q:
            timestamp = i.image_meta.split(',')[0]

            if timestamp not in seen_timestamps:
                photos_list.append({
                    "imageUrl": i.image_path,
                    "text": "텍스트입니다.",
                    "timestamp": timestamp
                })
                seen_timestamps.add(timestamp)

    photos_list.sort(key=lambda x: x['timestamp'])

    album_dict["photos"] = photos_list

    return album_dict


def get_album_list(db: Session, user: User):
    """
    앨범 리스트 조회 함수
    - db: DB 세션 객체
    - user: User 모델로 정의한 사용자 정보
    """
    return db.query(Album).filter(Album.user_id == user.id).all()


    
    
    
    
    