import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState } from '../types';
import { getSpiralPoint, getRandomSpherePoint } from '../utils/geometry';

interface DecorativeSpiralProps {
  treeState: TreeState;
  count?: number;
}

export const DecorativeSpiral: React.FC<DecorativeSpiralProps> = ({ treeState, count = 400 }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const [tempObj] = useState(() => new THREE.Object3D());

  const data = useMemo(() => {
    return new Array(count).fill(0).map((_, i) => {
      const t = i / count;
      const targetPos = getSpiralPoint(t, 12, 4.3, 7, -4);
      const chaosPos = getRandomSpherePoint(20);
      
      return {
        chaosPos,
        targetPos,
        currentPos: chaosPos.clone(),
        speed: 1.5 + Math.random() * 1.0,
        scale: 0.06 + Math.random() * 0.04,
        color: new THREE.Color(Math.random() > 0.5 ? '#F7E7CE' : '#D4AF37'), // Champagne and Gold
        rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0)
      };
    });
  }, [count]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const isFormed = treeState === TreeState.FORMED;

    data.forEach((d, i) => {
      const dest = isFormed ? d.targetPos : d.chaosPos;
      d.currentPos.lerp(dest, delta * d.speed);
      
      if (isFormed) {
         // Subtle rotation with the tree
         const orbitSpeed = 0.08 * delta;
         const x = d.currentPos.x;
         const z = d.currentPos.z;
         d.currentPos.x = x * Math.cos(orbitSpeed) - z * Math.sin(orbitSpeed);
         d.currentPos.z = x * Math.sin(orbitSpeed) + z * Math.cos(orbitSpeed);
         d.rotation.x += delta * 1.5;
         d.rotation.y += delta * 1.5;
      }

      tempObj.position.copy(d.currentPos);
      tempObj.rotation.copy(d.rotation);
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
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        metalness={1.0} 
        roughness={0.05} 
        emissive="#D4AF37"
        emissiveIntensity={0.2}
      />
    </instancedMesh>
  );
};
