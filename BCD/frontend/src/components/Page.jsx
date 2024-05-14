import React from 'react';
import './Page.css';

const Page = React.forwardRef(({ number, text, imageUrl, timestamp }, ref) => {
  const backgroundImageStyle = {
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: 'cover',
    height: '100%', // Adjust as needed
  };

  return (
    <div className="page" ref={ref}>
      <div className="page-content">
        <h2 className="page-header">{timestamp}</h2>
        <div className="page-image" style={backgroundImageStyle}></div>
        <div className="page-text">{text}</div>
        <div className="page-footer">{number}</div>
      </div>
    </div>
  );
});

export default Page;
