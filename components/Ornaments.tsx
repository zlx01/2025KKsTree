import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState } from '../types';
import { getTreePoint, getRandomSpherePoint } from '../utils/geometry';

interface OrnamentsProps {
  treeState: TreeState;
  type: 'box' | 'ball' | 'light';
  count: number;
}

const LUXURY_PALETTE = [
  '#FFD700', // Rich Gold
  '#C00000', // Deep High-gloss Red
  '#FFFFFF', // Pure Pearl White / Silver
  '#004d26', // Deep Emerald Green
];

export const Ornaments: React.FC<OrnamentsProps> = ({ treeState, type, count }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const [tempObj] = useState(() => new THREE.Object3D());

  const data = useMemo(() => {
    return new Array(count).fill(0).map(() => {
      const weight = type === 'box' ? 0.8 : type === 'ball' ? 1.5 : 3.0;
      const tPos = getTreePoint(12, 4.1, -4);
      const cPos = getRandomSpherePoint(20);
      
      const colorHex = type === 'light' ? '#FFCC33' : LUXURY_PALETTE[Math.floor(Math.random() * LUXURY_PALETTE.length)];
      
      // Increased base scale slightly and balanced random variance
      let baseScale = 0.22; // Increased from 0.18
      let randomFactor = 0.3; // Increased from 0.25

      if (type === 'light') {
        baseScale = 0.07;
        randomFactor = 0.05;
      } else if (type === 'box') {
        baseScale = 0.2;
        randomFactor = 0.35;
      }
      
      return {
        chaosPos: cPos,
        targetPos: tPos,
        color: new THREE.Color(colorHex),
        // Use a more organic distribution for "large and small"
        scale: baseScale + (Math.random() > 0.8 ? Math.random() * randomFactor : Math.random() * randomFactor * 0.4),
        speed: Math.random() * 0.5 + weight,
        currentPos: cPos.clone(),
        currentRot: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0)
      };
    });
  }, [count, type]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const isFormed = treeState === TreeState.FORMED;

    data.forEach((d, i) => {
      const dest = isFormed ? d.targetPos : d.chaosPos;
      d.currentPos.lerp(dest, delta * d.speed);
      
      if (isFormed) {
         const orbitSpeed = 0.08 * delta;
         const x = d.currentPos.x;
         const z = d.currentPos.z;
         d.currentPos.x = x * Math.cos(orbitSpeed) - z * Math.sin(orbitSpeed);
         d.currentPos.z = x * Math.sin(orbitSpeed) + z * Math.cos(orbitSpeed);
      } else {
         d.currentRot.x += 0.02;
         d.currentRot.y += 0.02;
      }

      tempObj.position.copy(d.currentPos);
      tempObj.rotation.copy(d.currentRot);
      tempObj.scale.setScalar(d.scale);
      tempObj.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObj.matrix);
      meshRef.current!.setColorAt(i, d.color);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow>
      {type === 'box' ? <boxGeometry /> : <sphereGeometry args={[1, 32, 32]} />}
      <meshStandardMaterial 
        metalness={1.0} 
        roughness={0.03} 
        emissiveIntensity={type === 'light' ? 1.5 : 0}
        toneMapped={false}
      />
    </instancedMesh>
  );
};