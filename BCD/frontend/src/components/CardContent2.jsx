import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas, extend, useFrame, useThree } from "@react-three/fiber";
import {
  useCursor,
  MeshPortalMaterial,
  CameraControls,
  Gltf,
  Text,
  OrbitControls,
} from "@react-three/drei";
import { useRoute, useLocation } from "wouter";
import { easing, geometry } from "maath";
import { suspend } from "suspend-react";

import { ScrollControls, Scroll, useScroll } from "./LabelScrollControls";
import bgImage from "./content/background.jpg";

extend(geometry);
const regular = import("@pmndrs/assets/fonts/inter_regular.woff");
const medium = import("@pmndrs/assets/fonts/inter_medium.woff");

function Frame({
  selectedTheme,
  id,
  name,
  author,
  bg,
  width = 1,
  height = 1.61803398875,
  children,
  ...props
}) {
  const portal = useRef();
  const [, setLocation] = useLocation();
  // const [, params] = useRoute("/item/:id");
  const [, params] = useRoute("/imagepage/:selectedTheme");
  const [hovered, hover] = useState(false);

  useCursor(hovered);

  // easing.damp을 사용하여 portal.current의 blend 값을 0.2초 동안 1로 변화시킴
  useFrame((state, dt) =>
    easing.damp(portal.current, "blend", params?.id === id ? 1 : 0, 0.2, dt)
  );

  return (
    <group {...props}>
      <Text
        font={suspend(medium).default}
        fontSize={0.3}
        anchorY="top"
        anchorX="left"
        lineHeight={0.8}
        position={[-0.375, 0.715, 0.01]}
        material-toneMapped={false}
      >
        {name}
      </Text>
      <Text
        font={suspend(regular).default}
        fontSize={0.2}
        // anchorX="right"
        anchorX="right"
        position={[-0.1, -0.659, 0.01]}
        material-toneMapped={false}
      >
        /{id}
      </Text>
      {/* <Text
        font={suspend(regular).default}
        fontSize={0.04}
        anchorX="right"
        position={[0.0, -0.677, 0.01]}
        material-toneMapped={false}
      >
        {author}
      </Text> */}
      <mesh
        name={selectedTheme}
        onDoubleClick={ async (e) => {
          // e.stopPropagation(), setLocation("/item/" + e.object.name)
          // e.stopPropagation(), setLocation("/imagepage/" + e.object.name)
          e.stopPropagation();

          setLocation("/imagepage/" + e.object.name);
        }}
        onPointerOver={(e) => hover(true)}
        onPointerOut={() => hover(false)}
        >
        <roundedPlaneGeometry args={[width, height, 0.1]} />
        <MeshPortalMaterial
          ref={portal}
          events={params?.id === id}
          side={THREE.DoubleSide}
        >
          <color attach="background" args={[bg]} />
          {children}
        </MeshPortalMaterial>
      </mesh>
    </group>
  );
}

// r3f의 카메라 제어를 위한 컴포넌트
function Rig({
  position = new THREE.Vector3(0, 0, 2),
  focus = new THREE.Vector3(0, 0, 0),
}) {
  const { controls, scene } = useThree();
  // const [, params] = useRoute("/item/:id");
  const [, params] = useRoute("/imagepage/:selectedTheme");
  useEffect(() => {
    // const active = scene.getObjectByName(params?.id);
    const active = scene.getObjectByName(params?.selectedTheme);
    if (active) {
      active.parent.localToWorld(position.set(0, 0.5, 0.25));
      active.parent.localToWorld(focus.set(0, 0, -2));
    }
    controls?.setLookAt(...position.toArray(), ...focus.toArray(), true);
  });
  return (
    <CameraControls
      makeDefault
      minPolarAngle={0}
      maxPolarAngle={Math.PI / 2}
      enableZoom={false}
    />
  );
}

export default function CardContent2() {
  return (
    <Canvas
      camera={{ fov: 75, position: [0, 0, 20] }}
      eventSource={document.getElementById("root")}
      eventPrefix="client"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <axesHelper scale={10} />
      {/* <color attach="background" args={["#f0f0f0"]} /> */}

      <Frame
        id="01"
        // name={`pick\nles`}
        name={`Per-\nson`}
        selectedTheme={"person"}
        author="Omar Faruq Tawsif"
        bg="#e4cdac"
        position={[-1.15, 0, 0]}
        rotation={[0, 0, 0]}

        onDoubleClick={(e) => {
          e.stopPropagation();
        // 여기에 페이지 이동 로직 추가
          window.location.href = "/";
        }}
      >
        {/* <Gltf
        src="pickles_3d_version_of_hyuna_lees_illustration-transformed.glb"
        scale={8}
        position={[0, -0.7, -2]}
      /> */}
      </Frame>
      <Frame id="02" name={"Land-\nscape"} author="Omar Faruq Tawsif">
        {/* <Gltf src="fiesta_tea-transformed.glb" position={[0, -2, -3]} /> */}
      </Frame>
      <Frame
        id="03"
        name={"In-\nterior"}
        author="Omar Faruq Tawsif"
        bg="#d1d1ca"
        position={[1.15, 0, 0]}
        rotation={[0, 0, 0]}
      >
        {/* <Gltf
        src="still_life_based_on_heathers_artwork-transformed.glb"
        scale={2}
        position={[0, -0.8, -4]}
      /> */}
      </Frame>
      <Frame
        id="04"
        name="Food"
        author="Omar Faruq Tawsif"
        bg="#d1d1ca"
        position={[2.3, 0, 0]}
      ></Frame>
      <Frame
        id="05"
        name="Car"
        author="Omar Faruq Tawsif"
        bg="#d1d1ca"
        position={[3.45, 0, 0]}
      ></Frame>
      <Frame
        id="06"
        name="Animal"
        author="Omar Faruq Tawsif"
        bg="#d1d1ca"
        position={[4.6, 0, 0]}
      ></Frame>
      <Frame
        id="07"
        name={"Vehi-\ncle"}
        author="Omar Faruq Tawsif"
        bg="#d1d1ca"
        position={[5.75, 0, 0]}
      ></Frame>
      <Frame
        id="08"
        name="Sport"
        author="Omar Faruq Tawsif"
        bg="#d1d1ca"
        position={[6.9, 0, 0]}
      ></Frame>
      <Frame
        id="09"
        name="Dish"
        author="Omar Faruq Tawsif"
        bg="#d1d1ca"
        position={[8.05, 0, 0]}
      ></Frame>
      <Frame
        id="10"
        name={"Acce-\nssory"}
        author="Omar Faruq Tawsif"
        bg="#d1d1ca"
        position={[9.2, 0, 0]}
      ></Frame>
      <Frame
        id="11"
        name={"Elec-\ntro-\nnic"}
        author="Omar Faruq Tawsif"
        bg="#d1d1ca"
        position={[10.35, 0, 0]}
      ></Frame>
      <Frame
        id="12"
        name={"Red"}
        author="Omar Faruq Tawsif"
        bg="#d1d1ca"
        position={[11.5, 0, 0]}
      ></Frame>
      <Frame
        id="13"
        name={"Green"}
        author="Omar Faruq Tawsif"
        bg="#d1d1ca"
        position={[12.65, 0, 0]}
      ></Frame>
      <Frame
        id="14"
        name={"Blue"}
        author="Omar Faruq Tawsif"
        bg="#d1d1ca"
        position={[13.8, 0, 0]}
      ></Frame>
      <Rig />
    </Canvas>
  );
}
