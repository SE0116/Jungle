// https://cydstumpel.nl/

import * as THREE from 'three'
import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Image, Environment, ScrollControls, useScroll, useTexture } from '@react-three/drei'
import { easing } from 'maath'
import './AlbumListUtil.jsx'
import bgImage from './content/background.jpg';

import { AlbumListProvider } from './AlbumListContext';

import AlbumListOverlay2 from './AlbumListOverlay2.jsx'
import AlbumListCard from './AlbumListCard.jsx'
import AlbumListRig from './AlbumListRig.jsx'
import AlbumListCarousel from './AlbumListCarousel.jsx'
import AlbumListContent2 from './AlbumListContent2.jsx'
import Navbar from './Navbar.jsx'

const AlbumListPage2 = () => (
  <>
  <AlbumListProvider>
    {/* <Navbar /> */}
  <AlbumListContent2 />
  <AlbumListOverlay2 />
  </AlbumListProvider>
  
  </>
)

export default AlbumListPage2 ;