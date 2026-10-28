export interface TeleportHotKey {
  key: string;
  name: string;
  position: [number, number, number];
}

/**
 * Developer teleport shortcut targets (Keys 1 to 6).
 * Real coordinates for Street Spawn (1), Top of Stairs (2), and UG1 Landing (3).
 */
export const TELEPORT_HOTKEYS: Record<string, TeleportHotKey> = {
  '1': {
    key: '1',
    name: 'Street Plaza',
    position: [0, 0, 3.5],
  },
  '2': {
    key: '2',
    name: 'Metro Canopy',
    position: [0, 0.35, -4.5],
  },
  '3': {
    key: '3',
    name: 'Escalator Midway',
    position: [0, -2.2, -8.8],
  },
  '4': {
    key: '4',
    name: 'UG Station Landing',
    position: [0, -4.72, -15.0],
  },
  '5': {
    key: '5',
    name: 'UG2 Platform',
    position: [0, -12, -45],
  },
  '6': {
    key: '6',
    name: 'Inside the Train',
    position: [0, -12, -60],
  },
};
