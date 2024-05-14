"""
이미지 스키마
"""
from pydantic import BaseModel, Field
from typing import List, Optional

class ImageUpload(BaseModel):
    # id: int
    # user_id: int
    image_path: str
    image_name: str
    # image_lable_feature: int
    image_lable_rgb: Optional[int] = None
    image_edited: bool
    class_name: Optional[str] = None
    image_meta: Optional[str] = None

class ImageNames(BaseModel):
    images: List[str]

class OverlayImage(BaseModel):
    url: str = Field(..., alias='imageUrl')
    x: float
    y: float
    width: int
    height: int

class ImageMergeData(BaseModel):
    baseImage: str
    overlayImages: List[OverlayImage] # 예: [{"url": "image_url", "x": 100, "y": 200}, ...]

class ImageRemoved(BaseModel):
    image_path: str