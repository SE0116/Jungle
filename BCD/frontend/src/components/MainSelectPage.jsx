import { React, useEffect, useState } from 'react';
import axios from 'axios';

import { useNavigate } from 'react-router-dom'; // useNavigate 훅 임포트
import './MainSelectPage.css'; // CSS 파일 경로 확인
import bgImage from './content/background.jpg';
import { useImageData } from './ImageContext';
import Navbar from './Navbar';

function MainSelectPage() {
  const [ fetchAttempted, setFetchAttempted ] = useState(false); // 요청 시도 상태 추가

  const navigate = useNavigate(); // useNavigate 훅 사용

  // "Album Create" 버튼 클릭 핸들러
  const handleAlbumCreateClick = () => {
    navigate('/labelpage'); // /labelpage 경로로 이동
  };
  // cardpage2 개발중
  // const handleAlbumCreateClick = () => {
  //   navigate('/cardpage2'); // /labelpage 경로로 이동
  // };

  // "Album List" 버튼 클릭 핸들러
  const handleAlbumListClick = () => {
    navigate('/albumlist'); // /albumlist 경로로 이동
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

          console.log('/mainselect 이미지 데이터 로드:', response.data);
          
          // 이미지 데이터의 전역 상태 관리
          setImageData(response.data);
          setFetchAttempted(true); // 요청 실패 시에도 상태 업데이트

        } catch (error) {
          console.error('이미지 데이터 로드 중 오류 발생:', error);
          setFetchAttempted(true); // 요청 실패 시에도 상태 업데이트
        }
      };

      if (imageData.length === 0) {
        console.log("imageData", imageData);
        fetchImages();
      }
    }
  }, [ imageData, setImageData, fetchAttempted ]);


  return (
    <div>
      <Navbar />
      <div className="sel-container">
        <div className="select-button-group">
          <button className="select-button" onClick={handleAlbumCreateClick}>
            앨범 생성
          </button>
          <button className="select-button" onClick={handleAlbumListClick}>
            앨범 리스트
          </button>
        </div>
      </div>
    </div>
    
  );
}

export default MainSelectPage;
