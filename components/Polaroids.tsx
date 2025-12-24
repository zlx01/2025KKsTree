import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { TreeState } from '../types';
import { getRandomSpherePoint, getTreePoint } from '../utils/geometry';

interface PolaroidsProps {
  treeState: TreeState;
}

const IMAGE_IDS = [
  '1513297856428-1139199c8d1c',
  '1543589077-47d81606c1ad',
  '1512474932049-7826d6909240',
  '1481131319519-6bc229988267',
  '1511268559489-34b6248bbec3',
  '1513297856428-1139199c8d1c'
];

const IMAGE_URLS = IMAGE_IDS.map(id => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=200&q=80`);

export const Polaroids: React.FC<PolaroidsProps> = ({ treeState }) => {
  let textures: THREE.Texture[] = [];
  try {
    const loaded = useTexture(IMAGE_URLS);
    textures = Array.isArray(loaded) ? loaded : [loaded];
  } catch (e) {
    console.warn("Polaroid textures failed to load", e);
  }
  
  const groupRef = useRef<THREE.Group>(null);

  const items = useMemo(() => {
    if (!textures.length) return [];
    
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