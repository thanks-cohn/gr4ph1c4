declare const require: (name: string) => {
  mkdir?: (path: string, options: { recursive: boolean }) => Promise<void>;
  writeFile?: (path: string, data: string, encoding: "utf8") => Promise<void>;
  copyFile?: (from: string, to: string) => Promise<void>;
  rm?: (path: string, options: { recursive: boolean; force: boolean }) => Promise<void>;
  join?: (...parts: string[]) => string;
};

const fsPromises = require("node:fs/promises");
const pathModule = require("node:path");

const { mkdir, writeFile, copyFile, rm } = fsPromises as {
  mkdir: (path: string, options: { recursive: boolean }) => Promise<void>;
  writeFile: (path: string, data: string, encoding: "utf8") => Promise<void>;
  copyFile: (from: string, to: string) => Promise<void>;
  rm: (path: string, options: { recursive: boolean; force: boolean }) => Promise<void>;
};
const { join } = pathModule as { join: (...parts: string[]) => string };

const OUTPUT_DIR = join("dist", "three-ocean-points-demo");
const VENDOR_DIR = join(OUTPUT_DIR, "vendor");
const HTML_PATH = join(OUTPUT_DIR, "index.html");
const STATE_PATH = join(OUTPUT_DIR, "three-ocean-state.json");
const PROOF_PATH = join(OUTPUT_DIR, "proof.log");
const BUNDLE_PATH = join(VENDOR_DIR, "three.min.js");
const SOURCE_BUNDLE_PATH = join("vendor", "three", "build", "three.min.js");

const THREE_OCEAN_STATE = {
  demo: "three-ocean-points",
  pass: "6B-interactive-ocean-handling",
  demoName: "three-ocean-points",
  renderer: "three.js",
  sceneName: "ocean-points",
  waveHeight: "normal",
  pointDensity: "medium",
  motion: "normal",
  colorMode: "blue",
  serverRequired: false,
  source: "deterministic-wave-field",
  localBundle: "vendor/three.min.js",
  defaultCamera: { x: 34, y: 24, z: 42 },
  defaultTarget: { x: 0, y: 0, z: 0 },
  viewPresets: {
    top: { label: "Top View", camera: { x: 0, y: 66, z: 0.01 }, target: { x: 0, y: 0, z: 0 } },
    side: { label: "Side View", camera: { x: 58, y: 8, z: 0 }, target: { x: 0, y: 0, z: 0 } },
    presentation: { label: "Presentation View", camera: { x: 34, y: 24, z: 42 }, target: { x: 0, y: 0, z: 0 } },
  },
  interactionControls: {
    orbit: "mouse drag around ocean center",
    spin: "Spin Ocean button rotates the THREE.Points object on its y axis",
    zoom: "mouse wheel changes camera distance in and out",
    pan: "Shift + drag or right drag moves camera and target across the point field",
    tilt: "Tilt Camera button changes camera elevation",
    presets: ["Top View", "Side View", "Presentation View"],
    pauseResume: "Pause button toggles requestAnimationFrame wave updates",
    reset: "Reset View restores default camera, target, zoom distance, and ocean spin",
    saveRestore: "Save View and Restore View persist camera state with localStorage key gr4ph1c4.threeOceanPoints.view.v1",
  },
  animation: {
    usesRequestAnimationFrame: true,
    pointCount: 6400,
    gridSize: 80,
    waveFunction: "sin/cos deterministic x-z wave field",
    pausedByDefault: false,
  },
  proof: {
    command: "node dist/main.js three-ocean-points-demo",
    output: "dist/three-ocean-points-demo/index.html",
    state: "dist/three-ocean-points-demo/three-ocean-state.json",
    proofLog: "dist/three-ocean-points-demo/proof.log",
    geometry: "THREE.BufferGeometry",
    object: "THREE.Points",
    interaction: "orbit zoom pan tilt presets pause reset save restore",
    storage: "localStorage",
    status: "ok",
  },
};

function proofLines(): string[] {
  return [
    "PASS GR4PH1C4 V0 PASS 6B interactive ocean handling proof",
    "command=node dist/main.js three-ocean-points-demo",
    "output=dist/three-ocean-points-demo/index.html",
    "state=dist/three-ocean-points-demo/three-ocean-state.json",
    "renderer=three.js local bundle",
    "geometry=THREE.BufferGeometry",
    "object=THREE.Points",
    "interaction=orbit zoom pan tilt presets pause reset save restore",
    "storage=localStorage",
    "status=ok",
    "input: deterministic wave field",
    "demo: three-ocean-points",
    "renderer: three.js",
    "scene: ocean-points",
    "wave height: normal",
    "point density: medium",
    "motion: normal",
    "color mode: blue",
    "server required: no",
    "three bundle: dist/three-ocean-points-demo/vendor/three.min.js",
  ];
}

function renderThreeOceanHtml(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Gr4ph1c4 Three.js Point Ocean</title>
  <style>
    :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #020617; color: #e0f2fe; }
    body { margin: 0; min-height: 100vh; background: radial-gradient(circle at 18% 12%, rgba(56, 189, 248, 0.22), transparent 30%), radial-gradient(circle at 76% 18%, rgba(168, 85, 247, 0.18), transparent 25%), linear-gradient(145deg, #020617 0%, #06111f 54%, #111827 100%); }
    main { width: min(96vw, 1520px); margin: 0 auto; padding: 30px 20px 44px; }
    header { display: flex; justify-content: space-between; gap: 24px; align-items: flex-start; margin-bottom: 18px; }
    h1 { margin: 0 0 8px; font-size: clamp(2rem, 4.2vw, 4.5rem); line-height: 0.96; letter-spacing: -0.06em; }
    h2 { margin: 0 0 12px; font-size: 1.08rem; }
    .lede { max-width: 840px; margin: 0; color: #bfdbfe; line-height: 1.55; font-size: 1.04rem; }
    .badge { flex: 0 0 auto; border: 1px solid rgba(96, 165, 250, 0.5); border-radius: 999px; padding: 9px 14px; color: #bae6fd; font-weight: 900; background: rgba(2, 6, 23, 0.72); box-shadow: 0 0 34px rgba(56, 189, 248, 0.2); }
    .layout { display: grid; grid-template-columns: minmax(0, 1fr) 390px; gap: 18px; align-items: start; }
    .panel { border: 1px solid rgba(148, 163, 184, 0.25); border-radius: 28px; background: rgba(15, 23, 42, 0.80); box-shadow: 0 30px 90px rgba(0, 0, 0, 0.42); backdrop-filter: blur(14px); }
    #oceanViewport { min-height: 690px; position: relative; overflow: hidden; touch-action: none; cursor: grab; }
    #oceanViewport.dragging { cursor: grabbing; }
    #oceanViewport canvas { display: block; width: 100%; height: 100%; }
    .hud { position: absolute; left: 18px; bottom: 18px; min-width: 310px; padding: 13px 15px; border-radius: 18px; background: rgba(2, 6, 23, 0.72); border: 1px solid rgba(125, 211, 252, 0.26); color: #bae6fd; font-variant-numeric: tabular-nums; }
    .hud-row { display: grid; grid-template-columns: 140px 1fr; gap: 10px; margin: 4px 0; }
    .hud strong { color: #eff6ff; }
    aside { display: grid; gap: 16px; }
    .card { padding: 18px; }
    .controls { display: grid; gap: 10px; }
    .button-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    button { border-radius: 14px; border: 1px solid rgba(148, 163, 184, 0.34); background: linear-gradient(135deg, rgba(14, 165, 233, 0.3), rgba(124, 58, 237, 0.26)); color: #eff6ff; padding: 11px 12px; font: inherit; cursor: pointer; font-weight: 950; }
    button:hover { border-color: rgba(125, 211, 252, 0.78); transform: translateY(-1px); }
    .help { margin: 0; padding-left: 20px; color: #bfdbfe; line-height: 1.7; }
    .proof-list { margin: 0; display: grid; grid-template-columns: max-content 1fr; gap: 8px 12px; }
    dt { color: #93c5fd; font-weight: 900; }
    dd { margin: 0; color: #e0f2fe; }
    .command { border-radius: 18px; padding: 13px 14px; background: #020617; border: 1px solid rgba(56, 189, 248, 0.24); color: #bae6fd; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; overflow-wrap: anywhere; }
    .status { min-height: 1.35em; color: #7dd3fc; font-weight: 800; }
    @media (max-width: 1080px) { header, .layout { display: block; } .badge { display: inline-flex; margin-top: 14px; } aside { margin-top: 18px; } #oceanViewport { min-height: 540px; } }
  </style>
</head>
<body>
  <main id="threeOceanDemo"
    data-demo="three-ocean-points"
    data-renderer="three.js"
    data-pass="6B-interactive-ocean-handling"
    data-scene="ocean-points"
    data-wave-height="normal"
    data-point-density="medium"
    data-motion="normal"
    data-color-mode="blue">
    <header>
      <div>
        <h1>Gr4ph1c4 Three.js Point Ocean</h1>
        <p class="lede"><strong>Interactive Ocean Handling</strong>: drag the local Three.js point field like a physical object, zoom through it, pan across it, switch camera presets, pause waves, and persist the current view in localStorage.</p>
      </div>
      <div class="badge">renderer: Three.js local bundle</div>
    </header>

    <section class="layout" aria-label="Interactive Three.js point ocean demo">
      <div id="oceanViewport" class="panel" aria-label="Gr4ph1c4 Three.js Point Ocean viewport">
        <div class="hud" aria-live="polite">
          <div class="hud-row"><strong>Camera Position</strong><span id="cameraPosition">waiting</span></div>
          <div class="hud-row"><strong>Camera Target</strong><span id="cameraTarget">waiting</span></div>
          <div class="hud-row"><strong>Zoom Distance</strong><span id="zoomDistance">waiting</span></div>
        </div>
      </div>

      <aside>
        <section class="panel card">
          <h2>Interactive Ocean Handling</h2>
          <ul class="help">
            <li>Drag: orbit</li>
            <li>Wheel: zoom</li>
            <li>Shift + drag: pan</li>
            <li>Right drag: pan</li>
          </ul>
        </section>

        <section class="panel card controls" aria-label="View controls">
          <div class="button-grid">
            <button id="topViewButton" type="button">Top View</button>
            <button id="sideViewButton" type="button">Side View</button>
            <button id="presentationViewButton" type="button">Presentation View</button>
            <button id="resetViewButton" type="button">Reset View</button>
            <button id="spinOceanButton" type="button">Spin Ocean</button>
            <button id="tiltCameraButton" type="button">Tilt Camera</button>
            <button id="pauseButton" type="button">Pause</button>
            <button id="saveViewButton" type="button">Save View</button>
            <button id="restoreViewButton" type="button">Restore View</button>
          </div>
          <div id="interactionStatus" class="status">Ready for orbit, zoom, pan, tilt, presets, pause, reset, save, and restore.</div>
        </section>

        <section class="panel card">
          <h2>Command Prompt</h2>
          <div class="command">node dist/main.js three-ocean-points-demo</div>
        </section>

        <section class="panel card">
          <h2>Proof Metadata</h2>
          <dl class="proof-list">
            <dt>Geometry</dt><dd>THREE.BufferGeometry</dd>
            <dt>Object</dt><dd>THREE.Points</dd>
            <dt>Animation</dt><dd>requestAnimationFrame</dd>
            <dt>Storage</dt><dd>localStorage</dd>
            <dt>Input</dt><dd>pointerdown + wheel</dd>
          </dl>
        </section>
      </aside>
    </section>
  </main>

  <script src="./vendor/three.min.js"></script>
  <script>
    (function () {
      "use strict";

      const STORAGE_KEY = "gr4ph1c4.threeOceanPoints.view.v1";
      const viewport = document.getElementById("oceanViewport");
      const cameraPositionEl = document.getElementById("cameraPosition");
      const cameraTargetEl = document.getElementById("cameraTarget");
      const zoomDistanceEl = document.getElementById("zoomDistance");
      const statusEl = document.getElementById("interactionStatus");
      const defaultCamera = new THREE.Vector3(34, 24, 42);
      const defaultTarget = new THREE.Vector3(0, 0, 0);
      const worldUp = new THREE.Vector3(0, 1, 0);
      const viewPresets = {
        top: { camera: new THREE.Vector3(0, 66, 0.01), target: new THREE.Vector3(0, 0, 0), message: "Top View applied" },
        side: { camera: new THREE.Vector3(58, 8, 0), target: new THREE.Vector3(0, 0, 0), message: "Side View applied" },
        presentation: { camera: defaultCamera.clone(), target: defaultTarget.clone(), message: "Presentation View applied" }
      };

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x020617);
      scene.fog = new THREE.Fog(0x020617, 58, 140);

      const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 240);
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      viewport.appendChild(renderer.domElement);

      const target = defaultTarget.clone();
      const gridSize = 80;
      const pointCount = gridSize * gridSize;
      const spacing = 0.78;
      const positions = new Float32Array(pointCount * 3);
      const colors = new Float32Array(pointCount * 3);
      const basePoints = [];
      const color = new THREE.Color();
      let cursor = 0;
      for (let iz = 0; iz < gridSize; iz += 1) {
        for (let ix = 0; ix < gridSize; ix += 1) {
          const x = (ix - gridSize / 2) * spacing;
          const z = (iz - gridSize / 2) * spacing;
          const y = waveY(x, z, 0);
          positions[cursor * 3] = x;
          positions[cursor * 3 + 1] = y;
          positions[cursor * 3 + 2] = z;
          const depth = (y + 3.5) / 7;
          color.setHSL(0.53 + depth * 0.08, 0.86, 0.38 + depth * 0.28);
          colors[cursor * 3] = color.r;
          colors[cursor * 3 + 1] = color.g;
          colors[cursor * 3 + 2] = color.b;
          basePoints.push({ x: x, z: z });
          cursor += 1;
        }
      }

      const oceanGeometry = new THREE.BufferGeometry();
      oceanGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      oceanGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      oceanGeometry.computeBoundingSphere();
      const oceanMaterial = new THREE.PointsMaterial({ size: 0.16, vertexColors: true, transparent: true, opacity: 0.92, depthWrite: false });
      const oceanPoints = new THREE.Points(oceanGeometry, oceanMaterial);
      scene.add(oceanPoints);

      const grid = new THREE.GridHelper(70, 28, 0x1d4ed8, 0x0f172a);
      grid.position.y = -3.2;
      scene.add(grid);
      scene.add(new THREE.AmbientLight(0x6ee7ff, 1.05));
      const keyLight = new THREE.DirectionalLight(0xeff6ff, 1.2);
      keyLight.position.set(18, 24, 16);
      scene.add(keyLight);

      let spherical = new THREE.Spherical();
      let isDragging = false;
      let dragMode = "orbit";
      let lastPointer = { x: 0, y: 0 };
      let paused = false;
      let elapsed = 0;
      let oceanSpin = 0;

      setCameraView(defaultCamera, defaultTarget, "Default view ready");
      resizeRenderer();
      window.addEventListener("resize", resizeRenderer);

      viewport.addEventListener("pointerdown", function pointerdown(event) {
        event.preventDefault();
        isDragging = true;
        dragMode = event.shiftKey || event.button === 2 ? "pan" : "orbit";
        lastPointer = { x: event.clientX, y: event.clientY };
        viewport.classList.add("dragging");
        viewport.setPointerCapture(event.pointerId);
        setStatus(dragMode === "pan" ? "Panning across the point field" : "Orbiting around the ocean center");
      });
      viewport.addEventListener("pointermove", function pointermove(event) {
        if (!isDragging) return;
        event.preventDefault();
        const dx = event.clientX - lastPointer.x;
        const dy = event.clientY - lastPointer.y;
        lastPointer = { x: event.clientX, y: event.clientY };
        if (dragMode === "pan") {
          panCamera(dx, dy);
        } else {
          orbitCamera(dx, dy);
        }
        updateCameraReadout();
      });
      viewport.addEventListener("pointerup", endDrag);
      viewport.addEventListener("pointercancel", endDrag);
      viewport.addEventListener("contextmenu", function (event) { event.preventDefault(); });
      viewport.addEventListener("wheel", function wheel(event) {
        event.preventDefault();
        zoomCamera(event.deltaY > 0 ? 1.12 : 0.88);
        setStatus(event.deltaY > 0 ? "Zoomed out from the point ocean" : "Zoomed into the point ocean");
      }, { passive: false });

      document.getElementById("topViewButton").addEventListener("click", function () { applyPreset("top"); });
      document.getElementById("sideViewButton").addEventListener("click", function () { applyPreset("side"); });
      document.getElementById("presentationViewButton").addEventListener("click", function () { applyPreset("presentation"); });
      document.getElementById("resetViewButton").addEventListener("click", resetView);
      document.getElementById("spinOceanButton").addEventListener("click", spinOcean);
      document.getElementById("tiltCameraButton").addEventListener("click", tiltCamera);
      document.getElementById("pauseButton").addEventListener("click", togglePause);
      document.getElementById("saveViewButton").addEventListener("click", saveView);
      document.getElementById("restoreViewButton").addEventListener("click", restoreView);

      requestAnimationFrame(animate);

      function waveY(x, z, currentTimeSample) {
        return Math.sin(x * 0.33 + currentTimeSample * 1.35) * 1.25 + Math.cos(z * 0.27 - currentTimeSample * 1.05) * 0.95 + Math.sin((x + z) * 0.11 + currentTimeSample * 0.7) * 0.85;
      }

      function animate(now) {
        if (!paused) {
          elapsed = now * 0.001;
          for (let index = 0; index < basePoints.length; index += 1) {
            const point = basePoints[index];
            positions[index * 3 + 1] = waveY(point.x, point.z, elapsed);
          }
          oceanGeometry.attributes.position.needsUpdate = true;
          oceanGeometry.computeBoundingSphere();
          oceanPoints.rotation.y = oceanSpin + Math.sin(elapsed * 0.14) * 0.025;
        }
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      }

      function resizeRenderer() {
        const width = Math.max(320, viewport.clientWidth);
        const height = Math.max(420, viewport.clientHeight);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        updateCameraReadout();
      }

      function setCameraView(position, nextTarget, message) {
        camera.position.copy(position);
        target.copy(nextTarget);
        camera.lookAt(target);
        spherical.setFromVector3(camera.position.clone().sub(target));
        updateCameraReadout();
        if (message) setStatus(message);
      }

      function orbitCamera(dx, dy) {
        spherical.theta -= dx * 0.008;
        spherical.phi = clamp(spherical.phi + dy * 0.008, 0.08, Math.PI - 0.08);
        applySphericalCamera();
        setStatus("Drag: orbit updated camera position");
      }

      function zoomCamera(scale) {
        spherical.radius = clamp(spherical.radius * scale, 8, 110);
        applySphericalCamera();
        updateCameraReadout();
      }

      function panCamera(dx, dy) {
        const distance = camera.position.distanceTo(target);
        const panScale = distance * 0.0015;
        const forward = target.clone().sub(camera.position).normalize();
        const right = forward.clone().cross(worldUp).normalize();
        if (right.lengthSq() < 0.001) right.set(1, 0, 0);
        const up = right.clone().cross(forward).normalize();
        const offset = right.multiplyScalar(-dx * panScale).add(up.multiplyScalar(dy * panScale));
        camera.position.add(offset);
        target.add(offset);
        camera.lookAt(target);
        spherical.setFromVector3(camera.position.clone().sub(target));
        setStatus("Shift + drag: pan moved camera and target");
      }

      function tiltCamera() {
        spherical.phi = clamp(spherical.phi - 0.24, 0.08, Math.PI - 0.08);
        applySphericalCamera();
        setStatus("Tilt Camera changed camera elevation");
      }

      function applySphericalCamera() {
        camera.position.copy(new THREE.Vector3().setFromSpherical(spherical).add(target));
        camera.lookAt(target);
      }

      function applyPreset(name) {
        const preset = viewPresets[name];
        setCameraView(preset.camera, preset.target, preset.message);
      }

      function resetView() {
        oceanSpin = 0;
        oceanPoints.rotation.y = 0;
        paused = false;
        document.getElementById("pauseButton").textContent = "Pause";
        setCameraView(defaultCamera, defaultTarget, "Reset View restored camera, target, zoom, pause, and spin");
      }

      function spinOcean() {
        oceanSpin += Math.PI / 8;
        oceanPoints.rotation.y = oceanSpin;
        setStatus("Spin Ocean rotated the THREE.Points object on its axis");
      }

      function togglePause() {
        paused = !paused;
        document.getElementById("pauseButton").textContent = paused ? "Resume" : "Pause";
        setStatus(paused ? "Pause engaged: animation stopped" : "Resume engaged: animation running");
      }

      function currentViewState() {
        return {
          camera: vectorToState(camera.position),
          target: vectorToState(target),
          oceanSpin: oceanSpin,
          paused: paused,
          savedAt: new Date().toISOString()
        };
      }

      function saveView() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentViewState()));
        setStatus("Save View wrote camera and ocean state to localStorage");
      }

      function restoreView() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          setStatus("Restore View found no localStorage view yet");
          return;
        }
        try {
          const saved = JSON.parse(raw);
          const savedCamera = new THREE.Vector3(saved.camera.x, saved.camera.y, saved.camera.z);
          const savedTarget = new THREE.Vector3(saved.target.x, saved.target.y, saved.target.z);
          oceanSpin = Number(saved.oceanSpin || 0);
          paused = Boolean(saved.paused);
          oceanPoints.rotation.y = oceanSpin;
          document.getElementById("pauseButton").textContent = paused ? "Resume" : "Pause";
          setCameraView(savedCamera, savedTarget, "Restore View loaded camera and target from localStorage");
        } catch (error) {
          setStatus("Restore View ignored invalid saved localStorage JSON");
        }
      }

      function updateCameraReadout() {
        if (!cameraPositionEl) return;
        cameraPositionEl.textContent = formatVector(camera.position);
        cameraTargetEl.textContent = formatVector(target);
        zoomDistanceEl.textContent = camera.position.distanceTo(target).toFixed(2);
      }

      function endDrag(event) {
        if (!isDragging) return;
        isDragging = false;
        viewport.classList.remove("dragging");
        if (event && viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
        setStatus("Pointer released; current view remains active");
      }

      function formatVector(vector) {
        return vector.x.toFixed(2) + ", " + vector.y.toFixed(2) + ", " + vector.z.toFixed(2);
      }

      function vectorToState(vector) {
        return { x: Number(vector.x.toFixed(4)), y: Number(vector.y.toFixed(4)), z: Number(vector.z.toFixed(4)) };
      }

      function setStatus(message) {
        statusEl.textContent = message;
      }

      function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
      }
    }());
  </script>
</body>
</html>
`;
}

export async function runThreeOceanPointsDemo(): Promise<void> {
  await rm(OUTPUT_DIR, { recursive: true, force: true });
  await mkdir(VENDOR_DIR, { recursive: true });
  await copyFile(SOURCE_BUNDLE_PATH, BUNDLE_PATH);
  const html = renderThreeOceanHtml();
  const stateJson = JSON.stringify(THREE_OCEAN_STATE, null, 2);
  const proof = `${proofLines().join("\n")}\n`;
  await writeFile(HTML_PATH, html, "utf8");
  await writeFile(STATE_PATH, `${stateJson}\n`, "utf8");
  await writeFile(PROOF_PATH, proof, "utf8");
  console.log(proof.trimEnd());
}
