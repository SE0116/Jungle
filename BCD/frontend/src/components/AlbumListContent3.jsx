import React from 'react';
import { Canvas } from '@react-three/fiber';
import './AlbumListUtil.jsx';
import bgImage from './content/background.jpg';
import AlbumListRig from './AlbumListRig.jsx';
import AlbumListCarousel3 from './AlbumListCarousel3.jsx';
import { ScrollControls } from '@react-three/drei';

export const AlbumListContent3 = () => (
  <div style={{
    width: '100vw',
    height: '100vh',
    backgroundImage: `url(${bgImage})`,
    backgroundSize: '100% 100%', // 이미지를 가로 세로 100%로 설정
    backgroundPosition: 'center center',
  }}>
    <Canvas style={{ width: '100%', height: '100%' }} camera={{ position: [0, 0, 100], fov: 15 }}>
      <fog attach="fog" args={['#a79', 8.5, 12]} />
      <ScrollControls pages={4} infinite>
        <AlbumListRig rotation={[0, 0, 0.15]}>
          <AlbumListCarousel3 />
        </AlbumListRig>
      </ScrollControls>
    </Canvas>
  </div>
);

export default AlbumListContent3;
