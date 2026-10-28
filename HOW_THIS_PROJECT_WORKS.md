# How This Project Works

This document explains the architecture of the **Maglev Station** project, what each core file does in plain language, and the permanent world and coordinate conventions used across all development stages.

---

## 1. What is IWSDK?

**IWSDK** (Meta's Immersive Web SDK) is a modern framework for building WebXR and 3D web applications. It is built on top of:
- **Three.js** for 3D rendering, materials, and geometries.
- **ECS (Entity-Component-System)** architecture for managing game objects, data components, and behaviors cleanly without monolithic classes.
- **Vite** for fast local development, hot reloading, and optimized production builds.
- **IWER (Immersive Web Emulation Runtime)** for testing VR/XR experiences directly in a standard desktop browser with mouse and keyboard without needing a physical headset.

---

## 2. Core Project Files

### `iwsdk.config.json`
The central project authority file. It defines:
- **Scene**: Path to the default scene description (`./public/scenes/main.iwsdk.scene.json`).
- **Assets Module**: Where assets are registered (`./src/assets`).
- **Components Module**: Where custom ECS components are registered (`./src/components`).
- **World Configuration**:
  - `xr`: VR mode (`mode: "vr"`), session offering behavior (`offer: "always"`), and controller/hand tracking capabilities.
  - `render`: Camera settings including field of view (`fov: 70`), near/far clipping distances (`0.001` to `200` meters), and initial camera look target.
  - `features`: Built-in capabilities toggled on or off—locomotion (`locomotion: { useWorker: true }`), grabbing (`grabbing: true`), physics, and spatial UI kit (`horizon`).
  - `dev.emulator`: Default emulated hardware for browser development (`metaQuest3`).

### `src/index.ts`
The application's TypeScript entry point.
- Finds the `#scene-container` DOM element in `index.html`.
- Loads the virtual project options created from `iwsdk.config.json`.
- Initializes the WebXR world using `World.create()`.
- Provides the lifecycle hook where custom ECS systems and logic are registered.

### `public/scenes/main.iwsdk.scene.json`
The declarative 3D scene file loaded by IWSDK's `LevelSystem`:
- **Components**:
  - `DomeGradient`: Defines the sky dome colors (sky, equator, ground) and sun elevation/azimuth for realistic atmospheric lighting.
  - `IBLGradient`: Image-based ambient lighting gradient providing natural ambient fill.
- **Environment**: Controls exposure and shadow settings.
- **Nodes**: Hierarchical 3D objects placed in the scene:
  - `studio-floor`: A 36 m × 36 m walkable floor plane tagged with `LocomotionEnvironment` so the player can walk on it.
  - `key-light`: A directional sun light providing primary illumination and directional shadows.
  - `fill-light`: A hemisphere light balancing shadows with soft sky and ground ambient tones.

### Supporting Architecture Files
- **`src/assets.ts`**: The asset manifest registry (`defineAssets()`). Every 3D model, sound, or procedural mesh placed in scenes or used by systems is declared here.
- **`src/components.ts`**: The application ECS component catalog (`defineComponents()`).
- **`src/scene-assets/studio.scene-asset.ts`**: Procedural Three.js mesh generator for the walkable floor, complete with a fine diamond lattice texture.
- **`index.html`**: Host HTML page containing `#scene-container` and loading `src/index.ts`.
- **`PROJECT_BRIEF.md`**: Permanent specification of the entire Maglev Station project and roadmap.

---

## 3. Direction and Coordinate Conventions

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
