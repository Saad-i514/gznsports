import * as THREE from "./vendor/three.module.js";

/** A deliberately abstract construction study, not a substitute for product photography. */
export function createMaterialStudio(container, reduced) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.6;
  container.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 40);
  camera.position.set(0, 0.25, 10.6);
  const root = new THREE.Group();
  scene.add(root);
  root.rotation.set(-0.16, -0.25, -0.12);
  const resources = new Set();
  const own = (resource) => {
    resources.add(resource);
    return resource;
  };
  // Softboxes reflected in the metal; no external HDR request or loading gate.
  const room = new THREE.Scene();
  room.background = new THREE.Color("#666856");
  for (const [x, y, z, w, h] of [
    [0, 4, 1, 8, 3],
    [-4, 1, 2, 2, 7],
    [4, 0, -2, 2, 6],
  ]) {
    const panel = new THREE.Mesh(
      own(new THREE.PlaneGeometry(w, h)),
      own(
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          side: THREE.DoubleSide,
        }),
      ),
    );
    panel.position.set(x, y, z);
    panel.lookAt(0, 0, 0);
    room.add(panel);
  }
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(room, 0.02);
  scene.environment = environment.texture;
  pmrem.dispose();
  scene.add(new THREE.AmbientLight(0xd5d6bb, 2));
  const key = new THREE.DirectionalLight(0xffedd2, 4);
  key.position.set(-3, 4, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 3);
  rim.position.set(4, 2, 1);
  scene.add(rim);
  const gold = own(
    new THREE.MeshStandardMaterial({
      color: 0xc9a34c,
      metalness: 0.85,
      roughness: 0.28,
    }),
  );
  const darkGold = own(
    new THREE.MeshStandardMaterial({
      color: 0x725426,
      metalness: 0.8,
      roughness: 0.4,
    }),
  );
  const leather = own(
    new THREE.MeshStandardMaterial({
      color: 0x171911,
      metalness: 0.02,
      roughness: 0.94,
    }),
  );
  const grain = document.createElement("canvas");
  grain.width = grain.height = 128;
  const gc = grain.getContext("2d");
  gc.fillStyle = "#888";
  gc.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 3500; i++) {
    const x = (i * 47) % 128,
      y = (i * 71 + Math.floor(i / 128) * 13) % 128;
    gc.fillStyle = i % 2 ? "#777" : "#999";
    gc.fillRect(x, y, 1, 2);
  }
  const bump = own(new THREE.CanvasTexture(grain));
  bump.wrapS = bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(5, 2);
  leather.bumpMap = bump;
  leather.bumpScale = 0.025;
  function box(w, h, d, material, x = 0, y = 0, z = 0) {
    const mesh = new THREE.Mesh(own(new THREE.BoxGeometry(w, h, d)), material);
    mesh.position.set(x, y, z);
    return mesh;
  }
  const strap = box(6.6, 1.12, 0.12, leather, 0, 0, -0.12);
  root.add(strap);
  const plateLayer = new THREE.Group();
  root.add(plateLayer);
  function shield(w, h, depth, material) {
    const shape = new THREE.Shape();
    shape.moveTo(-w * 0.35, h * 0.5);
    shape.lineTo(w * 0.35, h * 0.5);
    shape.lineTo(w * 0.5, h * 0.3);
    shape.lineTo(w * 0.47, -h * 0.3);
    shape.quadraticCurveTo(0, -h * 0.67, -w * 0.47, -h * 0.3);
    shape.lineTo(-w * 0.5, h * 0.3);
    shape.closePath();
    return new THREE.Mesh(
      own(
        new THREE.ExtrudeGeometry(shape, {
          depth,
          bevelEnabled: true,
          bevelSegments: 3,
          steps: 1,
          bevelSize: 0.035,
          bevelThickness: 0.025,
          curveSegments: 20,
        }),
      ),
      material,
    );
  }
  const foundation = shield(2.5, 2.1, 0.12, leather);
  foundation.position.z = -0.16;
  root.add(foundation);
  const plate = shield(2.35, 1.95, 0.13, gold);
  plateLayer.add(plate);
  const inset = shield(2.12, 1.73, 0.035, darkGold);
  inset.position.z = 0.16;
  plateLayer.add(inset);
  const face = shield(1.98, 1.59, 0.025, gold);
  face.position.z = 0.21;
  plateLayer.add(face);
  // A bespoke, readable GNZ seal, surrounded by fine concentric engraving.
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#c9a550";
  ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = "#82632d";
  ctx.lineWidth = 2;
  for (let r = 150; r <= 238; r += 8) {
    ctx.beginPath();
    ctx.arc(256, 256, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (let i = 0; i < 64; i++) {
    const angle = (i * Math.PI) / 32;
    ctx.beginPath();
    ctx.moveTo(256 + Math.cos(angle) * 167, 256 + Math.sin(angle) * 167);
    ctx.lineTo(256 + Math.cos(angle) * 231, 256 + Math.sin(angle) * 231);
    ctx.stroke();
  }
  ctx.fillStyle = "#332912";
  ctx.textAlign = "center";
  ctx.font = "bold italic 120px Arial";
  ctx.fillText("GNZ", 250, 286);
  ctx.font = "bold 19px Arial";
  ctx.fillText("EARNED. NEVER GIVEN.", 256, 334);
  ctx.font = "17px Arial";
  ctx.fillText("C H A M P I O N S H I P", 256, 180);
  const sealTex = own(new THREE.CanvasTexture(canvas));
  sealTex.colorSpace = THREE.SRGBColorSpace;
  const sealMat = own(
    new THREE.MeshStandardMaterial({
      map: sealTex,
      metalness: 0.66,
      roughness: 0.35,
    }),
  );
  const seal = new THREE.Mesh(own(new THREE.CircleGeometry(0.74, 64)), sealMat);
  seal.position.z = 0.29;
  plateLayer.add(seal);
  for (const side of [-1, 1]) {
    const group = new THREE.Group();
    group.position.set(side * 1.88, 0, -0.08);
    group.rotation.y = side * 0.17;
    group.add(box(0.91, 1.07, 0.12, gold));
    group.add(box(0.76, 0.91, 0.04, darkGold, 0, 0, 0.09));
    const medallion = new THREE.Mesh(
      own(new THREE.CylinderGeometry(0.34, 0.34, 0.09, 48)),
      gold,
    );
    medallion.rotation.x = Math.PI / 2;
    medallion.position.z = 0.16;
    group.add(medallion);
    const inner = new THREE.Mesh(
      own(new THREE.TorusGeometry(0.25, 0.013, 8, 48)),
      darkGold,
    );
    inner.position.z = 0.217;
    group.add(inner);
    plateLayer.add(group);
    for (let x = 0; x < 4; x++)
      for (const y of [-0.28, 0.28]) {
        const snap = new THREE.Mesh(
          own(new THREE.SphereGeometry(0.047, 10, 8)),
          gold,
        );
        snap.scale.z = 0.35;
        snap.position.set(side * (2.55 + x * 0.17), y, -0.045);
        root.add(snap);
      }
    for (let i = 0; i < 19; i++) {
      const bead = new THREE.Mesh(
        own(new THREE.SphereGeometry(0.021, 6, 4)),
        gold,
      );
      bead.position.set(
        side * (0.98 + 0.025 * Math.sin(i)),
        0.69 - i * 0.072,
        0.265,
      );
      plateLayer.add(bead);
    }
  }
  let targetY = -0.25,
    targetX = -0.16,
    targetExplode = 0,
    targetScale = 1,
    frame = 0,
    visible = true,
    disposed = false;
  const abort = new AbortController();
  function draw() {
    frame = 0;
    if (disposed || !visible || document.hidden) return;
    const ease = reduced.matches ? 1 : 0.11;
    root.rotation.y += (targetY - root.rotation.y) * ease;
    root.rotation.x += (targetX - root.rotation.x) * ease;
    plateLayer.position.z += (targetExplode - plateLayer.position.z) * ease;
    const scale = root.scale.x + (targetScale - root.scale.x) * ease;
    root.scale.setScalar(scale);
    renderer.render(scene, camera);
    if (
      Math.abs(targetY - root.rotation.y) +
        Math.abs(targetX - root.rotation.x) +
        Math.abs(targetExplode - plateLayer.position.z) +
        Math.abs(targetScale - scale) >
      0.001
    )
      requestDraw();
  }
  function requestDraw() {
    if (!frame && !disposed) frame = requestAnimationFrame(draw);
  }
  const resize = new ResizeObserver(() => {
    const w = container.clientWidth,
      h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.position.z = Math.max(
      10.6,
      7.8 / camera.aspect / (2 * Math.tan(THREE.MathUtils.degToRad(16.5))),
    );
    camera.updateProjectionMatrix();
    requestDraw();
  });
  resize.observe(container);
  const visibility = new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      if (visible) requestDraw();
    },
    { threshold: 0.01 },
  );
  visibility.observe(container);
  document.addEventListener("visibilitychange", requestDraw, {
    signal: abort.signal,
  });
  let pointer = null,
    lastX = 0,
    lastY = 0;
  container.addEventListener(
    "pointerdown",
    (event) => {
      pointer = event.pointerId;
      lastX = event.clientX;
      lastY = event.clientY;
      container.setPointerCapture(pointer);
    },
    { signal: abort.signal },
  );
  container.addEventListener(
    "pointermove",
    (event) => {
      if (pointer !== event.pointerId) return;
      targetY = Math.max(
        -1.2,
        Math.min(1.2, targetY + (event.clientX - lastX) * 0.006),
      );
      if (event.pointerType !== "touch")
        targetX = Math.max(
          -0.55,
          Math.min(0.55, targetX + (event.clientY - lastY) * 0.004),
        );
      lastX = event.clientX;
      lastY = event.clientY;
      requestDraw();
    },
    { signal: abort.signal },
  );
  const release = () => {
    pointer = null;
  };
  container.addEventListener("pointerup", release, { signal: abort.signal });
  container.addEventListener("pointercancel", release, {
    signal: abort.signal,
  });
  renderer.domElement.addEventListener(
    "webglcontextlost",
    (event) => {
      event.preventDefault();
      container.parentElement.classList.remove("is-ready");
      document.getElementById("studio-status").textContent =
        "MATERIAL DETAIL / PHOTOGRAPHIC VIEW";
    },
    { signal: abort.signal },
  );
  requestDraw();
  return {
    setMaterial(name) {
      targetExplode = name === "leather" ? 0.8 : 0;
      targetScale = name === "detail" ? 1.2 : 1;
      targetY = name === "leather" ? -0.65 : -0.25;
      targetX = name === "detail" ? 0.03 : -0.16;
      requestDraw();
    },
    rotate(delta) {
      targetY = Math.max(-1.2, Math.min(1.2, targetY + delta));
      requestDraw();
    },
    reset() {
      targetY = -0.25;
      targetX = -0.16;
      requestDraw();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      abort.abort();
      resize.disconnect();
      visibility.disconnect();
      resources.forEach((resource) => resource.dispose());
      environment.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
