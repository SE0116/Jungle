import * as THREE from "three";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { React, Suspense, useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Preload, Image as ImageImpl, OrbitControls } from "@react-three/drei";
import { ScrollControls, Scroll, useScroll } from "./LabelScrollControls";
import { useImageData } from "./ImageContext";

import bgImage from "./content/background.jpg";

function Image(props) {
  const ref = useRef();
  const group = useRef();
  const navigate = useNavigate();

  useFrame((state, delta) => {
    group.current.position.z = THREE.MathUtils.damp(
      group.current.position.z,
      Math.max(0, 0),
      4,
      delta
    );
  });

  const handleClick = () => {
    // const imageName = props.url.split("/").pop().split(".").shift();
    const imageName = props.url;
    console.log("props", props);
    // window.location.href = `/edit/${imageName}`; // edit 페이지로 가되, 헤더에 이미지 이름을 넘겨줌
    // navigate(`/edit?selectedImageForEdit=${imageName}`);
    navigate(`/imagepage?selectedTheme=${imageName}`); //! 쿼리스트링 수정 필요
  };

  return (
    <group ref={group}>
      <ImageImpl ref={ref} {...props} onClick={2} />
    </group>
  );
}

function Page({ m = 0.4, urls, ...props }) {
  const { width } = useThree((state) => state.viewport);
  // Adjust the scale and position to make images smaller and overlapped
  const scale = [2, 2, 1]; // Adjust scale as needed
  const positions = [
    [-0.5, 0.5, 0], // Image 1 position
    [0, 0, 0.1], // Image 2 position, slightly in front/behind the first
    [-0.5, -0.5, 0.2], // Image 3 position, slightly in front/behind the second
  ];

  return (
    <group {...props}>
      {urls.map((url, index) => (
        <Image
          key={index}
          position={positions[index]}
          // rotation={[0, 45*Math.PI/180, 0]} // 모든 이미지 y축에 대해 45도 회전
          // opacity={0.5} transparent={true} // 투명도 조절
          scale={scale}
          url={url}
        />
      ))}
    </group>
  );
}

function Pages({ imageGroups }) {
  const { viewport } = useThree();
  // Define the horizontal spacing between each page group
  const groupWidth = viewport.width / (imageGroups.length / 2);

  return (
    <>
      {imageGroups.map((group, index) => {
        // Determine the vertical position: all items in the first row, then all items in the second row
        const y =
          index < imageGroups.length / 2
            ? -viewport.height / 4
            : viewport.height / 4;
        // Determine the horizontal position: incrementally increase based on the group index
        // For the second row, reset the index to start from 0 again
        const xOffset =
          index < imageGroups.length / 2
            ? index
            : index - imageGroups.length / 2;
        const x = -(viewport.width / 2) + xOffset * groupWidth + groupWidth / 2; // Adjust this calculation as needed

        return <Page key={index} urls={group} position={[x, y, 0]} />;
      })}
    </>
  );
}

export default function LabelContent({ filterLabel }) {
  // imageData: 이미지 데이터 자체, setImageData: 이미지 데이터를 변경하는 함수
  const { imageData, setImageData } = useImageData(); // Context API 사용을 위해 추가 -> 여기에서 이미 imageData를 사용할 준비가 됨
  const [imageGroups, setImageGroups] = useState([]);
  const [fetchAttempted, setFetchAttempted] = useState(false);

  // filterLabel = all -> 정렬된 이미지 보임, filterLabel = Filtering -> 전체 이미지 보임
  console.log("filterLabel 변경:", filterLabel);
  useEffect(() => {
    // 이미지 데이터가 비어있고 요청이 시도되지 않았거나, 데이터가 있는 경우에만 요청
    if (!fetchAttempted || (fetchAttempted && imageData.length > 0)) {
      const fetchImages = async () => {
        // filterLabel 상태에 따라 로직 변경
        const endpoint =
          filterLabel === "Filtering" ? "/api/all" : "/api/filter";
        try {
          const response = await axios.get(`http://localhost:8000${endpoint}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              Label: filterLabel,
            },
          });

          // response.data(=imageData): image의 모든 정보를 담고 있음
          // 예시:
          // {
          // class_name: "['person']",
          // id: 114,
          // image_edited: false,
          // image_lable_rgb: 2,
          // image_meta: "('2023:04:09 10:41:58', 37.513930555555554, 127.10469166666667)",
          // image_name: "IMG_2206.jpeg",
          // image_path: "s3_url",
          // user_id: 8
          // }

          // Context API: 이미지 데이터를 전역 상태로 관리
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
          window.location.href = "/loginandsignup";
        }
      };
      console.log("LabelContent.jsx: imageData 로드 중...");

      // 이미 로드된 이미지 데이터 가져오기
      // 이미지의 캐시 여부 확인
      if (imageData.length === 0) {
        console.log("LabelContent.jsx: 이미지 데이터가 메모리에 없음");
        fetchImages();
        setFetchAttempted(true); // 무한 루프 방지
      } else {
        console.log("LabelContent.jsx: 이미지 데이터가 메모리에 있음");
        const image_path = imageData.map((image) => image.image_path);
        const formattedGroups = image_path
          .map((_, index, array) =>
            index % 3 === 0 ? array.slice(index, index + 3) : null
          )
          .filter(Boolean);

        setImageGroups(formattedGroups);
      }

      //! 테마별 뷰잉 로직
      if (filterLabel === "All") {
        // const class_name = imageData.map((image) => image.class_name);
        // const id = imageData.map((image) => image.id);
        // const image_edited = imageData.map((image) => image.image_edited);
        // const image_meta = imageData.map((image) => image.image_meta);
        // const image_name = imageData.map((image) => image.image_name);
        // const user_id = imageData.map((image) => image.user_id);

        // theme 종류(11개): car, inside, animal, vehicle, person,
        //            electronic, dish, food, sport, accessory, landscape

        // rgb 값에 따라 이미지 그룹화
        const rgb_0_paths = imageData
          .filter((image) => image.image_lable_rgb === 0)
          .map((image) => image.image_path);
        // console.log("rgb_0_paths:", rgb_0_paths);

        const rgb_1_paths = imageData
          .filter((image) => image.image_lable_rgb === 1)
          .map((image) => image.image_path);
        // console.log("rgb_1_paths:", rgb_1_paths);

        const rgb_2_paths = imageData
          .filter((image) => image.image_lable_rgb === 2)
          .map((image) => image.image_path);
        // console.log("rgb_2_paths:", rgb_2_paths);

        // 테마별로 이미지 그룹화 && 공간 별로 이미지 그룹화 추가해보자
        const themeCar = imageData.filter(
          (image) =>
            Array.isArray(image.class_name) && image.class_name.includes("Car")
        );
        const themeInside = imageData.filter(
          (image) =>
            Array.isArray(image.class_name) &&
            image.class_name.includes("Inside")
        );
        const themeAnimal = imageData.filter(
          (image) =>
            Array.isArray(image.class_name) &&
            image.class_name.includes("Animal")
        );
        const themeVehicle = imageData.filter(
          (image) =>
            Array.isArray(image.class_name) &&
            image.class_name.includes("Vehicle")
        );
        const themePerson = imageData.filter(
          (image) =>
            Array.isArray(image.class_name) &&
            image.class_name.includes("Person")
        );
        const themeElectronic = imageData.filter(
          (image) =>
            Array.isArray(image.class_name) &&
            image.class_name.includes("Electronic")
        );
        const themeDish = imageData.filter(
          (image) =>
            Array.isArray(image.class_name) && image.class_name.includes("Dish")
        );
        const themeFood = imageData.filter(
          (image) =>
            Array.isArray(image.class_name) && image.class_name.includes("Food")
        );
        const themeSport = imageData.filter(
          (image) =>
            Array.isArray(image.class_name) &&
            image.class_name.includes("Sport")
        );
        const themeAccessory = imageData.filter(
          (image) =>
            Array.isArray(image.class_name) &&
            image.class_name.includes("Accessory")
        );
        const themeLandscape = imageData.filter(
          (image) =>
            image.class_name === "None" ||
            (Array.isArray(image.class_name) &&
              image.class_name.includes("None"))
        );

        // 로깅 확인
        console.log("themeCar:", themeCar);
        console.log("themeInside:", themeInside);
        console.log("themeAnimal:", themeAnimal);
        console.log("themeVehicle:", themeVehicle);
        console.log("themePerson:", themePerson);
        console.log("themeElectronic:", themeElectronic);
        console.log("themeDish:", themeDish);
        console.log("themeFood:", themeFood);
        console.log("themeSport:", themeSport);
        console.log("themeAccessory:", themeAccessory);
        console.log("themeLandscape:", themeLandscape);

        // 테마별로 이미지 경로만 추출
        // const themeCarPaths = themeCar.map((image) => image.image_path);
        const themeCarPaths = themeCar.map((image) => image.image_path);
        const themeInsidePaths = themeInside.map((image) => image.image_path);
        const themeAnimalPaths = themeAnimal.map((image) => image.image_path);
        const themeVehiclePaths = themeVehicle.map((image) => image.image_path);
        const themePersonPaths = themePerson.map((image) => image.image_path);
        const themeElectronicPaths = themeElectronic.map(
          (image) => image.image_path
        );
        const themeDishPaths = themeDish.map((image) => image.image_path);
        const themeFoodPaths = themeFood.map((image) => image.image_path);
        const themeSportPaths = themeSport.map((image) => image.image_path);
        const themeAccessoryPaths = themeAccessory.map(
          (image) => image.image_path
        );
        const themeLandscapePaths = themeLandscape.map(
          (image) => image.image_path
        );

        // 테마별로 대표 이미지 3장 선택하는 함수
        const selectTopThree = (images) => images.slice(0, 3);

        // 각 테마별로 대표 이미지 3장 선택
        const topRgb0 = selectTopThree(rgb_0_paths);
        const topRgb1 = selectTopThree(rgb_1_paths);
        const topRgb2 = selectTopThree(rgb_2_paths);
        const topCar = selectTopThree(themeCarPaths);
        const topInside = selectTopThree(themeInsidePaths);
        const topAnimal = selectTopThree(themeAnimalPaths);
        const topVehicle = selectTopThree(themeVehiclePaths);
        const topPerson = selectTopThree(themePersonPaths);
        const topElectronic = selectTopThree(themeElectronicPaths);
        const topDish = selectTopThree(themeDishPaths);
        const topFood = selectTopThree(themeFoodPaths);
        const topSport = selectTopThree(themeSportPaths);
        const topAccessory = selectTopThree(themeAccessoryPaths);
        const topLandscape = selectTopThree(themeLandscapePaths);

        const allImageGroups = [
          topRgb0,
          topRgb1,
          topRgb2,
          topCar,
          topInside,
          topAnimal,
          topVehicle,
          topPerson,
          topElectronic,
          topDish,
          topFood,
          topSport,
          topAccessory,
          topLandscape,
        ]; // 각 테마별로 대표 이미지 3장씩 모인 그룹

        setImageGroups(allImageGroups);
      }
    }
  }, [filterLabel, setImageData, imageData]);

  return (
    <Canvas
      gl={{ antialias: false }}
      dpr={[1, 1.5]}
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* <axesHelper scale={10} /> */}
      <OrbitControls />
      <Suspense fallback={null}>
        <ScrollControls
          pages={imageGroups.length / 7}
          distance={1}
          damping={4}
          horizontal={true}
          infinite={false}
        >
          <Scroll>
            <Pages imageGroups={imageGroups} />
          </Scroll>
        </ScrollControls>
      </Suspense>
    </Canvas>
  );
}
