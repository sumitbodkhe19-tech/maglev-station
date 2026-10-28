/**
 * Player spawn configuration for Maglev Station.
 * Default: x=0, y=0, z=0 facing -Z.
 */

export interface SpawnConfig {
  position: { x: number; y: number; z: number };
  facing: { x: number; y: number; z: number };
  eyeHeight: number;
}

export const playerSpawn: SpawnConfig = {
  position: { x: 0, y: 0, z: 3.5 },
  facing: { x: 0, y: 0, z: -1 }, // facing -Z
  eyeHeight: 1.6,
};
