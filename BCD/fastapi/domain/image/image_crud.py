from sqlalchemy.orm import Session
from domain.image.image_schema import ImageUpload, ImageRemoved
from models import Image, User, ImageRemoved

import os
import boto3


def make_sample_dir(start_dir):
    num = 1
    while True:
        fname = start_dir + '_' + f"{num:02}"
        if not os.path.exists(fname):
            os.makedirs(fname)
            break
        else:
            num += 1
            continue
    return fname, f'{num:02}'


def aws_upload(input, bucket, output):
    s3 = boto3.client(SERVICE_NAME, aws_access_key_id=ACCESS_KEY, aws_secret_access_key=SECRET_KEY, region_name=REGION)

    try:
        s3.upload_file(input, bucket, output, ExtraArgs={'ContentType': 'image/jpeg'})
    except Exception as e:
        print(e)
        return None
    
    image_url = f"https://{BUCKET_NAME}.s3.{REGION}.amazonaws.com/{output}"
    
    return image_url


def db_update(db: Session, update_db: ImageUpload, user: User):
    db_image = Image(
            image_path = update_db.image_path,
            image_name = update_db.image_name,
            # image_lable_feature = update_db.image_lable_feature,
            image_lable_rgb = update_db.image_lable_rgb,
            user = user,
            image_edited = update_db.image_edited,
            class_name = update_db.class_name,
            image_meta = update_db.image_meta,
            )
    db.add(db_image)
    db.commit()
    

def db_removed_update(db: Session, update_db: ImageRemoved, user: User):
    db_image_removed = ImageRemoved(
            image_path = update_db.image_path,
            user = user,
            )
    db.add(db_image_removed)
    db.commit()
    