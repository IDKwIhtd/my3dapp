// https://cydstumpel.nl/

import * as THREE from 'three'
import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
//Canvas  : Three.js의 3D씬 생성
//useFrame : 매 프레임마다 호출되어 애니메이션 업데이트
import { Image, Environment, ScrollControls, useScroll, useTexture } from '@react-three/drei'
//@react-three/drei : Three.js와의 통합을 돕는 유틸리티 모음
import { easing } from 'maath'
//easing : 애니메이션에 부드러운 전환 효과 추가
import './util'
//코드에는 포함되지 않은 별도의 유틸리티 파일
import './App.css'


export const App = () => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(window.navigator.userAgent);

  return(
  <Canvas className='flex-div' camera={{ position: [0, 0, isMobile ? 50 : 100], fov: isMobile ? 30 : 15 }}>
    <fog attach="fog" args={['#a79', 8.5, 12]} />
    <ScrollControls pages={4} infinite>
      <Rig rotation={[0, 0, 0.15]}>
        <Carousel />
      </Rig>
      <Banner position={[0, -0.15, 0]} />
    </ScrollControls>
    <Environment preset="dawn" background blur={0.5} />
  </Canvas>
)
};

//fov(Field Of View) : 시야각 => 넓을수록 더 많은 장면이 화면에 보이고, 좁을수록 확대된 느낌을 줌
//fog : 안개 추가, 씬에 깊이감을 줌, args : 시작과 끝 거리 설정
//ScrollControls : 스크롤컨트롤추가, 페이지 스크롤을 통해 애니메이션 제어, infinite로 무한루프
//Rig : 씬의 회전 조절 rotation으로 방향을 조절(고정된 회전 값 설정) [x, y, z]
//Environment : preset(사전설정) dawn으로 따뜻하고 자연스러운 조명 효과, blur로 흐림 효과

//=====Rig 컴포넌트=====//
function Rig(props) {
  const ref = useRef()
  const scroll = useScroll()
  useFrame((state, delta) => {
    ref.current.rotation.y = -scroll.offset * (Math.PI * 2) // Rotate contents
    state.events.update() // Raycasts every frame rather than on pointer-move
    easing.damp3(state.camera.position, [-state.pointer.x * 2, state.pointer.y + 1.5, 10], 0.3, delta) // Move camera
    state.camera.lookAt(0, 0, 0) // Look at center
  })
  return <group ref={ref} {...props} />
}
//=====씬 회전 및 카메라 이동 관리=======//

//========캐러셀 컴포넌트=======//
function Carousel({ radius = 1.4, count = 8 }) {
  return Array.from({ length: count }, (_, i) => (
    <Card
      key={i}
      index={i + 1}
      url={`${process.env.PUBLIC_URL}/img${Math.floor(i % 10) + 1}.png`} // URL을 환경 변수로 설정
      position={[Math.sin((i / count) * Math.PI * 2) * radius, 0, Math.cos((i / count) * Math.PI * 2) * radius]}
      rotation={[0, Math.PI + (i / count) * Math.PI * 2, 0]}
    />
  ))
}
//======== 카드 컴포넌트 생성, 지정된 개수의 카드를 원형으로 배치==========//

//========개별 카드 컴포넌트==========//
function Card({ url, ...props }) {
  const ref = useRef()
  const [hovered, hover] = useState(false)
  const pointerOver = (e) => (e.stopPropagation(), hover(true))
  const pointerOut = () => hover(false)

  const index222 = props.index

  const handleClick = () => {
    window.location.href = `${process.env.PUBLIC_URL}/pages/img${index222}.php`;
  };

  
  useFrame((state, delta) => {
    easing.damp3(ref.current.scale, hovered ? 1.15 : 1, 0.1, delta)
    easing.damp(ref.current.material, 'radius', hovered ? 0.25 : 0.1, 0.2, delta)
    easing.damp(ref.current.material, 'zoom', hovered ? 1 : 1.5, 0.2, delta)
  })
  return (
    <Image 
    ref={ref} 
    url={url} 
    transparent 
    side={THREE.DoubleSide} 
    onPointerOver={pointerOver} 
    onPointerOut={pointerOut} 
    onClick={handleClick}
    {...props}>
      <bentPlaneGeometry args={[0.1, 1, 1, 20, 20]} />
    </Image>
  )
}
//========호버 애니메이션, 사용자 인터랙션 처리===========//

//==========배너 컴포넌트===============//
function Banner(props) {
  const ref = useRef()
  const texture = useTexture('/zerominu.png')
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  const scroll = useScroll()
  useFrame((state, delta) => {
    ref.current.material.time.value += Math.abs(scroll.delta) * 4
    ref.current.material.map.offset.x += delta / 2
  })
  return (
    <mesh ref={ref} {...props}>
      <cylinderGeometry args={[1.6, 1.6, 0.14, 128, 16, true]} />
      <meshSineMaterial map={texture} map-anisotropy={16} map-repeat={[30, 1]} side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
  )
}
//mesh 컴포넌트를 사용 3D객체 생성, ref통해서 객체 참조 props를 전달하여 외부에서 설정한 속성 사용
//useRef 훅을 사용하여 ref생성, ref는 mesh 컴포넌트에 할당되어 3D객체에 대한 직접 접근 가능하게 함 (매 프레임마다 객체의 속성을 업데이트 가능)
//useTexture로 텍스처 로드 : 이미지 파일 텍스처 로드, 배너의 표면에 적용
//texture.wrapS(S축 -수평 방향), texture.wrapT(T축-수직 방향)를 ThreeRepeatWrapping으로 설정하여 텍스처 반복 => 텍스처가 객체의 표면을 덮을 때 여러 번 반복됨
//useScroll로 스크롤 감지 : 스크롤 이벤트 감지, 스크롤 상태 가져옴(객체 속성 업데이트)
//useFrame : 애니메이션 업데이트 =>매 프레임마다 호출, 애니메이션 구현
//ref.current.material.time.value를 스크롤 변화량에 따라 업데이트, 시간에 따른 애니메이션 효과 추가, map.offset.x(텍스처 오프셋) 매 프레임마다 조정하여 텍스처가 천천히 움직이도록 만듦
//cylinderGeometry : 원통형의 기하학적 형태 정의 [위쪽 반지름, 아래쪽 반지름, 높이, 가로 세그먼트 수, 높이(세로) 세그먼트 수, 열림 여부]
//meshSineMaterial : 커스텀 머티리얼 , 텍스처와 특수한 셰이더 효과 사용-표면에 렌더링
//map : 텍스처 지정, map-anisotropy : 비등방성 필터링(각도에 따라 필터링을 다르게 적용, 기울어진 표면에서 텍스처의 선명도), map-repeat : 텍스처가 반복되는 수, side={THREE.DoubleSide} : 머티리얼이 양면에 렌더링되도록 설정, toneMapped : 톤 매핑을 비활성화, 텍스처의 원래 색상이 왜곡되지 않도록 함




export default App;