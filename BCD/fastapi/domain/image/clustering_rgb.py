from sklearn.cluster import KMeans, MiniBatchKMeans
from joblib import dump, load
import cv2 as cv
import numpy as np
import json
import os
# 매개변수 설정(예제)
# image_size = (1000, 1000)
# cluster_num = 4
# folder_path   = 'myphotos'
# new_image_path = 'input_images'
# model_path = 'kmeans_rgb_model.pkl'
def rgb_clustering(new_image_path, folder_path=None, model_path=None, image_size=(1000, 1000), cluster_num=4):
    """
    __summary__
    이미지를 색상(HSV) 기반으로 군집화
    Args:
        folder_path: 모델 훈련 샘플 이미지의 폴더 경로, model_path가 None일 때만 사용
        new_image_path: 유저가 업로드한 이미지 폴더 경로,
        model_path: 모델 파일 경로, None일 때 새로운 모델 생성
    Returns:
        [{
            'image_name1': image_name1,
            'image_label1': image_label1
        },
        {
            'image_name2': image_name2,
            'image_label2': image_label2
        }]
    """
    # 이미지 데이터 로드 및 전처리
    def load_images(images_path, target_size=image_size):
        images = []
        filenames = []
        for file in os.listdir(images_path):
            img_path = os.path.join(images_path, file)
            image = cv.imread(img_path)
            if image is not None:
                image = cv.resize(image, target_size, interpolation=cv.INTER_AREA)
                # RGB에서 HSV로 변환
                image = cv.cvtColor(image, cv.COLOR_BGR2HSV)
                images.append(image)
                filenames.append(file)
        print("이미지 개수: ", len(images))
        return images, filenames
    
    
    #### 메인 함수 ####
    def main():
        print("rgb_clustering() 시작\n")
        
        # images와 filenames를 빈 리스트로 초기화
        images = []
        if model_path is not None:
            print("모델 로드 중...\n")
            kmeans = load(model_path)
            print("모델 로드 완료\n")
            print("모델:", kmeans, "\n")
        else:
            if folder_path is not None:
                print("이미지 로드 중...\n")
                images, filenames = load_images(folder_path) # images: 리스트
                print("이미지 로드 완료\n")
            else:
                print("!!!!!!!!!샘플 이미지 폴더 경로(folder_path)를 입력하세요!!!!!!!!!")
                
            # 히스토그램 계산
            all_features = []
            for i in range(len(images)):
                print("히스토그램 계산 중...", i+1, "/", len(images))
                hue_hist = cv.calcHist([images[i]], [0], None, [256], [0, 256])
                all_features.append(hue_hist.flatten())
                
            # all_features를 numpy 배열로 변환하고, 필요하다면 2차원 형태로 조정
            all_features = np.array(all_features, dtype=np.float64)
            if all_features.ndim == 1:
                all_features = all_features.reshape(-1, 1)
                
            print("히스토그램 계산 완료\n")
            print("all_features:", all_features, "\n")
            
            # K-평균 군집화
            print("K-평균 군집화 중...\n")
            kmeans = MiniBatchKMeans(n_clusters=cluster_num, random_state=22, batch_size=100).fit(all_features)
            print("모델:", kmeans, "\n")
            print("K-평균 군집화 완료\n")
            
            
        #### 새 이미지 처리 ####
        print("####새 이미지 처리 시작####\n")
        print("이미지 로드 중...\n")
        new_images, new_file_names = load_images(new_image_path)
        print("새로운 이미지 이름:", new_file_names, "\n")
        print("이미지 로드 완료\n")
        
        # 각 이미지의 히스토그램 계산
        new_all_features = []
        for i in range(len(new_images)):
            print("히스토그램 계산 중...", i+1, "/", len(new_images))
            hue_hist = cv.calcHist([new_images[i]], [0], None, [256], [0, 256])
            new_all_features.append(hue_hist.flatten())
        print("히스토그램 계산 완료\n")
        print("새 이미지 처리 완료\n")
        
        # 새로운 데이터에 대해 모델 업데이트
        print("모델 업데이트 중...\n")
        kmeans.partial_fit(new_all_features)
        
        # 모델 저장
        dump(kmeans, 'kmeans_rgb_model.pkl')
        print("모델 저장 완료\n")
        
        # 가장 가까운 군집 찾기
        print("가장 가까운 군집 찾기 중...\n")
        predict_cluster_label = kmeans.predict(new_all_features)
        print("가장 가까운 군집의 레이블 예측(predict_cluster_label)\n:", predict_cluster_label, "\n")
        print("가장 가까운 군집 찾기 완료\n")
        
        print("####이미지 매칭 결과####\n")
        print("folder_path:", folder_path)
        print("image_size:", image_size)
        print("클러스터 개수(k):", kmeans.n_clusters, "\n")
        print("rgb_clustering() 종료\n")
        ret = []
        for i in range(len(new_file_names)):
            ret.append({
                "image_name": f'{new_file_names[i]}',
                "image_label": f'{predict_cluster_label[i]}'
            })
        return ret
    
    return main()