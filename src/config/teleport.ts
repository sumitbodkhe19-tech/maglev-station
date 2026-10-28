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
    name: 'Street Spawn',
    position: [0, 0, 0],
  },
  '2': {
    key: '2',
    name: 'Top of Stairs',
    position: [1.15, 0, -8.6],
  },
  '3': {
    key: '3',
    name: 'UG1 Landing',
    position: [-1.15, -6.0, -6.0],
  },
  '4': {
    key: '4',
    name: 'UG1 Concourse Centre',
    position: [0, -6, -28],
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
