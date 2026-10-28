# How This Project Works

This document explains the architecture of the **Maglev Station** project, what each core file does in plain language, how locomotion and walkable surfaces operate, and the permanent world and coordinate conventions used across all development stages.

---

## 1. What is IWSDK?

**IWSDK** (Meta's Immersive Web SDK) is a modern framework for building WebXR and 3D web applications. It is built on top of:
- **Three.js** for 3D rendering, materials, and geometries.
- **ECS (Entity-Component-System)** architecture for managing game objects, data components, and behaviors cleanly without monolithic classes.
- **Vite** for fast local development, hot reloading, and optimized production builds.
- **IWER (Immersive Web Emulation Runtime)** for testing VR/XR experiences directly in a standard desktop browser with mouse and keyboard without needing a physical headset.

---

## 2. Locomotion & Walkable Surfaces (CRITICAL RULE)

IWSDK includes a physics-backed locomotion engine (`@iwsdk/locomotor`) managed via `LocomotionSystem`.

### Every Walkable Surface MUST Have `LocomotionEnvironment`

> **IMPORTANT:** In IWSDK, virtual characters and players will fall through or fail to step onto any surface that has not been explicitly registered with the `LocomotionEnvironment` component.

To make any floor, ramp, stairway tread, or platform walkable:
1. **In Scene JSON (`*.iwsdk.scene.json`)**:
   Add the `"LocomotionEnvironment": {}` component to the scene node:
   ```json
   {
     "id": "concourse-floor",
     "name": "Concourse Floor",
     "content": {
       "type": "asset",
       "asset": "concourse-floor-mesh"
     },
     "components": {
       "LocomotionEnvironment": {}
     }
   }
   ```
2. **In Procedural Code / ECS Entities**:
   Add the `LocomotionEnvironment` component to the entity hosting the Three.js mesh:
   ```ts
   import { LocomotionEnvironment } from '@iwsdk/core';
   entity.addComponent(LocomotionEnvironment);
   ```

When the `LocomotionSystem` initializes or when new entities enter the world query, it extracts the mesh geometry, builds spatial BVH raycast trees, and registers them with the locomotor worker engine.

---

## 3. Configuration & State Files

All tunable parameters and coordinates are centralized in `src/config/`:

| File | Purpose | Key Values |
| --- | --- | --- |
| `src/config/spawn.ts` | Player spawn point and look direction | `position: [0, 0, 0]`, facing `-Z` (`[0, 0, -1]`), eye height `1.6` m |
| `src/config/locomotion.ts` | Locomotion speeds and turning modes | `slidingSpeed: 2.0` m/s, `turningMethod: SnapTurn`, `turningAngle: 45`°, `teleportEnabled: true` |
| `src/config/areas.ts` | Bounding boxes for each station zone | `Street Plaza`, `Entrance`, `Switchback Stairs`, `UG1 Landing`, `UG1 Concourse`, `Fun Corner`, `UG2 Platform`, `Inside Maglev Train` |
| `src/config/teleport.ts` | Developer number-key jump shortcuts | Keys `1` to `6` mapped to planned station coordinates |

---

## 4. Developer Tools & Shortcuts (Dev-Only)

To accelerate testing across all stages, two developer aids are included. Both are completely stripped from production builds via `if (import.meta.env.DEV)` dynamic imports:

1. **Debug HUD Overlay (`src/dev/debug-overlay.ts`)**:
   - Fixed in the top-left corner with a dark glassmorphic UI.
   - Displays real-time **FPS**, exact **player coordinates (x, y, z)**, and the **current station zone name** resolved from `src/config/areas.ts`.
   - Displays a cheat sheet for number-key teleports.

2. **Teleport Hotkeys (`src/dev/hotkeys.ts`)**:
   - Keys **1 to 6** instantly teleport the player to any zone:
     - `1`: Street Spawn `(0, 0, 0)`
     - `2`: Top of Stairs `(0, 0, -8)`
     - `3`: UG1 Landing `(0, -6, -14)`
     - `4`: UG1 Concourse Centre `(0, -6, -28)`
     - `5`: UG2 Platform `(0, -12, -45)`
     - `6`: Inside Maglev Train `(0, -12, -60)`
   - Hotkeys bypass input elements and do not conflict with emulator keys (W, A, S, D, Q, E, arrows).

---

## 5. Core Project Files

### `iwsdk.config.json`
The central project authority file. It defines:
- **Scene**: Path to default scene (`./public/scenes/main.iwsdk.scene.json`).
- **Assets Module**: Where assets are registered (`./src/assets`).
- **Components Module**: Where custom ECS components are registered (`./src/components`).
- **World Configuration**:
  - `xr`: VR mode (`mode: "vr"`), session offering behavior (`offer: "always"`), controller and hand tracking.
  - `camera`: Initial camera position `[0, 1.6, 0]` facing `[0, 1.6, -1]`.
  - `features`: Locomotion (`locomotion: { useWorker: true, browserControls: true }`), grabbing (`grabbing: true`), physics, and horizon UI kit.
  - `dev.emulator`: Default emulated hardware for browser development (`metaQuest3`).

### `src/index.ts`
The application's TypeScript entry point.
- Finds `#scene-container` DOM element.
- Boots `World.create()`.
- Pulls `LocomotionSystem` and applies `locomotionConfig` (`slidingSpeed = 2.0`, `turningMethod = SnapTurn`, `turningAngle = 45°`).
- Positions player at `playerSpawn` (`[0, 0, 0]` facing `-Z`).
- Dynamically imports and mounts `DebugOverlay` and `DevHotkeys` in development mode.

### `public/scenes/main.iwsdk.scene.json`
The declarative 3D scene file loaded by IWSDK's `LevelSystem`:
- **Components**:
  - `DomeGradient`: Atmospheric sky dome colors.
  - `IBLGradient`: Image-based ambient fill.
- **Nodes**:
  - `studio-floor`: Walkable surface with `LocomotionEnvironment: {}`.
  - `test-cubes`: Walkable test cubes and underground landing pads with `LocomotionEnvironment: {}`.
  - `key-light`: Directional shadow-casting sunlight.
  - `fill-light`: Hemisphere ambient fill light.

---

## 6. Direction and Coordinate Conventions

These conventions are fixed and must never be altered in later stages:

| Axis | Direction | Representation |
| --- | --- | --- |
| **+Y** | Up | Ceiling / Sky |
| **-Y** | Down | Floor / Underground floors |
| **-Z** | North | Backward from entrance facing |
| **+Z** | South | Forward progression into the station |
| **+X** | East | Right-hand side of concourse |
| **-X** | West | Left-hand side of concourse |

### Station Floor Heights:
- **Street Plaza**: `y = 0` m (spawn point ~8 m in front of entrance facing South `+Z`).
- **Stairwell**: descent from `y = 0` to `y = -6` m.
- **UG1 Concourse**: `y = -6` m (Security checkpoint, Ticket counters on West `-X`, Help desk on West `-X`, Restrooms on East `+X`, Fun Corner on South-East `+X/+Z`, Ticket gates on South `+Z`).
- **UG2 Platform Hall**: `y = -12` m (Platform and vacuum-tube guideway).
