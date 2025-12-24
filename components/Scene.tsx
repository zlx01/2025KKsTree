import React, { Suspense } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Environment, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { Foliage } from './Foliage';
import { Ornaments } from './Ornaments';
import { Polaroids } from './Polaroids';
import { Star } from './Star';
import { Snow } from './Snow';
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
      
      <ambientLight intensity={0.15} color="#ffffff" />
      <spotLight 
        position={[20, 30, 20]} 
        angle={0.3} 
        penumbra={1} 
        intensity={2.5} 
        color="#fffaf0" 
        castShadow 
      />
      
      <pointLight position={[-15, 10, -15]} intensity={1.5} color="#FFD700" />
      <pointLight position={[15, 5, -15]} intensity={1} color="#ffffff" />

      <Snow />

      <group position={[0, -2, 0]}>
        <Foliage treeState={treeState} />
        
        {/* Adjusted counts for balanced density with slightly larger ornaments */}
        <Ornaments treeState={treeState} type="box" count={150} />
        <Ornaments treeState={treeState} type="ball" count={220} />
        <Ornaments treeState={treeState} type="light" count={500} />
        
        <Star treeState={treeState} />

        <Suspense fallback={null}>
          <Polaroids treeState={treeState} />
        </Suspense>
      </group>

      <Suspense fallback={null}>
        <EffectComposer enableNormalPass={false} multisampling={0}>
          <Bloom 
            luminanceThreshold={0.9} 
            mipmapBlur 
            intensity={0.6} 
            radius={0.25}
          />
          <Vignette darkness={0.6} />
          <Noise opacity={0.015} />
        </EffectComposer>
      </Suspense>
    </>
  );
};