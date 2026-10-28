import {
  BoxGeometry,
  CanvasTexture,
  CylinderGeometry,
  DodecahedronGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  SRGBColorSpace,
} from 'three';

/**
 * Creates procedural text texture for signs and banners.
 */
function createSignTexture(
  text: string,
  subtext = '',
  bgColor = '#0f172a',
  textColor = '#38bdf8',
  width = 512,
  height = 128,
): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = textColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, width - 8, height - 8);

    ctx.fillStyle = textColor;
    ctx.font = 'bold 36px "Segoe UI", Inter, Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = subtext ? 'middle' : 'middle';

    const textY = subtext ? height * 0.4 : height * 0.5;
    ctx.fillText(text, width / 2, textY);

    if (subtext) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '18px "Segoe UI", Inter, Roboto, sans-serif';
      ctx.fillText(subtext, width / 2, height * 0.75);
    }
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/**
 * Creates a stylized low-poly urban building matching Image 2.
 */
function createCityBuilding(
  width: number,
  height: number,
  depth: number,
  baseColor: string,
  windowRows: number,
  windowCols: number,
): Group {
  const building = new Group();

  // Main body
  const bodyMat = new MeshStandardMaterial({
    color: baseColor,
    roughness: 0.85,
    metalness: 0.1,
  });
  const bodyGeo = new BoxGeometry(width, height, depth);
  const bodyMesh = new Mesh(bodyGeo, bodyMat);
  bodyMesh.position.y = height / 2;
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  building.add(bodyMesh);

  // Roof cornice ledge
  const ledgeMat = new MeshStandardMaterial({
    color: '#334155',
    roughness: 0.9,
  });
  const ledgeMesh = new Mesh(
    new BoxGeometry(width + 0.4, 0.4, depth + 0.4),
    ledgeMat,
  );
  ledgeMesh.position.y = height + 0.2;
  ledgeMesh.castShadow = true;
  building.add(ledgeMesh);

  // Rooftop equipment (AC chillers / elevator penthouse)
  const acBox = new Mesh(
    new BoxGeometry(width * 0.35, 1.4, depth * 0.35),
    ledgeMat,
  );
  acBox.position.set(width * 0.15, height + 0.9, -depth * 0.1);
  acBox.castShadow = true;
  building.add(acBox);

  // Rooftop water tank on selected buildings
  if (width >= 8) {
    const tankLegsMat = new MeshStandardMaterial({ color: '#475569', metalness: 0.6 });
    const tankLegs = new Mesh(new BoxGeometry(1.6, 1.2, 1.6), tankLegsMat);
    tankLegs.position.set(-width * 0.2, height + 0.8, depth * 0.15);
    building.add(tankLegs);

    const tankMat = new MeshStandardMaterial({ color: '#854d0e', roughness: 0.7 });
    const tankCyl = new Mesh(new CylinderGeometry(0.8, 0.8, 1.4, 12), tankMat);
    tankCyl.position.set(-width * 0.2, height + 2.0, depth * 0.15);
    tankCyl.castShadow = true;
    building.add(tankCyl);
  }

  // Windows grid on front facade
  const windowLitMat = new MeshStandardMaterial({
    color: '#fef08a',
    emissive: '#fef08a',
    emissiveIntensity: 0.8,
    roughness: 0.2,
  });
  const windowDarkMat = new MeshStandardMaterial({
    color: '#1e293b',
    roughness: 0.3,
    metalness: 0.4,
  });

  const winW = 1.0;
  const winH = 1.4;
  const spacingX = width / (windowCols + 1);
  const spacingY = (height - 3) / windowRows;

  for (let r = 0; r < windowRows; r++) {
    for (let c = 0; c < windowCols; c++) {
      const isLit = (r + c * 3) % 4 === 1;
      const winMesh = new Mesh(
        new BoxGeometry(winW, winH, 0.1),
        isLit ? windowLitMat : windowDarkMat,
      );
      const posX = -width / 2 + spacingX * (c + 1);
      const posY = 3.0 + spacingY * r;
      const posZ = depth / 2 + 0.05;
      winMesh.position.set(posX, posY, posZ);
      building.add(winMesh);
    }
  }

  return building;
}

/**
 * Creates a low-poly tree in a square planter matching Image 2.
 */
function createPlanterTree(): Group {
  const treeGroup = new Group();

  const planterMat = new MeshStandardMaterial({
    color: '#94a3b8',
    roughness: 0.9,
  });
  const planter = new Mesh(new BoxGeometry(1.4, 0.4, 1.4), planterMat);
  planter.position.y = 0.2;
  planter.castShadow = true;
  planter.receiveShadow = true;
  treeGroup.add(planter);

  const soilMat = new MeshStandardMaterial({ color: '#3f2e21', roughness: 1.0 });
  const soil = new Mesh(new BoxGeometry(1.2, 0.05, 1.2), soilMat);
  soil.position.y = 0.4;
  treeGroup.add(soil);

  const trunkMat = new MeshStandardMaterial({ color: '#78350f', roughness: 0.9 });
  const trunk = new Mesh(new CylinderGeometry(0.12, 0.18, 1.8, 6), trunkMat);
  trunk.position.y = 1.2;
  trunk.castShadow = true;
  treeGroup.add(trunk);

  const foliageMat1 = new MeshStandardMaterial({
    color: '#15803d',
    roughness: 0.8,
    flatShading: true,
  });
  const foliageMat2 = new MeshStandardMaterial({
    color: '#22c55e',
    roughness: 0.8,
    flatShading: true,
  });

  const crown1 = new Mesh(new DodecahedronGeometry(0.9, 0), foliageMat1);
  crown1.position.set(0, 2.4, 0);
  crown1.castShadow = true;
  treeGroup.add(crown1);

  const crown2 = new Mesh(new DodecahedronGeometry(0.7, 0), foliageMat2);
  crown2.position.set(0.3, 3.0, 0.1);
  crown2.castShadow = true;
  treeGroup.add(crown2);

  const crown3 = new Mesh(new DodecahedronGeometry(0.65, 0), foliageMat1);
  crown3.position.set(-0.3, 2.8, -0.2);
  crown3.castShadow = true;
  treeGroup.add(crown3);

  return treeGroup;
}

/**
 * Creates a modern street lamp post with warm evening emissive glow.
 */
function createStreetLamp(): Group {
  const lamp = new Group();

  const metalMat = new MeshStandardMaterial({
    color: '#1e293b',
    roughness: 0.6,
    metalness: 0.8,
  });

  const base = new Mesh(new CylinderGeometry(0.2, 0.25, 0.4, 8), metalMat);
  base.position.y = 0.2;
  lamp.add(base);

  const pole = new Mesh(new CylinderGeometry(0.06, 0.08, 3.6, 8), metalMat);
  pole.position.y = 2.0;
  pole.castShadow = true;
  lamp.add(pole);

  const arm = new Mesh(new BoxGeometry(0.7, 0.08, 0.08), metalMat);
  arm.position.set(0.3, 3.75, 0);
  lamp.add(arm);

  const fixtureMat = new MeshStandardMaterial({
    color: '#ffedd5',
    emissive: '#fde047',
    emissiveIntensity: 2.2,
    roughness: 0.2,
  });
  const fixture = new Mesh(new BoxGeometry(0.4, 0.12, 0.2), fixtureMat);
  fixture.position.set(0.55, 3.65, 0);
  lamp.add(fixture);

  return lamp;
}

/**
 * Creates a modern park bench with wood slats and metal frame.
 */
function createParkBench(): Group {
  const bench = new Group();

  const legMat = new MeshStandardMaterial({
    color: '#0f172a',
    metalness: 0.8,
    roughness: 0.4,
  });
  const woodMat = new MeshStandardMaterial({
    color: '#b45309',
    roughness: 0.7,
  });

  const leg1 = new Mesh(new BoxGeometry(0.08, 0.45, 0.6), legMat);
  leg1.position.set(-0.7, 0.225, 0);
  bench.add(leg1);

  const leg2 = new Mesh(new BoxGeometry(0.08, 0.45, 0.6), legMat);
  leg2.position.set(0.7, 0.225, 0);
  bench.add(leg2);

  for (let i = 0; i < 3; i++) {
    const slat = new Mesh(new BoxGeometry(1.6, 0.04, 0.14), woodMat);
    slat.position.set(0, 0.45, -0.18 + i * 0.18);
    slat.castShadow = true;
    bench.add(slat);
  }

  for (let j = 0; j < 2; j++) {
    const backSlat = new Mesh(new BoxGeometry(1.6, 0.12, 0.04), woodMat);
    backSlat.position.set(0, 0.65 + j * 0.16, -0.26);
    backSlat.castShadow = true;
    bench.add(backSlat);
  }

  return bench;
}

/**
 * Build the 30 m x 30 m street plaza with an open shaft for the station entrance stairwell.
 */
export function createStreetPlaza(): Group {
  const root = new Group();
  root.name = 'StreetPlaza';

  const plazaFloorMat = new MeshStandardMaterial({
    color: '#64748b',
    roughness: 0.88,
    metalness: 0.05,
  });

  // 1. South Main Plaza slab (between entrance opening z = -6.5 and road curb z = +11.8)
  const southPlaza = new Mesh(
    new BoxGeometry(30, 0.4, 18.3),
    plazaFloorMat,
  );
  southPlaza.position.set(0, -0.2, 2.65);
  southPlaza.receiveShadow = true;
  root.add(southPlaza);

  // 2. West Plaza slab (flanking stairwell cutout: x = -15 to -2.8, z = -17.5 to -6.5)
  const westPlaza = new Mesh(
    new BoxGeometry(12.2, 0.4, 11.0),
    plazaFloorMat,
  );
  westPlaza.position.set(-8.9, -0.2, -12.0);
  westPlaza.receiveShadow = true;
  root.add(westPlaza);

  // 3. East Plaza slab (flanking stairwell cutout: x = +2.8 to +15, z = -17.5 to -6.5)
  const eastPlaza = new Mesh(
    new BoxGeometry(12.2, 0.4, 11.0),
    plazaFloorMat,
  );
  eastPlaza.position.set(8.9, -0.2, -12.0);
  eastPlaza.receiveShadow = true;
  root.add(eastPlaza);

  // 4. North Plaza slab (behind stairwell cutout: z = -20 to -17.5)
  const northPlaza = new Mesh(
    new BoxGeometry(30, 0.4, 2.5),
    plazaFloorMat,
  );
  northPlaza.position.set(0, -0.2, -18.75);
  northPlaza.receiveShadow = true;
  root.add(northPlaza);

  // Central walkway paver strip leading up to entrance (z = -6.5 to +11.8)
  const corridorMat = new MeshStandardMaterial({
    color: '#94a3b8',
    roughness: 0.8,
  });
  const corridorFloor = new Mesh(
    new BoxGeometry(6, 0.02, 18.3),
    corridorMat,
  );
  corridorFloor.position.set(0, 0.01, 2.65);
  corridorFloor.receiveShadow = true;
  root.add(corridorFloor);

  // 5. Asphalt roadway along south boundary (z = 12.0 to 17.0)
  const roadMat = new MeshStandardMaterial({
    color: '#1e293b',
    roughness: 0.95,
  });
  const road = new Mesh(new BoxGeometry(30, 0.03, 5), roadMat);
  road.position.set(0, 0.02, 14.5);
  road.receiveShadow = true;
  root.add(road);

  // Sidewalk curb
  const curbMat = new MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.7 });
  const curb = new Mesh(new BoxGeometry(30, 0.16, 0.35), curbMat);
  curb.position.set(0, 0.08, 11.8);
  curb.castShadow = true;
  root.add(curb);

  // Yellow dashed road center lines
  const roadStripeMat = new MeshBasicMaterial({ color: '#eab308' });
  for (let s = -12; s <= 12; s += 4) {
    const stripe = new Mesh(new PlaneGeometry(2.0, 0.2), roadStripeMat);
    stripe.rotation.x = -Math.PI / 2;
    stripe.position.set(s, 0.04, 14.5);
    root.add(stripe);
  }

  // 6. Perimeter retaining walls
  const wallMat = new MeshStandardMaterial({ color: '#475569', roughness: 0.85 });
  const westWall = new Mesh(new BoxGeometry(0.5, 0.8, 26), wallMat);
  westWall.position.set(-14.8, 0.4, 0);
  root.add(westWall);

  const eastWall = new Mesh(new BoxGeometry(0.5, 0.8, 26), wallMat);
  eastWall.position.set(14.8, 0.4, 0);
  root.add(eastWall);

  // 7. Surrounding City Buildings (matching Image 2)
  const bldg1 = createCityBuilding(9, 14, 12, '#991b1b', 4, 3);
  bldg1.position.set(-20, 0, -1);
  root.add(bldg1);

  const bldg2 = createCityBuilding(9, 16, 12, '#475569', 5, 3);
  bldg2.position.set(20, 0, -1);
  root.add(bldg2);

  const bldg3 = createCityBuilding(12, 18, 10, '#b45309', 5, 4);
  bldg3.position.set(-13, 0, -23);
  root.add(bldg3);

  const bldg4 = createCityBuilding(12, 15, 10, '#334155', 4, 4);
  bldg4.position.set(13, 0, -23);
  root.add(bldg4);

  // 8. Street Lamp Posts
  const lampPositions: [number, number, number][] = [
    [-4.5, 0, 4.5],
    [4.5, 0, 4.5],
    [-4.5, 0, -2.5],
    [4.5, 0, -2.5],
    [-9.0, 0, 8.5],
    [9.0, 0, 8.5],
  ];
  for (const pos of lampPositions) {
    const lamp = createStreetLamp();
    lamp.position.set(...pos);
    if (pos[0] > 0) {
      lamp.rotation.y = Math.PI;
    }
    root.add(lamp);
  }

  // 9. Park Benches
  const benchPositions: { pos: [number, number, number]; rotY: number }[] = [
    { pos: [-4.2, 0, 1.5], rotY: Math.PI / 2 },
    { pos: [4.2, 0, 1.5], rotY: -Math.PI / 2 },
    { pos: [-4.2, 0, -5.0], rotY: Math.PI / 2 },
    { pos: [4.2, 0, -5.0], rotY: -Math.PI / 2 },
  ];
  for (const b of benchPositions) {
    const bench = createParkBench();
    bench.position.set(...b.pos);
    bench.rotation.y = b.rotY;
    root.add(bench);
  }

  // 10. Low-Poly Trees in Planters
  const treePositions: [number, number, number][] = [
    [-3.8, 0, -4.0],
    [3.8, 0, -4.0],
    [-7.5, 0, 0.0],
    [7.5, 0, 0.0],
    [-7.5, 0, 6.5],
    [7.5, 0, 6.5],
    [-11.5, 0, -8.0],
    [11.5, 0, -8.0],
  ];
  for (const pos of treePositions) {
    const tree = createPlanterTree();
    tree.position.set(...pos);
    root.add(tree);
  }

  // 11. Plaza Information Totem
  const infoTotemMat = new MeshStandardMaterial({ color: '#0f172a', metalness: 0.7 });
  const infoTotem = new Mesh(new BoxGeometry(1.6, 2.4, 0.2), infoTotemMat);
  infoTotem.position.set(3.2, 1.2, 0.5);
  infoTotem.rotation.y = -Math.PI / 6;

  const infoTex = createSignTexture('PLAZA MAP', 'MAGLEV CENTRAL - STREET ENTRANCE', '#0369a1', '#ffffff', 512, 256);
  const infoFace = new Mesh(
    new PlaneGeometry(1.4, 1.8),
    new MeshBasicMaterial({ map: infoTex }),
  );
  infoFace.position.set(0, 0.1, 0.11);
  infoTotem.add(infoFace);
  root.add(infoTotem);

  return root;
}
