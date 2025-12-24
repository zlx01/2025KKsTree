import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SNOW_COUNT = 3000;
const SNOW_RANGE = 70;

export const Snow: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(SNOW_COUNT * 3);
    const vel = new Float32Array(SNOW_COUNT);

    for (let i = 0; i < SNOW_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * SNOW_RANGE;
      pos[i * 3 + 1] = (Math.random() - 0.5) * SNOW_RANGE;
      pos[i * 3 + 2] = (Math.random() - 0.5) * SNOW_RANGE;
      vel[i] = Math.random() * 0.03 + 0.01;
    }
    return { positions: pos, velocities: vel };
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    const positionsAttribute = pointsRef.current.geometry.attributes.position;

    for (let i = 0; i < SNOW_COUNT; i++) {
      let y = positionsAttribute.array[i * 3 + 1];
      y -= velocities[i] * (delta * 60);

      if (y < -SNOW_RANGE / 2) {
        y = SNOW_RANGE / 2;
        positionsAttribute.array[i * 3] = (Math.random() - 0.5) * SNOW_RANGE;
        positionsAttribute.array[i * 3 + 2] = (Math.random() - 0.5) * SNOW_RANGE;
      }
      positionsAttribute.array[i * 3 + 1] = y;
    }
    
    positionsAttribute.needsUpdate = true;
    pointsRef.current.rotation.y += delta * 0.01;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={SNOW_COUNT} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#ffffff"
        transparent
        opacity={0.5}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};