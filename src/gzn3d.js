import * as THREE from './vendor/three.module.js';

export class Gzn3DEngine {
  constructor(containerElement) {
    this.container = containerElement;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.beltRoot = null;
    this.particles = null;

    // Segment & Layer refs for animations
    this.segments = {
      center: null,
      leftSide: null,
      rightSide: null,
      leftBar: null,
      rightBar: null,
      leftStrap: null,
      rightStrap: null
    };

    this.layers = {
      leatherStrap: null,
      centerPlate: null,
      leftSidePlate: null,
      rightSidePlate: null,
      separatorBars: null
    };

    // Animation & Presentation State
    this.mode = 'curved'; // 'showcase' | 'curved' | 'flat'
    this.isExploded = false;
    this.explodeFactor = 0.0;
    this.targetExplodeFactor = 0.0;

    this.isCurved = true;
    this.curveFactor = 1.0;
    this.targetCurveFactor = 1.0;

    // Adaptive scale so flat display mode fits completely within viewport borders
    this.specScale = 0.88;
    this.targetSpecScale = 0.88;

    // Drag orbit state
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.targetRotation = { x: 0.06, y: -0.2 };
    this.currentRotation = { x: 0.06, y: -0.2 };
    this.mouseParallax = { x: 0, y: 0 };

    // Dynamic glint lights
    this.glintLight1 = null;
    this.glintLight2 = null;

    this.init();
  }

  init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || 600;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera (Wide-angle framing ~65mm compression, positioned to keep entire belt within borders)
    this.camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 50);
    this.camera.position.set(0, 0.08, 6.8);

    // 3. Renderer with high dynamic range tonemapping
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.4;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting Rig
    this.setupLighting();

    // 5. Build Clean Real Belt
    this.buildPhotorealisticBelt();

    // 6. Gold Glimmer Dust Particles
    this.buildArenaParticles();

    // 7. Ground Contact Shadow
    this.buildContactShadow();

    // 8. Event Listeners
    this.bindEvents();

    // 9. Animation Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setupLighting() {
    // Ambient arena fill
    const ambient = new THREE.AmbientLight(0x282832, 2.0);
    this.scene.add(ambient);

    // Key studio warm light (3200K gold reflection accent)
    const keyWarm = new THREE.DirectionalLight(0xfffae8, 4.5);
    keyWarm.position.set(-3.0, 4.0, 4.0);
    this.scene.add(keyWarm);

    // Cold diamond rim kicker (6500K diamond sparkle)
    const rimCold = new THREE.DirectionalLight(0xf2f8ff, 5.0);
    rimCold.position.set(3.5, 3.0, -2.5);
    this.scene.add(rimCold);

    // Crimson accent light from below
    const underSpot = new THREE.SpotLight(0xff1a35, 6.0, 16, Math.PI / 5, 0.4);
    underSpot.position.set(0, -2.5, 3.0);
    this.scene.add(underSpot);

    // Moving glint spotlights for dynamic gold sheen & diamond glints
    this.glintLight1 = new THREE.PointLight(0xffe680, 6.5, 9);
    this.glintLight1.position.set(-2, 1, 2.5);
    this.scene.add(this.glintLight1);

    this.glintLight2 = new THREE.PointLight(0xffffff, 5.5, 9);
    this.glintLight2.position.set(2, -0.5, 2.5);
    this.scene.add(this.glintLight2);
  }

  // --- ASSET LOADER: CLEAN WHITE BACKGROUND & ERASE CAROUSEL ARROWS ---

  createCleanTransparentTexture(url, arrowCircles, onReady) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, img.width, img.height);
      const d = imgData.data;

      // 1. Remove white / off-white studio background
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i];
        const g = d[i + 1];
        const b = d[i + 2];

        // Background is pure white or very light gray (> 218)
        if (r > 218 && g > 218 && b > 218) {
          d[i + 3] = 0;
        } else if (r > 195 && g > 195 && b > 195) {
          const avg = (r + g + b) / 3;
          d[i + 3] = Math.round(255 * Math.max(0, 1 - (avg - 195) / 23));
        }
      }
      ctx.putImageData(imgData, 0, 0);

      // 2. Erase any carousel arrow buttons completely
      if (arrowCircles && arrowCircles.length > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        arrowCircles.forEach(circle => {
          ctx.beginPath();
          ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 16;
      onReady(texture, canvas);
    };
  }

  buildPhotorealisticBelt() {
    this.beltRoot = new THREE.Group();
    this.scene.add(this.beltRoot);

    // Polished 24K Gold material for 3D separator bars and snap studs
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xfad03b,
      roughness: 0.18,
      metalness: 0.95,
      envMapIntensity: 2.2
    });

    // Dark saddle leather backer material
    const leatherMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f0f14,
      roughness: 0.85,
      metalness: 0.08
    });

    // --- SEGMENTS SETUP FOR CURVATURE MORPHING ---
    const centerGroup = new THREE.Group();
    this.segments.center = centerGroup;
    this.beltRoot.add(centerGroup);

    const leftSideGroup = new THREE.Group();
    this.segments.leftSide = leftSideGroup;
    this.beltRoot.add(leftSideGroup);

    const rightSideGroup = new THREE.Group();
    this.segments.rightSide = rightSideGroup;
    this.beltRoot.add(rightSideGroup);

    const leftBarGroup = new THREE.Group();
    this.segments.leftBar = leftBarGroup;
    this.beltRoot.add(leftBarGroup);

    const rightBarGroup = new THREE.Group();
    this.segments.rightBar = rightBarGroup;
    this.beltRoot.add(rightBarGroup);

    const leftStrapGroup = new THREE.Group();
    this.segments.leftStrap = leftStrapGroup;
    this.beltRoot.add(leftStrapGroup);

    const rightStrapGroup = new THREE.Group();
    this.segments.rightStrap = rightStrapGroup;
    this.beltRoot.add(rightStrapGroup);

    // --- 1. FULL REAL BELT TEXTURE (From belt-full.png with background & arrows removed) ---
    // In belt-full.png (915 x 558), arrow icons are at:
    const fullArrows = [
      { x: 40, y: 279, r: 35 },
      { x: 875, y: 279, r: 35 }
    ];

    this.createCleanTransparentTexture('/images/belt/belt-full.png', fullArrows, (fullTex, fullCanvas) => {
      // 1. Center Plate crop (clean real photo texture)
      const centerCropCanvas = document.createElement('canvas');
      centerCropCanvas.width = 512;
      centerCropCanvas.height = 512;
      const cctx = centerCropCanvas.getContext('2d');
      // Coordinates of center plate in belt-full.png: x: 335, y: 155, w: 245, h: 245
      cctx.drawImage(fullCanvas, 335, 155, 245, 245, 0, 0, 512, 512);
      const centerTex = new THREE.CanvasTexture(centerCropCanvas);
      centerTex.colorSpace = THREE.SRGBColorSpace;
      if (this.centerMesh) {
        this.centerMesh.material.map = centerTex;
        this.centerMesh.material.needsUpdate = true;
      }

      // 2. Left Side Plate crop
      const leftSideCanvas = document.createElement('canvas');
      leftSideCanvas.width = 256;
      leftSideCanvas.height = 300;
      const lctx = leftSideCanvas.getContext('2d');
      lctx.drawImage(fullCanvas, 222, 195, 112, 165, 0, 0, 256, 300);
      const leftSideTex = new THREE.CanvasTexture(leftSideCanvas);
      leftSideTex.colorSpace = THREE.SRGBColorSpace;
      if (this.leftSideMesh) {
        this.leftSideMesh.material.map = leftSideTex;
        this.leftSideMesh.material.needsUpdate = true;
      }

      // 3. Right Side Plate crop
      const rightSideCanvas = document.createElement('canvas');
      rightSideCanvas.width = 256;
      rightSideCanvas.height = 300;
      const rctx = rightSideCanvas.getContext('2d');
      rctx.drawImage(fullCanvas, 580, 195, 112, 165, 0, 0, 256, 300);
      const rightSideTex = new THREE.CanvasTexture(rightSideCanvas);
      rightSideTex.colorSpace = THREE.SRGBColorSpace;
      if (this.rightSideMesh) {
        this.rightSideMesh.material.map = rightSideTex;
        this.rightSideMesh.material.needsUpdate = true;
      }

      // 4. Left Strap Wing crop (8 snaps + embossed leather monogram)
      const leftWingCanvas = document.createElement('canvas');
      leftWingCanvas.width = 360;
      leftWingCanvas.height = 240;
      const lwctx = leftWingCanvas.getContext('2d');
      lwctx.drawImage(fullCanvas, 68, 205, 155, 145, 0, 0, 360, 240);
      const leftWingTex = new THREE.CanvasTexture(leftWingCanvas);
      leftWingTex.colorSpace = THREE.SRGBColorSpace;
      if (this.leftWingMesh) {
        this.leftWingMesh.material.map = leftWingTex;
        this.leftWingMesh.material.needsUpdate = true;
      }

      // 5. Right Strap Wing crop (8 snaps + gold tip)
      const rightWingCanvas = document.createElement('canvas');
      rightWingCanvas.width = 360;
      rightWingCanvas.height = 240;
      const rwctx = rightWingCanvas.getContext('2d');
      rwctx.drawImage(fullCanvas, 692, 205, 155, 145, 0, 0, 360, 240);
      const rightWingTex = new THREE.CanvasTexture(rightWingCanvas);
      rightWingTex.colorSpace = THREE.SRGBColorSpace;
      if (this.rightWingMesh) {
        this.rightWingMesh.material.map = rightWingTex;
        this.rightWingMesh.material.needsUpdate = true;
      }
    });

    // Also load high-resolution center plate photo with arrows removed
    const centerArrows = [
      { x: 57, y: 504, r: 42 },
      { x: 900, y: 504, r: 42 }
    ];
    this.createCleanTransparentTexture('/images/belt/belt-center.jpg', centerArrows, (hdCenterTex) => {
      if (this.centerMesh) {
        this.centerMesh.material.map = hdCenterTex;
        this.centerMesh.material.roughness = 0.18;
        this.centerMesh.material.metalness = 0.94;
        this.centerMesh.material.needsUpdate = true;
      }
    });

    // Also load high-resolution side plate photo
    const sideArrows = [
      { x: 70, y: 500, r: 42 },
      { x: 940, y: 500, r: 42 }
    ];
    this.createCleanTransparentTexture('/images/belt/belt-side.jpg', sideArrows, (hdSideTex) => {
      if (this.leftSideMesh) {
        this.leftSideMesh.material.map = hdSideTex;
        this.leftSideMesh.material.roughness = 0.2;
        this.leftSideMesh.material.metalness = 0.92;
        this.leftSideMesh.material.needsUpdate = true;
      }
      if (this.rightSideMesh) {
        this.rightSideMesh.material.map = hdSideTex;
        this.rightSideMesh.material.roughness = 0.2;
        this.rightSideMesh.material.metalness = 0.92;
        this.rightSideMesh.material.needsUpdate = true;
      }
    });

    // --- 2. BUILD 3D REAL MESHES (NO OPAQUE RECTANGULAR BOXES) ---

    // 1. CENTER SECTION (Main Plate)
    // Physical leather back plate (shaped to avoid any oversized rectangle)
    const centerBackGeo = new THREE.BoxGeometry(1.95, 1.82, 0.05);
    const centerBackMesh = new THREE.Mesh(centerBackGeo, leatherMaterial);
    centerBackMesh.position.set(0, 0, -0.03);
    centerGroup.add(centerBackMesh);

    // Front Center Plate: Transparent quad, ONLY the gold plate & jewels render!
    const centerFrontMat = new THREE.MeshStandardMaterial({
      roughness: 0.2,
      metalness: 0.92,
      transparent: true,
      alphaTest: 0.08,
      side: THREE.DoubleSide
    });
    const centerFrontGeo = new THREE.PlaneGeometry(1.9, 1.78);
    const centerMesh = new THREE.Mesh(centerFrontGeo, centerFrontMat);
    centerMesh.position.set(0, 0, 0.035);
    centerGroup.add(centerMesh);
    this.centerMesh = centerMesh;
    this.layers.centerPlate = centerMesh;

    // 2. LEFT SIDE PLATE SECTION
    const sideBackGeo = new THREE.BoxGeometry(1.05, 1.35, 0.05);
    const leftSideBack = new THREE.Mesh(sideBackGeo, leatherMaterial);
    leftSideBack.position.set(0, 0, -0.03);
    leftSideGroup.add(leftSideBack);

    const sideFrontMat = new THREE.MeshStandardMaterial({
      roughness: 0.22,
      metalness: 0.9,
      transparent: true,
      alphaTest: 0.08,
      side: THREE.DoubleSide
    });
    const leftSideMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.02, 1.32), sideFrontMat);
    leftSideMesh.position.set(0, 0, 0.03);
    leftSideGroup.add(leftSideMesh);
    this.leftSideMesh = leftSideMesh;
    this.layers.leftSidePlate = leftSideMesh;

    // 3. RIGHT SIDE PLATE SECTION
    const rightSideBack = new THREE.Mesh(sideBackGeo, leatherMaterial);
    rightSideBack.position.set(0, 0, -0.03);
    rightSideGroup.add(rightSideBack);

    const rightSideFrontMat = new THREE.MeshStandardMaterial({
      roughness: 0.22,
      metalness: 0.9,
      transparent: true,
      alphaTest: 0.08,
      side: THREE.DoubleSide
    });
    const rightSideMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.02, 1.32), rightSideFrontMat);
    rightSideMesh.position.set(0, 0, 0.03);
    rightSideGroup.add(rightSideMesh);
    this.rightSideMesh = rightSideMesh;
    this.layers.rightSidePlate = rightSideMesh;

    // 4. VERTICAL POLISHED GOLD SEPARATOR BARS
    const barGeo = new THREE.CylinderGeometry(0.042, 0.042, 1.4, 24);
    const leftBarMesh = new THREE.Mesh(barGeo, goldMaterial);
    leftBarMesh.position.set(0, 0, 0.05);
    leftBarGroup.add(leftBarMesh);

    const rightBarMesh = new THREE.Mesh(barGeo, goldMaterial);
    rightBarMesh.position.set(0, 0, 0.05);
    rightBarGroup.add(rightBarMesh);
    this.layers.separatorBars = [leftBarMesh, rightBarMesh];

    // 5. STRAP WINGS (With Real Snap Buttons & Gold Tip)
    const wingMat = new THREE.MeshStandardMaterial({
      roughness: 0.75,
      metalness: 0.12,
      transparent: true,
      alphaTest: 0.08,
      side: THREE.DoubleSide
    });

    // Left Wing
    const wingGeo = new THREE.PlaneGeometry(1.4, 1.05);
    const leftWingMesh = new THREE.Mesh(wingGeo, wingMat);
    leftWingMesh.position.set(-0.7, 0, 0.01);
    leftStrapGroup.add(leftWingMesh);
    this.leftWingMesh = leftWingMesh;

    const leftWingBackMesh = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.05, 0.05), leatherMaterial);
    leftWingBackMesh.position.set(-0.7, 0, -0.03);
    leftStrapGroup.add(leftWingBackMesh);

    // Right Wing
    const rightWingMesh = new THREE.Mesh(wingGeo, wingMat);
    rightWingMesh.position.set(0.7, 0, 0.01);
    rightStrapGroup.add(rightWingMesh);
    this.rightWingMesh = rightWingMesh;

    const rightWingBackMesh = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.05, 0.05), leatherMaterial);
    rightWingBackMesh.position.set(0.7, 0, -0.03);
    rightStrapGroup.add(rightWingBackMesh);

    // 3D Polished Gold Curved End Tip on right wing
    const tipGeo = new THREE.BoxGeometry(0.08, 1.06, 0.07);
    const tipMesh = new THREE.Mesh(tipGeo, goldMaterial);
    tipMesh.position.set(1.42, 0, 0.01);
    rightStrapGroup.add(tipMesh);

    // Initial position update according to initial curveFactor (1.0 = champion waist curve)
    this.updateBeltCurvature(1.0);
  }

  // Calculate positions and rotations for all 7 belt segments based on curveFactor
  // curveFactor = 0: Flat exhibition trophy case layout (fitting completely inside borders)
  // curveFactor = 1: Iconic circular 3D champion waist wrap
  updateBeltCurvature(factor) {
    const R = 2.45;

    const angles = {
      center: 0,
      leftBar: -0.28 * factor,
      leftSide: -0.62 * factor,
      leftStrap: -1.05 * factor,
      rightBar: 0.28 * factor,
      rightSide: 0.62 * factor,
      rightStrap: 1.05 * factor
    };

    // Compact linear stations when flat so it never clips container borders
    const flatX = {
      center: 0,
      leftBar: -1.12,
      leftSide: -1.78,
      leftStrap: -2.45,
      rightBar: 1.12,
      rightSide: 1.78,
      rightStrap: 2.45
    };

    Object.keys(this.segments).forEach(key => {
      const seg = this.segments[key];
      if (!seg) return;

      const ang = angles[key];
      const fx = flatX[key];

      const cx = Math.sin(ang) * R;
      const cz = -(1 - Math.cos(ang)) * R;

      seg.position.x = THREE.MathUtils.lerp(fx, cx, factor);
      seg.position.z = THREE.MathUtils.lerp(0, cz, factor);
      seg.rotation.y = THREE.MathUtils.lerp(0, ang, factor);
    });
  }

  buildArenaParticles() {
    const count = 180;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 9;
      positions[i + 1] = (Math.random() - 0.5) * 6;
      positions[i + 2] = (Math.random() - 0.5) * 5;

      if (Math.random() > 0.4) {
        colors[i] = 1.0;
        colors[i + 1] = 0.85;
        colors[i + 2] = 0.35;
      } else {
        colors[i] = 0.95;
        colors[i + 1] = 0.98;
        colors[i + 2] = 1.0;
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.03,
      vertexColors: true,
      transparent: true,
      opacity: 0.45
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  buildContactShadow() {
    const shadowGeo = new THREE.PlaneGeometry(6.5, 3.0);
    shadowGeo.rotateX(-Math.PI / 2);

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(128, 64, 15, 128, 64, 115);
    grad.addColorStop(0, 'rgba(0,0,0,0.85)');
    grad.addColorStop(0.5, 'rgba(0,0,0,0.3)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 128);

    const shadowTex = new THREE.CanvasTexture(canvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false
    });

    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.y = -1.45;
    this.scene.add(shadowMesh);
  }

  bindEvents() {
    const el = this.container;

    el.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const deltaX = e.clientX - this.previousMousePosition.x;
        const deltaY = e.clientY - this.previousMousePosition.y;

        this.targetRotation.y += deltaX * 0.008;
        this.targetRotation.x += deltaY * 0.006;
        this.targetRotation.x = Math.max(-0.5, Math.min(0.5, this.targetRotation.x));

        this.previousMousePosition = { x: e.clientX, y: e.clientY };
      }

      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      this.mouseParallax.x = normX * 0.04;
      this.mouseParallax.y = normY * 0.04;
    }, { passive: true });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    el.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (this.isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - this.previousMousePosition.x;
        const deltaY = e.touches[0].clientY - this.previousMousePosition.y;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          this.targetRotation.y += deltaX * 0.009;
        }

        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    window.addEventListener('resize', () => {
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      if (w && h && this.renderer && this.camera) {
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
      }
    });
  }

  // --- PUBLIC API: ANIMATION MODES ---

  setMode(modeName) {
    this.mode = modeName;
    if (modeName === 'flat') {
      this.targetCurveFactor = 0.0;
      this.targetExplodeFactor = 0.0;
      // Scale down gently in flat display mode so width completely fits inside viewport
      this.targetSpecScale = 0.72;
      this.isExploded = false;
    } else if (modeName === 'curved' || modeName === 'showcase') {
      this.targetCurveFactor = 1.0;
      this.targetExplodeFactor = 0.0;
      this.targetSpecScale = 0.88;
      this.isExploded = false;
    }
  }

  setExploded(exploded) {
    this.isExploded = exploded;
    this.targetExplodeFactor = exploded ? 1.0 : 0.0;
  }

  setWeight(edition) {
    if (edition === 'REPLICA' || edition === '12-OZ') this.targetSpecScale = 0.82;
    else if (edition === 'ELITE' || edition === '14-OZ') this.targetSpecScale = 0.88;
    else if (edition === 'CAST 24K' || edition === '16-OZ') this.targetSpecScale = 0.94;
  }

  // --- RENDER & ANIMATION LOOP ---

  animate(time) {
    requestAnimationFrame(this.animate);

    const delta = time * 0.001;

    // 1. Smooth rotation interpolation
    this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * 0.08;
    this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * 0.08;

    // Mode 1: Showcase breathing & floating drift
    const breathingHover = Math.sin(delta * 1.5) * 0.035;
    this.beltRoot.position.y = breathingHover;

    if (!this.isDragging && this.mode === 'showcase') {
      this.targetRotation.y += 0.0025;
    }

    this.beltRoot.rotation.y = this.currentRotation.y + this.mouseParallax.x;
    this.beltRoot.rotation.x = this.currentRotation.x + this.mouseParallax.y;

    // 2. Smooth scale interpolation (Adaptive zoom so it never exceeds borders)
    this.specScale += (this.targetSpecScale - this.specScale) * 0.08;
    this.beltRoot.scale.set(this.specScale, this.specScale, this.specScale);

    // 3. Smooth Curvature Interpolation (Flat vs Waist Wrap)
    if (Math.abs(this.targetCurveFactor - this.curveFactor) > 0.001) {
      this.curveFactor += (this.targetCurveFactor - this.curveFactor) * 0.06;
      this.updateBeltCurvature(this.curveFactor);
    }

    // 4. Smooth Exploded Multi-Layer Displacement
    this.explodeFactor += (this.targetExplodeFactor - this.explodeFactor) * 0.08;

    if (this.centerMesh) {
      // Center plate pushes forward (+Z)
      this.centerMesh.position.z = 0.035 + this.explodeFactor * 0.75;
    }

    if (this.leftSideMesh && this.rightSideMesh) {
      this.leftSideMesh.position.z = 0.03 + this.explodeFactor * 0.55;
      this.rightSideMesh.position.z = 0.03 + this.explodeFactor * 0.55;
    }

    if (this.layers.separatorBars) {
      this.layers.separatorBars.forEach(bar => {
        bar.position.z = 0.05 + this.explodeFactor * 0.4;
      });
    }

    // 5. Dynamic glint lighting sweeps across real gold plates & crystals
    if (this.glintLight1 && this.glintLight2) {
      this.glintLight1.position.x = Math.sin(delta * 1.8) * 3.0;
      this.glintLight1.position.y = Math.cos(delta * 1.4) * 1.5 + 0.5;

      this.glintLight2.position.x = -Math.sin(delta * 1.8) * 3.0;
      this.glintLight2.position.y = -Math.cos(delta * 1.4) * 1.5 + 0.2;
    }

    // 6. Drift arena particles
    if (this.particles) {
      this.particles.rotation.y = delta * 0.02;
    }

    // 7. Render
    this.renderer.render(this.scene, this.camera);
  }
}
