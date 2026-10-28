import {
  BoxGeometry,
  CanvasTexture,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  SRGBColorSpace,
} from 'three';

/**
 * Creates high-contrast illuminated sign for "UG1 - Concourse".
 */
function createConcourseSignTexture(width = 1024, height = 256): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 8;
    ctx.strokeRect(8, 8, width - 16, height - 16);

    // Cyan glowing text
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 25;
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 68px "Segoe UI", Inter, Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('UG1 - CONCOURSE', width / 2, height * 0.44);

    // Directional arrows and subtitle
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 30px "Segoe UI", Inter, Roboto, sans-serif';
    ctx.fillText('◄ TICKETING & SECURITY  |  TRAIN PLATFORMS ►', width / 2, height * 0.78);
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/**
 * Creates green illuminated directional sign for "▲ STREET EXIT".
 */
function createExitSignTexture(width = 512, height = 128): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, width - 12, height - 12);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 42px "Segoe UI", Inter, Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('▲ STREET EXIT', width / 2, height / 2);
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

// Dimensions for the switchback staircase
const FLIGHT_STEPS = 18;
const STEP_WIDTH = 1.9;
const STEP_DEPTH = 0.30;
const STEP_HEIGHT = 3.0 / FLIGHT_STEPS; // 0.1667m
const START_Z = -8.5;
const END_Z = START_Z - FLIGHT_STEPS * STEP_DEPTH; // -13.9m
const LANDING_END_Z = END_Z - 2.8; // -16.7m
const FLIGHT_LENGTH = Math.hypot(FLIGHT_STEPS * STEP_DEPTH, 3.0); // ~6.177m
const FLIGHT_ANGLE = Math.atan2(3.0, FLIGHT_STEPS * STEP_DEPTH); // ~0.507 rad

/**
 * Creates ONLY the walkable collision geometry registered with LocomotionEnvironment.
 * Smooth ramps under Flight 1 & Flight 2 guarantee 100% stutter-free locomotion down & up.
 */
export function createStairwellWalkable(): Group {
  const root = new Group();
  root.name = 'StairwellWalkable';

  const colliderMat = new MeshBasicMaterial({
    transparent: true,
    opacity: 0.0,
    depthWrite: false,
  });

  // 1. Top Landing (y = 0.0, z = -7.5 to -8.5)
  const topLandingCol = new Mesh(new BoxGeometry(4.4, 0.2, 1.2), colliderMat);
  topLandingCol.name = 'Col_TopLanding';
  topLandingCol.position.set(0, -0.1, -8.0);
  root.add(topLandingCol);

  // 2. Flight 1 Smooth Slope Ramp Collider (from y = 0.0 at z = -8.5 to y = -3.0 at z = -13.9)
  const ramp1Col = new Mesh(new BoxGeometry(STEP_WIDTH, 0.1, FLIGHT_LENGTH), colliderMat);
  ramp1Col.name = 'Col_RampFlight1';
  ramp1Col.position.set(1.15, -1.5, (START_Z + END_Z) / 2);
  ramp1Col.rotation.x = -FLIGHT_ANGLE;
  root.add(ramp1Col);

  // 3. Middle Landing (y = -3.0, z = -13.9 to -16.7, width 4.4m)
  const midLandingCol = new Mesh(new BoxGeometry(4.4, 0.2, 2.8), colliderMat);
  midLandingCol.name = 'Col_MidLanding';
  midLandingCol.position.set(0, -3.1, (END_Z + LANDING_END_Z) / 2);
  root.add(midLandingCol);

  // 4. Flight 2 Smooth Slope Ramp Collider (from y = -3.0 at z = -13.9 to y = -6.0 at z = -8.5)
  const ramp2Col = new Mesh(new BoxGeometry(STEP_WIDTH, 0.1, FLIGHT_LENGTH), colliderMat);
  ramp2Col.name = 'Col_RampFlight2';
  ramp2Col.position.set(-1.15, -4.5, (START_Z + END_Z) / 2);
  ramp2Col.rotation.x = FLIGHT_ANGLE;
  root.add(ramp2Col);

  // 5. Plain UG1 Landing Floor (10 m x 10 m at y = -6.0 m, in front of Flight 2 exit)
  const ug1FloorCol = new Mesh(new BoxGeometry(10, 0.2, 10), colliderMat);
  ug1FloorCol.name = 'Col_UG1LandingFloor';
  ug1FloorCol.position.set(0, -6.1, -3.5);
  root.add(ug1FloorCol);

  // 6. Wall Colliders to prevent walking through walls or falling into the void
  // East wall (keeps player inside Flight 1 and middle landing)
  const eastWallCol = new Mesh(new BoxGeometry(0.3, 8.0, 8.6), colliderMat);
  eastWallCol.name = 'Col_EastWall';
  eastWallCol.position.set(2.25, -2.5, (START_Z + LANDING_END_Z) / 2);
  root.add(eastWallCol);

  // West wall upper (keeps player on middle landing)
  const westWallMidCol = new Mesh(new BoxGeometry(0.3, 5.0, 3.2), colliderMat);
  westWallMidCol.name = 'Col_WestWallMid';
  westWallMidCol.position.set(-2.25, -1.0, (END_Z + LANDING_END_Z) / 2);
  root.add(westWallMidCol);

  // West wall lower (keeps player on Flight 2)
  const westWallFlight2Col = new Mesh(new BoxGeometry(0.3, 5.0, FLIGHT_STEPS * STEP_DEPTH), colliderMat);
  westWallFlight2Col.name = 'Col_WestWallFlight2';
  westWallFlight2Col.position.set(-2.25, -4.0, (START_Z + END_Z) / 2);
  root.add(westWallFlight2Col);

  // North wall of middle landing
  const northWallCol = new Mesh(new BoxGeometry(4.8, 4.0, 0.3), colliderMat);
  northWallCol.name = 'Col_NorthWall';
  northWallCol.position.set(0, -1.1, LANDING_END_Z - 0.15);
  root.add(northWallCol);

  // Central divider wall (separates Flight 1 and Flight 2)
  const centerDividerCol = new Mesh(new BoxGeometry(0.3, 8.0, FLIGHT_STEPS * STEP_DEPTH), colliderMat);
  centerDividerCol.name = 'Col_CenterDivider';
  centerDividerCol.position.set(0, -3.0, (START_Z + END_Z) / 2);
  root.add(centerDividerCol);

  // UG1 Enclosing Wall Colliders (10m x 10m room)
  // South Wall at z = 1.65
  const ug1SouthWallCol = new Mesh(new BoxGeometry(10.6, 5.0, 0.3), colliderMat);
  ug1SouthWallCol.name = 'Col_UG1SouthWall';
  ug1SouthWallCol.position.set(0, -3.75, 1.65);
  root.add(ug1SouthWallCol);

  // West Wall at x = -5.15
  const ug1WestWallCol = new Mesh(new BoxGeometry(0.3, 5.0, 10.6), colliderMat);
  ug1WestWallCol.name = 'Col_UG1WestWall';
  ug1WestWallCol.position.set(-5.15, -3.75, -3.5);
  root.add(ug1WestWallCol);

  // East Wall at x = 5.15
  const ug1EastWallCol = new Mesh(new BoxGeometry(0.3, 5.0, 10.6), colliderMat);
  ug1EastWallCol.name = 'Col_UG1EastWall';
  ug1EastWallCol.position.set(5.15, -3.75, -3.5);
  root.add(ug1EastWallCol);

  // North Wall East segment at z = -8.65
  const ug1NorthEastCol = new Mesh(new BoxGeometry(5.0, 5.0, 0.3), colliderMat);
  ug1NorthEastCol.name = 'Col_UG1NorthEast';
  ug1NorthEastCol.position.set(2.5, -3.75, -8.65);
  root.add(ug1NorthEastCol);

  // North Wall West segment at z = -8.65
  const ug1NorthWestCol = new Mesh(new BoxGeometry(2.8, 5.0, 0.3), colliderMat);
  ug1NorthWestCol.name = 'Col_UG1NorthWest';
  ug1NorthWestCol.position.set(-3.6, -3.75, -8.65);
  root.add(ug1NorthWestCol);

  return root;
}

/**
 * Creates the visual geometry: visible 36 steps with yellow safety nosing stripes,
 * dual handrails, subway tile walls, ceiling lights, and illuminated "UG1 - Concourse" sign.
 */
export function createStairwellVisual(): Group {
  const root = new Group();
  root.name = 'StairwellVisual';

  // Materials
  const treadMat = new MeshStandardMaterial({
    color: '#1e293b',
    roughness: 0.8,
  });

  const stripeMat = new MeshStandardMaterial({
    color: '#facc15',
    emissive: '#facc15',
    emissiveIntensity: 0.35,
    roughness: 0.5,
  });

  const wallMat = new MeshStandardMaterial({
    color: '#e2e8f0',
    roughness: 0.65,
  });

  const baseboardMat = new MeshStandardMaterial({
    color: '#334155',
    roughness: 0.7,
  });

  const ceilingMat = new MeshStandardMaterial({
    color: '#94a3b8',
    roughness: 0.85,
  });

  const landingFloorMat = new MeshStandardMaterial({
    color: '#475569',
    roughness: 0.85,
  });

  const handrailMat = new MeshStandardMaterial({
    color: '#f8fafc',
    metalness: 0.9,
    roughness: 0.2,
  });

  const lightFixtureMat = new MeshStandardMaterial({
    color: '#ffffff',
    emissive: '#fef08a',
    emissiveIntensity: 2.0,
    roughness: 0.2,
  });

  // 1. Top Landing Floor Slab
  const topLanding = new Mesh(new BoxGeometry(4.4, 0.3, 1.2), landingFloorMat);
  topLanding.position.set(0, -0.15, -8.0);
  topLanding.receiveShadow = true;
  root.add(topLanding);

  // 2. Flight 1 Steps (18 visible steps, drop 3m from y = 0 to y = -3.0)
  for (let i = 0; i < FLIGHT_STEPS; i++) {
    const stepZ = START_Z - (i + 0.5) * STEP_DEPTH;
    const stepY = -STEP_HEIGHT * (i + 1) + STEP_HEIGHT / 2;

    const tread = new Mesh(new BoxGeometry(STEP_WIDTH, STEP_HEIGHT, STEP_DEPTH), treadMat);
    tread.position.set(1.15, stepY, stepZ);
    tread.castShadow = true;
    tread.receiveShadow = true;
    root.add(tread);

    // Yellow safety nosing stripe on front edge
    const stripe = new Mesh(new BoxGeometry(STEP_WIDTH, 0.02, 0.05), stripeMat);
    stripe.position.set(1.15, stepY + STEP_HEIGHT / 2 + 0.01, stepZ + STEP_DEPTH / 2 - 0.025);
    root.add(stripe);
  }

  // Flight 1 Handrails (right wall & center divider)
  const rail1Right = new Mesh(new CylinderGeometry(0.03, 0.03, FLIGHT_LENGTH, 8), handrailMat);
  rail1Right.position.set(2.05, -0.6, (START_Z + END_Z) / 2);
  rail1Right.rotation.x = Math.PI / 2 - FLIGHT_ANGLE;
  root.add(rail1Right);

  const rail1Center = new Mesh(new CylinderGeometry(0.03, 0.03, FLIGHT_LENGTH, 8), handrailMat);
  rail1Center.position.set(0.25, -0.6, (START_Z + END_Z) / 2);
  rail1Center.rotation.x = Math.PI / 2 - FLIGHT_ANGLE;
  root.add(rail1Center);

  // 3. Middle Landing (y = -3.0, z = -13.9 to -16.7)
  const midLanding = new Mesh(new BoxGeometry(4.4, 0.4, 2.8), landingFloorMat);
  midLanding.name = 'MiddleLanding';
  midLanding.position.set(0, -3.2, (END_Z + LANDING_END_Z) / 2);
  midLanding.receiveShadow = true;
  root.add(midLanding);

  // Handrail along north wall of middle landing
  const midRailNorth = new Mesh(new CylinderGeometry(0.03, 0.03, 4.2, 8), handrailMat);
  midRailNorth.rotation.z = Math.PI / 2;
  midRailNorth.position.set(0, -2.1, LANDING_END_Z + 0.1);
  root.add(midRailNorth);

  // 4. Flight 2 Steps (18 visible steps, drop 3m from y = -3.0 to y = -6.0)
  for (let j = 0; j < FLIGHT_STEPS; j++) {
    const stepZ2 = END_Z + (j + 0.5) * STEP_DEPTH;
    const stepY2 = -3.0 - STEP_HEIGHT * (j + 1) + STEP_HEIGHT / 2;

    const tread2 = new Mesh(new BoxGeometry(STEP_WIDTH, STEP_HEIGHT, STEP_DEPTH), treadMat);
    tread2.position.set(-1.15, stepY2, stepZ2);
    tread2.castShadow = true;
    tread2.receiveShadow = true;
    root.add(tread2);

    const stripe2 = new Mesh(new BoxGeometry(STEP_WIDTH, 0.02, 0.05), stripeMat);
    stripe2.position.set(-1.15, stepY2 + STEP_HEIGHT / 2 + 0.01, stepZ2 - STEP_DEPTH / 2 + 0.025);
    root.add(stripe2);
  }

  // Flight 2 Handrails (left wall & center divider)
  const rail2Left = new Mesh(new CylinderGeometry(0.03, 0.03, FLIGHT_LENGTH, 8), handrailMat);
  rail2Left.position.set(-2.05, -3.6, (START_Z + END_Z) / 2);
  rail2Left.rotation.x = Math.PI / 2 + FLIGHT_ANGLE;
  root.add(rail2Left);

  const rail2Center = new Mesh(new CylinderGeometry(0.03, 0.03, FLIGHT_LENGTH, 8), handrailMat);
  rail2Center.position.set(-0.25, -3.6, (START_Z + END_Z) / 2);
  rail2Center.rotation.x = Math.PI / 2 + FLIGHT_ANGLE;
  root.add(rail2Center);

  // 5. Walls & Central Divider
  const centerDivider = new Mesh(new BoxGeometry(0.3, 7.5, FLIGHT_STEPS * STEP_DEPTH), wallMat);
  centerDivider.position.set(0, -2.5, (START_Z + END_Z) / 2);
  centerDivider.castShadow = true;
  root.add(centerDivider);

  // East Wall
  const eastWall = new Mesh(new BoxGeometry(0.3, 7.5, 8.4), wallMat);
  eastWall.position.set(2.25, -2.5, (START_Z + LANDING_END_Z) / 2);
  eastWall.receiveShadow = true;
  root.add(eastWall);

  const eastBaseboard = new Mesh(new BoxGeometry(0.32, 0.3, 8.4), baseboardMat);
  eastBaseboard.position.set(2.25, -3.0, (START_Z + LANDING_END_Z) / 2);
  root.add(eastBaseboard);

  // West Wall (upper section covering mid landing)
  const westWallUpper = new Mesh(new BoxGeometry(0.3, 4.5, 3.2), wallMat);
  westWallUpper.position.set(-2.25, -1.0, (END_Z + LANDING_END_Z) / 2);
  westWallUpper.receiveShadow = true;
  root.add(westWallUpper);

  // North Wall of Middle Landing (from y = -3.0 up to y = 0.8)
  const northWall = new Mesh(new BoxGeometry(4.8, 3.8, 0.3), wallMat);
  northWall.position.set(0, -1.1, LANDING_END_Z - 0.15);
  northWall.receiveShadow = true;
  root.add(northWall);

  // Ceiling over Flight 1 (with generous headroom)
  const ceiling1 = new Mesh(new BoxGeometry(STEP_WIDTH + 0.4, 0.2, FLIGHT_LENGTH), ceilingMat);
  ceiling1.position.set(1.15, 2.2, (START_Z + END_Z) / 2);
  ceiling1.rotation.x = -FLIGHT_ANGLE;
  root.add(ceiling1);

  const ceilingLight1 = new Mesh(new BoxGeometry(0.3, 0.08, 4.0), lightFixtureMat);
  ceilingLight1.position.set(1.15, 2.12, (START_Z + END_Z) / 2);
  ceilingLight1.rotation.x = -FLIGHT_ANGLE;
  root.add(ceilingLight1);

  // Ceiling over Middle Landing
  const midCeiling = new Mesh(new BoxGeometry(4.8, 0.2, 3.2), ceilingMat);
  midCeiling.position.set(0, 0.8, (END_Z + LANDING_END_Z) / 2);
  root.add(midCeiling);

  const midLight = new Mesh(new BoxGeometry(2.0, 0.1, 0.4), lightFixtureMat);
  midLight.position.set(0, 0.7, (END_Z + LANDING_END_Z) / 2);
  root.add(midLight);

  // Ceiling over Flight 2
  const ceiling2 = new Mesh(new BoxGeometry(STEP_WIDTH + 0.4, 0.2, FLIGHT_LENGTH), ceilingMat);
  ceiling2.position.set(-1.15, -0.8, (START_Z + END_Z) / 2);
  ceiling2.rotation.x = FLIGHT_ANGLE;
  root.add(ceiling2);

  const ceilingLight2 = new Mesh(new BoxGeometry(0.3, 0.08, 4.0), lightFixtureMat);
  ceilingLight2.position.set(-1.15, -0.88, (START_Z + END_Z) / 2);
  ceilingLight2.rotation.x = FLIGHT_ANGLE;
  root.add(ceilingLight2);

  // 6. Plain UG1 Landing Floor & Hall at y = -6.0 m (10 m x 10 m in front of Flight 2 exit)
  const ug1FloorMat = new MeshStandardMaterial({
    color: '#cbd5e1',
    roughness: 0.7,
  });

  const ug1LandingFloor = new Mesh(new BoxGeometry(10, 0.4, 10), ug1FloorMat);
  ug1LandingFloor.name = 'UG1_Landing_Floor';
  ug1LandingFloor.position.set(0, -6.2, -3.5);
  ug1LandingFloor.receiveShadow = true;
  root.add(ug1LandingFloor);

  // Accent border tiles
  const ug1BorderMat = new MeshStandardMaterial({ color: '#334155', roughness: 0.8 });
  const ug1BorderNorth = new Mesh(new BoxGeometry(10, 0.02, 0.4), ug1BorderMat);
  ug1BorderNorth.position.set(0, -5.99, -8.3);
  root.add(ug1BorderNorth);

  const ug1BorderSouth = new Mesh(new BoxGeometry(10, 0.02, 0.4), ug1BorderMat);
  ug1BorderSouth.position.set(0, -5.99, 1.3);
  root.add(ug1BorderSouth);

  // UG1 Enclosing Walls (Height 4.5m: y = -6.0 to -1.5)
  const ug1WallMat = new MeshStandardMaterial({
    color: '#f1f5f9',
    roughness: 0.65,
  });

  // West Wall at x = -5.0
  const ug1WestWall = new Mesh(new BoxGeometry(0.3, 4.5, 10.6), ug1WallMat);
  ug1WestWall.position.set(-5.15, -3.75, -3.5);
  ug1WestWall.receiveShadow = true;
  root.add(ug1WestWall);

  // East Wall at x = +5.0
  const ug1EastWall = new Mesh(new BoxGeometry(0.3, 4.5, 10.6), ug1WallMat);
  ug1EastWall.position.set(5.15, -3.75, -3.5);
  ug1EastWall.receiveShadow = true;
  root.add(ug1EastWall);

  // South Wall at z = +1.5 (facing North towards incoming player)
  const ug1SouthWall = new Mesh(new BoxGeometry(10.6, 4.5, 0.3), ug1WallMat);
  ug1SouthWall.position.set(0, -3.75, 1.65);
  ug1SouthWall.receiveShadow = true;
  root.add(ug1SouthWall);

  // North Wall segments at z = -8.5 (framing the stairs exit)
  const ug1NorthWallEast = new Mesh(new BoxGeometry(5.0, 4.5, 0.3), ug1WallMat);
  ug1NorthWallEast.position.set(2.5, -3.75, -8.65);
  ug1NorthWallEast.receiveShadow = true;
  root.add(ug1NorthWallEast);

  const ug1NorthWallWest = new Mesh(new BoxGeometry(2.8, 4.5, 0.3), ug1WallMat);
  ug1NorthWallWest.position.set(-3.6, -3.75, -8.65);
  ug1NorthWallWest.receiveShadow = true;
  root.add(ug1NorthWallWest);

  // Lintel above Flight 2 portal (height 1.2m, leaves 3.3m clear headroom)
  const ug1NorthLintel = new Mesh(new BoxGeometry(2.2, 1.2, 0.3), ug1WallMat);
  ug1NorthLintel.position.set(-1.15, -2.1, -8.65);
  root.add(ug1NorthLintel);

  // UG1 Ceiling at y = -1.5 m
  const ug1Ceiling = new Mesh(new BoxGeometry(10.6, 0.2, 10.6), ceilingMat);
  ug1Ceiling.position.set(0, -1.4, -3.5);
  root.add(ug1Ceiling);

  // Recessed LED troffer light fixtures in UG1 ceiling
  const ug1LightPositions: [number, number, number][] = [
    [-2.5, -1.48, -1.5],
    [2.5, -1.48, -1.5],
    [-2.5, -1.48, -5.5],
    [2.5, -1.48, -5.5],
  ];
  for (const lpos of ug1LightPositions) {
    const troffer = new Mesh(new BoxGeometry(1.4, 0.05, 1.4), lightFixtureMat);
    troffer.position.set(...lpos);
    root.add(troffer);
  }

  // 7. Prominent Illuminated Sign: "UG1 - Concourse"
  // Mounted on the south wall at z = +1.45, facing North directly towards the player arriving down Flight 2!
  const ug1SignGroup = new Group();
  ug1SignGroup.position.set(0, -3.8, 1.45);

  const signBacking = new Mesh(
    new BoxGeometry(5.6, 1.2, 0.1),
    new MeshStandardMaterial({ color: '#090d16', metalness: 0.8, roughness: 0.3 }),
  );
  ug1SignGroup.add(signBacking);

  const concourseSignTex = createConcourseSignTexture(1024, 256);
  const signFace = new Mesh(
    new PlaneGeometry(5.4, 1.05),
    new MeshStandardMaterial({
      map: concourseSignTex,
      emissive: '#ffffff',
      emissiveMap: concourseSignTex,
      emissiveIntensity: 1.2,
      roughness: 0.2,
    }),
  );
  signFace.position.set(0, 0, -0.06);
  signFace.rotation.y = Math.PI;
  ug1SignGroup.add(signFace);

  root.add(ug1SignGroup);

  // 8. Illuminated Directional Sign: "▲ STREET EXIT"
  // Mounted on the north wall lintel above the stairs opening, facing South into UG1
  const exitSignGroup = new Group();
  exitSignGroup.position.set(-1.15, -2.1, -8.45);

  const exitBacking = new Mesh(
    new BoxGeometry(2.2, 0.6, 0.08),
    new MeshStandardMaterial({ color: '#022c22', metalness: 0.7, roughness: 0.4 }),
  );
  exitSignGroup.add(exitBacking);

  const exitTex = createExitSignTexture(512, 128);
  const exitFace = new Mesh(
    new PlaneGeometry(2.1, 0.52),
    new MeshStandardMaterial({
      map: exitTex,
      emissive: '#ffffff',
      emissiveMap: exitTex,
      emissiveIntensity: 1.2,
      roughness: 0.2,
    }),
  );
  exitFace.position.set(0, 0, 0.05);
  exitSignGroup.add(exitFace);

  root.add(exitSignGroup);

  return root;
}
