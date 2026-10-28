export interface AreaBox {
  name: string;
  min: [number, number, number];
  max: [number, number, number];
}

/**
 * Named bounding boxes for station zones (Prompt 3 & Section 6 of PROJECT_BRIEF.md).
 * Coordinates: +Y up, -Z north (entrance & underground), +Z south (plaza road), +X east, -X west.
 */
export const AREAS: AreaBox[] = [
  // 1. UG1 Landing: 10m x 10m floor hall at y = -6m (z = -8.5 to +1.5)
  {
    name: 'UG1 Landing',
    min: [-5.5, -6.6, -9.0],
    max: [5.5, -5.7, 2.0],
  },
  // 2. Stairwell: 36-step switchback staircase & middle landing
  {
    name: 'Stairwell',
    min: [-2.6, -5.7, -17.8],
    max: [2.6, 0.5, -7.0],
  },
  // 3. Street: 30m x 30m street plaza & entrance porch at y = 0
  {
    name: 'Street',
    min: [-16.0, -0.6, -7.0],
    max: [16.0, 6.0, 18.0],
  },
  // Future planned areas for subsequent tasks
  {
    name: 'UG1 - Concourse Hall',
    min: [-25.0, -7.5, -45.0],
    max: [25.0, -5.7, -19.5],
  },
  {
    name: 'UG2 - Platform',
    min: [-20.0, -13.5, -55.0],
    max: [20.0, -9.5, -40.0],
  },
  {
    name: 'UG2 - Inside Maglev Train',
    min: [-10.0, -13.5, -80.0],
    max: [10.0, -9.5, -55.0],
  },
];

/**
 * Identify which area a given position falls into.
 */
export function getAreaName(pos: { x: number; y: number; z: number }): string {
  for (const area of AREAS) {
    if (
      pos.x >= area.min[0] &&
      pos.x <= area.max[0] &&
      pos.y >= area.min[1] &&
      pos.y <= area.max[1] &&
      pos.z >= area.min[2] &&
      pos.z <= area.max[2]
    ) {
      return area.name;
    }
  }

  // Fallback by floor height if outside specific bounding box
  if (pos.y >= -0.5) {
    return 'Street';
  } else if (pos.y >= -5.7 && pos.z <= -7.0 && pos.z >= -18.0) {
    return 'Stairwell';
  } else if (pos.y >= -7.0) {
    return 'UG1 Landing';
  } else {
    return 'UG2 Platform';
  }
}
