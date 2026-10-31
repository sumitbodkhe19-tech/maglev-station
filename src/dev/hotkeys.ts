import { Vector3, World, LocomotionSystem } from '@iwsdk/core';
import { TELEPORT_HOTKEYS } from '../config/teleport.js';

export class DevHotkeys {
  private listener: ((event: KeyboardEvent) => void) | null = null;
  private tempVec = new Vector3();

  constructor(private world: World) {
    this.setupListener();
  }

  private setupListener(): void {
    this.listener = (event: KeyboardEvent) => {
      // Don't intercept if an input or textarea element is focused
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Don't trigger teleport hotkeys if Shift is held (sprint modifier)
      if (event.shiftKey) {
        return;
      }

      const hotkey = TELEPORT_HOTKEYS[event.key];
      if (!hotkey) {
        return;
      }

      event.preventDefault();
      const [x, y, z] = hotkey.position;
      this.tempVec.set(x, y, z);

      // Move player via LocomotionSystem if present
      const locomotion = this.world.getSystem(LocomotionSystem);
      if (locomotion && typeof locomotion.setPlayerPosition === 'function') {
        locomotion.setPlayerPosition(this.tempVec);
      } else if (this.world.player) {
        this.world.player.position.set(x, y, z);
      }

      // Also ensure authored player position is notified
      if (typeof this.world.setAuthoredPlayerPosition === 'function') {
        this.world.setAuthoredPlayerPosition(this.tempVec);
      }

      console.log(
        `[Dev Hotkey ${hotkey.key}] Teleported to ${hotkey.name} at (${x}, ${y}, ${z})`
      );
    };

    window.addEventListener('keydown', this.listener);
  }

  public destroy(): void {
    if (this.listener) {
      window.removeEventListener('keydown', this.listener);
      this.listener = null;
    }
  }
}
