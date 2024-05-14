import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { ScrollControls, Scroll } from './AlbumListScrollControls';
import axios from 'axios'; // axios 임포트
import bgImage from './content/background.jpg';
import './AlbumListContent.css';

const PageCover = ({ title, image }) => (
  <div className="page-cover2">
    <div className="image-container">
      <img src={image} alt={title} className="cover-image"/>
    </div>
    <div className="title-container">
      <h2 style={{ color: '#ffffff' }}>{title}</h2>
    </div>
  </div>
);

function Page({ title, position, image }) {
  return (
    <group position={position}>
      <Html>
        <PageCover title={title} image={image} />
      </Html>
    </group>
  );
}

export default function AlbumListContent() {
  const [pages, setPages] = useState([]);

  useEffect(() => {
    const fetchAlbumData = async () => {
      
      try {
        const response = await axios.get(`http://localhost:8000/api/album/data`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`, // 인증 토큰 추가
          }
        });
        const albumData = response.data.map((item, index) => ({
          title: item.albumTitle,
          position: [(index * 6.0) - 5.2, 3.1, 0],
          image: item.imageUrl
        }));
        setPages(albumData);
      } catch (error) {
        console.error('Failed to fetch album data:', error);
        alert('앨범 데이터를 불러오는데 실패했습니다.');
      }
    };

    fetchAlbumData();
  }, []);

  return (
    <Canvas gl={{ antialias: false }} dpr={[1, 1.5]} style={{ backgroundImage: `url(${bgImage})`, width: '100%', height: '100vh' }}>
      <Suspense fallback={null}>
        <ScrollControls pages={2.6} distance={1} damping={4} horizontal={true} infinite={false}>
          <Scroll>
            {pages.map((page, index) => (
              <Page key={index} title={page.title} position={page.position} image={page.image} />
            ))}
          </Scroll>
        </ScrollControls>
      </Suspense>
    </Canvas>
  );
}
