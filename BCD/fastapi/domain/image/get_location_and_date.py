from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS


def get_location_and_date(image_path):
    """_summary_
    이미지 파일의 경로를 입력받아 해당 이미지의 촬영 일시와 GPS 정보를 반환
    Args:
        image_path (_type_): _description_
    Returns:
        ('2024:02:09 13:03:13', 37.29992222222222, 127.03039444444444)
        or 
        값이 존재하지 않으면 None
    """
    def get_decimal_from_dms(dms, ref):
        degrees, minutes, seconds = dms
        decimal = degrees + (minutes / 60.0) + (seconds / 3600.0)
        if ref in ['S', 'W']:
            decimal = -decimal
        return decimal

    def get_gps_location(image_path):
        with Image.open(image_path) as img:
            exif_data = img._getexif()
            if not exif_data:
                return None, None

            gps_info = {}
            for tag, value in exif_data.items():
                decoded = TAGS.get(tag, tag)
                if decoded == 'GPSInfo':
                    for gps_tag in value:
                        sub_decoded = GPSTAGS.get(gps_tag, gps_tag)
                        gps_info[sub_decoded] = value[gps_tag]

            if 'GPSLatitude' in gps_info and 'GPSLatitudeRef' in gps_info and 'GPSLongitude' in gps_info and 'GPSLongitudeRef' in gps_info:
                lat = get_decimal_from_dms(gps_info['GPSLatitude'], gps_info['GPSLatitudeRef'])
                lon = get_decimal_from_dms(gps_info['GPSLongitude'], gps_info['GPSLongitudeRef'])
                return lat, lon
            else:
                return None, None
    
    def get_datetime(image_path):
        with Image.open(image_path) as img:
            exif_data = img._getexif()
            if not exif_data:
                return None

            for tag_id, data in exif_data.items():
                tag = TAGS.get(tag_id, tag_id)
                if tag == 'DateTimeOriginal':
                    if isinstance(data, bytes): 
                        return data.decode('utf-8', 'ignore')
                    else:
                        return data

            return None

    latitude, longitude = get_gps_location(image_path)
    datetime = get_datetime(image_path)

    # maps_url = f"https://www.google.com/maps?q={latitude},{longitude}"
    return datetime, latitude, longitude
