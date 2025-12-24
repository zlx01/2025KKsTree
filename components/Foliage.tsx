import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState } from '../types';
import { getRandomSpherePoint, getTreePoint } from '../utils/geometry';

interface FoliageProps {
  treeState: TreeState;
}

const COUNT = 15000;
const EMERALD = new THREE.Color('#003d1c'); // Darker base Emerald for depth
const GOLD = new THREE.Color('#aa8800');    // Muted Gold for contrast

export const Foliage: React.FC<FoliageProps> = ({ treeState }) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  const { positions, chaosPositions, targetPositions, colors } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const chaos = new Float32Array(COUNT * 3);
    const target = new Float32Array(COUNT * 3);
    const cols = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      const t = getTreePoint(12, 4.2, -4);
      target[i * 3] = t.x;
      target[i * 3 + 1] = t.y;
      target[i * 3 + 2] = t.z;

      const c = getRandomSpherePoint(18);
      chaos[i * 3] = c.x;
      chaos[i * 3 + 1] = c.y;
      chaos[i * 3 + 2] = c.z;

      pos[i * 3] = c.x;
      pos[i * 3 + 1] = c.y;
      pos[i * 3 + 2] = c.z;

      const isGold = Math.random() > 0.9;
      const baseColor = isGold ? GOLD : EMERALD;
      const variation = (Math.random() - 0.5) * 0.1;
      const finalColor = baseColor.clone().offsetHSL(0, 0, variation);
      
      cols[i * 3] = finalColor.r;
      cols[i * 3 + 1] = finalColor.g;
      cols[i * 3 + 2] = finalColor.b;
    }

    return { 
      positions: pos, 
      chaosPositions: chaos, 
      targetPositions: target, 
      colors: cols 
    };
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const positionsAttribute = pointsRef.current.geometry.attributes.position;
    const isFormed = treeState === TreeState.FORMED;
    const lerpSpeed = isFormed ? 3.0 : 1.5;

    for (let i = 0; i < COUNT; i++) {
      const idx = i * 3;
      const destX = isFormed ? targetPositions[idx] : chaosPositions[idx];
      const destY = isFormed ? targetPositions[idx + 1] : chaosPositions[idx + 1];
      const destZ = isFormed ? targetPositions[idx + 2] : chaosPositions[idx + 2];

      positionsAttribute.array[idx] = THREE.MathUtils.lerp(positionsAttribute.array[idx], destX, delta * lerpSpeed);
      positionsAttribute.array[idx+1] = THREE.MathUtils.lerp(positionsAttribute.array[idx+1], destY, delta * lerpSpeed);
      positionsAttribute.array[idx+2] = THREE.MathUtils.lerp(positionsAttribute.array[idx+2], destZ, delta * lerpSpeed);
    }
    
    positionsAttribute.needsUpdate = true;
    
    if (isFormed) {
      pointsRef.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={COUNT} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={COUNT} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        size={0.1}
        sizeAttenuation={true}
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};