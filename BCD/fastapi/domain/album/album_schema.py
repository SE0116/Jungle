"""
필터링 기반으로 생성된 앨범 스키마
"""
from pydantic import BaseModel
from typing import List, Union, Text



class AlbumCreate(BaseModel):
    album_title: str
    album_filter: List[str]
    # user_id: 연결된 사용자의 id

class AlbumArticleCreate(BaseModel):
    article_title: str
    article_content: Union[Text, None] = None
    article_page: Union[int, None] = None
    # album_id: 연결된 앨범의 id
    # user_id: 연결된 사용자의 id