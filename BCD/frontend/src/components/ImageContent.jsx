import * as THREE from "three";
import { Suspense, useRef, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Preload, Image as ImageImpl } from "@react-three/drei";
import { ScrollControls, Scroll, useScroll } from "./ScrollControls";
import axios from "axios";
import bgImage from "./content/background.jpg";
import { imageData } from "./ImageContext";

function Image(props) {
  const ref = useRef();
  const group = useRef();
  const data = useScroll();
  const navigate = useNavigate();
  useFrame((state, delta) => {
    group.current.position.z = THREE.MathUtils.damp(
      group.current.position.z,
      Math.max(0, data.delta * 50),
      4,
      delta
    );
    const targetGrayscale = Math.max(0, 1 - data.delta * 1000);
    ref.current.material.grayscale = THREE.MathUtils.damp(
      ref.current.material.grayscale,
      Math.min(targetGrayscale, 0.1),
      4,
      delta
    );
  });
  // 클릭 이벤트 핸들러 추가
  const handleClick = () => {
    // URL에서 파일 이름 추출 ('/image1.jpeg' -> 'image1')
    // const imageName = props.url.split('/').pop().split('.').shift();
    // 'edit/' 경로와 함께 리디렉션
    navigate(`/edit?selectedImage=${encodeURIComponent(
      props.url
    )}`);
  };
  return (
    <group ref={group}>
      <ImageImpl ref={ref} {...props} onClick={handleClick} />
    </group>
  );
}
function Page({ m = 0.4, urls, ...props }) {
  const { width } = useThree((state) => state.viewport);
  const w = width < 10 ? 1.5 / 3 : 1 / 3;
  // console.log(urls);
  return (
    <group {...props}>
      <Image
        position={[-width * w, 0, -1]}
        scale={[width * w - m * 2, 5, 1]}
        url={urls}
      />
    </group>
  );
}
function Pages({ imageGroups }) {
  const { width } = useThree((state) => state.viewport);
  const pageWidth = width / 3; // 페이지 너비 (화면 너비의 1/3)
  // pageWidth는 페이지 간 간격 거리 조정

  return (
    <>
      {imageGroups &&
        imageGroups.map(
          (
            urls,
            index // imageGroups가 undefined일 경우를 대비한 체크
          ) => (
            <Page
              key={index}
              position={[index * pageWidth, 0, 0]}
              urls={urls}
            />
          )
        )}
    </>
  );
}

export default function ImageContent() {
  const [imageGroups, setImageGroups] = useState([]); // imageGroups를 빈 배열로 초기화
  const [imageData, setImageData] = useState([]);
  const [fetchAttempted, setFetchAttempted] = useState(false);

  console.log("ImageContent.jsx: imageData", imageData);
  useEffect(() => {
    // 이미지 데이터가 비어있고 요청이 시도되지 않았거나, 데이터가 있는 경우에만 요청
    if (!fetchAttempted || (fetchAttempted && imageData.length > 0)) {
      const fetchImages = async () => {
        try {
          const response = await axios.get("http://localhost:8000/api/all", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              Label: "All",
            },
          });
          setImageData(response.data);
          console.log(`imageData : ${imageData}`);

          // 이미지 3장씩 그룹화, 전역으로 관리되는 이미지 데이터를 사용
          const image_path = response.data.map((image) => image.image_path);
          const formattedGroups = image_path
            .map((_, index, array) =>
              index % 3 === 0 ? array.slice(index, index + 3) : null
            )
            .filter(Boolean);

          setImageGroups(formattedGroups);
        } catch (error) {
          console.error("Failed to fetch images:", error);
          window.location.href = '/loginandsignup';
        }
      };
      console.log("ImageContent.jsx: imageData 로드 중...");

      if (imageData.length === 0) {
        console.log("ImageContent.jsx: 이미지 데이터가 메모리에 없음");
        fetchImages();
        setFetchAttempted(true); // 무한 루프 방지
      } else {
        console.log("ImageContent.jsx: 이미지 데이터가 메모리에 있음");
        const image_path = imageData.map((image) => image.image_path);
        // const formattedGroups = image_path
        //   .map((_, index, array) =>
        //     index % 3 === 0 ? array.slice(index, index + 3) : null
        //   )
        //   .filter(Boolean);

        // setImageGroups(formattedGroups);
        setImageGroups(image_path);
      }
    }
  }, [imageData]);

  return (
    <Canvas
      gl={{ antialias: false }}
      dpr={[1, 1.5]}
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <Suspense fallback={null}>
        {/* pages는 전체 스크롤 길이 */}
        <ScrollControls
          infinite
          horizontal
          damping={4}
          pages={imageGroups.length / 3}
          distance={1}
        >
          <Scroll>
            <Pages imageGroups={imageGroups} />
          </Scroll>
          <Scroll html>{/* 화면 내 글씨들 */}</Scroll>
        </ScrollControls>
      </Suspense>
    </Canvas>
  );
}
