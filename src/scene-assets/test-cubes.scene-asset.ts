import {
  createSceneMaterial,
  createScenePrimitiveObject,
  Group,
  Mesh,
} from '@iwsdk/core';

interface CubeSpec {
  color: `#${string}`;
  size: [number, number, number];
  position: [number, number, number];
}

interface PlatformSpec {
  color: `#${string}`;
  size: [number, number, number];
  position: [number, number, number];
}

const CUBES: CubeSpec[] = [
  // 1: Street Level - Near spawn
  { color: '#00C896', size: [0.6, 0.6, 0.6], position: [-2.5, 0.3, -3] }, // Vibrant teal (left)
  { color: '#FF7043', size: [0.6, 0.6, 0.6], position: [2.5, 0.3, -3] },  // Coral orange (right)
  // Mid-distance walkway
  { color: '#8E24AA', size: [0.8, 1.0, 0.8], position: [-3.5, 0.5, -6] }, // Violet pillar
  { color: '#FFB300', size: [0.8, 1.0, 0.8], position: [3.5, 0.5, -6] },  // Amber pillar
  { color: '#29B6F6', size: [0.5, 0.5, 0.5], position: [0, 0.25, -5] },   // Sky blue guide

  // 2: Top of Stairs
  { color: '#EC407A', size: [1.0, 1.2, 1.0], position: [-3.5, 0.6, -8] }, // Deep pink left
  { color: '#66BB6A', size: [1.0, 1.2, 1.0], position: [3.5, 0.6, -8] },  // Green right
  { color: '#FFD54F', size: [0.8, 0.8, 0.8], position: [0, 0.4, -10] },   // Gold gate marker

  // 3: UG1 Landing markers (y = -6, z = -14)
  { color: '#38BDF8', size: [0.6, 1.0, 0.6], position: [-2.5, -5.5, -14] }, // Cyan pillar
  { color: '#F43F5E', size: [0.6, 1.0, 0.6], position: [2.5, -5.5, -14] },  // Rose pillar

  // 4: UG1 Concourse markers (y = -6, z = -28)
  { color: '#A855F7', size: [0.8, 1.4, 0.8], position: [-3.5, -5.3, -28] }, // Purple column
  { color: '#10B981', size: [0.8, 1.4, 0.8], position: [3.5, -5.3, -28] },  // Emerald column
  { color: '#F59E0B', size: [0.6, 0.6, 0.6], position: [0, -5.7, -31] },    // Amber info beacon

  // 5: UG2 Platform markers (y = -12, z = -45)
  { color: '#06B6D4', size: [0.8, 1.5, 0.8], position: [-3.5, -11.25, -45] }, // Cyan platform edge
  { color: '#F97316', size: [0.8, 1.5, 0.8], position: [3.5, -11.25, -45] },  // Orange safety pylon

  // 6: Train interior markers (y = -12, z = -60)
  { color: '#6366F1', size: [0.5, 1.0, 0.5], position: [-1.8, -11.5, -60] }, // Indigo seat marker
  { color: '#EC4899', size: [0.5, 1.0, 0.5], position: [1.8, -11.5, -60] },  // Pink seat marker
  { color: '#E2E8F0', size: [0.4, 0.4, 1.2], position: [0, -11.8, -63] },    // Train aisle beacon
];

/** Walkable test platforms for testing underground coordinates (3-6) */
const TEST_PLATFORMS: PlatformSpec[] = [
  // 3: UG1 Landing pad (top at y = -6, center [0, -6.15, -14])
  { color: '#334155', size: [8, 0.3, 8], position: [0, -6.15, -14] },
  // 4: UG1 Concourse pad (top at y = -6, center [0, -6.15, -28])
  { color: '#1e293b', size: [14, 0.3, 14], position: [0, -6.15, -28] },
  // 5: UG2 Platform pad (top at y = -12, center [0, -12.15, -45])
  { color: '#0f172a', size: [12, 0.3, 16], position: [0, -12.15, -45] },
  // 6: Inside Train pad (top at y = -12, center [0, -12.15, -60])
  { color: '#1e1b4b', size: [8, 0.3, 12], position: [0, -12.15, -60] },
];

export function createTestCubes(): Group {
  const root = new Group();
  root.name = 'TestCubes';

  // Create cubes
  for (let i = 0; i < CUBES.length; i++) {
    const spec = CUBES[i];
    const material = createSceneMaterial({
      id: `test-cube-mat-${i}`,
      model: 'standard',
      baseColor: spec.color,
      roughness: 0.35,
      metalness: 0.1,
    });

    const cube = createScenePrimitiveObject(
      { geometry: { type: 'roundedBox', size: spec.size, radius: 0.04, segments: 2 } },
      material,
    ) as Mesh;

    cube.position.set(...spec.position);
    cube.castShadow = true;
    cube.receiveShadow = true;
    root.add(cube);
  }

  // Create temporary walkable testing platforms for underground coordinates
  for (let j = 0; j < TEST_PLATFORMS.length; j++) {
    const plat = TEST_PLATFORMS[j];
    const material = createSceneMaterial({
      id: `test-plat-mat-${j}`,
      model: 'standard',
      baseColor: plat.color,
      roughness: 0.8,
      metalness: 0.2,
    });

    const platform = createScenePrimitiveObject(
      { geometry: { type: 'box', size: plat.size } },
      material,
    ) as Mesh;

    platform.position.set(...plat.position);
    platform.receiveShadow = true;
    root.add(platform);
  }

  return root;
}
