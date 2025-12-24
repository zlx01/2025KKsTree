import { Vector3 } from 'three';

/**
 * Helper to get random point in sphere
 */
export const getRandomSpherePoint = (radius: number): Vector3 => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  
  const sinPhi = Math.sin(phi);
  return new Vector3(
    r * sinPhi * Math.cos(theta),
    r * sinPhi * Math.sin(theta),
    r * Math.cos(phi)
  );
};

/**
 * Helper to get point on/in cone surface (Tree shape)
 * To make density uniform, we use the square root of a random number for height 
 * distribution, which compensates for the linear increase in circumference/radius.
 */
export const getTreePoint = (height: number, baseRadius: number, yOffset: number = -2): Vector3 => {
  // To avoid crowding at the top, we sample 'distFromTop' using sqrt(rand)
  // This puts more points towards the wider base.
  const distFromTop = Math.sqrt(Math.random()) * height; 
  const y = height - distFromTop;
  
  const progress = y / height; // 0 (bottom) to 1 (top)
  const currentRadius = baseRadius * (1 - progress);
  
  // Random radius within the cross-section to fill the "insides" slightly too
  const r = Math.sqrt(Math.random()) * currentRadius;
  
  const angle = Math.random() * Math.PI * 2;
  const x = Math.cos(angle) * r;
  const z = Math.sin(angle) * r;
  
  return new Vector3(x, y + yOffset, z);
};

/**
 * Generates points for a spiral winding down the tree
 */
export const getSpiralPoint = (t: number, height: number, baseRadius: number, turns: number = 8, yOffset: number = -2): Vector3 => {
  // t: 0 (top) to 1 (bottom)
  const y = (1 - t) * height;
  const currentRadius = baseRadius * t;
  const angle = t * Math.PI * 2 * turns;
  
  const x = Math.cos(angle) * currentRadius;
  const z = Math.sin(angle) * currentRadius;
  
  return new Vector3(x, y + yOffset, z);
};
