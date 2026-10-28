# MAGLEV STATION: PROJECT BRIEF (permanent context)

> **For the AI agent:** read this whole file at the start of EVERY task, before doing anything else. It describes the full project, the rules, and what has been built so far. Do only what the current prompt asks. Do not build ahead.
>
> **For the students:** keep this file in the project root. After each finished stage, tick the box in section 15 (or ask the agent to). Never delete this file.

---

## 1. What we are building

**Maglev Station** is a first-person **WebXR educational simulation** that teaches how a **maglev (magnetic levitation) train** works and the **electromagnetism** behind it.

The player:
1. Spawns on a street plaza near a subway-style station entrance.
2. Walks down a staircase to **Underground Floor 1 (UG1)**.
3. Is greeted by a security guard, passes a wand frisk and a luggage scan.
4. Explores the concourse: ticket counters, help desk, restrooms, fountains, fake plants, passenger NPCs.
5. Talks to NPCs and plays with small interactive models in the **Electromagnetism Fun Corner**.
6. Books a ticket, passes the ticket-verifying gates.
7. Goes down to **Underground Floor 2 (UG2)** by lift, escalator or stairs (player's choice).
8. Boards a **maglev train that floats above its track inside an underground vacuum-tube tunnel**, and rides it.

Tone: friendly, accurate, academic. Audience: college students. Most of the station feels like a normal subway station. The two differences are the maglev train (floating, no wheels on the track) and the tunnel (a round vacuum-tube).

It must run on:
- A **desktop browser** with keyboard and mouse (for development and demos).
- A **Meta Quest 3** with its controllers (the final target).
- A **public https web address** (hosted), with a localhost version for development.

---

## 2. How we work

- The students are **beginners** and will only give prompts. **The agent does all coding, running, testing and fixing.** After every task, explain what you did in short, plain language.
- Work is split into small numbered tasks (section 15). Do **only the current task**.
- Students may attach **screenshots** and **3D models (.glb)**. When provided, match them. Until then, use simple primitives (boxes, cylinders, planes) with clear names so they can be swapped later.
- If something is unclear, **ask first** instead of guessing.
- Never remove working features while adding new ones. After a stage works, commit to Git with a clear message.

---

## 3. Rules for every task

1. Read this file and `HOW_THIS_PROJECT_WORKS.md` first.
2. Use **IWSDK** features before writing custom code. The SDK is new: read **https://iwsdk.dev/skill.md** and the docs at **https://iwsdk.dev** and the generated project's own files before using any API. Never guess an API from memory.
3. After every task: start the dev server yourself, check the build and the browser console for errors, and tell the students the exact address to open (the port can change, so always use the printed address).
4. Test your own work in the browser and report honestly what works and what does not.
5. Keep code modular (see section 13). Put positions, sizes and all text in config or data files, not buried in code.
6. Keep `README.md` and `HOW_THIS_PROJECT_WORKS.md` up to date when you add something new.
7. **Facts must be accurate.** Every factual claim shown to the player (dialogue, signs, boards) goes into `src/data/facts.md` with a source link. Verify on the web before using a number or a claim. If a source is not found, do not use the claim.
8. Do not use real brand names, copyrighted characters, or copyrighted images. Use invented names (the station is "Maglev Central").

---

## 4. Tech stack and how to run

- **IWSDK** (Meta's Immersive Web SDK, package `@iwsdk/core`), built on **Three.js** with an **ECS** (entity-component-system) and **Vite**. Project created with `npm create @iwsdk@latest`, target **Virtual reality**, TypeScript, locomotion ON, grabbing ON.
- **Node.js 20.19+** (or 22.12+, or 24+).
- Run locally: `npm run dev` (serves over **https**, WebXR needs a secure page). Stop a background session: `npm run dev:down`. Check the address: `npm run dev:status`. Build: `npm run build`. Test the build: `npm run preview`.
- The IWSDK dev server injects the **IWER emulator** so everything can be tested on a laptop without a headset. Emulator settings live in `iwsdk.config.json`.
- Walkable surfaces must be registered with the `LocomotionEnvironment` component (static type for fixed geometry; the KINEMATIC type is for moving platforms such as the lift). Walls and counters must block the player.
- Spatial UI (dialogue panels, boards, buttons) uses IWSDK's spatial UI tools. Check the docs for the recommended approach.
- Grabbing and ray interaction use IWSDK's built-in systems.

---

## 5. Controls

**Desktop (IWER emulator).** Click **Enter XR**, then the **Play mode** button (circle-play icon) to lock the mouse.

| Input | Action |
| --- | --- |
| W A S D | Walk (left thumbstick) |
| Mouse (in Play mode) | Look around |
| Arrow keys | Right thumbstick |
| Left mouse button | Right controller trigger (click, select) |
| Right mouse button | Right controller grip (grab) |
| Q / E | Left controller trigger / grip |
| Esc | Leave Play mode |

**Quest 3 controllers.** Ray pointer on both controllers for UI and NPCs. Trigger = select. Grip = grab. Left thumbstick = walk. Right thumbstick = snap turn (default). Teleport is an optional alternative. Left controller **Y button** opens the Settings panel.

Every interaction must work with BOTH the desktop mouse and the Quest controller ray.

---

## 6. World layout

Units are **meters** (1 unit = 1 m). Player eye height about 1.6 m. Exact coordinates live in `src/config/areas.ts` and `src/config/spawn.ts`. Record the direction conventions (which way the journey runs) in `HOW_THIS_PROJECT_WORKS.md` and never change them later.

| Level | Floor height | Contents |
| --- | --- | --- |
| Street | y = 0 | Plaza about 30 m x 30 m, entrance building with a glowing "MAGLEV CENTRAL" sign, benches, lamp posts, low-poly trees, early-evening sky. Player spawns about 8 m in front of the entrance, facing it. |
| Stairwell | 0 to -6 m | Enclosed switchback staircase with a middle landing. Step height about 0.17 m, depth about 0.3 m, handrails both sides, ceiling lights. |
| UG1 | y = -6 | Concourse hall about 40 m wide x 36 m long, ceiling 5 m, pillars every 8 m. |
| Stairs, lift, escalator | -6 to -12 m | All three lead from the south end of UG1 (beyond the ticket gates) to the UG2 landing. |
| UG2 | y = -12 | Arrival landing about 12 m x 12 m, then the platform hall about 70 m long, platform 8 m wide, ceiling 5 m. |
| Tube | along UG2 | Circular vacuum tube about 7 m in diameter running past the platform, at least 150 m visible each way, fading into darkness. |

**UG1 zones, in walking order** (each is a named box in `src/config/areas.ts`):
1. Stairs landing (about 10 m x 10 m) with "UG1 - Concourse" sign.
2. Security checkpoint zone (about 8 m deep).
3. Ticket booking counters on the west wall (3 counters, glass windows, queue rail).
4. Help desk zone (middle of the west side).
5. Restrooms on the east wall (Men, Women, Accessible). Doors are decoration only.
6. Electromagnetism Fun Corner (south-east, about 10 m x 10 m, floor ring, hanging sign).
7. Ticket gates zone (3 lanes, near the south end).
8. Lift / escalator / stairs zone (south end).

Decorations: fake plants in planters (instanced), benches, a central fountain with cheap animated water, science-themed posters (simple shapes), hanging wayfinding signs with arrows, a digital departure board for Platform 2.

**UG2 train and tube details**
- Two-car train, each car about 12 m long and 3 m wide, white with a blue stripe, rounded nose. It **floats above the guideway with a visible gap of about 15 cm** (exaggerated for teaching; a sign says so and gives the real gaps, verified and cited in `facts.md`). Very slight sway.
- Guideway: concrete U-shaped channel with evenly spaced glowing blue coils on both inner walls, with a light pulse travelling along them (the moving magnetic wave).
- Platform screen doors (glass wall) open together with the train doors only when the train is stopped and aligned.
- An info board states honestly that vacuum-tube maglev is still an experimental idea and is not what most maglev lines use today (verify the current status and cite it).

**Lift and escalator**
- Lift cabin about 2.2 m x 2.2 m, sliding doors, 6 m descent over about 6 seconds with ease-in/out and a chime. Player is carried with the cabin; comfort vignette during the ride.
- Escalator: 30 to 35 degree slope, speed about 0.6 to 0.75 m/s (ride about 15 to 20 seconds), moving steps, side rails, comfort vignette. Player can still look around and step off sideways.

---

## 7. Player journey and game flags

A small global store holds these flags (add more only when a task needs them):

| Flag | Set when |
| --- | --- |
| `metGuard` | The player talks to Officer Sam |
| `passedSecurity` | Wand frisk AND luggage scan are both done |
| `hasTicket` | The player books a ticket at the counter |
| `ticketVerified` | The ticket is accepted at the gate reader |
| `labComplete` | The player finishes Dr. Maya's quiz (after visiting all 6 stations) |

Also stored: a **Learning Journal** (list of learning points earned), the chosen destination, and completed Fun Corner stations.

**Gating rules** (real collision, never just a message):
- A rope barrier blocks the way into the concourse until `passedSecurity`.
- Closed gate doors block the way to the lift/escalator/stairs until `ticketVerified` (doors open for 5 seconds on a valid scan).
- Captain Lee refuses boarding if `ticketVerified` is false and sends the player back.
- Players must never get stuck: every conversation can be closed, and the Settings panel has "Return to last safe spot".

---

## 8. NPCs (all use the same NPC + dialogue system)

| Name | Where | Role |
| --- | --- | --- |
| Officer Sam | Foot of the stairs, UG1 landing | Greets the player automatically, explains security and what maglev means, runs the wand frisk and luggage check |
| Jordan | Help desk | Gives hints based on the flags (what to do next), explains the Fun Corner, directions to restrooms |
| Alex | Ticket counter 2 | Booking flow: choose one of 3 made-up destinations, a ticket is printed |
| Dr. Maya | Fun Corner entrance | Introduces the 6 stations, explains EMS vs EDS, gives a 3-question quiz |
| Captain Lee | UG2 platform | Explains boarding, answers "How does the train float?", "How does it move?", "Why a vacuum tube?" |
| 4 passengers | Around UG1 | Short 3 to 4 line chats, each with one verified fun fact; slow waypoint loops, never through walls |

**NPC rules:** simple low-poly person from primitives (different colors per NPC), name tag, gentle idle animation, turns to face the player within 4 m, "Talk" marker in range. Keep the total NPC count low for Quest performance.

**Dialogue rules:** all conversations are **data files** (`src/data/dialogue/*.json`): nodes with id, speaker, text, and choices (label, next node, optional action such as "set flag" or "give learning point"). Lines are short (2 to 3 sentences max). Shown on a spatial panel near the NPC, large readable text at 1.5 to 2 m, working with controller ray + trigger and desktop left click. Dialogue is always shown as text (captions).

---

## 9. Electromagnetism Fun Corner (6 stations)

Each station is a table, a title sign, a "How it works" board (title, 3 short bullets, a "Try this" line), a Reset button, and a one-time learning point when the key action is done. Code in `src/lab/` (one file per station), text in `src/data/lab/*.json`. Simple math animation, **no physics engine**, stable and cheap.

1. **Compass wire board (Oersted).** Wire through a board with 8 compasses; a switch turns the current on, off or reverses it; needles circle the wire; right-hand rule icon.
2. **Electromagnet.** Nail with a coil, battery, current dial, 10 or 30 turns; paper clips jump to the nail; more current or turns lifts more; field-strength bar.
3. **Magnet poles track.** Two grabbable bar magnets (red N, blue S) on a low-friction rail; like poles repel, unlike attract and snap; force arrow grows when close; stable maths.
4. **Falling magnet tubes.** Copper tube vs plastic tube: the magnet falls slower through copper. Explains Lenz's law in simple words and links it to electrodynamic suspension (EDS).
5. **Linear motor track.** 8 coils switch on in a moving pattern and pull a magnetic cart; a speed dial changes the pattern speed. A maglev train is pushed by a travelling magnetic wave.
6. **Levitation toy (main attraction).** Model train above a guideway with a visible gap; strength slider changes the gap; control system ON keeps the gap steady even when tapped; OFF (electromagnetic suspension) makes it snap up or drop, showing EMS needs constant electronic control.

After all 6: Dr. Maya's 3-question multiple-choice quiz, then `labComplete` and a learning-point bonus. A Learning Journal board shows which stations are done.

---

## 10. Learning content (use in NPCs, signs, boards, ride captions)

- Electricity and magnetism are linked: an electric current makes a magnetic field (an electromagnet). A changing magnetic field can make a current (Faraday's law).
- Magnets attract and repel; like poles repel.
- Metal detector wand: a coil makes a changing magnetic field; nearby metal disturbs it and the detector notices (electromagnetic induction).
- X-ray luggage scanners use X-rays (another part of the electromagnetic spectrum), not magnets.
- Lifts and escalators use electric motors, so electromagnetism is all around.
- **Levitation, two kinds.** EMS (electromagnetic suspension): attractive magnets pull the train up toward the track and need constant active electronic control to stay stable. EDS (electrodynamic suspension): strong magnets on a moving train induce currents in track coils, and the resulting repulsion lifts the train once it is moving fast enough.
- **Guidance** keeps the train centered. **Propulsion** uses a linear motor: a travelling magnetic wave along the track pulls the train, like an unrolled electric motor.
- Lenz's law: the induced currents oppose the change that causes them (why the magnet falls slowly in a copper tube, and why EDS works).
- No wheels touch the track, so friction is tiny. A vacuum tube removes most air drag too, but vacuum-tube maglev is still experimental.
- Sample fun facts to verify before use: the Shanghai Maglev airport line's peak operating speed (about 431 km/h) and Japan's SCMaglev test train reaching 603 km/h in 2015 (a manned-train record at the time).

---

## 11. Interaction and UI conventions

- Interactive objects show a small hover highlight. Controllers are visible with ray lines.
- Buttons and dials work by controller ray + trigger or desktop left click. Grabbable objects use grip (desktop: right mouse).
- UI panels sit 1.2 to 2 m away, face the player, never appear inside walls, and are readable in VR.
- A "How it works" board sits next to every interactive model.
- Sound effects (beep, whoosh, chime, ambience) through IWSDK audio where it fits, with a mute toggle (key **M** on desktop) and a Settings option.
- **Settings panel** (Y button on the left controller, **Tab** on desktop): turning method (snap or smooth), snap angle, walk speed, slide or teleport, comfort vignette, text size, sound, captions. Saved in the browser's local storage.

---

## 12. Performance and comfort

- Target **72 fps on Quest 3**. Low-poly shapes, reused meshes and materials, **instancing** for repeated objects (plants, benches, coils, rings), few lights, **no real-time shadows** (use emissive panels and baked-looking light), no large textures.
- Report the FPS in each major area (start, UG1 hall, Fun Corner, platform, ride). If an area is below target, optimise before moving on.
- The debug overlay also shows draw calls and triangle counts.
- Comfort: nothing moves the player suddenly except the lift, escalator and ride, and all of those use a vignette. **Never move the player's rig at high speed during the ride**: keep the player in the cabin and stream tunnel rings and coil pulses past the windows with gentle acceleration. Offer a reduced-effect option (key **C** on desktop).
- Ride timing: sealing sequence, then smooth acceleration to a demo speed of about 600 km/h over about 45 s, cruise about 20 s, brake about 30 s. Cabin display shows tube pressure falling, levitation OK with the gap, speed, and 3 short facts.

---

## 13. File and folder conventions

```
maglev-station/
  PROJECT_BRIEF.md            <- this file (never delete)
  HOW_THIS_PROJECT_WORKS.md   <- plain-language explanation of the project files
  README.md                   <- install, run, stop, build, desktop controls
  DEPLOY.md                   <- hosting steps for beginners
  QUEST_TEST_CHECKLIST.md     <- step-by-step headset test list
  TEST_REPORT.md              <- what was tested, fixed, still imperfect
  iwsdk.config.json
  public/
    scenes/  models/  audio/  ui/
  src/
    config/    areas.ts  spawn.ts  (plus other settings: locomotion, comfort)
    data/
      dialogue/*.json   facts.md   lab/*.json
    lab/                 one file per Fun Corner station
    (one file per feature: areas, npc, dialogue, interactions, maglev, lift, gates, security)
```

Rules: one file per feature, text and numbers in data/config files, clear object names (for example `Station_UG1_Hall`, `NPC_OfficerSam`, `Train_Car1`) so models can be swapped later.

---

## 14. Developer shortcuts (development only)

These are removed or disabled in production builds, and can be re-enabled on the hosted site only with `?debug=1` in the address.

- Debug overlay: player position (x, y, z), current area name, FPS, draw calls, triangles, NPC names.
- Teleport hotkeys: **1** street spawn, **2** top of the stairs, **3** UG1 landing, **4** UG1 concourse centre, **5** UG2 platform, **6** inside the train. Coordinates are kept in a config file. They must not clash with emulator keys (W A S D, Q, E, arrows).
- **P** toggles the translucent colored area boxes.
- **M** mute, **C** comfort (reduced ride effect), **Tab** Settings.

---

## 15. Build order and status

Tick a box only when the stage runs without console errors and the agent has tested it. Update this list after each task.

- [x] **1. Setup:** IWSDK project (VR, TypeScript, locomotion + grabbing), runs on localhost, docs files written
- [x] **2. Walking:** locomotion, spawn config, desktop controls, debug overlay, teleport hotkeys, test cubes
- [x] **3. Street + stairs:** plaza, entrance, switchback stairs to UG1, areas config
- [ ] **4. UG1 hall:** shell, all zones marked, decorations, signs, departure board, performance check
- [ ] **5. NPC + dialogue system + Officer Sam:** data-driven dialogue, spatial panels, game flags, Learning Journal counter
- [ ] **6A. Help desk, ticket counter, 4 passengers:** hints from flags, booking flow with grabbable ticket, facts file
- [ ] **6B. Security + gates:** wand frisk, luggage scanner, rope barrier, ticket gates with verifier, sounds
- [ ] **7A. Fun Corner framework + stations 1 to 3:** compass board, electromagnet, magnet poles track
- [ ] **7B. Stations 4 to 6 + Dr. Maya + quiz:** falling magnet tubes, linear motor, levitation toy, quiz, journal board
- [ ] **8A. Stairs to UG2 + arrival landing**
- [ ] **8B. Lift + escalator** with comfort vignette
- [ ] **9A. Platform + vacuum tube + guideway**
- [ ] **9B. Train + Captain Lee + boarding + ride + arrival summary**
- [ ] **10. Quest 3 controllers + settings panel + comfort audit + checklist file**
- [ ] **11A. Polish:** start screen, loading, audio, captions, credits board, hide debug in production, full playthrough test
- [ ] **11B. Build + host:** production build, GitHub Pages (or another https host), DEPLOY.md, live check

**Current status / notes from the agent (update after every task):**

- **Stage 1 (Setup) completed**:
  - Scaffolding generated with `@iwsdk/create` (VR target, TypeScript, locomotion ON, grabbing ON, physics OFF, Git initialized).
  - Starter demo objects (robot, plants, demo plinths, stage, sideboard, gallery, welcome panel) removed while keeping the large plain floor (`studio-floor` with `LocomotionEnvironment`), sky gradients (`DomeGradient`, `IBLGradient`), and basic lighting (`key-light`, `fill-light`).
  - `HOW_THIS_PROJECT_WORKS.md` and `README.md` written and updated with coordinate conventions and exact run commands.
  - Development server runs on `https://localhost:8081/` with 0 console errors and IWER emulator tested and working.

- **Stage 2 (Walking & Test Shortcuts) completed**:
  - Config files created: `src/config/spawn.ts` (spawn at `[0, 0, 0]` facing `-Z`), `src/config/locomotion.ts` (sliding speed 2.0 m/s, snap turn 45°, teleport enabled), `src/config/areas.ts` (station zone bounding boxes), `src/config/teleport.ts` (keys 1-6 planned station coordinates).
  - Built-in `LocomotionSystem` configured and active.
  - Large walkable floor with `LocomotionEnvironment` registered and verified.
  - 8 colorful test cubes positioned along the corridor plus preview landing pads with distinct color pillars for all 6 teleport zones.
  - Dev-only debug HUD (`src/dev/debug-overlay.ts`) displaying real-time FPS (solid 60 fps), Player Pos `(x, y, z)`, and current station zone name.
  - Dev-only teleport shortcuts (`src/dev/hotkeys.ts`) on number keys 1-6 verified and working without clashing with emulator keys.
  - Stripped entirely from production builds (`import.meta.env.DEV` dynamic imports).
  - Verified in browser with screenshots, keypress interactions, and zero console errors.

- **Stage 3 (Street Entrance & Staircase Down) completed**:
  - Street-level plaza (~30 m x 30 m at `y = 0`) built with paved ground, perimeter road with curbs, modern street lamps, park benches, low-poly trees in planters, and stylized city buildings matching user reference images.
  - Early-evening dusk sky with warm peach horizon and twilight zenith via `DomeGradient` and `IBLGradient`.
  - Station entrance building with arched glass/steel canopy, glowing cyan "MAGLEV CENTRAL" sign, and subway-style yellow totem pylon.
  - Switchback staircase going down to UG1 at `y = -6 m` with middle landing at `y = -3 m` (36 steps total, 0.1667 m rise, 0.30 m run), dual stainless steel handrails, subway tile walls, and overhead lighting.
  - Clean separation of walkable geometry (`stairwell-walkable`) and visual geometry (`stairwell-visual`). Smooth sloped ramp colliders ensure 100% stutter-free continuous locomotion walking down AND back up.
  - Full enclosing wall colliders along stairs, divider, and landing room to prevent walking through walls or seeing through geometry.
  - 10 m x 10 m plain UG1 Landing floor at `y = -6 m` in front of stair exit with prominent self-illuminated "UG1 - CONCOURSE" sign and green "▲ STREET EXIT" directional sign.
  - `src/config/areas.ts` updated with exact bounds: `Street`, `Stairwell`, and `UG1 Landing`. Debug HUD dynamically displays the active area name.
  - `src/config/teleport.ts` updated with real coordinates for hotkeys 1 (Street `[0, 0, 0]`), 2 (Stairs `[1.15, 0, -8.6]`), and 3 (UG1 Landing `[-1.15, -6.0, -6.0]`).
  - Self-tested and verified with automated browser locomotion: spawned at street, walked down 36 steps to UG1 landing, verified HUD area changes, and walked all the way back up to street plaza at solid 60 FPS.

---

## 16. Definition of done for any task

1. It runs with `npm run dev` with no build errors and no browser console errors.
2. It works with desktop keyboard and mouse in the emulator, and the code path is the one Quest controllers will use.
3. FPS was checked and reported for the area touched.
4. New facts are in `src/data/facts.md` with sources.
5. Docs (`README.md`, `HOW_THIS_PROJECT_WORKS.md`) and the status list above are updated.
6. The agent reported plainly what works, what does not, and what to look at by eye.

---

## 17. Never do

- Do not build ahead of the current task or rewrite working features without being asked.
- Do not guess IWSDK APIs; read the docs.
- Do not add a physics engine for the Fun Corner models.
- Do not use real brands, copyrighted characters or copyrighted images.
- Do not show unverified facts to the player.
- Do not move the player's rig at speed during the train ride.
- Do not leave developer hotkeys or the debug overlay enabled in production builds.
- Do not trap the player: every dialogue and every machine must have a way out.
