import * as THREE from 'three'
import { Suspense, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Preload, Image as ImageImpl } from '@react-three/drei'
import { ScrollControls, Scroll, useScroll } from './ScrollControls'
import ImageOverlay from './ImageOverlay'
import ImageContent from './ImageContent'

import './ImagePage.css'



function ImagePage() {
    return (
        <div className='image-page-container'>
        <ImageContent />
        <ImageOverlay />
        </div>
    )
}

export default ImagePage