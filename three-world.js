// ============================================================================
// AURUM 3D WORLD & AURA VORTEX ENGINE
// Interactive Three.js Engine: Aura Portal, 360° Orbit, Zoom, Split-Rooms Architecture
// ============================================================================

import { MANSIONS } from './data.js';

let auraScene, auraCamera, auraRenderer, auraAnimationId;
let auraParticles, auraRings = [];

let mainScene, mainCamera, mainRenderer, mainControls;
let mansionCompoundGroup, mansionLevels = [];
let activeMansionId = 'villa-skyfall';
let isExploded = false;
let explodeFactor = 0;
let targetExplodeFactor = 0;
let isNightMode = false;
let isAutoRotating = true;
let isInitialized = false;

// Tier offsets when splitting rooms (Exploded View)
const LEVEL_OFFSETS = [
  { name: 'Private Marina & Automotive Vault', y: -16, x: 0, z: 12, label: 'Level 0: Marina & Vault' },
  { name: 'Wellness Spa & Heated Resort Pool', y: -4, x: -8, z: 0, label: 'Level 1: Spa & Resort Pool' },
  { name: 'Grand Salon & Michelin Culinary Wings', y: 8, x: 8, z: 0, label: 'Level 2: Grand Salon' },
  { name: 'Master Penthouse Sanctuary & Wraparound Deck', y: 20, x: 0, z: -8, label: 'Level 3: Master Penthouse' },
  { name: 'Sky Solarium & Private Helipad', y: 32, x: 0, z: 0, label: 'Level 4: Sky Solarium & Helipad' }
];

// ----------------------------------------------------------------------------
// 1. AURA FARMING HOLE / WORMHOLE WELCOME ANIMATION
// ----------------------------------------------------------------------------
export function initAuraPortal(onCompleteCallback) {
  const portalCanvas = document.getElementById('aura-portal-canvas');
  if (!portalCanvas) return;

  const width = window.innerWidth;
  const height = window.innerHeight;

  auraScene = new THREE.Scene();
  auraCamera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000);
  auraCamera.position.z = 180;

  auraRenderer = new THREE.WebGLRenderer({ canvas: portalCanvas, antialias: true, alpha: true });
  auraRenderer.setSize(width, height);
  auraRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Cosmic Nebula Particle Swarm
  const particleCount = 2800;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const goldColor = new THREE.Color(0xd4af37);
  const cyanColor = new THREE.Color(0x00f0ff);
  const deepBlue = new THREE.Color(0x0f172a);

  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 10 + Math.pow(Math.random(), 2) * 160;
    const depth = (Math.random() - 0.5) * 400;

    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = Math.sin(angle) * radius;
    positions[i * 3 + 2] = depth;

    const mixedColor = Math.random() > 0.5 ? goldColor : cyanColor;
    colors[i * 3] = mixedColor.r;
    colors[i * 3 + 1] = mixedColor.g;
    colors[i * 3 + 2] = mixedColor.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Particle Material
  const material = new THREE.PointsMaterial({
    size: 2.8,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending
  });

  auraParticles = new THREE.Points(geometry, material);
  auraScene.add(auraParticles);

  // Concentric Aura Energy Rings (Wormhole Tunnel)
  for (let r = 0; r < 14; r++) {
    const ringGeo = new THREE.TorusGeometry(18 + r * 9, 0.4 + (r % 2) * 0.4, 16, 80);
    const ringMat = new THREE.MeshBasicMaterial({
      color: r % 2 === 0 ? 0xd4af37 : 0x00f0ff,
      transparent: true,
      opacity: 0.45 - r * 0.025,
      wireframe: true
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.z = -r * 26;
    ringMesh.rotation.z = (r * Math.PI) / 8;
    auraScene.add(ringMesh);
    auraRings.push(ringMesh);
  }

  let startTime = performance.now();
  let hasWarped = false;

  function animateAura(time) {
    auraAnimationId = requestAnimationFrame(animateAura);

    const elapsed = (time - startTime) / 1000;

    // Rotate vortex particles
    auraParticles.rotation.z += 0.015;
    const positions = auraParticles.geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      let z = positions[i * 3 + 2];
      z += 2.8 + (elapsed * 2.5); // accelerating forward rush
      if (z > 200) z = -250;
      positions[i * 3 + 2] = z;
    }
    auraParticles.geometry.attributes.position.needsUpdate = true;

    // Pulse & twist rings
    auraRings.forEach((ring, idx) => {
      ring.rotation.z += (idx % 2 === 0 ? 0.01 : -0.015);
      ring.scale.x = 1 + Math.sin(elapsed * 4 + idx) * 0.06;
      ring.scale.y = 1 + Math.sin(elapsed * 4 + idx) * 0.06;
    });

    // Camera zooms into the center of the aura hole
    if (elapsed > 0.8 && !hasWarped) {
      auraCamera.position.z -= (elapsed - 0.8) * 85;
      if (auraCamera.position.z <= -60) {
        hasWarped = true;
        closeAuraPortal(onCompleteCallback);
      }
    }

    auraRenderer.render(auraScene, auraCamera);
  }

  requestAnimationFrame(animateAura);

  window.addEventListener('resize', () => {
    if (auraRenderer && auraCamera) {
      auraCamera.aspect = window.innerWidth / window.innerHeight;
      auraCamera.updateProjectionMatrix();
      auraRenderer.setSize(window.innerWidth, window.innerHeight);
    }
  });
}

export function closeAuraPortal(onCompleteCallback) {
  const portalOverlay = document.getElementById('aura-welcome-overlay');
  if (portalOverlay) {
    portalOverlay.classList.add('portal-warp-out');
    setTimeout(() => {
      portalOverlay.style.display = 'none';
      if (auraAnimationId) cancelAnimationFrame(auraAnimationId);
      if (onCompleteCallback) onCompleteCallback();
    }, 800);
  }
}

// ----------------------------------------------------------------------------
// 2. INTERACTIVE 3D MANSION VIEWER
// ----------------------------------------------------------------------------
export function init3DMansionViewer(containerId, mansionId = 'villa-skyfall') {
  activeMansionId = mansionId;
  const container = document.getElementById(containerId);
  if (!container) return;

  // Clear previous canvas if exists
  container.innerHTML = '';

  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || 650;

  // Scene & Camera
  mainScene = new THREE.Scene();
  mainScene.background = new THREE.Color(0x060913);
  mainScene.fog = new THREE.FogExp2(0x060913, 0.0045);

  mainCamera = new THREE.PerspectiveCamera(45, width / height, 1, 2000);
  mainCamera.position.set(70, 48, 85);

  // WebGL Renderer
  mainRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  mainRenderer.setSize(width, height);
  mainRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  mainRenderer.shadowMap.enabled = true;
  mainRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
  mainRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  mainRenderer.toneMappingExposure = 1.15;
  container.appendChild(mainRenderer.domElement);

  // Setup Lights
  setupLighting();

  // Ground & Reflective Water
  setupGroundAndWater();

  // Build Mansion Architecture
  buildMansionModel(activeMansionId);

  // Setup Manual Interaction (Orbit + Zoom + Pan)
  setupOrbitControls(container);

  // Start Render Loop
  if (!isInitialized) {
    animateMainViewer();
    isInitialized = true;
  }

  // Handle Resize
  window.addEventListener('resize', () => {
    if (mainRenderer && mainCamera && container) {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight || 650;
      mainCamera.aspect = newWidth / newHeight;
      mainCamera.updateProjectionMatrix();
      mainRenderer.setSize(newWidth, newHeight);
    }
  });

  updateMansionUIInfo(activeMansionId);
}

// Lighting System (Day / Night switchable)
let sunLight, ambientLight, blueFill, poolLight, windowLights = [];

function setupLighting() {
  ambientLight = new THREE.AmbientLight(0x223344, 1.2);
  mainScene.add(ambientLight);

  // Sunlight (Day)
  sunLight = new THREE.DirectionalLight(0xfff4d6, 2.4);
  sunLight.position.set(80, 110, 60);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 10;
  sunLight.shadow.camera.far = 300;
  const d = 60;
  sunLight.shadow.camera.left = -d;
  sunLight.shadow.camera.right = d;
  sunLight.shadow.camera.top = d;
  sunLight.shadow.camera.bottom = -d;
  mainScene.add(sunLight);

  // Cool Sky fill light
  blueFill = new THREE.DirectionalLight(0x38bdf8, 0.8);
  blueFill.position.set(-60, 50, -60);
  mainScene.add(blueFill);

  // Cyan underwater pool glow
  poolLight = new THREE.PointLight(0x00f0ff, 3.5, 55);
  poolLight.position.set(0, 2, 28);
  mainScene.add(poolLight);
}

// Reflective Water & Modern Landscape Podium
let waterMesh;
function setupGroundAndWater() {
  // Main Waterfront Lagoon
  const waterGeo = new THREE.PlaneGeometry(350, 350, 32, 32);
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x0b253a,
    roughness: 0.1,
    metalness: 0.85,
    transparent: true,
    opacity: 0.88
  });
  waterMesh = new THREE.Mesh(waterGeo, waterMat);
  waterMesh.rotation.x = -Math.PI / 2;
  waterMesh.position.y = -0.5;
  waterMesh.receiveShadow = true;
  mainScene.add(waterMesh);

  // Manicured Grass Estate Peninsula
  const groundGeo = new THREE.CylinderGeometry(52, 56, 3, 48);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x0f1d18,
    roughness: 0.85,
    metalness: 0.1
  });
  const groundMesh = new THREE.Mesh(groundGeo, groundMat);
  groundMesh.position.set(0, 0.5, 0);
  groundMesh.receiveShadow = true;
  mainScene.add(groundMesh);

  // Floating Stone Stepping Promenades & Terraces
  const terraceGeo = new THREE.BoxGeometry(70, 1.2, 54);
  const terraceMat = new THREE.MeshStandardMaterial({
    color: 0x1a2233,
    roughness: 0.35,
    metalness: 0.3
  });
  const terraceMesh = new THREE.Mesh(terraceGeo, terraceMat);
  terraceMesh.position.set(0, 2.1, 4);
  terraceMesh.receiveShadow = true;
  mainScene.add(terraceMesh);
}

// ----------------------------------------------------------------------------
// 3. ARCHITECTURAL 3D MANSION GENERATOR
// ----------------------------------------------------------------------------
export function buildMansionModel(mansionId) {
  if (mansionCompoundGroup) {
    mainScene.remove(mansionCompoundGroup);
  }

  mansionCompoundGroup = new THREE.Group();
  mansionLevels = [];
  windowLights = [];

  const mansionData = MANSIONS.find(m => m.id === mansionId) || MANSIONS[0];
  const goldTone = 0xd4af37;
  const darkGlass = 0x0c1322;
  const marbleWhite = 0x242d3d;
  const timberWarm = 0x3d271d;

  // Materials
  const concreteMat = new THREE.MeshStandardMaterial({ color: marbleWhite, roughness: 0.3, metalness: 0.2 });
  const goldAccentMat = new THREE.MeshStandardMaterial({ color: goldTone, roughness: 0.25, metalness: 0.9 });
  const darkWallMat = new THREE.MeshStandardMaterial({ color: 0x131926, roughness: 0.5, metalness: 0.3 });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x64748b,
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.85,
    transparent: true,
    opacity: 0.85,
    ior: 1.5
  });
  const waterPoolMat = new THREE.MeshStandardMaterial({
    color: 0x00e5ff,
    roughness: 0.1,
    metalness: 0.9,
    emissive: 0x004455,
    emissiveIntensity: 0.3
  });

  // ---------------------------------------------------------
  // LEVEL 0: Subterranean Marina, Dockage & Automotive Vault
  // ---------------------------------------------------------
  const level0 = new THREE.Group();
  level0.userData = { levelIndex: 0, ...LEVEL_OFFSETS[0] };

  // Vault Floor & Columns
  const vaultFloor = new THREE.Mesh(new THREE.BoxGeometry(64, 1.2, 48), darkWallMat);
  vaultFloor.position.set(0, 0, 0);
  vaultFloor.receiveShadow = true;
  level0.add(vaultFloor);

  // Automotive Exhibition Bays (8 Exotic Supercars representation)
  for (let c = 0; c < 4; c++) {
    const carBase = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.4, 7.5), goldAccentMat);
    carBase.position.set(-18 + c * 12, 1.2, -10);
    carBase.castShadow = true;
    level0.add(carBase);

    // Car glass cabin
    const carTop = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.1, 4.2), glassMat);
    carTop.position.set(-18 + c * 12, 2.2, -10);
    level0.add(carTop);
  }

  // Deepwater Yacht Dock Pier extending into water
  const pier = new THREE.Mesh(new THREE.BoxGeometry(10, 0.8, 38), concreteMat);
  pier.position.set(26, 0.2, 24);
  pier.castShadow = true;
  level0.add(pier);

  // Moored Luxury Mega-Yacht (48m representation)
  const yachtHull = new THREE.Mesh(new THREE.ConeGeometry(5.5, 26, 4), concreteMat);
  yachtHull.rotation.x = Math.PI / 2;
  yachtHull.rotation.y = Math.PI / 4;
  yachtHull.position.set(38, 0.4, 26);
  yachtHull.castShadow = true;
  level0.add(yachtHull);

  const yachtCabin = new THREE.Mesh(new THREE.BoxGeometry(5.2, 3.2, 14), goldAccentMat);
  yachtCabin.position.set(38, 2.4, 24);
  level0.add(yachtCabin);

  level0.position.set(0, 0, 0);
  mansionCompoundGroup.add(level0);
  mansionLevels.push(level0);

  // ---------------------------------------------------------
  // LEVEL 1: Wellness Spa, Teppanyaki Loggia & 95ft Infinity Pool
  // ---------------------------------------------------------
  const level1 = new THREE.Group();
  level1.userData = { levelIndex: 1, ...LEVEL_OFFSETS[1] };

  // Cantilevered Pool Deck
  const poolDeck = new THREE.Mesh(new THREE.BoxGeometry(66, 1.5, 48), concreteMat);
  poolDeck.position.set(0, 3.5, 0);
  poolDeck.receiveShadow = true;
  level1.add(poolDeck);

  // 95-ft Resort Infinity Pool
  const poolWater = new THREE.Mesh(new THREE.BoxGeometry(46, 0.6, 16), waterPoolMat);
  poolWater.position.set(0, 4.2, 14);
  level1.add(poolWater);

  // Glowing pool edge border in gold
  const poolRim = new THREE.Mesh(new THREE.BoxGeometry(48, 0.3, 18), goldAccentMat);
  poolRim.position.set(0, 4.0, 14);
  level1.add(poolRim);

  // Spa & Fitness Pavilion Walls
  const spaWing = new THREE.Mesh(new THREE.BoxGeometry(22, 7.5, 18), darkWallMat);
  spaWing.position.set(-18, 7.5, -8);
  spaWing.castShadow = true;
  level1.add(spaWing);

  // Teppanyaki Outdoor Kitchen Pavilion
  const teppanyakiRoof = new THREE.Mesh(new THREE.BoxGeometry(16, 0.8, 12), goldAccentMat);
  teppanyakiRoof.position.set(20, 8.5, -8);
  level1.add(teppanyakiRoof);

  for (let p = 0; p < 4; p++) {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 5), darkWallMat);
    pillar.position.set(14 + (p % 2) * 12, 6, -12 + Math.floor(p / 2) * 8);
    level1.add(pillar);
  }

  // Palms & Lush Foliage
  for (let f = 0; f < 6; f++) {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 8, 8), darkWallMat);
    trunk.position.set(-28 + f * 11, 7.5, 23);
    level1.add(trunk);

    const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(2.4), new THREE.MeshStandardMaterial({ color: 0x1b4332 }));
    foliage.position.set(-28 + f * 11, 11.5, 23);
    level1.add(foliage);
  }

  level1.position.set(0, 0, 0);
  mansionCompoundGroup.add(level1);
  mansionLevels.push(level1);

  // ---------------------------------------------------------
  // LEVEL 2: Grand Salon, Gourmet Culinary & Entertainment Gallery
  // ---------------------------------------------------------
  const level2 = new THREE.Group();
  level2.userData = { levelIndex: 2, ...LEVEL_OFFSETS[2] };

  // Double-height Living Salon Core
  const salonCore = new THREE.Mesh(new THREE.BoxGeometry(50, 9, 32), concreteMat);
  salonCore.position.set(0, 15.5, -4);
  salonCore.castShadow = true;
  salonCore.receiveShadow = true;
  level2.add(salonCore);

  // Floor-to-ceiling Panoramic Glass Facade
  const salonGlass = new THREE.Mesh(new THREE.BoxGeometry(46, 8, 0.4), glassMat);
  salonGlass.position.set(0, 15.5, 12);
  level2.add(salonGlass);

  // Golden Brise-Soleil / Vertical Louvers
  for (let l = 0; l < 12; l++) {
    const louver = new THREE.Mesh(new THREE.BoxGeometry(0.4, 8.5, 1.8), goldAccentMat);
    louver.position.set(-20 + l * 3.6, 15.5, 12.8);
    level2.add(louver);
  }

  // Interior warm chandelier lighting representation
  const chandelier = new THREE.PointLight(0xffdd99, 1.8, 30);
  chandelier.position.set(0, 17, 0);
  level2.add(chandelier);
  windowLights.push(chandelier);

  level2.position.set(0, 0, 0);
  mansionCompoundGroup.add(level2);
  mansionLevels.push(level2);

  // ---------------------------------------------------------
  // LEVEL 3: Master Penthouse Sanctuary & Cantilevered Balconies
  // ---------------------------------------------------------
  const level3 = new THREE.Group();
  level3.userData = { levelIndex: 3, ...LEVEL_OFFSETS[3] };

  // Asymmetric Master Suite Wing
  const masterWing = new THREE.Mesh(new THREE.BoxGeometry(36, 8, 26), darkWallMat);
  masterWing.position.set(-5, 24, -4);
  masterWing.castShadow = true;
  level3.add(masterWing);

  // Cantilevered Glass Balcony extending outward
  const balcony = new THREE.Mesh(new THREE.BoxGeometry(38, 0.8, 10), concreteMat);
  balcony.position.set(-5, 20.2, 12);
  level3.add(balcony);

  const glassRailing = new THREE.Mesh(new THREE.BoxGeometry(38, 2.5, 0.3), glassMat);
  glassRailing.position.set(-5, 21.6, 16.8);
  level3.add(glassRailing);

  // Warm bedroom interior glow
  const bedLight = new THREE.PointLight(0xffbe76, 1.6, 25);
  bedLight.position.set(-5, 25, 0);
  level3.add(bedLight);
  windowLights.push(bedLight);

  level3.position.set(0, 0, 0);
  mansionCompoundGroup.add(level3);
  mansionLevels.push(level3);

  // ---------------------------------------------------------
  // LEVEL 4: Sky Solarium, Heli-Pad & Observation Lounge
  // ---------------------------------------------------------
  const level4 = new THREE.Group();
  level4.userData = { levelIndex: 4, ...LEVEL_OFFSETS[4] };

  // Rooftop Sky Deck Platform
  const roofDeck = new THREE.Mesh(new THREE.BoxGeometry(26, 1, 22), concreteMat);
  roofDeck.position.set(8, 28.5, -4);
  roofDeck.castShadow = true;
  level4.add(roofDeck);

  // Helipad Circle & "H" Marking
  const heliPad = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 0.2, 32), darkWallMat);
  heliPad.position.set(8, 29.1, -4);
  level4.add(heliPad);

  const heliRing = new THREE.Mesh(new THREE.TorusGeometry(7.2, 0.25, 8, 32), goldAccentMat);
  heliRing.rotation.x = Math.PI / 2;
  heliRing.position.set(8, 29.25, -4);
  level4.add(heliRing);

  // Solar Canopy & Sky Bar
  const skyBarRoof = new THREE.Mesh(new THREE.BoxGeometry(10, 0.5, 8), goldAccentMat);
  skyBarRoof.position.set(16, 32.5, -4);
  level4.add(skyBarRoof);

  level4.position.set(0, 0, 0);
  mansionCompoundGroup.add(level4);
  mansionLevels.push(level4);

  mainScene.add(mansionCompoundGroup);
}

// ----------------------------------------------------------------------------
// 4. USER INTERACTION: ORBIT, ZOOM, SPLIT ROOMS
// ----------------------------------------------------------------------------
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let cameraRadius = 120;
let cameraTheta = Math.PI / 4;
let cameraPhi = Math.PI / 3.4;
let targetLookAt = new THREE.Vector3(0, 12, 0);

function setupOrbitControls(container) {
  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
    isAutoRotating = false;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;

    cameraTheta -= deltaX * 0.007;
    cameraPhi = Math.max(0.15, Math.min(Math.PI / 2 - 0.05, cameraPhi + deltaY * 0.007));

    previousMousePosition = { x: e.clientX, y: e.clientY };
    updateCameraPosition();
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Touch Support for Mobile
  let touchStartDist = 0;
  container.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      isAutoRotating = false;
    } else if (e.touches.length === 2) {
      touchStartDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  }, { passive: true });

  container.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1 && isDragging) {
      const deltaX = e.touches[0].clientX - previousMousePosition.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.y;

      cameraTheta -= deltaX * 0.008;
      cameraPhi = Math.max(0.15, Math.min(Math.PI / 2 - 0.05, cameraPhi + deltaY * 0.008));

      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      updateCameraPosition();
    } else if (e.touches.length === 2) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const diff = touchStartDist - currentDist;
      cameraRadius = Math.max(40, Math.min(220, cameraRadius + diff * 0.2));
      touchStartDist = currentDist;
      updateCameraPosition();
    }
  }, { passive: true });

  container.addEventListener('touchend', () => {
    isDragging = false;
  });

  // Mouse Wheel Zoom
  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    cameraRadius = Math.max(40, Math.min(240, cameraRadius + e.deltaY * 0.08));
    updateCameraPosition();
  }, { passive: false });

  updateCameraPosition();
}

function updateCameraPosition() {
  if (!mainCamera) return;
  mainCamera.position.x = targetLookAt.x + cameraRadius * Math.sin(cameraPhi) * Math.sin(cameraTheta);
  mainCamera.position.y = targetLookAt.y + cameraRadius * Math.cos(cameraPhi);
  mainCamera.position.z = targetLookAt.z + cameraRadius * Math.sin(cameraPhi) * Math.cos(cameraTheta);
  mainCamera.lookAt(targetLookAt);
}

// ----------------------------------------------------------------------------
// 5. SPLIT ROOMS / EXPLODED ARCHITECTURE LOGIC
// ----------------------------------------------------------------------------
export function toggleSplitRooms(forceState) {
  isExploded = forceState !== undefined ? forceState : !isExploded;
  targetExplodeFactor = isExploded ? 1.0 : 0.0;

  const btn = document.getElementById('btn-split-toggle');
  if (btn) {
    btn.innerHTML = isExploded ? '<i class="fa-solid fa-compress"></i> Assemble Mansion' : '<i class="fa-solid fa-layer-group"></i> Split Rooms in 3D';
    btn.classList.toggle('active', isExploded);
  }

  const slider = document.getElementById('split-range-slider');
  if (slider) {
    slider.value = isExploded ? 100 : 0;
  }

  // Show / Hide Floating Level Badges
  const labelsContainer = document.getElementById('level-labels-overlay');
  if (labelsContainer) {
    labelsContainer.classList.toggle('visible', isExploded);
  }
}

export function setSplitSlider(value0to100) {
  targetExplodeFactor = value0to100 / 100;
  isExploded = targetExplodeFactor > 0.05;

  const btn = document.getElementById('btn-split-toggle');
  if (btn) {
    btn.classList.toggle('active', isExploded);
    btn.innerHTML = isExploded ? '<i class="fa-solid fa-compress"></i> Assemble Mansion' : '<i class="fa-solid fa-layer-group"></i> Split Rooms in 3D';
  }

  const labelsContainer = document.getElementById('level-labels-overlay');
  if (labelsContainer) {
    labelsContainer.classList.toggle('visible', isExploded);
  }
}

// Focus on a specific level/room
export function focusLevel(levelIndex) {
  if (levelIndex < 0 || levelIndex >= mansionLevels.length) {
    // Reset view
    targetLookAt.set(0, 12, 0);
    cameraRadius = 120;
    updateCameraPosition();
    return;
  }

  // Auto split slightly to see clearly
  if (explodeFactor < 0.3) {
    setSplitSlider(60);
  }

  const targetLevel = mansionLevels[levelIndex];
  const offset = LEVEL_OFFSETS[levelIndex];
  targetLookAt.set(offset.x * targetExplodeFactor, 12 + offset.y * targetExplodeFactor, offset.z * targetExplodeFactor);
  cameraRadius = 65;
  updateCameraPosition();
}

// ----------------------------------------------------------------------------
// 6. DAY / NIGHT LIGHTING TOGGLE
// ----------------------------------------------------------------------------
export function toggleDayNightMode() {
  isNightMode = !isNightMode;

  const toggleBtn = document.getElementById('btn-day-night');
  if (toggleBtn) {
    toggleBtn.innerHTML = isNightMode ? '<i class="fa-solid fa-sun"></i> Day Mode' : '<i class="fa-solid fa-moon"></i> Night Gala Mode';
  }

  if (isNightMode) {
    // Night gala lighting
    mainScene.background.set(0x020409);
    mainScene.fog.color.set(0x020409);
    sunLight.intensity = 0.15;
    ambientLight.intensity = 0.4;
    blueFill.intensity = 0.2;
    poolLight.intensity = 6.5;
    windowLights.forEach(l => l.intensity = 3.2);
  } else {
    // Coastal Day sunlight
    mainScene.background.set(0x060913);
    mainScene.fog.color.set(0x060913);
    sunLight.intensity = 2.4;
    ambientLight.intensity = 1.2;
    blueFill.intensity = 0.8;
    poolLight.intensity = 3.5;
    windowLights.forEach(l => l.intensity = 1.8);
  }
}

// ----------------------------------------------------------------------------
// 7. ZOOM & AUTO ROTATE HELPERS
// ----------------------------------------------------------------------------
export function zoomIn() {
  cameraRadius = Math.max(40, cameraRadius - 18);
  updateCameraPosition();
}

export function zoomOut() {
  cameraRadius = Math.min(240, cameraRadius + 18);
  updateCameraPosition();
}

export function toggleAutoRotate() {
  isAutoRotating = !isAutoRotating;
  const btn = document.getElementById('btn-auto-rotate');
  if (btn) {
    btn.classList.toggle('active', isAutoRotating);
  }
}

export function resetCameraView() {
  cameraRadius = 120;
  cameraTheta = Math.PI / 4;
  cameraPhi = Math.PI / 3.4;
  targetLookAt.set(0, 12, 0);
  isAutoRotating = true;
  updateCameraPosition();
}

// Switch active mansion displayed in 3D
export function switch3DMansion(mansionId) {
  activeMansionId = mansionId;
  buildMansionModel(mansionId);
  updateMansionUIInfo(mansionId);
  resetCameraView();
}

function updateMansionUIInfo(mansionId) {
  const mansion = MANSIONS.find(m => m.id === mansionId) || MANSIONS[0];
  const nameEl = document.getElementById('viewer-mansion-name');
  const priceEl = document.getElementById('viewer-mansion-price');
  const scaleEl = document.getElementById('viewer-mansion-scale');
  const selectorEl = document.getElementById('viewer-mansion-select');

  if (nameEl) nameEl.textContent = mansion.name;
  if (priceEl) priceEl.textContent = mansion.formattedPrice;
  if (scaleEl) scaleEl.textContent = mansion.scale.scaleLine;
  if (selectorEl && selectorEl.value !== mansionId) selectorEl.value = mansionId;
}

// ----------------------------------------------------------------------------
// 8. RENDER LOOP
// ----------------------------------------------------------------------------
function animateMainViewer() {
  requestAnimationFrame(animateMainViewer);

  // Auto rotation
  if (isAutoRotating) {
    cameraTheta += 0.003;
    updateCameraPosition();
  }

  // Smooth Explode / Split Interpolation
  explodeFactor += (targetExplodeFactor - explodeFactor) * 0.08;

  mansionLevels.forEach((level, idx) => {
    const offset = LEVEL_OFFSETS[idx];
    level.position.y = offset.y * explodeFactor;
    level.position.x = offset.x * explodeFactor;
    level.position.z = offset.z * explodeFactor;
  });

  if (mainRenderer && mainScene && mainCamera) {
    mainRenderer.render(mainScene, mainCamera);
  }
}
