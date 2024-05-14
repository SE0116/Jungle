import * as THREE from "three";
import { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Preload, Image as ImageImpl } from "@react-three/drei";
import { ScrollControls, Scroll, useScroll } from "./LabelScrollControls";

import Navbar from "./Navbar";
import LabelOverlay from "./LabelOverlay";
// import LabelContent from "./LabelContent";

import LabelContent2 from "./LabelContent2";

import "./LabelPage.css";
import AlbumListPage2 from "./AlbumListPage2";

import { AlbumListProvider } from './AlbumListContext';

import axios from 'axios';
import { useImageData } from './ImageContext';


function LabelPage() {
  const [filterLabel, setFilterLabel] = useState("Filtering");
  const [fetchAttempted, setFetchAttempted] = useState(false); 

  const toggleFilterLabel = () => {
    setFilterLabel((currentLabel) =>
      currentLabel === "Filtering" ? "All" : "Filtering"
    );
  };

  // 여기에서 모든 이미지 미리 로드하기
  const { imageData, setImageData } = useImageData();
  useEffect(() => {
    if (!fetchAttempted || (fetchAttempted && imageData.length > 0)) { // 이미지 데이터가 비어있고 요청이 시도되지 않았거나, 데이터가 있는 경우에만 요청
      const fetchImages = async () => {
        // 모든 이미지 미리 비동기로 로딩하기
        const endpoint = '/api/all'
        try {
          const response = await axios.get(`http://localhost:8000${endpoint}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
              'Label': '/api/all'
            }
          });

          console.log('/LablePage.jsx 이미지 데이터 로드:', response.data);
          
          // 이미지 데이터의 전역 상태 관리
          setImageData(response.data);
          setFetchAttempted(true); // 요청 실패 시에도 상태 업데이트

        } catch (error) {
          console.error('이미지 데이터 로드 중 오류 발생:', error);
          setFetchAttempted(true); // 요청 실패 시에도 상태 업데이트
        }
      };

      if (imageData.length === 0) {
        fetchImages();
      }
    }
  }, [ imageData, setImageData, fetchAttempted ]);

  return (
  <div className="label-page-container">
    <AlbumListProvider>
      <Navbar />
      {/* <LabelContent filterLabel={filterLabel} /> */}
      {/* <LabelContent2 filterLabel={filterLabel} /> */}
      <AlbumListPage2 />
      {/* <LabelOverlay
        onToggleFilterLabel={toggleFilterLabel}
        filterLabel={filterLabel}
      /> */}
    </AlbumListProvider>
  </div>
  );
}

export default LabelPage;
