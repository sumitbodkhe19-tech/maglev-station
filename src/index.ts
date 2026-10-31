/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LocomotionSystem, Vector3, World } from '@iwsdk/core';
import projectOptions from 'virtual:iwsdk-project';
import { locomotionConfig } from './config/locomotion.js';
import { playerSpawn } from './config/spawn.js';

World.create(
  document.getElementById('scene-container') as HTMLDivElement,
  projectOptions,
).then(async (world) => {
  console.log('Maglev Station world initialized');

  // Configure locomotion system
  const locomotion = world.getSystem(LocomotionSystem);
  if (locomotion) {
    if (locomotion.config?.slidingSpeed) {
      locomotion.config.slidingSpeed.value = locomotionConfig.slidingSpeed;
    }
    if (locomotion.config?.turningMethod) {
      locomotion.config.turningMethod.value = locomotionConfig.turningMethod;
    }
    if (locomotion.config?.turningAngle) {
      locomotion.config.turningAngle.value = locomotionConfig.turningAngle;
    }
    if (locomotion.config?.turningSpeed) {
      locomotion.config.turningSpeed.value = locomotionConfig.turningSpeed;
    }
    if (locomotion.config?.comfortAssist) {
      locomotion.config.comfortAssist.value = locomotionConfig.comfortAssist;
    }
    if (locomotion.config?.enableJumping) {
      locomotion.config.enableJumping.value = locomotionConfig.enableJumping;
    }

    // Set initial spawn position
    const spawnPos = new Vector3(
      playerSpawn.position.x,
      playerSpawn.position.y,
      playerSpawn.position.z,
    );
    locomotion.setPlayerPosition(spawnPos);
    world.setAuthoredPlayerPosition(spawnPos);
  }

  // Enhanced locomotion: smooth acceleration, deceleration, walking (2.2 m/s) & sprint (4.0 m/s)
  let movementController: any = undefined;
  if (locomotion) {
    const { setupPlayerMovement } = await import(
      './locomotion/movement-controller.js'
    );
    movementController = await setupPlayerMovement(world, locomotion);
  }

  // Desktop mouse-look: turns the player's head and view when moving or dragging the mouse
  const { MouseLook } = await import('./dev/mouse-look.js');
  new MouseLook(world);
  console.log('Desktop mouse look active');

  // Developer-only tools: Debug Overlay & Teleport Hotkeys
  // Disabled in production builds
  if (import.meta.env.DEV) {
    const { DebugOverlay } = await import('./dev/debug-overlay.js');
    const { DevHotkeys } = await import('./dev/hotkeys.js');

    new DebugOverlay(world, movementController);
    new DevHotkeys(world);
    console.log('[DEV] Debug overlay and teleport hotkeys (1-6) active');
  }
});
