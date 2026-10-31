import {
  Euler,
  LocomotionSystem,
  MathUtils,
  Quaternion,
  Vector3,
  World,
} from '@iwsdk/core';
import { locomotionConfig } from '../config/locomotion.js';

export type MovementState = 'Idle' | 'Walking' | 'Sprinting';

/**
 * Enhanced Player Movement Controller for Maglev Station.
 *
 * Implements:
 * - Walking at 2.2 m/s and sprinting at 4.0 m/s (Desktop SHIFT + WASD) / 3.0 m/s (XR Grip).
 * - Smooth framerate-independent acceleration (~0.15 s) and deceleration (~0.12 s).
 * - Physics delta time clamping (max 0.05 s) to prevent tunneling and stair launching.
 * - Horizontal yaw-only planar movement to prevent camera tilt glitches and vertical lift.
 * - Unified codebase for Desktop and Meta Quest 3 WebXR.
 */
export class PlayerMovementController {
  private currentSpeed = 0;
  private currentHeading = new Vector3(0, 0, -1);
  private movementState: MovementState = 'Idle';
  private shiftHeld = false;
  private isMoving = false;

  private tempEuler = new Euler(0, 0, 0, 'YXZ');
  private tempQuat = new Quaternion();
  private tempYawQuat = new Quaternion();
  private tempInputVector = new Vector3();
  private readonly upVector = new Vector3(0, 1, 0);

  private originalUpdate: ((delta: number) => void) | null = null;
  private boundKeyDown: ((e: KeyboardEvent) => void) | null = null;
  private boundKeyUp: ((e: KeyboardEvent) => void) | null = null;
  private boundBlur: (() => void) | null = null;

  constructor(
    private world: World,
    public locomotion: LocomotionSystem,
    public slideSystem: any,
  ) {
    this.setupKeyboardListeners();
    this.hookSlideSystem();
  }

  private setupKeyboardListeners(): void {
    this.boundKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        this.shiftHeld = true;
      }
    };

    this.boundKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        this.shiftHeld = false;
      }
    };

    this.boundBlur = () => {
      this.shiftHeld = false;
    };

    window.addEventListener('keydown', this.boundKeyDown, { passive: true });
    window.addEventListener('keyup', this.boundKeyUp, { passive: true });
    window.addEventListener('blur', this.boundBlur);
  }

  private hookSlideSystem(): void {
    if (!this.slideSystem) return;

    // Save original update if needed
    this.originalUpdate = this.slideSystem.update?.bind(this.slideSystem);

    // Override slideSystem update with our smoothed, clamped controller
    this.slideSystem.update = (delta: number): void => {
      this.update(delta);
    };
  }

  private update(delta: number): void {
    // 1. Clamp delta time to prevent physics tunneling through walls & stair bounce
    const dt = Math.min(Math.max(delta, 0.0001), locomotionConfig.maxDeltaTime);

    // 2. Handle optional jumping input if enabled in config
    if (
      this.slideSystem.config?.enableJumping?.value &&
      typeof this.slideSystem.inputProvider?.getJumpDown === 'function' &&
      this.slideSystem.inputProvider.getJumpDown()
    ) {
      this.slideSystem.locomotor?.jump?.();
    }

    // 3. Read movement axes from IWSDK action-backed input provider (WASD / Left Stick)
    this.slideSystem.inputProvider.getMoveAxis(this.slideSystem.input2D);
    const inputLength = Math.min(this.slideSystem.input2D.length(), 1.0);

    // 4. Detect sprint state across Desktop and XR
    const isXR = Boolean(this.world.renderer?.xr?.isPresenting || this.world.session);
    let isSprinting = false;

    if (isXR) {
      // XR controller: Left controller Grip (Button 1) or Stick Click (Button 3)
      const leftGp = this.world.input?.xr?.gamepads?.left;
      if (leftGp) {
        isSprinting = Boolean(
          leftGp.getButtonPressedByIdx(1) || leftGp.getButtonPressedByIdx(3),
        );
      }
    } else {
      // Desktop: Shift key held
      const kbd = this.world.input?.keyboard;
      const kbdShift = Boolean(
        kbd?.getKeyPressed?.('ShiftLeft') || kbd?.getKeyPressed?.('ShiftRight'),
      );
      isSprinting = this.shiftHeld || kbdShift;
    }

    // 5. Determine target speed
    const maxSprint = isXR
      ? locomotionConfig.sprintSpeedXR
      : locomotionConfig.sprintSpeedDesktop;
    const targetMaxSpeed = isSprinting ? maxSprint : locomotionConfig.walkSpeed;
    const targetSpeed = inputLength > 0.05 ? inputLength * targetMaxSpeed : 0;

    // 6. Calculate planar heading (horizontal X/Z plane ONLY)
    // Extracting head yaw isolates horizontal direction so camera pitch cannot glitch movement
    if (inputLength > 0.05) {
      this.slideSystem.inputProvider.getMovementReferenceQuaternion(this.tempQuat);
      this.tempEuler.setFromQuaternion(this.tempQuat, 'YXZ');
      this.tempYawQuat.setFromAxisAngle(this.upVector, this.tempEuler.y);

      this.tempInputVector.set(
        this.slideSystem.input2D.x,
        0,
        this.slideSystem.input2D.y,
      );
      this.tempInputVector.applyQuaternion(this.tempYawQuat);
      this.tempInputVector.y = 0; // Enforce zero vertical movement

      if (this.tempInputVector.lengthSq() > 0.0001) {
        this.tempInputVector.normalize();
        this.currentHeading.copy(this.tempInputVector);
      }
    }

    // 7. Smooth Framerate-Independent Acceleration and Deceleration
    if (targetSpeed > this.currentSpeed) {
      // Accelerating: reaches full speed in ~0.15 s
      const kAccel = 3.0 / Math.max(locomotionConfig.accelerationTime, 0.01);
      const factor = 1 - Math.exp(-kAccel * dt);
      this.currentSpeed += (targetSpeed - this.currentSpeed) * factor;
    } else {
      // Decelerating: stops smoothly in ~0.12 s
      const kDecel = 3.0 / Math.max(locomotionConfig.decelerationTime, 0.01);
      const factor = 1 - Math.exp(-kDecel * dt);
      this.currentSpeed += (targetSpeed - this.currentSpeed) * factor;
      if (this.currentSpeed < 0.01 && targetSpeed === 0) {
        this.currentSpeed = 0;
      }
    }

    // 8. Feed smoothed slide vector to locomotor engine
    if (this.currentSpeed > 0) {
      this.slideSystem.movementVector
        .copy(this.currentHeading)
        .multiplyScalar(this.currentSpeed);
      this.slideSystem.movementVector.y = 0; // Pure horizontal sliding
      this.slideSystem.locomotor.slide(this.slideSystem.movementVector);
      this.isMoving = true;
    } else {
      if (this.isMoving) {
        this.slideSystem.movementVector.set(0, 0, 0);
        this.slideSystem.locomotor.slide(this.slideSystem.movementVector);
        this.isMoving = false;
      }
    }

    // 9. Update Comfort Vignette dynamically scaled by speed ratio
    if (this.slideSystem.vignette?.material?.uniforms?.uAlpha) {
      const maxRefSpeed = isXR
        ? locomotionConfig.sprintSpeedXR
        : locomotionConfig.sprintSpeedDesktop;
      const speedRatio = Math.min(this.currentSpeed / maxRefSpeed, 1.0);
      const vignetteTarget = speedRatio * locomotionConfig.comfortAssist;
      this.slideSystem.vignette.material.uniforms.uAlpha.value = MathUtils.lerp(
        this.slideSystem.vignette.material.uniforms.uAlpha.value,
        vignetteTarget,
        dt * 10,
      );
    }

    // 10. Update state for HUD / Debug inspection
    if (this.currentSpeed <= 0.05) {
      this.movementState = 'Idle';
    } else if (isSprinting && this.currentSpeed > locomotionConfig.walkSpeed + 0.1) {
      this.movementState = 'Sprinting';
    } else {
      this.movementState = 'Walking';
    }
  }

  public getCurrentSpeed(): number {
    return this.currentSpeed;
  }

  public getMovementState(): MovementState {
    return this.movementState;
  }

  public isRunning(): boolean {
    return this.movementState === 'Sprinting';
  }

  public destroy(): void {
    if (this.boundKeyDown) {
      window.removeEventListener('keydown', this.boundKeyDown);
      this.boundKeyDown = null;
    }
    if (this.boundKeyUp) {
      window.removeEventListener('keyup', this.boundKeyUp);
      this.boundKeyUp = null;
    }
    if (this.boundBlur) {
      window.removeEventListener('blur', this.boundBlur);
      this.boundBlur = null;
    }

    if (this.slideSystem && this.originalUpdate) {
      this.slideSystem.update = this.originalUpdate;
    }
  }
}

/**
 * Waits for SlideSystem to be registered on LocomotionSystem, then installs
 * the PlayerMovementController.
 */
export async function setupPlayerMovement(
  world: World,
  locomotion: LocomotionSystem,
): Promise<PlayerMovementController> {
  const slideSystem = await waitForSlideSystem(locomotion);
  const controller = new PlayerMovementController(world, locomotion, slideSystem);
  console.log('[Movement] Enhanced Player Movement Controller active (Walk: 2.2m/s, Sprint: 4.0m/s)');
  return controller;
}

function waitForSlideSystem(locomotion: LocomotionSystem): Promise<any> {
  if ((locomotion as any).slideSystem) {
    return Promise.resolve((locomotion as any).slideSystem);
  }

  return new Promise((resolve) => {
    const check = () => {
      const slide = (locomotion as any).slideSystem;
      if (slide) {
        resolve(slide);
      } else {
        requestAnimationFrame(check);
      }
    };
    requestAnimationFrame(check);
  });
}
