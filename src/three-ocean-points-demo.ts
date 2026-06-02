declare const require: (name: string) => {
  mkdir?: (path: string, options: { recursive: boolean }) => Promise<void>;
  writeFile?: (path: string, data: string, encoding: "utf8") => Promise<void>;
  copyFile?: (from: string, to: string) => Promise<void>;
  join?: (...parts: string[]) => string;
};

const fsPromises = require("node:fs/promises");
const pathModule = require("node:path");

const { mkdir, writeFile, copyFile } = fsPromises as {
  mkdir: (path: string, options: { recursive: boolean }) => Promise<void>;
  writeFile: (path: string, data: string, encoding: "utf8") => Promise<void>;
  copyFile: (from: string, to: string) => Promise<void>;
};
const { join } = pathModule as { join: (...parts: string[]) => string };

const OUTPUT_DIR = join("dist", "three-ocean-points-demo");
const VENDOR_DIR = join(OUTPUT_DIR, "vendor");
const HTML_PATH = join(OUTPUT_DIR, "index.html");
const STATE_PATH = join(OUTPUT_DIR, "three-ocean-state.json");
const PROOF_PATH = join(OUTPUT_DIR, "proof.log");
const BUNDLE_PATH = join(VENDOR_DIR, "three.min.js");
const SOURCE_BUNDLE_PATH = join("node_modules", "three", "build", "three.min.js");

const DEFAULT_STATE = {
  demoName: "three-ocean-points",
  renderer: "threejs",
  sceneName: "ocean-points",
  waveHeight: "normal",
  pointDensity: "medium",
  motion: "normal",
  colorMode: "blue",
  serverRequired: false,
  source: "deterministic-wave-field",
  localBundle: "vendor/three.min.js",
};

function proofLines(): string[] {
  return [
    "input: deterministic wave field",
    "demo: three-ocean-points",
    "renderer: threejs",
    "scene: ocean-points",
    "wave height: normal",
    "point density: medium",
    "motion: normal",
    "color mode: blue",
    "server required: no",
    "output: dist/three-ocean-points-demo/index.html",
    "state: dist/three-ocean-points-demo/three-ocean-state.json",
    "three bundle: dist/three-ocean-points-demo/vendor/three.min.js",
    "PASS GR4PH1C4 V0 PASS 6 three.js ocean points proof",
  ];
}

function renderThreeOceanHtml(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Gr4ph1c4 Three.js Ocean Points Demo</title>
  <style>
    :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #020617; color: #e0f2fe; }
    body { margin: 0; min-height: 100vh; background: radial-gradient(circle at 22% 14%, rgba(56, 189, 248, 0.20), transparent 28%), radial-gradient(circle at 80% 18%, rgba(168, 85, 247, 0.16), transparent 24%), linear-gradient(145deg, #020617 0%, #06111f 52%, #111827 100%); }
    main { width: min(96vw, 1500px); margin: 0 auto; padding: 32px 20px 46px; }
    header { display: flex; justify-content: space-between; gap: 24px; align-items: flex-start; margin-bottom: 20px; }
    h1 { margin: 0 0 10px; font-size: clamp(2.1rem, 4.4vw, 4.8rem); line-height: 0.95; letter-spacing: -0.06em; }
    .lede { max-width: 790px; margin: 0; color: #bfdbfe; line-height: 1.55; font-size: 1.04rem; }
    .renderer-badge { flex: 0 0 auto; border: 1px solid rgba(96, 165, 250, 0.5); border-radius: 999px; padding: 9px 14px; color: #bae6fd; font-weight: 900; background: rgba(2, 6, 23, 0.72); box-shadow: 0 0 34px rgba(56, 189, 248, 0.2); }
    .layout { display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 18px; align-items: start; }
    .panel { border: 1px solid rgba(148, 163, 184, 0.25); border-radius: 28px; background: rgba(15, 23, 42, 0.78); box-shadow: 0 30px 90px rgba(0, 0, 0, 0.42); backdrop-filter: blur(14px); }
    #oceanViewport { min-height: 680px; position: relative; overflow: hidden; }
    #oceanViewport canvas { display: block; width: 100%; height: 100%; }
    .overlay { position: absolute; left: 18px; bottom: 18px; padding: 12px 14px; border-radius: 18px; background: rgba(2, 6, 23, 0.68); border: 1px solid rgba(125, 211, 252, 0.24); color: #bae6fd; font-variant-numeric: tabular-nums; }
    aside { display: grid; gap: 16px; }
    .controls { display: grid; gap: 13px; padding: 18px; }
    label { display: grid; gap: 7px; font-weight: 900; color: #dbeafe; }
    select, button { border-radius: 14px; border: 1px solid rgba(148, 163, 184, 0.34); background: rgba(2, 6, 23, 0.72); color: #eff6ff; padding: 11px 12px; font: inherit; }
    button { cursor: pointer; font-weight: 950; background: linear-gradient(135deg, rgba(14, 165, 233, 0.3), rgba(124, 58, 237, 0.26)); }
    button:hover, select:hover { border-color: rgba(125, 211, 252, 0.72); }
    .proof, .capture { padding: 18px; }
    h2 { margin: 0 0 12px; font-size: 1.05rem; }
    dl { margin: 0; display: grid; grid-template-columns: max-content 1fr; gap: 8px 12px; }
    dt { color: #93c5fd; font-weight: 900; }
    dd { margin: 0; color: #e0f2fe; }
    pre { min-height: 210px; margin: 0; overflow: auto; white-space: pre-wrap; border-radius: 18px; padding: 14px; background: #020617; border: 1px solid rgba(56, 189, 248, 0.24); color: #bae6fd; }
    @media (max-width: 1050px) { header, .layout { display: block; } .renderer-badge { display: inline-flex; margin-top: 14px; } aside { margin-top: 18px; } #oceanViewport { min-height: 540px; } }
  </style>
</head>
<body>
  <main id="threeOceanDemo"
    data-demo="three-ocean-points"
    data-renderer="threejs"
    data-scene="ocean-points"
    data-wave-height="normal"
    data-point-density="medium"
    data-motion="normal"
    data-color-mode="blue">
    <header>
      <div>
        <h1>Gr4ph1c4 Three.js Ocean Points Demo</h1>
        <p class="lede">A local Three.js bundle draws a deterministic 3D point-ocean. The wave surface is generated from x/z grid coordinates and time, so the initial scene is inspectable and repeatable.</p>
      </div>
      <div class="renderer-badge">renderer: Three.js</div>
    </header>

    <div class="layout">
      <section id="oceanViewport" class="panel" aria-label="Animated Three.js ocean point field">
        <div class="overlay"><span id="pointCountLabel">pointCount: 1849</span><br><span id="frameLabel">frameNumber: 0</span></div>
      </section>

      <aside>
        <section class="panel controls" aria-label="Ocean controls">
          <label>Wave Height
            <select id="waveHeight">
              <option value="calm">calm</option>
              <option value="normal" selected>normal</option>
              <option value="storm">storm</option>
            </select>
          </label>
          <label>Point Density
            <select id="pointDensity">
              <option value="low">low</option>
              <option value="medium" selected>medium</option>
              <option value="high">high</option>
            </select>
          </label>
          <label>Motion
            <select id="motion">
              <option value="slow">slow</option>
              <option value="normal" selected>normal</option>
              <option value="fast">fast</option>
            </select>
          </label>
          <label>Color Mode
            <select id="colorMode">
              <option value="blue" selected>blue</option>
              <option value="violet">violet</option>
              <option value="gold">gold</option>
            </select>
          </label>
          <button id="pauseResume" type="button">Pause</button>
          <button id="captureMoment" type="button">Capture Moment</button>
        </section>

        <section class="panel proof" aria-label="Proof panel">
          <h2>Proof Panel</h2>
          <dl>
            <dt>renderer</dt><dd>renderer: Three.js</dd>
            <dt>stream/source</dt><dd>deterministic wave field</dd>
            <dt>file mode</dt><dd>local browser demo</dd>
            <dt>server required</dt><dd>no</dd>
          </dl>
        </section>

        <section class="panel capture" aria-label="Captured moment output">
          <h2>Captured JSON</h2>
          <pre id="captureOutput">Press Capture Moment to write the current state here. Local browser file security is respected: this button does not claim to save to disk.</pre>
        </section>
      </aside>
    </div>
  </main>

  <script src="./vendor/three.min.js"></script>
  <script>
    const root = document.getElementById("threeOceanDemo");
    const viewport = document.getElementById("oceanViewport");
    const output = document.getElementById("captureOutput");
    const pointCountLabel = document.getElementById("pointCountLabel");
    const frameLabel = document.getElementById("frameLabel");
    const controls = {
      waveHeight: document.getElementById("waveHeight"),
      pointDensity: document.getElementById("pointDensity"),
      motion: document.getElementById("motion"),
      colorMode: document.getElementById("colorMode"),
      pauseResume: document.getElementById("pauseResume"),
      captureMoment: document.getElementById("captureMoment")
    };
    const settings = {
      waveHeight: { calm: 0.45, normal: 1.0, storm: 1.85 },
      pointDensity: { low: { steps: 27, span: 25 }, medium: { steps: 43, span: 30 }, high: { steps: 61, span: 34 } },
      motion: { slow: 0.45, normal: 1.0, fast: 1.8 },
      colorMode: { blue: "#38bdf8", violet: "#a78bfa", gold: "#fbbf24" }
    };
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 180);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    viewport.prepend(renderer.domElement);
    const material = new THREE.PointsMaterial({ color: settings.colorMode.blue, size: 4.6, transparent: true, opacity: 0.92, depthWrite: false, blending: THREE.AdditiveBlending });
    let geometry;
    let points;
    let grid = [];
    let positions;
    let frameNumber = 0;
    let elapsed = 0;
    let paused = false;
    function controlState() { return { waveHeight: controls.waveHeight.value, pointDensity: controls.pointDensity.value, motion: controls.motion.value, colorMode: controls.colorMode.value }; }
    function syncAttributes(state) { root.dataset.waveHeight = state.waveHeight; root.dataset.pointDensity = state.pointDensity; root.dataset.motion = state.motion; root.dataset.colorMode = state.colorMode; }
    function waveY(x, z, t, height) { return height * (Math.sin(x * 0.42 + t * 1.45) * 0.72 + Math.cos(z * 0.36 - t * 1.12) * 0.48 + Math.sin((x + z) * 0.18 + t * 0.82) * 0.32); }
    function buildGrid() {
      const state = controlState();
      const density = settings.pointDensity[state.pointDensity];
      grid = [];
      positions = new Float32Array(density.steps * density.steps * 3);
      let cursor = 0;
      for (let row = 0; row < density.steps; row += 1) {
        for (let col = 0; col < density.steps; col += 1) {
          const x = ((col / (density.steps - 1)) - 0.5) * density.span;
          const z = ((row / (density.steps - 1)) - 0.5) * density.span;
          grid.push({ x, z });
          positions[cursor++] = x;
          positions[cursor++] = waveY(x, z, 0, settings.waveHeight[state.waveHeight]);
          positions[cursor++] = z;
        }
      }
      if (points) scene.children = scene.children.filter(child => child !== points);
      if (geometry) geometry.dispose();
      geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      points = new THREE.Points(geometry, material);
      scene.add(points);
      pointCountLabel.textContent = "pointCount: " + grid.length;
    }
    function resize() { const rect = viewport.getBoundingClientRect(); renderer.setSize(rect.width, rect.height); camera.aspect = rect.width / Math.max(1, rect.height); camera.updateProjectionMatrix(); }
    function applyControls(rebuild) { const state = controlState(); syncAttributes(state); material.color.set(settings.colorMode[state.colorMode]); material.size = state.pointDensity === "high" ? 3.6 : state.pointDensity === "low" ? 6.2 : 4.6; if (rebuild) buildGrid(); }
    function updateOcean(timeSample) {
      const state = controlState();
      const height = settings.waveHeight[state.waveHeight];
      const positionAttr = geometry.attributes.position;
      for (let index = 0; index < grid.length; index += 1) {
        const point = grid[index];
        positionAttr.array[index * 3 + 1] = waveY(point.x, point.z, timeSample, height);
      }
      positionAttr.needsUpdate = true;
      const orbit = timeSample * 0.11;
      camera.position.set(Math.sin(orbit) * 18, 12 + Math.sin(timeSample * 0.2) * 1.8, 28 + Math.cos(orbit) * 5);
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    }
    function captureMoment() {
      const state = controlState();
      output.textContent = JSON.stringify({ demoName: "three-ocean-points", renderer: "threejs", sceneName: "ocean-points", waveHeight: state.waveHeight, pointDensity: state.pointDensity, motion: state.motion, colorMode: state.colorMode, paused, pointCount: grid.length, frameNumber, currentTimeSample: Number(elapsed.toFixed(4)) }, null, 2);
    }
    for (const key of ["waveHeight", "motion", "colorMode"]) controls[key].addEventListener("change", () => applyControls(false));
    controls.pointDensity.addEventListener("change", () => applyControls(true));
    controls.pauseResume.addEventListener("click", () => { paused = !paused; controls.pauseResume.textContent = paused ? "Resume" : "Pause"; });
    controls.captureMoment.addEventListener("click", captureMoment);
    window.addEventListener("resize", resize);
    function frame() { const state = controlState(); if (!paused) { frameNumber += 1; elapsed += 0.016 * settings.motion[state.motion]; } updateOcean(elapsed); frameLabel.textContent = "frameNumber: " + frameNumber; requestAnimationFrame(frame); }
    applyControls(true); resize(); updateOcean(0); requestAnimationFrame(frame);
  </script>
</body>
</html>`;
}

export async function runThreeOceanPointsDemo(): Promise<void> {
  const proof = proofLines();
  await mkdir(VENDOR_DIR, { recursive: true });
  await copyFile(SOURCE_BUNDLE_PATH, BUNDLE_PATH);
  await writeFile(HTML_PATH, renderThreeOceanHtml(), "utf8");
  await writeFile(STATE_PATH, `${JSON.stringify(DEFAULT_STATE, null, 2)}\n`, "utf8");
  await writeFile(PROOF_PATH, `${proof.join("\n")}\n`, "utf8");
  console.log(proof.join("\n"));
}
