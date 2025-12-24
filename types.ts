import { Vector3 } from 'three';

export enum TreeState {
  CHAOS = 'CHAOS',
  FORMED = 'FORMED'
}

export interface ParticleData {
  chaosPos: Vector3;
  targetPos: Vector3;
  speed: number;
}

export interface OrnamentData extends ParticleData {
  type: 'box' | 'ball' | 'light';
  color: string;
  scale: number;
}

export interface HandGestureState {
  isOpen: boolean; // True = Unleash/Chaos, False = Formed
  position: { x: number; y: number }; // Normalized -1 to 1
}