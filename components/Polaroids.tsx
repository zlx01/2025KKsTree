import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { TreeState } from '../types';
import { getRandomSpherePoint, getTreePoint } from '../utils/geometry';

interface PolaroidsProps {
  treeState: TreeState;
}

// Using picsum.photos for reliable placeholder images with Christmas/winter themes
const IMAGE_URLS = [
  'https://picsum.photos/seed/xmas1/200/240',
  'https://picsum.photos/seed/xmas2/200/240',
  'https://picsum.photos/seed/xmas3/200/240',
  'https://picsum.photos/seed/xmas4/200/240',
  'https://picsum.photos/seed/xmas5/200/240',
  'https://picsum.photos/seed/xmas6/200/240'
];

export const Polaroids: React.FC<PolaroidsProps> = ({ treeState }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Load textures - drei will handle loading states
  const loadedTextures = useTexture(IMAGE_URLS);
  const textures = useMemo(() => {
    return Array.isArray(loadedTextures) ? loadedTextures : (loadedTextures ? [loadedTextures] : []);
  }, [loadedTextures]);

  const items = useMemo(() => {
    if (!textures || textures.length === 0) return [];
    
    return textures.map((tex, i) => {
      const chaos = getRandomSpherePoint(12);
      const tPos = getTreePoint(12, 4.5, -4); 
      
      return {
        texture: tex,
        chaosPos: chaos,
        targetPos: tPos,
        rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.5),
        currentPos: chaos.clone(),
        speed: 1 + Math.random() * 0.5
      };
    });
  }, [textures]);

  useFrame((state, delta) => {
    if (!groupRef.current || !items.length) return;
    const isFormed = treeState === TreeState.FORMED;

    items.forEach((item, i) => {
      const child = groupRef.current!.children[i];
      if (!child) return;

      const dest = isFormed ? item.targetPos : item.chaosPos;
      item.currentPos.lerp(dest, delta * item.speed);
      
      if (isFormed) {
         const orbitSpeed = 0.05 * delta;
         const x = item.currentPos.x;
         const z = item.currentPos.z;
         item.currentPos.x = x * Math.cos(orbitSpeed) - z * Math.sin(orbitSpeed);
         item.currentPos.z = x * Math.sin(orbitSpeed) + z * Math.cos(orbitSpeed);
         
         child.lookAt(new THREE.Vector3(0, item.currentPos.y, 0));
         child.rotateY(Math.PI); 
      } else {
         child.rotation.x += delta * 0.5;
         child.rotation.y += delta * 0.5;
      }

      child.position.copy(item.currentPos);
    });
  });

  if (!items.length) return null;

  return (
    <group ref={groupRef}>
      {items.map((item, i) => (
        <mesh key={i} castShadow receiveShadow>
          <planeGeometry args={[0.8, 1.0]} />
          <meshStandardMaterial 
            map={item.texture} 
            side={THREE.DoubleSide} 
            roughness={0.4}
            metalness={0.2}
          />
          {/* Removed the white background mesh that created the border */}
        </mesh>
      ))}
    </group>
  );
};