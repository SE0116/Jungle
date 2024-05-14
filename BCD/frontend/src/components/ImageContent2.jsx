import * as THREE from 'three'

import { Suspense, useRef } from 'react'

import { Canvas, useFrame, useThree } from '@react-three/fiber'

import { Preload, Image as ImageImpl } from '@react-three/drei'

import { ScrollControls2 as ScrollControls, Scroll, useScroll } from './ScrollControls2'
import bgImage from './content/background.jpg';



function Image(props) {

    const ref = useRef()

    const group = useRef()

    const data = useScroll()

    useFrame((state, delta) => {

      group.current.position.z = THREE.MathUtils.damp(group.current.position.z, Math.max(0, data.delta * 50), 4, delta)

      ref.current.material.grayscale = THREE.MathUtils.damp(ref.current.material.grayscale, Math.max(0, 0 - data.delta * 1000), 4, delta)

    })

    return (

      <group ref={group}>

        <ImageImpl ref={ref} {...props} />

      </group>

    )

  }




  function Page({ m = 0.4, urls, ...props }) {

    const { width } = useThree((state) => state.viewport)

    const w = width < 10 ? 1.5 / 3 : 1 / 3

    return (

      <group {...props}>

        <Image position={[-width * w, 0, -1]} scale={[width * w - m * 2, 5, 1]} url={urls[0]} />

        <Image position={[0, 0, 0]} scale={[width * w - m * 2, 5, 1]} url={urls[1]} />

        <Image position={[width * w, 0, 1]} scale={[width * w - m * 2, 5, 1]} url={urls[2]} />

      </group>

    )

  }




  function Pages() {

    const { width } = useThree((state) => state.viewport)

    return (

      <>

        <Page position={[-width * 1, 0, 0]} urls={['img4.jpg', '/img5.jpg', '/img6.jpg']} />

        <Page position={[width * 0, 0, 0]} urls={['/img7.jpg', '/img8.jpg', '/img9.jpg']} />

        <Page position={[width * 1, 0, 0]} urls={['/img10.jpg', '/img11.jpg', '/img12.jpg']} />

        <Page position={[width * 2, 0, 0]} urls={['/img1.jpg', '/img2.jpg', '/img3.jpg']} />

        <Page position={[width * 3, 0, 0]} urls={['img13.jpg', '/img14.jpg', '/img15.jpg']} />




        <Page position={[width * 4, 0, 0]} urls={['img4.jpg', '/img5.jpg', '/img6.jpg']} />

        <Page position={[width * 5, 0, 0]} urls={['/img7.jpg', '/img8.jpg', '/img9.jpg']} />

        <Page position={[width * 6, 0, 0]} urls={['/img10.jpg', '/img11.jpg', '/img12.jpg']} />

        <Page position={[width * 7, 0, 0]} urls={['/img1.jpg', '/img2.jpg', '/img3.jpg']} />

        <Page position={[width * 8, 0, 0]} urls={['img13.jpg', '/img14.jpg', '/img15.jpg']} />

      </>

    )

  }




  export default function ImageContent2() {

    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        backgroundImage: `url(${bgImage})`,
        backgroundSize: '100% 100%', // 이미지를 가로 세로 100%로 설정
        backgroundPosition: 'center center',
      }}>
        <Canvas style={{ width: '100%', height: '100%' }} gl={{ antialias: false }} dpr={[1, 1.5]}>

        <Suspense fallback={null}>

          <ScrollControls infinite horizontal damping={4} pages={6} distance={1}>

            <Scroll>

              <Pages />

            </Scroll>

            <Scroll html>

              <h1 style={{ position: 'absolute', top: '20vh', left: '-75vw' }}></h1>

              <h1 style={{ position: 'absolute', top: '20vh', left: '25vw' }}></h1>

              <h1 style={{ position: 'absolute', top: '20vh', left: '125vw' }}></h1>

              <h1 style={{ position: 'absolute', top: '20vh', left: '225vw' }}></h1>

              <h1 style={{ position: 'absolute', top: '20vh', left: '325vw' }}></h1>




              <h1 style={{ position: 'absolute', top: '20vh', left: '425vw' }}></h1>

              <h1 style={{ position: 'absolute', top: '20vh', left: '525vw' }}></h1>

              <h1 style={{ position: 'absolute', top: '20vh', left: '625vw' }}></h1>

              <h1 style={{ position: 'absolute', top: '20vh', left: '725vw' }}></h1>

              <h1 style={{ position: 'absolute', top: '20vh', left: '825vw' }}></h1>

            </Scroll>

          </ScrollControls>

          <Preload />

        </Suspense>

      </Canvas>

      </div>
      
    )

  }