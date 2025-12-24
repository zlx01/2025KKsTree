import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState } from '../types';

interface StarProps {
  treeState: TreeState;
}

export const Star: React.FC<StarProps> = ({ treeState }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Raised targetY from 8.2 to 8.6 to ensure the star is fully "out" of the foliage
  const targetY = 8.6; 
  
  // Create a 5-pointed star shape with sharper radii
  const starShape = useMemo(() => {
    const shape = new THREE.Shape();
    const points = 5;
    const outerRadius = 0.8; // Reduced from 1.0
    const innerRadius = 0.3; // Sharper inner radius for a more elegant look
    
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points;
      const x = Math.cos(angle - Math.PI / 2) * radius;
      const y = Math.sin(angle - Math.PI / 2) * radius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    return shape;
  }, []);

  const extrudeSettings = useMemo(() => ({
    steps: 1,
    depth: 0.2, // Slightly thinner
    bezelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.08,
    bevelOffset: 0,
    bevelSegments: 3
  }), []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    const isFormed = treeState === TreeState.FORMED;
    const time = state.clock.getElapsedTime();
    
    const targetPos = new THREE.Vector3(0, targetY, 0);
    const chaosPos = new THREE.Vector3(0, 10 + Math.sin(time * 0.5) * 1, 0);
    
    const dest = isFormed ? targetPos : chaosPos;
    
    groupRef.current.position.lerp(dest, delta * 1.5);
    groupRef.current.rotation.y = time * 1.0; 
    
    // Adjusted scale to be slightly smaller and tighter
    const scale = 1.0 + Math.sin(time * 3) * 0.05;
    groupRef.current.scale.setScalar(scale);
  });

  return (
    <group ref={groupRef}>
      <pointLight color="#FFD700" intensity={1.8} distance={12} decay={2} />
      
      <mesh rotation={[0, 0, 0]} position={[0, 0, -0.1]}>
        <extrudeGeometry args={[starShape, extrudeSettings]} />
        <meshStandardMaterial 
          color="#FFD700" 
          emissive="#FFD700"
          emissiveIntensity={1.0}
          metalness={1}
          roughness={0.05}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
};