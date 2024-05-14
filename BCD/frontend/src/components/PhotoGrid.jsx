import React from 'react';
import './PhotoGrid.css';
import ThumbnailGroup from './ThumbnailGroup';

function PhotoGrid(images) {
  const navigateTo = (url) => () => {
    window.location.href = url;
  };

  return (
    <div className="photo-grid">
      <div onClick={navigateTo('/imagepage')}>
        <ThumbnailGroup src="/moun.jpg" />
      </div>
      <div onClick={navigateTo('/destination/sea')}>
        <ThumbnailGroup src="/sea.jpg" />
      </div>
      <div onClick={navigateTo('/destination/forest')}>
        <ThumbnailGroup src="/in.jpg" />
      </div>
      <div onClick={navigateTo('/destination/city')}>
        <ThumbnailGroup src="/city.jpg" />
      </div>
    </div>
  );
}

export default PhotoGrid;