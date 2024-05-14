import React from 'react';
import './ThumbnailGroup.css'; // CSS 파일 임포트

function ThumbnailGroup({ src }) {
  return (
    <div className="thumbnailGroup">
      <img src={src} alt="ThumbnailGroup" />
    </div>
  );
}

export default ThumbnailGroup;