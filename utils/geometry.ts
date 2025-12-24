import { Vector3, MathUtils } from 'three';

// Helper to get random point in sphere
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

// Helper to get point on cone surface (Tree shape)
export const getTreePoint = (height: number, baseRadius: number, yOffset: number = -2): Vector3 => {
  const y = Math.random() * height; // 0 to height
  const progress = y / height; // 0 (bottom) to 1 (top)
  const currentRadius = baseRadius * (1 - progress);
  
  const angle = Math.random() * Math.PI * 2;
  const x = Math.cos(angle) * currentRadius;
  const z = Math.sin(angle) * currentRadius;
  
  return new Vector3(x, y + yOffset, z);
};

// Spiral distribution for more "formed" look if needed
export const getSpiralTreePoint = (i: number, count: number, height: number, baseRadius: number, yOffset: number = -2): Vector3 => {
  const t = i / count;
  const y = t * height;
  const currentRadius = baseRadius * (1 - t);
  const angle = i * 2.4; // Golden angle approx
  
  const x = Math.cos(angle) * currentRadius;
  const z = Math.sin(angle) * currentRadius;
  
  return new Vector3(x, y + yOffset, z);
};
