import { TurningMethod } from '@iwsdk/core';

export interface LocomotionSettings {
  /** Maximum walking sliding speed in meters per second (aim: ~2.2 m/s). */
  walkSpeed: number;
  /** Maximum sprinting speed on desktop keyboard in meters per second (~4.0 m/s). */
  sprintSpeedDesktop: number;
  /** Maximum sprinting speed on XR controllers in meters per second (~3.0 m/s). */
  sprintSpeedXR: number;
  /** Time in seconds to accelerate from standstill to full speed (~0.15 s). */
  accelerationTime: number;
  /** Time in seconds to decelerate from full speed to standstill (~0.12 s). */
  decelerationTime: number;
  /** Maximum physics delta time clamp to prevent lag tunneling and stair hopping (0.05 s). */
  maxDeltaTime: number;
  /** Sliding speed baseline alias (2.2 m/s). */
  slidingSpeed: number;
  /** Default turning method: SnapTurn (1) or SmoothTurn (2). */
  turningMethod: TurningMethod;
  /** Degrees rotated per snap turn. */
  turningAngle: number;
  /** Degrees per second for smooth turning. */
  turningSpeed: number;
  /** Whether teleportation is enabled as an option. */
  teleportEnabled: boolean;
  /** Comfort vignette intensity (0.0 = off, 1.0 = maximum). */
  comfortAssist: number;
  /** Whether jump action is enabled (disabled to prevent unwanted upward launch). */
  enableJumping: boolean;
}

export const locomotionConfig: LocomotionSettings = {
  walkSpeed: 2.2, // ~2.2 m/s walking speed
  sprintSpeedDesktop: 4.0, // ~4.0 m/s desktop SHIFT + WASD sprint
  sprintSpeedXR: 3.0, // ~3.0 m/s Quest 3 XR grip sprint
  accelerationTime: 0.15, // ~0.15 s to full speed
  decelerationTime: 0.12, // ~0.12 s to complete stop
  maxDeltaTime: 0.05, // 0.05 s clamp (prevents tunnel and stair bounce)
  slidingSpeed: 2.2, // baseline sliding speed
  turningMethod: TurningMethod.SnapTurn, // snap turn default
  turningAngle: 45, // 45 degrees per snap
  turningSpeed: 180, // 180 deg/s if smooth turn selected
  teleportEnabled: true, // teleport available as an option
  comfortAssist: 0.0,
  enableJumping: false,
};
