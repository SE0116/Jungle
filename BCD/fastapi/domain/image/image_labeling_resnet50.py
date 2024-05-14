import tensorflow as tf
import keras

import os
import numpy as np

# 매개변수
# images_path = "/Users/jiho/projects/clustering/similar_images"
# top_numa; 상위 몇 개의 예측을 반환할 것인지

def image_labeling_resnet50(images_path, model=None, top_num=2):
    """_summary_
    이미지를 라벨링하는 함수
    
    Args:
        images_path (_type_): 이미지 파일 경로
        model (_type_, optional): None이면 ResNet50 모델을 사용함
        top_num (int, optional): 상위 몇 개의 예측을 반환할 것인지. Defaults to 2.
    """
    def preprocess(image, boxes=[[0, 0, 1, 1]], box_indices=[0], crop_size=[224, 224]):
        """_summary_
        input: 이미지, 박스, 박스 인덱스, 크롭 크기
        output: 전처리된 이미지(모델에 바로 입력 가능한 형태로 변환된 이미지)
        
        Args:
            image (_type_): _description_
            boxes (list, optional): _description_. Defaults to [[0, 0, 1, 1]].
            box_indices (list, optional): _description_. Defaults to [0].
            crop_size (list, optional): _description_. Defaults to [224, 224].

        Returns:
            _type_: _description_
        """
        print("이미지 전처리 중...")
        # 잘라낼 영역 지정 (여기서는 전체 이미지)
        boxes = [[0, 0, 1, 1]]  # y_min, x_min, y_max, x_max

        # box_indices 설정 (첫 번째 이미지를 가리키므로 0)
        box_indices = [0]

        # 크기 조절
        crop_size = [224, 224] # ResNet50의 기본 입력 크기
        image_resized = tf.image.crop_and_resize(image, boxes, box_indices, crop_size)

        # 이 함수는 픽셀값이 0~255 사이라고 가정함
        inputs = keras.applications.resnet50.preprocess_input(image_resized)
        print("이미지 전처리 완료")
        return inputs
    
    def load_images(images_path):
        images = []
        filenames = []
        for file in os.listdir(images_path):
            img_path = os.path.join(images_path, file)
            # image = cv.imread(img_path)
            image_string = tf.io.read_file(img_path)

            if image_string is not None:
                images.append(image_string)
                filenames.append(file)
        print("이미지 개수: ", len(filenames))
        print("filename", filenames)
        print("이미지 로드 완료")
        return images, filenames
    
    print("image_labeling() 실행\n")
    
    print("이미지 로드 중...")
    images, filenames = load_images(images_path)
        
    # 이미지 디코딩
    print("이미지 디코딩 중...")
    decoded_images = []
    for image_string in images:
        decoded_image = tf.image.decode_image(image_string, channels=3)
        decoded_images.append(decoded_image)
    print("이미지 디코딩 완료")
    
    # 이미지를 4D 텐서로 변환 ([1, height, width, channels])
    print("이미지 4D 텐서로 변환 중...")
    tensor_images = []
    for decoded_image in decoded_images:
        tensor_image = tf.expand_dims(decoded_image, axis=0)
        tensor_images.append(tensor_image)
    print("이미지 4D 텐서로 변환 완료")
    
    # 전처리
    inputs = []
    for tensor_image in tensor_images:
        input = preprocess(tensor_image)
        inputs.append(input)
    # 입력 데이터를 하나의 배치로 만들기, 여러 배치로 나눌 수도 있음
    inputs_batch = np.vstack(inputs)
        
    # 사전 훈련된 모델 로드
    print("모델 로드 중...")
    if model is None:
        print("모델이 지정되지 않았습니다. ResNet50 모델을 사용합니다.")
        model = keras.applications.resnet50.ResNet50(weights="imagenet")
        # model = tf.keras.applications.deeplab_v3_plus()
        
    print("모델 로드 완료")
    
    # 예측 수행
    print("예측 수행 중...")
    Y_proba = model.predict(inputs_batch)
    print("예측 수행 완료")
    
    # 각 이미지에 대해 최상위 K개의 예측을 담은 리스트를 반환
    print("결과 반환 중...")
    top_k = keras.applications.resnet50.decode_predictions(Y_proba, top=top_num)
    
    ret = []    
    for image_index in range(len(filenames)):
        image_predictions = top_k[image_index]  # [(class_id, name, y_proba), ...]
        for class_id, name, y_proba in image_predictions:
            ret.append({
                "image_name": filenames[image_index],
                "class_name": name,
                "proba": y_proba * 100
            })
    return ret
