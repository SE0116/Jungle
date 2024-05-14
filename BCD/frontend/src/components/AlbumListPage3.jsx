// https://cydstumpel.nl/

import * as THREE from 'three'
import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Image, Environment, ScrollControls, useScroll, useTexture } from '@react-three/drei'
import { easing } from 'maath'
import './AlbumListUtil.jsx'
import bgImage from './content/background.jpg';

import { AlbumListProvider } from './AlbumListContext.jsx';

import AlbumListOverlay2 from './AlbumListOverlay2.jsx'
import AlbumListCard from './AlbumListCard.jsx'
import AlbumListRig from './AlbumListRig.jsx'
import AlbumListCarousel from './AlbumListCarousel.jsx'
import AlbumListContent3 from './AlbumListContent3.jsx'
import Navbar from './Navbar.jsx'

export const AlbumListPage3 = () => (
  <>
  <AlbumListProvider>
    <Navbar />
  <AlbumListContent3 />
  <AlbumListOverlay2 />
  </AlbumListProvider>
  
  </>
)
