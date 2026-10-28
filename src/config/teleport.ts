export interface TeleportHotKey {
  key: string;
  name: string;
  position: [number, number, number];
}

/**
 * Developer teleport shortcut targets (Keys 1 to 6).
 * Future areas use their planned coordinates from PROJECT_BRIEF.md.
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
    position: [0, 0, -8],
  },
  '3': {
    key: '3',
    name: 'UG1 Landing',
    position: [0, -6, -14],
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
