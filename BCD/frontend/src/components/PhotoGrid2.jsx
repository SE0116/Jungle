import React from 'react';
import './PhotoGrid.css';   // 스타일을 PhotoGrid.css 파일로 분리했다고 가정
import ThumbnailGroup from './ThumbnailGroup';  // ThumbnailGroup 컴포넌트 import

function PhotoGrid2( images ) {
    return (
      <div className="photo-grid">
        {/* 썸네일 사진들을 보여주는 부분 */}
        <ThumbnailGroup src="/red.jpg" />
        <ThumbnailGroup src="/green.jpg" />
        <ThumbnailGroup src="/blue.jpg" />
      </div>
    );
  }
  
  export default PhotoGrid2;
  