// ImageContext.js 수정

import React, { createContext, useState, useContext, useEffect } from "react";

const ImageDataContext = createContext();

export const useImageData = () => useContext(ImageDataContext);

export const ImageDataProvider = ({ children }) => {
  const [imageData, setImageData] = useState(() => {
    // 로컬 스토리지에서 이미지 데이터 불러오기
    const savedImageData = localStorage.getItem("imageData");
    return savedImageData ? JSON.parse(savedImageData) : [];
  });

  useEffect(() => {
    // imageData 상태가 변경될 때마다 로컬 스토리지에 저장
    localStorage.setItem("imageData", JSON.stringify(imageData));
  }, [imageData]);

  return (
    <ImageDataContext.Provider value={{ imageData, setImageData }}>
      {children}
    </ImageDataContext.Provider>
  );
};
