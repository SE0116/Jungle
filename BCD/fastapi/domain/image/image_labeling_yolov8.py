from ultralytics import YOLO
from PIL import Image
import os
import json

# images_path = './input_images'

def image_labeling_yolov8(images_path, conf=0.5):
    """_summary_
    객체 탐지 모델인 YOLOv8n 사용하여 이미지 안의 객체 라벨링
    
    Args:
        images_path: 이 디렉토리에 있는 이미지들을 라벨링
        conf: 신뢰도 임계값
        
    Returns:
        [
            {
                'image_name': 'cat-person-2.jpeg', 
                'class_name': 'person', 
                'count': 1, 'average_confidence': 0.6999133825302124
            },
            {
                'image_name': 'cat-person-2.jpeg', 
                'class_name': 'cat', 'count': 3, 
                'average_confidence': 0.4089735249678294
            },
            {
                ...
            }
        ]
    """
    
    # Load a pretrained YOLOv8n model
    model = YOLO('yolov8n.pt')
    
    # Function to process each image and get detection results
    def process_image(image_path):
        image = Image.open(image_path)
        results = model(image, conf=conf)  # Run inference
        return results

    # List to store results for each image
    overall_results = []

    # Iterate over images in the directory
    for file_name in os.listdir(images_path):
        if file_name.lower().endswith(('.png', '.jpg', '.jpeg')):  # Check for image files
            file_path = os.path.join(images_path, file_name)
            results = process_image(file_path)
            
            # Convert results to JSON for easy parsing
            res_json = json.loads(results[0].tojson())

            # Dictionary to store results for current image
            image_results = {}

            # Process each detection in the image
            for det in res_json:
                label = det['name']
                confidence = det['confidence']

                if label not in image_results:
                    image_results[label] = {'count': 0, 'total_confidence': 0}

                image_results[label]['count'] += 1
                image_results[label]['total_confidence'] += confidence

            # Prepare final results for the image
            for label, data in image_results.items():
                overall_results.append({
                    'image_name': file_name,
                    'class_name': label,
                    'count': data['count'],
                    'average_confidence': data['total_confidence'] / data['count']
                })
    
    return overall_results

# print(image_labeling_yolov8(images_path))