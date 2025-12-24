import React, { Suspense } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Environment, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { Foliage } from './Foliage';
import { Ornaments } from './Ornaments';
import { Polaroids } from './Polaroids';
import { Star } from './Star';
import { Snow } from './Snow';
import { DecorativeSpiral } from './DecorativeSpiral';
import { TreeState, HandGestureState } from '../types';
import * as THREE from 'three';

interface SceneProps {
  treeState: TreeState;
  gestureState: HandGestureState;
  zoom: number;
}

const CameraRig: React.FC<{ gestureState: HandGestureState; zoom: number }> = ({ gestureState, zoom }) => {
  const vec = new THREE.Vector3();

  useFrame((state) => {
    const baseDistance = 25;
    const targetDistance = baseDistance + zoom;
    const azimuth = gestureState.position.x * Math.PI; 
    const polar = THREE.MathUtils.mapLinear(gestureState.position.y, -1, 1, 2.3, 0.4);

    const x = targetDistance * Math.sin(polar) * Math.sin(azimuth);
    const z = targetDistance * Math.sin(polar) * Math.cos(azimuth);
    const y = targetDistance * Math.cos(polar);

    vec.set(x, y + 4, z);
    state.camera.position.lerp(vec, 0.08);
    state.camera.lookAt(0, 3, 0);
  });

  return null;
}

export const Scene: React.FC<SceneProps> = ({ treeState, gestureState, zoom }) => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 4, 30]} fov={45} />
      <CameraRig gestureState={gestureState} zoom={zoom} />
      
      <Environment preset="studio" background={false} />
      
      <ambientLight intensity={0.12} color="#ffffff" />
      <spotLight 
        position={[20, 30, 20]} 
        angle={0.3} 
        penumbra={1} 
        intensity={2.2} 
        color="#fffaf0" 
        castShadow 
      />
      
      <pointLight position={[-15, 10, -15]} intensity={1.2} color="#FFD700" />
      <pointLight position={[15, 5, -15]} intensity={0.8} color="#ffffff" />

      <Snow />

      <group position={[0, -2, 0]}>
        <Foliage treeState={treeState} />
        
        {/* Significantly reduced counts for a sparse, elegant look */}
        <Ornaments treeState={treeState} type="box" count={70} />
        <Ornaments treeState={treeState} type="ball" count={150} />
        <Ornaments treeState={treeState} type="light" count={280} />
        
        {/* Decorative Spiral Line - Kept prominent */}
        <DecorativeSpiral treeState={treeState} count={500} />
        
        <Star treeState={treeState} />

        <Suspense fallback={null}>
          <Polaroids treeState={treeState} />
        </Suspense>
      </group>

      <EffectComposer enableNormalPass={false}>
        <Bloom 
          luminanceThreshold={0.92} 
          mipmapBlur 
          intensity={0.45} 
          radius={0.25}
        />
        <Vignette darkness={0.65} />
        <Noise opacity={0.012} />
      </EffectComposer>
    </>
  );
};