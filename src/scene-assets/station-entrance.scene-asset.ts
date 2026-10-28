import {
  BoxGeometry,
  CanvasTexture,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  TorusGeometry,
} from 'three';

/**
 * Creates high-contrast glowing canvas texture for "MAGLEV CENTRAL" entrance sign.
 */
function createStationSignTexture(text: string, width = 1024, height = 256): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Dark modern background with metallic border
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 8;
    ctx.strokeRect(8, 8, width - 16, height - 16);

    // Glowing cyan text
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 25;
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 68px "Segoe UI", Inter, Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height * 0.44);

    // Subtitle
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 30px "Segoe UI", Inter, Roboto, sans-serif';
    ctx.fillText('UNDERGROUND ENTRANCE  ▼  UG1 CONCOURSE', width / 2, height * 0.78);
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/**
 * Creates vertical totem pole texture matching Image 1 (yellow transit icon + vertical text).
 */
function createTotemTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 256, 1024);

    // Yellow transit icon block at top
    ctx.fillStyle = '#facc15';
    ctx.fillRect(16, 20, 224, 200);

    // Train icon silhouette
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(48, 50, 160, 140, 16);
    ctx.fill();

    // Train windshield
    ctx.fillStyle = '#facc15';
    ctx.fillRect(68, 70, 120, 45);
    // Train headlights
    ctx.beginPath();
    ctx.arc(85, 145, 12, 0, Math.PI * 2);
    ctx.arc(171, 145, 12, 0, Math.PI * 2);
    ctx.fill();

    // Vertical text "MAGLEV" and "CENTRAL"
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px "Segoe UI", Inter, Roboto, sans-serif';
    ctx.textAlign = 'center';

    const letters = ['M', 'A', 'G', 'L', 'E', 'V', '•', 'C', 'E', 'N', 'T', 'R', 'A', 'L'];
    const startY = 270;
    const spacing = 52;
    for (let i = 0; i < letters.length; i++) {
      ctx.fillText(letters[i], 128, startY + i * spacing);
    }
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/**
 * Build the Subway Station Entrance Canopy inspired by Image 1.
 */
export function createStationEntrance(): Group {
  const root = new Group();
  root.name = 'StationEntrance';

  // Base materials
  const steelMat = new MeshStandardMaterial({
    color: '#334155',
    roughness: 0.4,
    metalness: 0.85,
  });

  const glassMat = new MeshStandardMaterial({
    color: '#38bdf8',
    roughness: 0.1,
    metalness: 0.2,
    transparent: true,
    opacity: 0.45,
  });

  const concreteMat = new MeshStandardMaterial({
    color: '#94a3b8',
    roughness: 0.9,
  });

  const handrailMat = new MeshStandardMaterial({
    color: '#e2e8f0',
    roughness: 0.2,
    metalness: 0.9,
  });

  // 1. Entrance Steps (short gentle rise from y = 0 to y = 0.15 at z = -6.8)
  const step1 = new Mesh(new BoxGeometry(5.4, 0.08, 0.5), concreteMat);
  step1.position.set(0, 0.04, -6.1);
  step1.castShadow = true;
  step1.receiveShadow = true;
  root.add(step1);

  const step2 = new Mesh(new BoxGeometry(5.4, 0.08, 0.5), concreteMat);
  step2.position.set(0, 0.12, -6.5);
  step2.castShadow = true;
  step2.receiveShadow = true;
  root.add(step2);

  // Porch Platform (y = 0.15, from z = -6.7 to -8.5)
  const porch = new Mesh(new BoxGeometry(5.4, 0.2, 2.0), concreteMat);
  porch.position.set(0, 0.05, -7.6);
  porch.receiveShadow = true;
  root.add(porch);

  // Concrete side cheek-walls flanking entrance
  const cheekLeft = new Mesh(new BoxGeometry(0.5, 1.0, 2.8), concreteMat);
  cheekLeft.position.set(-2.65, 0.5, -7.3);
  cheekLeft.castShadow = true;
  root.add(cheekLeft);

  const cheekRight = new Mesh(new BoxGeometry(0.5, 1.0, 2.8), concreteMat);
  cheekRight.position.set(2.65, 0.5, -7.3);
  cheekRight.castShadow = true;
  root.add(cheekRight);

  // Handrails on cheek-walls
  const railLeft = new Mesh(new CylinderGeometry(0.04, 0.04, 2.6, 8), handrailMat);
  railLeft.rotation.x = Math.PI / 2;
  railLeft.position.set(-2.65, 1.1, -7.3);
  root.add(railLeft);

  const railRight = new Mesh(new CylinderGeometry(0.04, 0.04, 2.6, 8), handrailMat);
  railRight.rotation.x = Math.PI / 2;
  railRight.position.set(2.65, 1.1, -7.3);
  root.add(railRight);

  // 2. Curved Arched Canopy Structure
  const archZPositions = [-6.7, -7.3, -7.9, -8.5];
  const archRadius = 2.5;

  for (let i = 0; i < archZPositions.length; i++) {
    const zPos = archZPositions[i];
    // Main arch tube
    const arch = new Mesh(
      new TorusGeometry(archRadius, 0.07, 8, 24, Math.PI),
      steelMat,
    );
    arch.position.set(0, 1.0, zPos);
    arch.castShadow = true;
    root.add(arch);

    // Vertical support posts down to floor
    const postL = new Mesh(new CylinderGeometry(0.07, 0.07, 1.0, 8), steelMat);
    postL.position.set(-archRadius, 0.5, zPos);
    root.add(postL);

    const postR = new Mesh(new CylinderGeometry(0.07, 0.07, 1.0, 8), steelMat);
    postR.position.set(archRadius, 0.5, zPos);
    root.add(postR);
  }

  // Horizontal purlin beams
  const purlinAngles = [0.2, 0.6, 1.0, 1.57, 2.14, 2.54, 2.94];
  for (const angle of purlinAngles) {
    const px = Math.cos(angle) * archRadius;
    const py = 1.0 + Math.sin(angle) * archRadius;
    const purlin = new Mesh(new CylinderGeometry(0.035, 0.035, 2.0, 8), steelMat);
    purlin.rotation.x = Math.PI / 2;
    purlin.position.set(px, py, -7.6);
    root.add(purlin);
  }

  // Curved Glass Roof Shell over canopy
  const glassRoof = new Mesh(
    new CylinderGeometry(archRadius + 0.02, archRadius + 0.02, 2.0, 24, 1, true, 0, Math.PI),
    glassMat,
  );
  glassRoof.rotation.x = Math.PI / 2;
  glassRoof.rotation.z = Math.PI;
  glassRoof.position.set(0, 1.0, -7.6);
  root.add(glassRoof);

  // 3. Glowing Sign "MAGLEV CENTRAL"
  const headerMat = new MeshStandardMaterial({
    color: '#0f172a',
    roughness: 0.4,
    metalness: 0.7,
  });
  const headerBeam = new Mesh(new BoxGeometry(5.2, 0.65, 0.25), headerMat);
  headerBeam.position.set(0, 3.4, -6.65);
  root.add(headerBeam);

  const signTex = createStationSignTexture('MAGLEV CENTRAL', 1024, 256);
  const signFaceMat = new MeshStandardMaterial({
    map: signTex,
    emissive: '#00f0ff',
    emissiveIntensity: 0.85,
    roughness: 0.2,
  });
  const signMesh = new Mesh(new PlaneGeometry(5.0, 0.55), signFaceMat);
  signMesh.position.set(0, 3.4, -6.51);
  root.add(signMesh);

  // 4. Station Totem Pillar / Pylon (matching Image 1)
  const totemGroup = new Group();
  totemGroup.position.set(2.95, 0, -6.1);

  const totemBase = new Mesh(new BoxGeometry(0.5, 0.3, 0.5), steelMat);
  totemBase.position.y = 0.15;
  totemGroup.add(totemBase);

  const totemBody = new Mesh(new BoxGeometry(0.42, 3.8, 0.42), steelMat);
  totemBody.position.y = 2.05;
  totemBody.castShadow = true;
  totemGroup.add(totemBody);

  const totemTex = createTotemTexture();
  const totemFaceMat = new MeshStandardMaterial({
    map: totemTex,
    emissive: '#facc15',
    emissiveIntensity: 0.45,
    roughness: 0.3,
  });
  const totemFace = new Mesh(new PlaneGeometry(0.4, 3.7), totemFaceMat);
  totemFace.position.set(0, 2.05, 0.22);
  totemGroup.add(totemFace);

  root.add(totemGroup);

  return root;
}
