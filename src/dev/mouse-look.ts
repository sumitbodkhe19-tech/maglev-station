import { Euler, Quaternion, World } from '@iwsdk/core';

/**
 * Desktop Mouse Look controller for Maglev Station.
 * Enables 360-degree head rotation using mouse look:
 * - Free look via Pointer Lock (click anywhere on the canvas)
 * - Click & Drag look (hold left or right mouse button and drag)
 * - Syncs seamlessly with IWSDK player rig and IWER emulator device
 */
export class MouseLook {
  private yaw = 0; // Horizontal rotation around Y
  private pitch = 0; // Vertical tilt around X
  private sensitivity = 0.0025;
  private isMouseDown = false;
  private isPointerLocked = false;
  private lastX = 0;
  private lastY = 0;

  private tempEuler = new Euler(0, 0, 0, 'YXZ');
  private tempQuat = new Quaternion();
  private canvas: HTMLCanvasElement | null = null;
  private hintElement: HTMLDivElement | null = null;

  constructor(private world: World) {
    this.canvas =
      world.renderer?.domElement ??
      document.querySelector('canvas') ??
      (document.getElementById('scene-container') as HTMLCanvasElement | null);

    this.createHint();
    this.setupListeners();
  }

  private createHint(): void {
    const hint = document.createElement('div');
    hint.id = 'mouse-look-hint';
    hint.style.cssText = `
      position: fixed;
      bottom: 18px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.82);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(148, 163, 184, 0.3);
      border-radius: 20px;
      color: #94a3b8;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
      font-size: 12px;
      padding: 6px 16px;
      z-index: 999998;
      pointer-events: none;
      user-select: none;
      transition: opacity 0.3s ease, transform 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    `;

    hint.innerHTML = `
      <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#38bdf8;"></span>
      <span>Click canvas or drag to <strong style="color:#f8fafc;">look around</strong> · <span style="color:#cbd5e1;">[SHIFT]</span> sprint · <span style="color:#cbd5e1;">[ESC]</span> unlock</span>
    `;

    document.body.appendChild(hint);
    this.hintElement = hint;
  }

  private setupListeners(): void {
    // Pointer lock change listener
    document.addEventListener('pointerlockchange', this.onPointerLockChange);
    document.addEventListener('mozpointerlockchange', this.onPointerLockChange);
    document.addEventListener('webkitpointerlockchange', this.onPointerLockChange);

    // Click canvas to request pointer lock
    window.addEventListener('click', this.onClick);

    // Mouse drag listeners
    window.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mouseup', this.onMouseUp);

    // Mouse movement listener
    window.addEventListener('mousemove', this.onMouseMove);
  }

  private onClick = (e: Event): void => {
    // Only request pointer lock if clicking on the 3D canvas or scene container
    if (
      !this.isPointerLocked &&
      (e.target === this.canvas || (e.target as HTMLElement)?.id === 'scene-container')
    ) {
      const lockTarget = this.canvas ?? document.body;
      const promise =
        lockTarget.requestPointerLock?.() ||
        // @ts-ignore
        lockTarget.mozRequestPointerLock?.() ||
        // @ts-ignore
        lockTarget.webkitRequestPointerLock?.();

      if (promise && typeof (promise as Promise<void>).catch === 'function') {
        (promise as Promise<void>).catch(() => {
          // Pointer lock rejected or not supported, drag-look remains active
        });
      }
    }
  };

  private onPointerLockChange = (): void => {
    const lockEl =
      document.pointerLockElement ||
      // @ts-ignore
      document.mozPointerLockElement ||
      // @ts-ignore
      document.webkitPointerLockElement;

    this.isPointerLocked = lockEl === this.canvas || lockEl === document.body;

    if (this.hintElement) {
      if (this.isPointerLocked) {
        this.hintElement.style.opacity = '0.35';
        this.hintElement.innerHTML = `
          <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#22c55e;"></span>
          <span>Mouse look locked · Press <strong style="color:#f8fafc;">[ESC]</strong> to release pointer</span>
        `;
      } else {
        this.hintElement.style.opacity = '1.0';
        this.hintElement.innerHTML = `
          <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#38bdf8;"></span>
          <span>Click canvas or drag to <strong style="color:#f8fafc;">look around</strong> · <span style="color:#cbd5e1;">[SHIFT]</span> sprint · <span style="color:#cbd5e1;">[ESC]</span> unlock</span>
        `;
      }
    }
  };

  private onMouseDown = (e: MouseEvent): void => {
    // Don't intercept UI buttons or debugger overlay clicks
    if ((e.target as HTMLElement)?.closest('#dev-debug-overlay')) {
      return;
    }
    this.isMouseDown = true;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
  };

  private onMouseUp = (): void => {
    this.isMouseDown = false;
  };

  private onMouseMove = (e: MouseEvent): void => {
    // Accept movement if pointer is locked OR if mouse is being dragged
    let deltaX = 0;
    let deltaY = 0;

    if (this.isPointerLocked) {
      deltaX = e.movementX || 0;
      deltaY = e.movementY || 0;
    } else if (this.isMouseDown) {
      deltaX = e.movementX || e.clientX - this.lastX;
      deltaY = e.movementY || e.clientY - this.lastY;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    } else {
      return;
    }

    if (deltaX === 0 && deltaY === 0) {
      return;
    }

    // Apply sensitivity
    this.yaw -= deltaX * this.sensitivity;
    this.pitch -= deltaY * this.sensitivity;

    // Clamp vertical pitch to prevent flipping upside down (~ -82° to +82°)
    const maxPitch = Math.PI / 2.2;
    this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));

    this.applyRotation();
  };

  private applyRotation(): void {
    const isXRPresenting = Boolean(this.world.renderer?.xr?.isPresenting);

    // 1. Rotate player rig horizontally (Yaw)
    if (this.world.player) {
      this.world.player.rotation.y = this.yaw;
    }

    // 2. Tilt camera vertically (Pitch) when not presenting in XR
    if (this.world.camera && !isXRPresenting) {
      this.world.camera.rotation.x = this.pitch;
    }

    // 3. Update IWER device emulated headset pose if present
    const iwer = (window as any).IWER_DEVICE;
    if (iwer && iwer.quaternion && typeof iwer.quaternion.set === 'function') {
      // In XR, player yaw handles horizontal orientation; headset applies vertical pitch
      const headYaw = isXRPresenting ? 0 : this.yaw;
      this.tempEuler.set(this.pitch, headYaw, 0, 'YXZ');
      this.tempQuat.setFromEuler(this.tempEuler);
      iwer.quaternion.set(
        this.tempQuat.x,
        this.tempQuat.y,
        this.tempQuat.z,
        this.tempQuat.w,
      );
      if (typeof iwer.notifyStateChange === 'function') {
        iwer.notifyStateChange();
      }
    }
  }

  public destroy(): void {
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);
    document.removeEventListener('mozpointerlockchange', this.onPointerLockChange);
    document.removeEventListener('webkitpointerlockchange', this.onPointerLockChange);

    window.removeEventListener('click', this.onClick);
    window.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('mousemove', this.onMouseMove);

    if (this.hintElement && this.hintElement.parentElement) {
      this.hintElement.parentElement.removeChild(this.hintElement);
      this.hintElement = null;
    }
  }
}
