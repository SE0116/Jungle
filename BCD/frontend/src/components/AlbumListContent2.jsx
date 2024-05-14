import React from 'react';
import { Canvas } from '@react-three/fiber';
import './AlbumListUtil.jsx';
import bgImage from './content/background.jpg';
import AlbumListRig from './AlbumListRig.jsx';
import AlbumListCarousel from './AlbumListCarousel.jsx';
import { ScrollControls } from '@react-three/drei';

export const AlbumListContent2 = () => (
    <Canvas style={{ width: '100%', height: '100%' }} camera={{ position: [0, 0, 100], fov: 15 }}>
      <fog attach="fog" args={['#a79', 8.5, 12]} />
      <ScrollControls pages={4} infinite>
        <AlbumListRig rotation={[0, 0, 0.15]}>
          <AlbumListCarousel />
        </AlbumListRig>
      </ScrollControls>
    </Canvas>
);

export default AlbumListContent2;
