from fastapi.responses import JSONResponse, FileResponse
from fastapi import APIRouter, HTTPException, File, UploadFile, Depends, BackgroundTasks
from typing import List, Dict
import os, cv2
import subprocess

from domain.image import image_crud
from domain.image.image_schema import ImageUpload, ImageNames, OverlayImage, ImageMergeData, ImageRemoved
from domain.image.image_crud import make_sample_dir, aws_upload, db_update, db_removed_update

# from domain.image.clustering_image import image_clustering
from domain.image.get_location_and_date import get_location_and_date
from domain.image.image_labeling_yolov8 import image_labeling_yolov8
from domain.image.image_labeling_resnet50 import image_labeling_resnet50
from domain.image.clustering_rgb import rgb_clustering

from domain.user.user_router import get_current_user

from models import User
from database import get_db

from sqlalchemy.orm import Session  # Session 클래스 임포트
import aiofiles
from PIL import Image, ExifTags
from io import BytesIO

from rembg import remove
import numpy as np

import boto3
from botocore.exceptions import ClientError, NoCredentialsError, PartialCredentialsError
from urllib.parse import urlparse
import re
from domain.image.theme_dict import theme
import datetime


router = APIRouter(
    # prefix="/image",
)

start_dir = "../frontend/public/aws_upload/"
remove_dir = "../frontend/public/img_0"

s3_client = boto3.client('s3', aws_access_key_id=ACCESS_KEY, aws_secret_access_key=SECRET_KEY)

@router.post("/group/album/upload", tags=["image"])
async def image_upload(files: List[UploadFile] = File(...), db=Depends(get_db), current_user: User = Depends(get_current_user)):
    results = []
    results_aws = []
    results_image_meta = []
    
    yolo = []
    results_yolo = {}
    results_rgb = []
    results_for_db = []

    num_path, num = make_sample_dir(start_dir)

    for file in files:
        content = await file.read()
        file_path = os.path.join(num_path, file.filename)

        with open(file_path, "wb") as fp:
            fp.write(content)

        results.append({"filename": file_path, "num": num})
        results_aws.append(aws_upload(file_path, "jungle-buchida-s3", f"{num_path.split('/')[-1]}/{file.filename}"))
        print(file_path)

        results_image_meta.append(get_location_and_date(file_path))

    yolo = image_labeling_yolov8(num_path)

    for item in yolo:
    # 해당 class_name의 테마 찾기
        class_theme = 'None'  # 기본값으로 'Other' 설정
        for theme_key, classes in theme.items():
            if item['class_name'] in classes:
                class_theme = theme_key
                break
        
        # 이미지 이름으로 딕셔너리에 저장, 테마를 리스트로 추가
        if item['image_name'] in results_yolo:
            # 이미 리스트에 테마가 존재하면 추가하지 않음
            if class_theme not in results_yolo[item['image_name']]:
                results_yolo[item['image_name']].append(class_theme)
        else:
            # 이미지 이름이 사전에 없으면 새로운 키로 추가하고 테마를 리스트로 시작
            results_yolo[item['image_name']] = [class_theme]

    results_rgb = rgb_clustering(new_image_path=num_path, folder_path=None, model_path="./kmeans_rgb_model.pkl")

    for i in range((len(results_aws))):
        results_for_db ={
                            "image_path": results_aws[i], 
                            "image_name": results_aws[i].split('/')[-1],
                            "class_name": str(results_yolo.get(results_aws[i].split('/')[-1])),
                            "image_lable_rgb": str(results_rgb[i]['image_label']),
                            "image_meta": ', '.join(map(str, results_image_meta[i])),
                            "image_edited": False,
                        }
        db_update(db, update_db=ImageUpload(**results_for_db), user=current_user)
    return JSONResponse(content=results)


@router.get("/api/all", tags=["image"])
async def get_album(db=Depends(get_db), current_user: User = Depends(get_current_user)):
    image_list = []
    images = db.query(image_crud.Image).filter(
        image_crud.Image.user_id == current_user.id
        ).all()
    
    # 이미지 모델 직렬화
    for image in images:
        image_data = {
            "id": image.id,
            "image_path": image.image_path,
            "image_name": image.image_name,
            "image_lable_rgb": image.image_lable_rgb,
            "user_id": image.user_id,
            "image_edited": image.image_edited,
            "class_name": image.class_name,
            "image_meta": image.image_meta,
            "image_edited": False
        }
        image_list.append(image_data)
        
    return JSONResponse(content=image_list)

@router.get("/api/filter", tags=["image"])
async def get_album(db=Depends(get_db), current_user: User = Depends(get_current_user)):
    image_list = []
    images = db.query(image_crud.Image).filter(
        (image_crud.Image.user_id == current_user.id) &
        (image_crud.Image.image_lable_rgb==2))
    for i in images:
        image_list.append(i.image_path)
    return JSONResponse(content=image_list)


@router.get("/api/images", tags=["image"])
def get_image_list(db=Depends(get_db), current_user: User = Depends(get_current_user)):
    
    user_image = db.query(image_crud.Image).filter(
        image_crud.Image.user_id == current_user.id
        ).all().filter(image_crud.Image.image_path).all()

    s3 = boto3.client(SERVICE_NAME, aws_access_key_id=ACCESS_KEY, aws_secret_access_key=SECRET_KEY, region_name=REGION)
    response = s3.list_objects_v2(Bucket=BUCKET_NAME)    

    image_files = [content['Key'] for content in response.get('Contents', []) if content['Key'].startswith('img/')]
    print(image_files)
    return image_files

async def check_image_exists(s3_image_path):
    try:
        response = s3_client.list_objects_v2(Bucket=BUCKET_NAME, Prefix=s3_image_path)
        if 'Contents' in response and len(response['Contents']) > 0:
            return True  # 이미지가 존재함
        else:
            return False  # 이미지가 존재하지 않음
    except (NoCredentialsError, PartialCredentialsError) as e:
        raise HTTPException(status_code=500, detail=f"Credentials issue: {str(e)}")
    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == 'NoSuchBucket':
            raise HTTPException(status_code=500, detail="Bucket does not exist.")
        else:
            raise HTTPException(status_code=500, detail=f"Unexpected S3 error: {str(e)}")

async def download_image_from_s3(s3_image_path):
    obj = s3_client.get_object(Bucket=BUCKET_NAME, Key=s3_image_path)
    return obj['Body'].read()

async def upload_image_to_s3(image_bytes, s3_image_path):
    s3_client.put_object(Bucket=BUCKET_NAME, Key=s3_image_path, Body=image_bytes, ContentType='image/jpeg')

@router.post("/remove_background", tags=["image"])
async def remove_background(image_names: ImageNames, db=Depends(get_db), current_user: User = Depends(get_current_user)):
    processed_images = []
    for s3_image_url in image_names.images:
        s3_image_path = s3_image_url[s3_image_url.find('amazonaws.com') + len('amazonaws.com') + 1:]
        output_image_name = f'removed_{s3_image_path}'
        
        # 이미 처리된 이미지가 있는지 확인
        if await check_image_exists(output_image_name):
            processed_images.append(f"https://{BUCKET_NAME}.s3.amazonaws.com/{output_image_name}")
            continue
        try:
            # S3에서 이미지 다운로드
            input_image = await download_image_from_s3(s3_image_path)
            output_image = remove(input_image)  # 배경 제거 처리

            # 바이트 데이터를 Image 객체로 변환
            image = Image.open(BytesIO(output_image))

            # 이미지 크기 조정
            resized_image = image.resize((800, 800))

            # Image 객체를 바이트 데이터로 변환하여 S3에 업로드
            buf = BytesIO()
            resized_image.save(buf, format='PNG')
            resized_image_bytes = buf.getvalue()

            output_image_name = f'removed_{s3_image_path}'
            await upload_image_to_s3(resized_image_bytes, output_image_name)
            processed_images.append(f"https://{BUCKET_NAME}.s3.amazonaws.com/{output_image_name}")

            results_for_db ={
                                "image_path": f"https://{BUCKET_NAME}.s3.amazonaws.com/{output_image_name}",
                            }
            db_removed_update(db, update_db=ImageRemoved(**results_for_db), user=current_user)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    return processed_images


async def generate_unique_filename(base_image_path, bucket_name):
    # 기본 이미지 이름 추출
    parsed_url = urlparse(base_image_path)
    base_image_name = re.sub(r'\W+', '_', os.path.splitext(os.path.basename(parsed_url.path))[0])
    
    index = 0
    while True:
        # 파일명 생성
        potential_name = f"overlay_{base_image_name}_{index}.jpg"
        try:
            s3_client.head_object(Bucket=bucket_name, Key=potential_name)
            index += 1  # 파일이 존재하면 인덱스 증가
        except:
            return potential_name  # 중복되지 않는 파일명 반환
        

@router.post("/merge_images", tags=["image"])
async def merge_images(data: ImageMergeData, db=Depends(get_db), current_user: User = Depends(get_current_user)):
    base_image_path = data.baseImage[data.baseImage.find('amazonaws.com') + len('amazonaws.com') + 1:]
    base_image_bytes = await download_image_from_s3(base_image_path)
    base_image = Image.open(BytesIO(base_image_bytes))
    # base_image_resized = base_image.resize((800, 800))
    try:
        # 이미지의 EXIF 태그에서 회전 정보를 가져옵니다.
        for orientation in ExifTags.TAGS.keys():
            if ExifTags.TAGS[orientation] == 'Orientation':
                break
        exif = dict(base_image._getexif().items())
        
        # 이미지의 방향을 확인하고 필요한 경우 회전합니다.
        if exif[orientation] == 3:
            base_image = base_image.rotate(180, expand=True)
        elif exif[orientation] == 6:
            base_image = base_image.rotate(270, expand=True)
        elif exif[orientation] == 8:
            base_image = base_image.rotate(90, expand=True)
    except (AttributeError, KeyError, IndexError):
        # 이미지에 EXIF 정보가 없는 경우 회전하지 않습니다.
        pass
    # 원본 이미지의 크기를 가져옵니다.
    original_width, original_height = base_image.size

    # 비율을 유지하면서 최대 길이 800px에 맞춰 리사이징합니다.
    if original_width > original_height:
        scale = 800 / original_width
        new_height = int(original_height * scale)
        new_size = (800, new_height)
    else:
        scale = 800 / original_height
        new_width = int(original_width * scale)
        new_size = (new_width, 800)
    
    # 새로운 크기로 이미지 리사이징, Image.ANTIALIAS 대신 Image.Resampling.LANCZOS 사용
    base_image_resized = base_image.resize(new_size, Image.Resampling.LANCZOS)

    for overlay in data.overlayImages:
        s3_image_path = overlay.url[overlay.url.find('amazonaws.com') + len('amazonaws.com') + 1:]
        overlay_image_bytes = await download_image_from_s3(s3_image_path)
        overlay_image = Image.open(BytesIO(overlay_image_bytes))

        # 새로운 크기로 이미지 크기 조정
        overlay_image_resized = overlay_image.resize((overlay.width, overlay.height))

        # 지정된 위치에 이미지를 붙입니다. 마지막 인자는 "마스크"로, 투명도가 있는 이미지를 올바르게 처리하기 위해 사용됩니다.
        # base_image_resized.paste(overlay_image_resized, (int(overlay.x), int(overlay.y)), overlay_image_resized.convert('RGBA'))
        base_image_resized.paste(overlay_image_resized, (int(overlay.x)+50, int(overlay.y)+60), overlay_image_resized.convert('RGBA'))
    # 합성된 이미지를 바이트로 변환
    buffer = BytesIO()
    # base_image_resized.save(buffer, format="PNG")
    base_image_resized.save(buffer, format="JPEG")
    merged_image_bytes = buffer.getvalue()

    # 동적 파일명 생성 및 업로드
    unique_filename = await generate_unique_filename(data.baseImage, BUCKET_NAME)
    await upload_image_to_s3(merged_image_bytes, unique_filename)

    results_for_db ={
                        "image_path": f"https://{BUCKET_NAME}.s3.amazonaws.com/{unique_filename}",
                        "image_name": unique_filename,
                        "image_edited": True,         
                    }
    db_update(db, update_db=ImageUpload(**results_for_db), user=current_user)

    print('========================================')
    print('now : ', unique_filename)
    print('========================================')
    return f"https://{BUCKET_NAME}.s3.amazonaws.com/{unique_filename}"


@router.post("/stitch_images", tags=["image"])
async def stitch_images(image_names: ImageNames, db=Depends(get_db), current_user: User = Depends(get_current_user)):
    images = []

    for s3_image_url in image_names.images:
        # S3 경로와 로컬 경로 설정
        s3_image_path = s3_image_url[s3_image_url.find('amazonaws.com') + len('amazonaws.com') + 1:]
        local_image_path = s3_image_path.split('/')[-1]


        # S3에서 이미지 다운로드
        s3_client.download_file(BUCKET_NAME, s3_image_path, local_image_path)
        image = cv2.imread(local_image_path)
        if image is None:
            raise HTTPException(status_code=500, detail=f"Failed to load image {s3_image_path}")
        images.append(image)
        # 로컬에 저장된 이미지 삭제
        os.remove(local_image_path)

    # 이미지 스티칭
    stitcher = cv2.Stitcher_create()
    (status, stitched) = stitcher.stitch(images)

    if status == cv2.Stitcher_OK:
        # 현재 시간을 기반으로 고유한 파일명 생성
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        stitched_filename = f"stitched_result_{timestamp}.jpg"
        cv2.imwrite(stitched_filename, stitched)

        # S3에 스티칭된 이미지 업로드
        s3_stitched_image_path = f"stitched_images/{stitched_filename}"
        s3_client.upload_file(stitched_filename, BUCKET_NAME, s3_stitched_image_path, ExtraArgs={'ContentType': 'image/jpeg', 'ContentDisposition': 'inline'})
        print('===============================================================')    
        print(f"https://{BUCKET_NAME}.s3.amazonaws.com/{s3_stitched_image_path}")
        print('===============================================================')    
        # 임시 파일 삭제
        os.remove(stitched_filename)
        # 스티칭된 이미지의 S3 URL 반환
        results_for_db ={
                            "image_path": f"https://{BUCKET_NAME}.s3.amazonaws.com/{s3_stitched_image_path}",
                            "image_name": s3_stitched_image_path,
                            "image_edited": True,
                        }
        db_update(db, update_db=ImageUpload(**results_for_db), user=current_user)

        return f"https://{BUCKET_NAME}.s3.amazonaws.com/{s3_stitched_image_path}"

    else:
        raise HTTPException(status_code=500, detail="서로 붙일 수 없는 이미지를 선택했습니다. 다른 이미지를 선택해주세요.")
