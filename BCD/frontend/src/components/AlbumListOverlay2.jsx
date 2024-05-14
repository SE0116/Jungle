// AlbumListOverlay2.jsx 수정

import React, { useState, useRef, useEffect } from "react";
import { useAlbumList } from './AlbumListContext';
import CreateAlbumModal from "./CreateAlbumModal";
import { useNavigate } from 'react-router-dom';
import ReactDOM from 'react-dom';

// URL과 텍스트 매핑 객체 예시입니다. 실제 URL을 사용하도록 변경해주세요.
const cardTexts = {
  "/image1.jpeg": "부산 해운대",
  "/image2.jpeg": "등산 추억",
  "/image3.jpeg": "외국 여행",
  "/image4.jpeg": "겨울 휴가",
  "/image5.jpeg": "다섯 번째 이미지",
  "/image6.jpeg": "여섯 번째 이미지",
  "/image7.jpeg": "일곱 번째 이미지",
  // 나머지 이미지에 대한 텍스트 추가...
};

function AlbumListOverlay() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef(null);
  const navigate = useNavigate();

  const { hoveredCard } = useAlbumList();

  const goBack = () => {
      navigate(-1);
  };

  const openModal = () => {
    document.body.style.overflow = 'hidden';
    setIsModalOpen(true);
  };

  const closeModal = () => {
    document.body.style.overflow = 'auto';
    setIsModalOpen(false);
  };

 useEffect(() => {
  const handleClickOutside = (event) => {
    if (isModalOpen && modalRef.current && !modalRef.current.contains(event.target)) {
      closeModal();
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, [isModalOpen]);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', width: '100%', height: '100%' }}>
      {hoveredCard && (
        <>
          <div style={{ position: 'absolute', bottom: '80%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '50px', color: "white" }}>
            {cardTexts[hoveredCard] || "기본 텍스트"} {/* 호버된 카드에 해당하는 텍스트를 동적으로 표시 */}
          </div>
          {/* <button onClick={goBack} style={{ position: 'absolute', bottom: '43px', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '20px', color: "white", background: "none", border: "none", cursor: "pointer", pointerEvents: 'all' }}>
            수정하기
          </button> */}
        </>
      )}
      {/* <button onClick={goBack} style={{ position: 'absolute', bottom: '43px', left: '80px', fontSize: '20px', color: "white", background: "none", border: "none", cursor: "pointer", pointerEvents: 'all' }}>
        뒤로 가기
      </button> */}
      <button onClick={openModal} style={{ position: 'absolute', bottom: '43px', right: '80px', fontSize: '20px', color: "white", background: "none", border: "none", cursor: "pointer", pointerEvents: 'all' }}>
        앨범 생성
      </button>
      {isModalOpen && ReactDOM.createPortal(
  <div ref={modalRef} onClick={(e) => e.stopPropagation()} style={{zIndex: 10000, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
    <CreateAlbumModal onClose={closeModal} />
  </div>,
  document.body // 모달을 body 태그의 최상단에 렌더링합니다.
)}
      <div style={{ position: 'absolute', top: '100px', left: '40px', fontSize: '20px', color: "white" }}>앨범 목록</div>
    </div>
  )
}

export default AlbumListOverlay;
