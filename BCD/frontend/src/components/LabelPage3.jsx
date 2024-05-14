import * as THREE from "three";
import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Preload, Image as ImageImpl } from "@react-three/drei";
import { ScrollControls, Scroll, useScroll } from "./LabelScrollControls";

import axios from "axios";
import { useImageData } from "./ImageContext";
import { AlbumListProvider } from './AlbumListContext';

import Navbar from "./Navbar";


import LabelContent2 from "./LabelContent2";

import "./LabelPage.css";
import { AlbumListPage3 } from "./AlbumListPage3.jsx";


function LabelPage3() {
  const [fetchAttempted, setFetchAttempted] = useState(false);
  
  const { imageData, setImageData } = useImageData();
  useEffect(() => {
    if (!fetchAttempted || (fetchAttempted && imageData.length > 0)) {
    const fetchImages = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/all", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          Label: "All",
        },
      });

      setImageData(response.data);
      console.log(`imageData : ${response.data}`);

    } catch (error) {
      console.error("Failed to fetch images:", error);
      window.location.href = '/loginandsignup';
    }
    };

    console.log("LabelPage3.jsx: imageData 로드 중...");

    if (imageData.length === 0) {
      console.log("LabelPage3.jsx: 이미지 데이터가 메모리에 없음");
      fetchImages();
      setFetchAttempted(true); // 무한 루프 방지
    } else {
      console.log("LabelPage3.jsx: 이미지 데이터가 메모리에 있음");
    }
  }
}, [imageData]);

  return (
    <div className="label-page-container">
    <AlbumListProvider>
      <Navbar />
      {/* <LabelContent filterLabel={filterLabel} /> */}
      {/* <LabelContent2 filterLabel={filterLabel} /> */}
      <AlbumListPage3 />
      {/* <LabelOverlay
        onToggleFilterLabel={toggleFilterLabel}
        filterLabel={filterLabel}
      /> */}
    </AlbumListProvider>
    </div>      
  );
}

export default LabelPage3;
