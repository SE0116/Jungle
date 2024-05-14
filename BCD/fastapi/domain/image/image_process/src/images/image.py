import cv2
import numpy as np


class Image:
    def __init__(self, path: str, size: int | None = None) -> None:
        """
        Image constructor.

        Args:
            path: path to the image
            size: maximum dimension to resize the image to
        """
        self.path = path
        self.image: np.ndarray = cv2.imread(path)
        if size is not None: # 사용자가 최대 크기를 지정했을 때 실행
            h, w = self.image.shape[:2] # 높이, 너비
            if max(w, h) > size: # 이미지가 최대 크기를 초과하면 실행, 만약에 w,h 둘 다 size 보다 큰 경우는??
                if w > h:
                    self.image = cv2.resize(self.image, (size, int(h * size / w)))
                else:
                    self.image = cv2.resize(self.image, (int(w * size / h), size))

        self.keypoints = None   # 이미지 특징점 저장
        self.features = None    # 특징점에 대한 descriptor
        self.H: np.ndarray = np.eye(3)  # 호모그래피 행렬, 초깃값 = 단위 행렬
        self.component_id: int = 0  # 이미지가 속한 컴포넌트 ID
        self.gain: np.ndarray = np.ones(3, dtype=np.float32) # 픽셀 강도, 초깃값 = 1

    def compute_features(self) -> None:
        """Compute the features and the keypoints of the image using SIFT."""
        descriptor = cv2.SIFT_create()
        keypoints, features = descriptor.detectAndCompute(self.image, None)
        self.keypoints = keypoints
        self.features = features
