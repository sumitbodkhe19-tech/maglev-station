# Maglev Station (WebXR)

A WebXR educational simulation teaching the principles of magnetic levitation (maglev) trains and electromagnetism. Built using Meta's **Immersive Web SDK (IWSDK)**, Three.js, ECS, and Vite.

---

## Prerequisites

- **Node.js**: `20.19+`, `22.12+`, or `24+` (`node -v` to verify).
- **Web Browser**: Chrome, Edge, or any modern Chromium-based browser supporting WebXR or the built-in IWER emulator.

---

## Quick Start Commands

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
> **Note:** The server starts over **HTTPS** (required for WebXR APIs). On first visit, if your browser displays a self-signed certificate warning, accept it (e.g., click "Advanced" → "Proceed to localhost") to load the page.

### 3. Check Server Status
```bash
npm run dev:status
```

### 4. Stop Background Dev Server
```bash
npm run dev:down
```

### 5. Build for Production
```bash
npm run build
```

### 6. Preview Production Build
```bash
npm run preview
```

---

## Desktop Controls

After clicking **Enter XR** (at the top center) and entering **Play mode** (the play icon on the emulator toolbar), you can navigate the station using keyboard and mouse. These inputs emulate Quest 3 Touch Plus controllers and work identically on a physical headset.

### Locomotion & Interaction

| Input | Controller Mapping | Action |
| --- | --- | --- |
| **W** | Left Thumbstick Up | Walk forward (~2.0 m/s) |
| **S** | Left Thumbstick Down | Walk backward (~2.0 m/s) |
| **A** | Left Thumbstick Left | Strafe left |
| **D** | Left Thumbstick Right | Strafe right |
| **Mouse Move** (Play mode) | Headset Gaze / Look | Look around in 360 degrees |
| **Arrow Left / Right** | Right Thumbstick X | 45° Snap turn left / right |
| **Left Mouse Button (LMB)** | Right Trigger | Primary trigger / select / interact |
| **Right Mouse Button (RMB)** | Right Grip / Squeeze | Grip / grab objects |
| **Q** | Left Trigger | Secondary select / trigger |
| **E** | Left Grip | Secondary grip / grab |
| **Esc** | N/A | Release mouse pointer / exit Play mode |

---

## Developer Teleport Hotkeys (Dev-Only)

In development builds (`npm run dev`), number keys **1 through 6** provide instant teleport shortcuts to jump across the station. These are disabled in production builds:

| Key | Destination Zone | Real Coordinates (x, y, z) |
| --- | --- | --- |
| **1** | Street Spawn (Plaza) | `(0, 0, 0)` |
| **2** | Top of the Stairs (Station Entrance) | `(1.15, 0, -8.6)` |
| **3** | UG1 Landing (Stairwell Bottom) | `(-1.15, -6.0, -6.0)` |
| **4** | UG1 Concourse Centre (Ticket Hall) | `(0, -6, -28)` |
| **5** | UG2 Platform (Maglev Trackside) | `(0, -12, -45)` |
| **6** | Inside the Maglev Train (Cabin) | `(0, -12, -60)` |

### Developer Debug HUD

A lightweight, high-performance debug HUD is displayed in the top-left corner:
- **FPS**: Current rendering frame rate.
- **Pos**: Real-time player coordinates `(x, y, z)`.
- **Area**: Current station zone name resolved dynamically from bounding boxes in `src/config/areas.ts`.
- **Cheat Sheet**: Quick reference for the `1` - `6` teleport hotkeys.

---

## Project Structure

- `iwsdk.config.json`: Framework, camera, and XR configuration.
- `src/index.ts`: Application entry point initializing the World and locomotion.
- `src/config/`:
  - `spawn.ts`: Player spawn coordinate and facing direction.
  - `locomotion.ts`: Locomotion speeds, snap turn angle, and comfort settings.
  - `areas.ts`: Station zone bounding boxes and area resolution.
  - `teleport.ts`: Developer teleport hotkey definitions.
- `src/dev/`:
  - `debug-overlay.ts`: Dev-only HUD showing FPS, position, and current area.
  - `hotkeys.ts`: Dev-only keyboard listener for keys 1 to 6.
- `src/scene-assets/`: Procedural 3D assets (floor, test cubes, temporary test platforms).
- `public/scenes/main.iwsdk.scene.json`: Scene definition (lighting, environment, floor).
- `HOW_THIS_PROJECT_WORKS.md`: Detailed explanation of architecture, `LocomotionEnvironment`, and world coordinate conventions.
- `PROJECT_BRIEF.md`: Comprehensive project roadmap and design specifications.
