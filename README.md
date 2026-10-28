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

## How to Open and Use the Page

1. Run `npm run dev` in your terminal. Note the printed HTTPS address (for example: `https://localhost:5173/`).
2. Open that URL in your browser.
3. You will see:
   - A large plain floor the player can stand on.
   - Atmospheric sky gradient and lighting.
   - The **Enter XR** button in the top/overlay bar provided by the IWER emulator.
4. Click **Enter XR**. The IWER emulator initializes and displays its device toolbar.
5. In the emulator toolbar, click the **Play mode** button (circle with play icon) to lock mouse look.

### Desktop Emulator Controls

| Input | Action |
| --- | --- |
| **W, A, S, D** | Walk forward, left, backward, right (left thumbstick) |
| **Mouse** (in Play mode) | Look around |
| **Arrow keys** | Turn / right thumbstick |
| **Left Click** | Trigger / select (right controller) |
| **Right Click** | Grip / grab (right controller) |
| **Q / E** | Left controller trigger / grip |
| **Esc** | Exit Play mode (unlock mouse) |

---

## Project Structure

- `iwsdk.config.json`: Framework and XR configuration.
- `src/index.ts`: Application entry point initializing the World.
- `public/scenes/main.iwsdk.scene.json`: Scene definition (lighting, environment, floor).
- `HOW_THIS_PROJECT_WORKS.md`: Detailed explanation of the architecture and world coordinate conventions.
- `PROJECT_BRIEF.md`: Comprehensive project roadmap and design specifications.
