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
const BROWSER_SMOKE_PATH = join(OUTPUT_DIR, "browser-render-smoke-test.js");
const BUNDLE_PATH = join(VENDOR_DIR, "three.min.js");
const SOURCE_BUNDLE_PATH = join("vendor", "three", "build", "three.min.js");

const POINT_GRID_SIZE = 100;
const POINT_COUNT = POINT_GRID_SIZE * POINT_GRID_SIZE;
const PIXEL_SAMPLE_THRESHOLD = 120;

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
  "STATIC_SMOKE_TEST_CREATED",
  "BROWSER_RENDER_SMOKE_TEST_CREATED",
  "CANVAS_PIXEL_READBACK_ENABLED",
  "VISIBLE_PIXEL_SAMPLE_REQUIRED",
  "SCREENSHOT_RENDER_PROOF_REQUIRED",
  "BROWSER_RENDER_PROOF_JSON_REQUIRED",
  "GRID_HELPER_NOT_REQUIRED",
  "OPTIONAL_HELPERS_CANNOT_BLOCK_RENDER",
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
  visible_pixel_sample_threshold: PIXEL_SAMPLE_THRESHOLD,
  three_source: "local vendor/three package with required WebGL ocean API constructors",
  main_render_path_constructors: [
    "WebGLRenderer",
    "Scene",
    "PerspectiveCamera",
    "BufferGeometry",
    "PointsMaterial",
    "Points",
  ],
  optional_three_helpers: ["GridHelper", "Float32BufferAttribute", "LineBasicMaterial", "LineSegments"],
  point_material: "large high-contrast cyan THREE.PointsMaterial against #081426 background",
  camera: { fov: 58, x: 0, y: 42, z: 82, target: { x: 0, y: 0, z: 0 } },
  proof_state_global: "window.GR4PH1C4_OCEAN_PROOF",
  capture_function_global: "window.GR4PH1C4_CAPTURE_RENDER_PROOF",
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
    "first_render_completed",
    "render_loop_alive",
    "visible_pixel_sample_passed",
    "non_background_pixel_count",
    "screenshot_data_url_length",
    "last_error",
  ],
  required_commands: [
    "node dist/main.js three-ocean-points-demo",
    "node dist/three-ocean-points-demo/smoke-test.js",
    "node dist/three-ocean-points-demo/browser-render-smoke-test.js",
    "xdg-open dist/three-ocean-points-demo/index.html",
  ],
};

function proofLines(): string[] {
  return [
    ...REQUIRED_PROOF_STRINGS,
    "",
    "manual and acceptance commands:",
    "node dist/main.js three-ocean-points-demo",
    "node dist/three-ocean-points-demo/smoke-test.js",
    "node dist/three-ocean-points-demo/browser-render-smoke-test.js",
    "xdg-open dist/three-ocean-points-demo/index.html",
    "",
    `point_count=${POINT_COUNT}`,
    `visible_pixel_sample_threshold=${PIXEL_SAMPLE_THRESHOLD}`,
    "main render path: WebGLRenderer, Scene, PerspectiveCamera, BufferGeometry, PointsMaterial, Points",
    "optional helpers: any GridHelper/LineSegments failure is caught and cannot block rendering",
    "browser proof: real browser opens file:// index.html, waits for >=30 frames, readPixels counts non-background pixels, writes browser-render-proof.json and browser-render-proof.png",
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
    body { background: #081426; color: #e0f7ff; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; }
    #app { position: fixed; inset: 0; width: 100%; height: 100%; background: #081426; }
    #ocean-container { position: absolute; inset: 0; width: 100%; height: 100%; min-width: 320px; min-height: 240px; }
    canvas { display: block; width: 100% !important; height: 100% !important; }
    #debug-panel { position: fixed; top: 14px; left: 14px; z-index: 10; min-width: 340px; max-width: min(500px, calc(100vw - 28px)); padding: 14px 16px; border: 1px solid rgba(125, 249, 255, 0.8); border-radius: 14px; background: rgba(2, 8, 23, 0.86); box-shadow: 0 0 28px rgba(34, 211, 238, 0.3); color: #dffcff; }
    #debug-panel h1 { margin: 0 0 10px; font-size: 16px; letter-spacing: 0.08em; text-transform: uppercase; color: #67e8f9; }
    .debug-row { display: grid; grid-template-columns: 220px 1fr; gap: 10px; padding: 3px 0; border-top: 1px solid rgba(148, 163, 184, 0.15); font-size: 13px; }
    .debug-key { color: #93c5fd; }
    .debug-value { color: #f8fafc; word-break: break-word; }
    #fallback-message { position: fixed; right: 14px; bottom: 14px; z-index: 11; max-width: 560px; padding: 14px 16px; border: 1px solid rgba(248, 113, 113, 0.7); border-radius: 14px; background: rgba(69, 10, 10, 0.9); color: #fee2e2; display: none; line-height: 1.45; }
    .caption { position: fixed; left: 14px; bottom: 14px; z-index: 9; max-width: 780px; padding: 10px 12px; border-radius: 12px; background: rgba(2, 6, 23, 0.58); color: #bae6fd; font-size: 14px; }
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
      <div class="debug-row"><span class="debug-key">first_render_completed</span><span class="debug-value" id="debug-first_render_completed">false</span></div>
      <div class="debug-row"><span class="debug-key">render_loop_alive</span><span class="debug-value" id="debug-render_loop_alive">false</span></div>
      <div class="debug-row"><span class="debug-key">visible_pixel_sample_passed</span><span class="debug-value" id="debug-visible_pixel_sample_passed">false</span></div>
      <div class="debug-row"><span class="debug-key">non_background_pixel_count</span><span class="debug-value" id="debug-non_background_pixel_count">0</span></div>
      <div class="debug-row"><span class="debug-key">screenshot_data_url_length</span><span class="debug-value" id="debug-screenshot_data_url_length">0</span></div>
      <div class="debug-row"><span class="debug-key">last_error</span><span class="debug-value" id="debug-last_error">null</span></div>
    </section>
    <aside id="fallback-message" role="alert"></aside>
    <p class="caption">High-contrast THREE.Points wave field: 10,000 animated points, local Three.js bundle, no CDN, browser pixel proof enabled.</p>
  </main>
  <script src="vendor/three.min.js"></script>
  <script>
    (function () {
      "use strict";
      var POINT_GRID_SIZE = ${POINT_GRID_SIZE};
      var POINT_COUNT = ${POINT_COUNT};
      var BACKGROUND_RGB = [8, 20, 38];
      var PIXEL_SAMPLE_THRESHOLD = ${PIXEL_SAMPLE_THRESHOLD};
      var container = document.getElementById("ocean-container");
      var fallback = document.getElementById("fallback-message");
      var renderer = null;
      var scene = null;
      var camera = null;
      var oceanPoints = null;
      var positions = null;
      var lastFrameTimestamp = 0;
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
        firstRenderCompleted: false,
        renderLoopAlive: false,
        visiblePixelSamplePassed: false,
        nonBackgroundPixelCount: 0,
        screenshotDataUrlLength: 0,
        lastError: null
      };

      window.GR4PH1C4_CAPTURE_RENDER_PROOF = async function () {
        var errors = [];
        await waitForFrames(30);
        sampleVisiblePixels();
        proof.screenshotDataUrlLength = safeScreenshotLength();
        proof.renderLoopAlive = proof.animationFrameCount >= 30 && performance.now() - lastFrameTimestamp < 1000;
        if (proof.canvasWidth <= 0) errors.push("canvas width is 0");
        if (proof.canvasHeight <= 0) errors.push("canvas height is 0");
        if (proof.pointCount < 9000) errors.push("pointCount is below 9000");
        if (proof.animationFrameCount < 30) errors.push("animationFrameCount is below 30");
        if (!proof.firstRenderCompleted) errors.push("firstRenderCompleted is false");
        if (!proof.renderLoopAlive) errors.push("renderLoopAlive is false");
        if (proof.nonBackgroundPixelCount < PIXEL_SAMPLE_THRESHOLD) errors.push("nonBackgroundPixelCount is below threshold " + PIXEL_SAMPLE_THRESHOLD);
        if (!proof.visiblePixelSamplePassed) errors.push("visiblePixelSamplePassed is false");
        if (proof.lastError && /fatal|render|webgl|error/i.test(proof.lastError)) errors.push("lastError contains a fatal render error: " + proof.lastError);
        updateDebugPanel();
        return {
          ok: errors.length === 0,
          canvasWidth: proof.canvasWidth,
          canvasHeight: proof.canvasHeight,
          pointCount: proof.pointCount,
          animationFrameCount: proof.animationFrameCount,
          firstRenderCompleted: proof.firstRenderCompleted,
          renderLoopAlive: proof.renderLoopAlive,
          nonBackgroundPixelCount: proof.nonBackgroundPixelCount,
          visiblePixelSamplePassed: proof.visiblePixelSamplePassed,
          screenshotDataUrlLength: proof.screenshotDataUrlLength,
          lastError: proof.lastError,
          errors: errors
        };
      };

      window.addEventListener("error", function (event) { reportError(event.message || "Unknown browser error"); });
      window.addEventListener("unhandledrejection", function (event) { reportError(event.reason && event.reason.message ? event.reason.message : String(event.reason)); });

      updateDebugPanel();
      initializeOcean();

      function initializeOcean() {
        if (!proof.threeLoaded) return failRender("Three.js did not load from vendor/three.min.js");
        verifyMainRenderConstructors();
        proof.webglReady = hasWebGLSupport();
        if (!proof.webglReady) return failRender("WebGL is not available in this browser, so the point ocean cannot render.");

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x081426);
        proof.sceneReady = true;

        var width = Math.max(320, container.clientWidth || window.innerWidth || 960);
        var height = Math.max(240, container.clientHeight || window.innerHeight || 540);
        camera = new THREE.PerspectiveCamera(58, width / height, 0.1, 1000);
        camera.position.set(0, 42, 82);
        camera.lookAt(0, 0, 0);
        proof.cameraReady = true;

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance", preserveDrawingBuffer: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(width, height, false);
        renderer.domElement.setAttribute("aria-label", "canvas rendering visible animated ocean point field");
        container.appendChild(renderer.domElement);
        proof.rendererReady = true;
        proof.canvasWidth = renderer.domElement.width;
        proof.canvasHeight = renderer.domElement.height;

        var geometry = new THREE.BufferGeometry();
        positions = new Float32Array(POINT_COUNT * 3);
        var cursor = 0;
        for (var zIndex = 0; zIndex < POINT_GRID_SIZE; zIndex += 1) {
          for (var xIndex = 0; xIndex < POINT_GRID_SIZE; xIndex += 1) {
            var x = (xIndex - (POINT_GRID_SIZE - 1) / 2) * 1.0;
            var z = (zIndex - (POINT_GRID_SIZE - 1) / 2) * 1.0;
            positions[cursor] = x;
            positions[cursor + 1] = waveHeight(x, z, 0);
            positions[cursor + 2] = z;
            cursor += 3;
          }
        }
        geometry.setAttribute("position", makeFloat32Attribute(positions, 3));
        if (typeof geometry.computeBoundingSphere === "function") geometry.computeBoundingSphere();

        var material = new THREE.PointsMaterial({
          color: 0x7df9ff,
          size: 1.9,
          sizeAttenuation: true,
          transparent: false,
          opacity: 1.0
        });
        oceanPoints = new THREE.Points(geometry, material);
        scene.add(oceanPoints);
        proof.pointCount = getGeometryAttribute(geometry, "position").count;
        if (proof.pointCount < 9000) return failRender("Point geometry contains fewer than 9000 vertices.");

        addOptionalGrid(scene, THREE);
        window.addEventListener("resize", resizeRenderer);
        updateDebugPanel();
        requestAnimationFrame(animate);
      }

      function animate(time) {
        try {
          proof.animationFrameCount += 1;
          lastFrameTimestamp = performance.now();
          proof.renderLoopAlive = true;
          var seconds = time * 0.001;
          var attr = getGeometryAttribute(oceanPoints.geometry, "position");
          for (var index = 0; index < POINT_COUNT; index += 1) {
            var offset = index * 3;
            attr.array[offset + 1] = waveHeight(attr.array[offset], attr.array[offset + 2], seconds);
          }
          attr.needsUpdate = true;
          oceanPoints.rotation.y = Math.sin(seconds * 0.18) * 0.04;
          renderer.render(scene, camera);
          proof.firstRenderCompleted = true;
          proof.canvasWidth = renderer.domElement.width;
          proof.canvasHeight = renderer.domElement.height;
          if (proof.animationFrameCount === 1 || proof.animationFrameCount % 15 === 0) sampleVisiblePixels();
          updateDebugPanel();
          requestAnimationFrame(animate);
        } catch (error) {
          failRender(error && error.message ? error.message : String(error));
        }
      }

      function verifyMainRenderConstructors() {
        var requiredConstructors = ["WebGLRenderer", "Scene", "PerspectiveCamera", "BufferGeometry", "PointsMaterial", "Points"];
        var missing = requiredConstructors.filter(function (name) { return typeof THREE[name] !== "function"; });
        if (missing.length > 0) failRender("Three.js vendor/three.min.js is missing main render constructor(s): " + missing.join(", "));
      }

      function addOptionalGrid(scene, THREE) {
        try {
          if (typeof THREE.GridHelper !== "function" || typeof THREE.LineSegments !== "function" || typeof THREE.LineBasicMaterial !== "function") return null;
          var grid = new THREE.GridHelper(110, 22, 0x1d4ed8, 0x0f766e);
          grid.position.y = -5.4;
          scene.add(grid);
          return grid;
        } catch (error) {
          console.warn("Optional GridHelper failed and ocean render will continue:", error);
          return null;
        }
      }

      function makeFloat32Attribute(array, itemSize) {
        if (typeof THREE.Float32BufferAttribute === "function") return new THREE.Float32BufferAttribute(array, itemSize);
        return { array: array, itemSize: itemSize, count: array.length / itemSize, needsUpdate: true };
      }

      function getGeometryAttribute(geometry, name) {
        if (typeof geometry.getAttribute === "function") return geometry.getAttribute(name);
        return geometry.attributes[name];
      }

      function sampleVisiblePixels() {
        if (!renderer || !renderer.domElement) return 0;
        var gl = renderer.getContext ? renderer.getContext() : renderer.gl;
        var width = renderer.domElement.width;
        var height = renderer.domElement.height;
        proof.canvasWidth = width;
        proof.canvasHeight = height;
        if (!gl || width <= 0 || height <= 0) return 0;
        var sampleWidth = Math.min(240, width);
        var sampleHeight = Math.min(160, height);
        var x = Math.max(0, Math.floor((width - sampleWidth) / 2));
        var y = Math.max(0, Math.floor((height - sampleHeight) / 2));
        var pixels = new Uint8Array(sampleWidth * sampleHeight * 4);
        gl.readPixels(x, y, sampleWidth, sampleHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        var nonBackground = 0;
        for (var index = 0; index < pixels.length; index += 4) {
          var dr = Math.abs(pixels[index] - BACKGROUND_RGB[0]);
          var dg = Math.abs(pixels[index + 1] - BACKGROUND_RGB[1]);
          var db = Math.abs(pixels[index + 2] - BACKGROUND_RGB[2]);
          if (pixels[index + 3] > 0 && dr + dg + db > 35) nonBackground += 1;
        }
        proof.nonBackgroundPixelCount = nonBackground;
        proof.visiblePixelSamplePassed = nonBackground >= PIXEL_SAMPLE_THRESHOLD;
        return nonBackground;
      }

      function waitForFrames(minFrames) {
        return new Promise(function (resolve) {
          function check() {
            if (proof.animationFrameCount >= minFrames) resolve();
            else requestAnimationFrame(check);
          }
          check();
        });
      }

      function safeScreenshotLength() {
        try { return renderer && renderer.domElement ? renderer.domElement.toDataURL("image/png").length : 0; }
        catch (error) { reportError("Canvas screenshot readback failed: " + (error && error.message ? error.message : String(error))); return 0; }
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

      function failRender(message) {
        reportError(message);
        throw new Error(message);
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
        setDebug("first_render_completed", proof.firstRenderCompleted);
        setDebug("render_loop_alive", proof.renderLoopAlive);
        setDebug("visible_pixel_sample_passed", proof.visiblePixelSamplePassed);
        setDebug("non_background_pixel_count", proof.nonBackgroundPixelCount);
        setDebug("screenshot_data_url_length", proof.screenshotDataUrlLength);
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
  console.error("GR4PH1C4_OCEAN_STATIC_SMOKE_TEST_FAIL: " + reason);
  process.exit(1);
}

function readRequired(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) fail(relativePath + " does not exist");
  return fs.readFileSync(fullPath, "utf8");
}

const html = readRequired("index.html");
const vendor = readRequired(path.join("vendor", "three.min.js"));
const stateText = readRequired("three-ocean-state.json");
const proofLog = readRequired("proof.log");
readRequired("browser-render-smoke-test.js");

const htmlNeedles = [
  "Commandable Ocean Field",
  "GR4PH1C4_OCEAN_PROOF",
  "GR4PH1C4_CAPTURE_RENDER_PROOF",
  "visiblePixelSamplePassed",
  "nonBackgroundPixelCount",
  "screenshotDataUrlLength",
  "firstRenderCompleted",
  "renderLoopAlive",
  "readPixels",
  "THREE.WebGLRenderer",
  "THREE.Scene",
  "THREE.PerspectiveCamera",
  "THREE.BufferGeometry",
  "THREE.PointsMaterial",
  "THREE.Points",
  "requestAnimationFrame",
  "visible_pixel_sample_passed",
  "non_background_pixel_count",
  "screenshot_data_url_length",
  "last_error"
];
for (const needle of htmlNeedles) if (!html.includes(needle)) fail("index.html is missing required text: " + needle);

for (const constructorName of ["WebGLRenderer", "Scene", "PerspectiveCamera", "BufferGeometry", "PointsMaterial", "Points"]) {
  if (!vendor.includes(constructorName + ":")) fail("vendor three bundle does not export main render constructor: " + constructorName);
}
if (!html.includes("try {") || !html.includes("THREE.GridHelper") || !html.includes("catch (error)")) fail("GridHelper must be optional and catch-wrapped");
if (html.includes("https://") || html.includes("http://")) fail("index.html must not use a remote runtime");
if (!html.includes("var POINT_COUNT = 10000")) fail("index.html must declare 10000 points");
if (!html.includes("size: 1.9")) fail("points must be large enough for immediate visibility");

let state;
try { state = JSON.parse(stateText); } catch (error) { fail("three-ocean-state.json is not valid JSON: " + error.message); }
if (state.point_count < 9000) fail("three-ocean-state.json point_count must be >= 9000");
if (state.proof_state_global !== "window.GR4PH1C4_OCEAN_PROOF") fail("state proof global mismatch");

for (const proofString of requiredProofStrings) if (!proofLog.includes(proofString)) fail("proof.log is missing required proof string: " + proofString);
for (const command of ["node dist/main.js three-ocean-points-demo", "node dist/three-ocean-points-demo/smoke-test.js", "node dist/three-ocean-points-demo/browser-render-smoke-test.js", "xdg-open dist/three-ocean-points-demo/index.html"]) {
  if (!proofLog.includes(command)) fail("proof.log is missing command: " + command);
}

console.log("GR4PH1C4_OCEAN_STATIC_SMOKE_TEST_PASS");
`;
}

function renderBrowserSmokeTest(): string {
  return `#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const root = __dirname;
const htmlPath = path.join(root, "index.html");
const proofJsonPath = path.join(root, "browser-render-proof.json");
const screenshotPath = path.join(root, "browser-render-proof.png");
const threshold = ${PIXEL_SAMPLE_THRESHOLD};

function fail(reason, detail) {
  if (detail) console.error(detail);
  console.error("GR4PH1C4_BROWSER_RENDER_SMOKE_TEST_FAIL: " + reason);
  process.exit(1);
}

function loadPlaywright() {
  try { return require("playwright"); }
  catch (error) {
    fail("Playwright is not installed. Run npm install so devDependencies are present.", error && error.stack ? error.stack : String(error));
  }
}

function systemBrowserExecutable() {
  const candidates = process.platform === "win32"
    ? []
    : ["chromium", "chromium-browser", "google-chrome", "google-chrome-stable", "microsoft-edge", "msedge"];
  for (const candidate of candidates) {
    try { return execFileSync("/bin/sh", ["-lc", "command -v " + candidate], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); }
    catch (_) {}
  }
  return undefined;
}

async function main() {
  if (!fs.existsSync(htmlPath)) fail("index.html does not exist at " + htmlPath);
  const { chromium } = loadPlaywright();
  const executablePath = process.env.GR4PH1C4_BROWSER_EXECUTABLE || systemBrowserExecutable();
  const launchOptions = {
    headless: true,
    args: ["--allow-file-access-from-files", "--ignore-gpu-blocklist", "--enable-webgl", "--use-gl=swiftshader", "--no-sandbox"]
  };
  if (executablePath) launchOptions.executablePath = executablePath;

  let browser;
  try {
    browser = await chromium.launch(launchOptions);
  } catch (firstError) {
    if (!executablePath) {
      try {
        console.error("Chromium launch failed; attempting Playwright Chromium browser install before retrying.");
        execFileSync(process.platform === "win32" ? "npx.cmd" : "npx", ["playwright", "install", "chromium"], { stdio: "inherit" });
        browser = await chromium.launch(launchOptions);
      } catch (installOrRetryError) {
        fail("Could not launch a real Chromium browser after Playwright install attempt. Run: npx playwright install chromium", (firstError && firstError.stack ? firstError.stack : String(firstError)) + "\\n" + (installOrRetryError && installOrRetryError.stack ? installOrRetryError.stack : String(installOrRetryError)));
      }
    } else {
      fail("Could not launch a real Chromium browser at " + executablePath, firstError && firstError.stack ? firstError.stack : String(firstError));
    }
  }

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  const consoleMessages = [];
  const pageErrors = [];
  page.on("console", message => consoleMessages.push(message.type() + ": " + message.text()));
  page.on("pageerror", error => pageErrors.push(error.message));

  try {
    await page.goto("file://" + htmlPath, { waitUntil: "load", timeout: 30000 });
    await page.waitForFunction(() => Boolean(window.GR4PH1C4_OCEAN_PROOF), null, { timeout: 15000 });
    await page.waitForFunction(() => window.GR4PH1C4_OCEAN_PROOF.animationFrameCount >= 30, null, { timeout: 15000 });
    const proof = await page.evaluate(async () => window.GR4PH1C4_CAPTURE_RENDER_PROOF());
    const errors = Array.isArray(proof.errors) ? proof.errors.slice() : [];
    if (proof.canvasWidth <= 0) errors.push("canvasWidth <= 0");
    if (proof.canvasHeight <= 0) errors.push("canvasHeight <= 0");
    if (proof.pointCount < 9000) errors.push("pointCount < 9000");
    if (proof.renderLoopAlive !== true) errors.push("renderLoopAlive !== true");
    if (proof.firstRenderCompleted !== true) errors.push("firstRenderCompleted !== true");
    if (proof.visiblePixelSamplePassed !== true) errors.push("visiblePixelSamplePassed !== true");
    if (proof.nonBackgroundPixelCount < threshold) errors.push("nonBackgroundPixelCount < " + threshold);
    if (proof.lastError !== null) errors.push("lastError was " + proof.lastError);
    if (pageErrors.length > 0) errors.push("page errors: " + pageErrors.join(" | "));

    const output = {
      ...proof,
      ok: errors.length === 0,
      threshold,
      htmlPath,
      screenshotPath,
      consoleMessages,
      pageErrors,
      capturedAt: new Date().toISOString()
    };
    await page.screenshot({ path: screenshotPath, fullPage: true });
    fs.writeFileSync(proofJsonPath, JSON.stringify(output, null, 2) + "\\n", "utf8");
    if (errors.length > 0) fail(errors.join("; "), JSON.stringify(output, null, 2));
    console.log("GR4PH1C4_BROWSER_RENDER_SMOKE_TEST_PASS");
  } finally {
    await browser.close();
  }
}

main().catch(error => fail(error && error.message ? error.message : String(error), error && error.stack ? error.stack : undefined));
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
  await writeFile(BROWSER_SMOKE_PATH, renderBrowserSmokeTest(), "utf8");
  console.log(proofLines().join("\n"));
}
