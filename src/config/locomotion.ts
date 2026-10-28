import { TurningMethod } from '@iwsdk/core';

export interface LocomotionSettings {
  /** Maximum sliding speed in meters per second (default ~2 m/s). */
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
}

export const locomotionConfig: LocomotionSettings = {
  slidingSpeed: 2.0, // about 2 m/s
  turningMethod: TurningMethod.SnapTurn, // snap turn default
  turningAngle: 45, // 45 degrees per snap
  turningSpeed: 180, // 180 deg/s if smooth turn selected
  teleportEnabled: true, // teleport available as an option
  comfortAssist: 0.0,
};
