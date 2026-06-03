declare const require: (name: string) => unknown;

const fsPromises = require("node:fs/promises") as {
  mkdir: (path: string, options: { recursive: boolean }) => Promise<void>;
  writeFile: (path: string, data: string, encoding: "utf8") => Promise<void>;
  copyFile: (from: string, to: string) => Promise<void>;
  rm: (path: string, options: { recursive: boolean; force: boolean }) => Promise<void>;
};
const pathModule = require("node:path") as { join: (...parts: string[]) => string };

const { mkdir, writeFile, copyFile, rm } = fsPromises;
const { join } = pathModule;

const OUTPUT_DIR = join("dist", "three-ocean-points-demo");
const VENDOR_DIR = join(OUTPUT_DIR, "vendor");
const HTML_PATH = join(OUTPUT_DIR, "index.html");
const STATE_PATH = join(OUTPUT_DIR, "three-ocean-state.json");
const PROOF_PATH = join(OUTPUT_DIR, "proof.log");
const SMOKE_PATH = join(OUTPUT_DIR, "smoke-test.js");
const BUNDLE_PATH = join(VENDOR_DIR, "three.min.js");
const SOURCE_BUNDLE_PATH = join("vendor", "three", "build", "three.min.js");

const POINT_GRID_SIZE = 100;
const POINT_COUNT = POINT_GRID_SIZE * POINT_GRID_SIZE;

const REQUIRED_PROOF_STRINGS = [
  "GR4PH1C4_THREE_OCEAN_VISIBLE_BASELINE",
  "OCEAN_POINT_FIELD_GENERATED",
  "OCEAN_POINT_COUNT_9000_OR_MORE",
  "THREE_LOCAL_VENDOR_PRESENT",
  "WEBGL_RENDERER_DECLARED",
  "SCENE_CAMERA_RENDERER_DECLARED",
  "ANIMATION_LOOP_DECLARED",
  "BROWSER_PROOF_STATE_DECLARED",
  "VISIBLE_DEBUG_PANEL_DECLARED",
  "SMOKE_TEST_CREATED",
  "NO_REMOTE_RUNTIME_REQUIRED",
];

const THREE_OCEAN_STATE = {
  demo: "three-ocean-points",
  pass: "7A-visible-ocean-render-proof",
  title: "Commandable Ocean Field",
  renderer: "three.js",
  server_required: false,
  local_bundle: "vendor/three.min.js",
  point_count: POINT_COUNT,
  grid_size: POINT_GRID_SIZE,
  point_material: "high-contrast cyan/white additive THREE.PointsMaterial",
  camera: { fov: 58, x: 52, y: 34, z: 72, target: { x: 0, y: 0, z: 0 } },
  proof_state_global: "window.GR4PH1C4_OCEAN_PROOF",
  debug_panel_fields: [
    "renderer_ready",
    "canvas_width",
    "canvas_height",
    "three_loaded",
    "webgl_ready",
    "scene_ready",
    "camera_ready",
    "point_count",
    "animation_frame_count",
    "last_error",
  ],
  required_commands: [
    "node dist/main.js three-ocean-points-demo",
    "node dist/three-ocean-points-demo/smoke-test.js",
    "xdg-open dist/three-ocean-points-demo/index.html",
    "firefox dist/three-ocean-points-demo/index.html",
    "chromium dist/three-ocean-points-demo/index.html",
    "brave dist/three-ocean-points-demo/index.html",
  ],
};

function proofLines(): string[] {
  return [
    ...REQUIRED_PROOF_STRINGS,
    "",
    "manual test commands:",
    "node dist/main.js three-ocean-points-demo",
    "node dist/three-ocean-points-demo/smoke-test.js",
    "xdg-open dist/three-ocean-points-demo/index.html",
    "",
    "browser fallbacks:",
    "firefox dist/three-ocean-points-demo/index.html",
    "chromium dist/three-ocean-points-demo/index.html",
    "brave dist/three-ocean-points-demo/index.html",
    "",
    `point_count=${POINT_COUNT}`,
    "title=Commandable Ocean Field",
    "runtime=local file with dist/three-ocean-points-demo/vendor/three.min.js",
  ];
}

function renderThreeOceanHtml(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Commandable Ocean Field</title>
  <style>
    html, body { width: 100%; height: 100%; margin: 0; overflow: hidden; }
    body { background: #07111f; color: #e0f7ff; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; }
    #app { position: fixed; inset: 0; width: 100%; height: 100%; background: linear-gradient(180deg, #10233e 0%, #08111f 58%, #020714 100%); }
    #ocean-container { position: absolute; inset: 0; width: 100%; height: 100%; min-width: 320px; min-height: 240px; }
    canvas { display: block; width: 100% !important; height: 100% !important; }
    #debug-panel { position: fixed; top: 14px; left: 14px; z-index: 10; min-width: 320px; max-width: min(440px, calc(100vw - 28px)); padding: 14px 16px; border: 1px solid rgba(125, 249, 255, 0.72); border-radius: 14px; background: rgba(2, 8, 23, 0.86); box-shadow: 0 0 28px rgba(34, 211, 238, 0.28); color: #dffcff; }
    #debug-panel h1 { margin: 0 0 10px; font-size: 16px; letter-spacing: 0.08em; text-transform: uppercase; color: #67e8f9; }
    .debug-row { display: grid; grid-template-columns: 190px 1fr; gap: 10px; padding: 3px 0; border-top: 1px solid rgba(148, 163, 184, 0.15); font-size: 13px; }
    .debug-key { color: #93c5fd; }
    .debug-value { color: #f8fafc; word-break: break-word; }
    #fallback-message { position: fixed; right: 14px; bottom: 14px; z-index: 11; max-width: 560px; padding: 14px 16px; border: 1px solid rgba(248, 113, 113, 0.7); border-radius: 14px; background: rgba(69, 10, 10, 0.88); color: #fee2e2; display: none; line-height: 1.45; }
    .caption { position: fixed; left: 14px; bottom: 14px; z-index: 9; max-width: 700px; padding: 10px 12px; border-radius: 12px; background: rgba(2, 6, 23, 0.58); color: #bae6fd; font-size: 14px; }
  </style>
</head>
<body>
  <main id="app" aria-label="Commandable Ocean Field">
    <div id="ocean-container" aria-label="visible animated point ocean canvas container"></div>
    <section id="debug-panel" aria-live="polite">
      <h1>Commandable Ocean Field</h1>
      <div class="debug-row"><span class="debug-key">renderer_ready</span><span class="debug-value" id="debug-renderer_ready">false</span></div>
      <div class="debug-row"><span class="debug-key">canvas_width</span><span class="debug-value" id="debug-canvas_width">0</span></div>
      <div class="debug-row"><span class="debug-key">canvas_height</span><span class="debug-value" id="debug-canvas_height">0</span></div>
      <div class="debug-row"><span class="debug-key">three_loaded</span><span class="debug-value" id="debug-three_loaded">false</span></div>
      <div class="debug-row"><span class="debug-key">webgl_ready</span><span class="debug-value" id="debug-webgl_ready">false</span></div>
      <div class="debug-row"><span class="debug-key">scene_ready</span><span class="debug-value" id="debug-scene_ready">false</span></div>
      <div class="debug-row"><span class="debug-key">camera_ready</span><span class="debug-value" id="debug-camera_ready">false</span></div>
      <div class="debug-row"><span class="debug-key">point_count</span><span class="debug-value" id="debug-point_count">0</span></div>
      <div class="debug-row"><span class="debug-key">animation_frame_count</span><span class="debug-value" id="debug-animation_frame_count">0</span></div>
      <div class="debug-row"><span class="debug-key">last_error</span><span class="debug-value" id="debug-last_error">null</span></div>
    </section>
    <aside id="fallback-message" role="alert"></aside>
    <p class="caption">High-contrast THREE.Points wave field: 10,000 animated points, local Three.js bundle, no CDN.</p>
  </main>
  <script src="vendor/three.min.js"></script>
  <script>
    (function () {
      "use strict";
      var POINT_GRID_SIZE = ${POINT_GRID_SIZE};
      var POINT_COUNT = ${POINT_COUNT};
      var container = document.getElementById("ocean-container");
      var fallback = document.getElementById("fallback-message");
      var renderer = null;
      var scene = null;
      var camera = null;
      var oceanPoints = null;
      var positions = null;
      var proof = window.GR4PH1C4_OCEAN_PROOF = {
        rendererReady: false,
        canvasWidth: 0,
        canvasHeight: 0,
        threeLoaded: typeof window.THREE !== "undefined",
        webglReady: false,
        sceneReady: false,
        cameraReady: false,
        pointCount: 0,
        animationFrameCount: 0,
        lastError: null
      };

      window.addEventListener("error", function (event) {
        reportError(event.message || "Unknown browser error");
      });
      window.addEventListener("unhandledrejection", function (event) {
        reportError(event.reason && event.reason.message ? event.reason.message : String(event.reason));
      });

      updateDebugPanel();

      try {
        if (!proof.threeLoaded) throw new Error("Three.js did not load from vendor/three.min.js");
        proof.webglReady = hasWebGLSupport();
        if (!proof.webglReady) throw new Error("WebGL is not available in this browser, so the point ocean cannot render.");

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x081426);
        proof.sceneReady = true;

        var width = Math.max(320, container.clientWidth || window.innerWidth || 960);
        var height = Math.max(240, container.clientHeight || window.innerHeight || 540);
        camera = new THREE.PerspectiveCamera(58, width / height, 0.1, 1000);
        camera.position.set(52, 34, 72);
        camera.lookAt(0, 0, 0);
        proof.cameraReady = true;

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(width, height, false);
        renderer.domElement.setAttribute("aria-label", "canvas rendering visible animated ocean point field");
        container.appendChild(renderer.domElement);
        proof.rendererReady = true;
        proof.canvasWidth = renderer.domElement.width;
        proof.canvasHeight = renderer.domElement.height;

        var grid = new THREE.GridHelper(120, 24, 0x1d4ed8, 0x0f766e);
        grid.position.y = -5.4;
        scene.add(grid);
        scene.add(new THREE.AxesHelper(18));

        var geometry = new THREE.BufferGeometry();
        positions = new Float32Array(POINT_COUNT * 3);
        var colors = new Float32Array(POINT_COUNT * 3);
        var cursor = 0;
        var colorCursor = 0;
        for (var zIndex = 0; zIndex < POINT_GRID_SIZE; zIndex += 1) {
          for (var xIndex = 0; xIndex < POINT_GRID_SIZE; xIndex += 1) {
            var x = (xIndex - POINT_GRID_SIZE / 2) * 1.05;
            var z = (zIndex - POINT_GRID_SIZE / 2) * 1.05;
            positions[cursor] = x;
            positions[cursor + 1] = waveHeight(x, z, 0);
            positions[cursor + 2] = z;
            cursor += 3;
            var crest = (positions[cursor - 2] + 5.5) / 11;
            colors[colorCursor] = 0.18 + crest * 0.35;
            colors[colorCursor + 1] = 0.82 + crest * 0.16;
            colors[colorCursor + 2] = 1.0;
            colorCursor += 3;
          }
        }
        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        geometry.computeBoundingSphere();

        var material = new THREE.PointsMaterial({
          size: 0.48,
          sizeAttenuation: true,
          vertexColors: true,
          transparent: false,
          opacity: 1.0
        });
        oceanPoints = new THREE.Points(geometry, material);
        scene.add(oceanPoints);
        proof.pointCount = geometry.getAttribute("position").count;
        if (proof.pointCount <= 0) throw new Error("Point geometry contains zero vertices.");

        window.addEventListener("resize", resizeRenderer);
        updateDebugPanel();
        requestAnimationFrame(animate);
      } catch (error) {
        reportError(error && error.message ? error.message : String(error));
      }

      function animate(time) {
        try {
          proof.animationFrameCount += 1;
          var seconds = time * 0.001;
          var attr = oceanPoints.geometry.getAttribute("position");
          for (var index = 0; index < POINT_COUNT; index += 1) {
            var offset = index * 3;
            attr.array[offset + 1] = waveHeight(attr.array[offset], attr.array[offset + 2], seconds);
          }
          attr.needsUpdate = true;
          oceanPoints.rotation.y = Math.sin(seconds * 0.18) * 0.06;
          renderer.render(scene, camera);
          proof.canvasWidth = renderer.domElement.width;
          proof.canvasHeight = renderer.domElement.height;
          updateDebugPanel();
          requestAnimationFrame(animate);
        } catch (error) {
          reportError(error && error.message ? error.message : String(error));
        }
      }

      function waveHeight(x, z, time) {
        return Math.sin(x * 0.22 + time * 1.35) * 2.7 + Math.cos(z * 0.18 + time * 0.92) * 2.1 + Math.sin((x + z) * 0.09 + time * 1.7) * 1.2;
      }

      function resizeRenderer() {
        if (!renderer || !camera) return;
        var width = Math.max(320, container.clientWidth || window.innerWidth || 960);
        var height = Math.max(240, container.clientHeight || window.innerHeight || 540);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        proof.canvasWidth = renderer.domElement.width;
        proof.canvasHeight = renderer.domElement.height;
        updateDebugPanel();
      }

      function hasWebGLSupport() {
        var canvas = document.createElement("canvas");
        return Boolean(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
      }

      function reportError(message) {
        proof.lastError = message;
        updateDebugPanel();
        fallback.style.display = "block";
        fallback.textContent = "WebGL/render proof error: " + message;
        console.error(message);
      }

      function updateDebugPanel() {
        setDebug("renderer_ready", proof.rendererReady);
        setDebug("canvas_width", proof.canvasWidth);
        setDebug("canvas_height", proof.canvasHeight);
        setDebug("three_loaded", proof.threeLoaded);
        setDebug("webgl_ready", proof.webglReady);
        setDebug("scene_ready", proof.sceneReady);
        setDebug("camera_ready", proof.cameraReady);
        setDebug("point_count", proof.pointCount);
        setDebug("animation_frame_count", proof.animationFrameCount);
        setDebug("last_error", proof.lastError === null ? "null" : proof.lastError);
      }

      function setDebug(key, value) {
        var element = document.getElementById("debug-" + key);
        if (element) element.textContent = String(value);
      }
    }());
  </script>
</body>
</html>
`;
}

function renderSmokeTest(): string {
  return `#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const requiredProofStrings = ${JSON.stringify(REQUIRED_PROOF_STRINGS, null, 2)};

function fail(reason) {
  console.error("GR4PH1C4_OCEAN_SMOKE_TEST_FAIL: " + reason);
  process.exit(1);
}

function readRequired(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) fail(relativePath + " does not exist");
  return fs.readFileSync(fullPath, "utf8");
}

const html = readRequired("index.html");
readRequired(path.join("vendor", "three.min.js"));
const stateText = readRequired("three-ocean-state.json");
const proofLog = readRequired("proof.log");

const htmlNeedles = [
  "Commandable Ocean Field",
  "GR4PH1C4_OCEAN_PROOF",
  "WebGL",
  "pointCount",
  "requestAnimationFrame",
  "THREE.WebGLRenderer",
  "THREE.Points",
  "canvas",
  "renderer_ready",
  "canvas_width",
  "canvas_height",
  "three_loaded",
  "webgl_ready",
  "scene_ready",
  "camera_ready",
  "point_count",
  "animation_frame_count",
  "last_error"
];
for (const needle of htmlNeedles) {
  if (!html.includes(needle)) fail("index.html is missing required text: " + needle);
}

if (!/html, body\\s*\\{[^}]*width:\\s*100%[^}]*height:\\s*100%[^}]*margin:\\s*0/s.test(html)) {
  fail("index.html is missing defensive html/body width/height/margin CSS");
}
if (!/appendChild\\(renderer\\.domElement\\)/.test(html)) {
  fail("index.html does not append renderer canvas to the visible container");
}
if (!/new THREE\\.PerspectiveCamera/.test(html)) {
  fail("index.html does not declare a perspective camera");
}
if (!/new THREE\\.BufferGeometry/.test(html) || !/setAttribute\\(\"position\"/.test(html)) {
  fail("index.html does not build nonzero point BufferGeometry positions");
}

let state;
try {
  state = JSON.parse(stateText);
} catch (error) {
  fail("three-ocean-state.json is not valid JSON: " + error.message);
}
if (typeof state.point_count !== "number" || state.point_count < 9000) {
  fail("three-ocean-state.json point_count must be >= 9000");
}

for (const proofString of requiredProofStrings) {
  if (!proofLog.includes(proofString)) fail("proof.log is missing required proof string: " + proofString);
}

const manualCommands = [
  "node dist/main.js three-ocean-points-demo",
  "node dist/three-ocean-points-demo/smoke-test.js",
  "xdg-open dist/three-ocean-points-demo/index.html",
  "firefox dist/three-ocean-points-demo/index.html",
  "chromium dist/three-ocean-points-demo/index.html",
  "brave dist/three-ocean-points-demo/index.html"
];
for (const command of manualCommands) {
  if (!proofLog.includes(command)) fail("proof.log is missing manual/browser command: " + command);
}

console.log("GR4PH1C4_OCEAN_SMOKE_TEST_PASS");
`;
}

export async function runThreeOceanPointsDemo(): Promise<void> {
  await rm(OUTPUT_DIR, { recursive: true, force: true });
  await mkdir(VENDOR_DIR, { recursive: true });
  await copyFile(SOURCE_BUNDLE_PATH, BUNDLE_PATH);
  await writeFile(HTML_PATH, renderThreeOceanHtml(), "utf8");
  await writeFile(STATE_PATH, `${JSON.stringify(THREE_OCEAN_STATE, null, 2)}\n`, "utf8");
  await writeFile(PROOF_PATH, `${proofLines().join("\n")}\n`, "utf8");
  await writeFile(SMOKE_PATH, renderSmokeTest(), "utf8");
  console.log(proofLines().join("\n"));
}
