export interface AreaBox {
  name: string;
  min: [number, number, number];
  max: [number, number, number];
}

/**
 * Named bounding boxes for station zones (Section 6 of PROJECT_BRIEF.md).
 * Coordinates: +Y up, -Z north/forward, +Z south, +X east, -X west.
 */
export const AREAS: AreaBox[] = [
  {
    name: 'Street Plaza',
    min: [-20, -1, -5],
    max: [20, 3, 20],
  },
  {
    name: 'Entrance / Top of Stairs',
    min: [-10, -2, -12],
    max: [10, 2, -5],
  },
  {
    name: 'Switchback Stairs',
    min: [-8, -6.5, -18],
    max: [8, -0.5, -10],
  },
  {
    name: 'UG1 - Stairs Landing',
    min: [-10, -7.5, -20],
    max: [10, -4.5, -12],
  },
  {
    name: 'UG1 - Concourse Hall',
    min: [-25, -7.5, -45],
    max: [25, -4.5, -18],
  },
  {
    name: 'UG1 - Fun Corner',
    min: [5, -7.5, -45],
    max: [20, -4.5, -30],
  },
  {
    name: 'UG2 - Inside Maglev Train',
    min: [-10, -13.5, -80],
    max: [10, -10.5, -55],
  },
  {
    name: 'UG2 - Platform',
    min: [-20, -13.5, -55],
    max: [20, -10.5, -40],
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
  if (pos.y >= -2) {
    return 'Street Level';
  } else if (pos.y >= -8) {
    return 'UG1 Concourse';
  } else {
    return 'UG2 Platform Level';
  }
}
