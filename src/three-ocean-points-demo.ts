declare const require: (name: string) => unknown;

import { defaultOceanColorControls, OceanColorControls } from "./color-controls";

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
  "GR4PH1C4_THREE_OCEAN_HAND_CONTROLS",
  "OCEAN_POINT_FIELD_GENERATED",
  "OCEAN_POINT_COUNT_9000_OR_MORE",
  "THREE_LOCAL_VENDOR_PRESENT",
  "WEBGL_RENDERER_DECLARED",
  "SCENE_CAMERA_RENDERER_DECLARED",
  "ANIMATION_LOOP_DECLARED",
  "BROWSER_PROOF_STATE_DECLARED",
  "VISIBLE_DEBUG_PANEL_DECLARED",
  "VISIBLE_CONTROL_PANEL_DECLARED",
  "STATIC_SMOKE_TEST_CREATED",
  "BROWSER_RENDER_SMOKE_TEST_CREATED",
  "CANVAS_PIXEL_READBACK_ENABLED",
  "VISIBLE_PIXEL_SAMPLE_REQUIRED",
  "SCREENSHOT_RENDER_PROOF_REQUIRED",
  "BROWSER_RENDER_PROOF_JSON_REQUIRED",
  "BROWSER_CONTROL_PROOF_REQUIRED",
  "BROWSER_COLOR_CONTROL_PROOF_REQUIRED",
  "BROWSER_WINDOW_MINIMIZE_PROOF_REQUIRED",
  "GRID_HELPER_NOT_USED",
  "OPTIONAL_HELPERS_CANNOT_BLOCK_RENDER",
  "NO_REMOTE_RUNTIME_REQUIRED",
];

const DEBUG_PANEL_FIELDS = [
  "color_background",
  "color_graph_lines",
  "color_axis_numbers",
  "color_points",
  "color_data_lines",
  "color_panel_accent",
  "color_text",
  "colors_json",
  "color_source_background",
  "color_source_graph_lines",
  "color_source_axis_numbers",
  "color_source_points",
  "color_source_data_lines",
  "color_source_panel_accent",
  "color_source_text",
  "window_control_panel_minimized",
  "window_debug_panel_minimized",
  "windows_minimized_json",
  "renderer_ready",
  "canvas_width",
  "canvas_height",
  "three_loaded",
  "webgl_ready",
  "scene_ready",
  "camera_ready",
  "three_capabilities",
  "point_count",
  "animation_frame_count",
  "first_render_completed",
  "render_loop_alive",
  "visible_pixel_sample_passed",
  "non_background_pixel_count",
  "screenshot_data_url_length",
  "controls_ready",
  "camera_distance",
  "camera_yaw",
  "camera_pitch",
  "camera_target_x",
  "camera_target_y",
  "camera_target_z",
  "auto_spin_enabled",
  "grid_enabled",
  "view_mode",
  "animation_paused",
  "interaction_count",
  "wheel_count",
  "drag_count",
  "touch_count",
  "last_control_event",
  "last_error",
];

function threeOceanState(colorControls: OceanColorControls) {
  return {
  demo: "three-ocean-points",
  pass: "7A-visible-ocean-render-proof",
  title: "Commandable Ocean Field",
  renderer: "three.js",
  server_required: true,
  local_bundle: "vendor/three.min.js",
  point_count: POINT_COUNT,
  grid_size: POINT_GRID_SIZE,
  visible_pixel_sample_threshold: PIXEL_SAMPLE_THRESHOLD,
  three_source: "local vendor/three package with only its exported WebGL ocean API constructors",
  inspected_three_exports: ["AdditiveBlending", "Color", "Scene", "PerspectiveCamera", "BufferGeometry", "Float32BufferAttribute", "PointsMaterial", "Points", "LineBasicMaterial", "LineSegments", "WebGLRenderer"],
  required_three_apis: ["Scene", "PerspectiveCamera", "WebGLRenderer", "BufferGeometry", "Float32BufferAttribute", "PointsMaterial", "Points"],
  main_render_path_constructors: ["WebGLRenderer", "Scene", "PerspectiveCamera", "BufferGeometry", "Float32BufferAttribute", "PointsMaterial", "Points"],
  optional_three_helpers: ["LineBasicMaterial", "LineSegments"],
  controls: {
    mouse: ["left drag orbit", "right drag pan", "shift drag pan", "wheel zoom", "double click reset"],
    touch: ["one finger orbit", "two finger pinch zoom", "two finger pan"],
    ui: ["Reset View", "Auto Spin", "Grid", "Points/Wire/Solid", "Pause/Resume", "live browser color controls", "independent window minimize/restore buttons"],
  },
  point_material: "large high-contrast cyan THREE.PointsMaterial against #081426 background",
  camera: { fov: 58, yaw: 0, pitch: 0.48, distance: 92, target: { x: 0, y: 0, z: 0 } },
  proof_state_global: "window.GR4PH1C4_OCEAN_PROOF",
  capture_function_global: "window.GR4PH1C4_CAPTURE_RENDER_PROOF",
  debug_panel_fields: DEBUG_PANEL_FIELDS,
  color_background: colorControls.background,
  color_graph_lines: colorControls.graphLines,
  color_axis_numbers: colorControls.axisNumbers,
  color_points: colorControls.points,
  color_data_lines: colorControls.dataLines,
  color_panel_accent: colorControls.panelAccent,
  color_text: colorControls.text,
  colors: { background: colorControls.background, point: colorControls.points, lineGrid: colorControls.graphLines, panelAccent: colorControls.panelAccent, text: colorControls.text },
  windows_minimized: { controlPanel: false, debugPanel: false },
  color_source_background: colorControls.sourceBackground,
  color_source_graph_lines: colorControls.sourceGraphLines,
  color_source_axis_numbers: colorControls.sourceAxisNumbers,
  color_source_points: colorControls.sourcePoints,
  color_source_data_lines: colorControls.sourceDataLines,
  color_source_panel_accent: colorControls.sourcePanelAccent,
  color_source_text: colorControls.sourceText,
  last_error: colorControls.lastError,
  required_commands: [
    "node dist/main.js three-ocean-points-demo",
    "node dist/three-ocean-points-demo/smoke-test.js",
    "node dist/three-ocean-points-demo/browser-render-smoke-test.js",
    "xdg-open dist/three-ocean-points-demo/index.html",
  ],
  };
}

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
    "controls: manual yaw/pitch/distance/target camera controller; no external runtime controls dependency",
    "main render path: WebGLRenderer, Scene, PerspectiveCamera, BufferGeometry, Float32BufferAttribute, PointsMaterial, Points",
    "optional helpers: local grid/wireframe/solid failures are caught and cannot block rendering",
    "browser proof: local HTTP server opens index.html, waits for frames, simulates wheel/drag/buttons, readPixels counts non-background pixels, writes browser-render-proof.json and browser-render-proof.png",
    "runtime=fully local HTTP page with dist/three-ocean-points-demo/vendor/three.min.js",
  ];
}

function renderDebugRows(): string {
  return DEBUG_PANEL_FIELDS.map((field) => `      <div class="debug-row"><span class="debug-key">${field}</span><span class="debug-value" id="debug-${field}">0</span></div>`).join("\n");
}

function hexToRgb(color: string): [number, number, number] {
  return [Number.parseInt(color.slice(1, 3), 16), Number.parseInt(color.slice(3, 5), 16), Number.parseInt(color.slice(5, 7), 16)];
}


function renderThreeOceanHtml(colorControls: OceanColorControls): string {
  const backgroundRgb = hexToRgb(colorControls.background);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Commandable Ocean Field</title>
  <style>
    :root { --ocean-bg: ${colorControls.background}; --ocean-grid: ${colorControls.graphLines}; --ocean-text: ${colorControls.text}; --ocean-axis: ${colorControls.axisNumbers}; --ocean-points: ${colorControls.points}; --ocean-lines: ${colorControls.dataLines}; --ocean-accent: ${colorControls.panelAccent}; }
    html, body { width: 100%; height: 100%; margin: 0; overflow: hidden; overscroll-behavior: none; }
    body { background: var(--ocean-bg); color: var(--ocean-text); font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; }
    #app { position: fixed; inset: 0; width: 100%; height: 100%; background: var(--ocean-bg); }
    #ocean-container { position: absolute; inset: 0; width: 100%; height: 100%; min-width: 320px; min-height: 240px; touch-action: none; user-select: none; }
    canvas { display: block; width: 100% !important; height: 100% !important; touch-action: none; user-select: none; cursor: grab; }
    canvas:active { cursor: grabbing; }
    .ocean-window { border: 1px solid var(--ocean-grid); border-radius: 14px; background: rgba(2, 8, 23, 0.78); box-shadow: 0 0 28px rgba(34, 211, 238, 0.3); color: var(--ocean-text); pointer-events: auto; }
    .window-header { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin: 0 0 10px; color: var(--ocean-accent); }
    .window-title { margin: 0; font-size: 16px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ocean-accent); font-weight: 900; }
    .minimize-button { min-height: 28px; border: 1px solid var(--ocean-accent); border-radius: 999px; background: rgba(14, 116, 144, 0.36); color: var(--ocean-text); font: inherit; font-weight: 900; cursor: pointer; padding: 0 10px; }
    .ocean-window.is-minimized { min-width: 0 !important; max-width: calc(100vw - 28px) !important; padding: 8px 10px !important; overflow: visible !important; }
    .ocean-window.is-minimized .window-body { display: none !important; }
    .ocean-window.is-minimized .window-header { margin: 0; }
    #debug-panel { position: fixed; top: 14px; left: 14px; z-index: 10; min-width: 340px; max-width: min(520px, calc(100vw - 28px)); max-height: calc(100vh - 28px); overflow: auto; padding: 14px 16px; }
    .debug-row { display: grid; grid-template-columns: 220px 1fr; gap: 10px; padding: 3px 0; border-top: 1px solid rgba(148, 163, 184, 0.15); font-size: 13px; }
    .debug-key, .debug-value { color: var(--ocean-text); }
    .debug-value { word-break: break-word; }
    #control-panel { position: fixed; right: 14px; top: 14px; z-index: 12; max-width: min(560px, calc(100vw - 28px)); padding: 12px; }
    .control-body { display: grid; gap: 10px; }
    .control-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
    #control-panel button:not(.minimize-button), #control-panel label, #control-panel select { min-height: 34px; border: 1px solid var(--ocean-accent); border-radius: 10px; background: rgba(14, 116, 144, 0.36); color: var(--ocean-text); font: inherit; font-weight: 800; }
    #control-panel button:not(.minimize-button) { padding: 0 12px; cursor: pointer; }
    #control-panel button:not(.minimize-button):hover, .minimize-button:hover { background: rgba(14, 165, 233, 0.5); }
    #control-panel label { display: inline-flex; gap: 7px; align-items: center; padding: 0 10px; cursor: pointer; }
    #control-panel select { padding: 0 9px; }
    .color-control { min-height: 42px !important; }
    .color-control input[type="color"] { width: 30px; height: 24px; padding: 0; border: 0; background: transparent; cursor: pointer; }
    #graph-line-overlay { position: absolute; inset: 0; z-index: 1; pointer-events: none; opacity: 0.35; background-image: linear-gradient(var(--ocean-grid) 1px, transparent 1px), linear-gradient(90deg, var(--ocean-grid) 1px, transparent 1px); background-size: 80px 80px; }
    #axis-number-strip { position: fixed; left: 14px; top: 50%; z-index: 8; display: grid; gap: 44px; transform: translateY(-50%); color: var(--ocean-text); font-weight: 800; text-shadow: 0 0 8px var(--ocean-bg); pointer-events: none; }
    .axis-number { color: var(--ocean-text); }
    #fallback-message { position: fixed; right: 14px; bottom: 14px; z-index: 11; max-width: 560px; padding: 14px 16px; border: 1px solid rgba(248, 113, 113, 0.7); border-radius: 14px; background: rgba(69, 10, 10, 0.9); color: #fee2e2; display: none; line-height: 1.45; }
    .caption { position: fixed; left: 14px; bottom: 14px; z-index: 9; max-width: 780px; padding: 10px 12px; border-radius: 12px; background: rgba(2, 6, 23, 0.58); color: var(--ocean-text); font-size: 14px; }
    @media (max-width: 760px) { #debug-panel { top: auto; bottom: 14px; font-size: 12px; max-height: 45vh; } #control-panel { left: 14px; right: 14px; top: 14px; } .caption { display: none; } }
  </style>
</head>
<body>
  <main id="app" aria-label="Commandable Ocean Field">
    <div id="ocean-container" aria-label="visible animated point ocean canvas container"></div>
    <div id="graph-line-overlay" aria-label="main graph grid line color overlay"></div>
    <div id="axis-number-strip" aria-label="side number axis labels"><span class="axis-number">-50</span><span class="axis-number">0</span><span class="axis-number">50</span></div>
    <section id="control-panel" class="ocean-window" aria-label="ocean camera view and color controls" data-window-key="controlPanel">
      <div class="window-header"><h1 class="window-title">Scene Controls</h1><button id="control-panel-minimize" class="minimize-button" type="button" data-window-target="control-panel" aria-expanded="true">Minimize</button></div>
      <div class="window-body control-body">
        <div class="control-row">
          <button id="reset-view" type="button">Reset View</button>
          <label><input id="auto-spin-toggle" type="checkbox"> Auto Spin</label>
          <label><input id="grid-toggle" type="checkbox" checked> Grid</label>
          <label><input id="pause-toggle" type="checkbox"> Pause</label>
          <select id="view-mode" aria-label="Points Wire Solid mode">
            <option value="points">Points</option>
            <option value="wire">Wire</option>
            <option value="solid">Solid</option>
          </select>
        </div>
        <div class="control-row" aria-label="live scene color controls">
          <label class="color-control">Background <input id="color-background" data-color-key="background" type="color" value="${colorControls.background}"></label>
          <label class="color-control">Points <input id="color-points" data-color-key="points" type="color" value="${colorControls.points}"></label>
          <label class="color-control">Line/Grid <input id="color-line-grid" data-color-key="lineGrid" type="color" value="${colorControls.graphLines}"></label>
          <label class="color-control">Panel Accent <input id="color-panel-accent" data-color-key="panelAccent" type="color" value="${colorControls.panelAccent}"></label>
          <label class="color-control">Text <input id="color-text" data-color-key="text" type="color" value="${colorControls.text}"></label>
        </div>
      </div>
    </section>
    <section id="debug-panel" class="ocean-window" aria-live="polite" data-window-key="debugPanel">
      <div class="window-header"><h1 class="window-title">Commandable Ocean Field</h1><button id="debug-panel-minimize" class="minimize-button" type="button" data-window-target="debug-panel" aria-expanded="true">Minimize</button></div>
      <div class="window-body">
${renderDebugRows()}
      </div>
    </section>
    <aside id="fallback-message" role="alert"></aside>
    <p class="caption">Drag to orbit. Right drag or Shift+drag to pan. Wheel or pinch to zoom. Double click or Reset View returns the camera.</p>
  </main>
  <script src="vendor/three.min.js"></script>
  <script>
    (function () {
      "use strict";
      var POINT_GRID_SIZE = ${POINT_GRID_SIZE};
      var POINT_COUNT = ${POINT_COUNT};
      var BACKGROUND_RGB = ${JSON.stringify(backgroundRgb)};
      var COLOR_BACKGROUND = ${JSON.stringify(colorControls.background)};
      var COLOR_GRAPH_LINES = ${JSON.stringify(colorControls.graphLines)};
      var COLOR_AXIS_NUMBERS = ${JSON.stringify(colorControls.axisNumbers)};
      var COLOR_POINTS = ${JSON.stringify(colorControls.points)};
      var COLOR_DATA_LINES = ${JSON.stringify(colorControls.dataLines)};
      var COLOR_PANEL_ACCENT = ${JSON.stringify(colorControls.panelAccent)};
      var COLOR_TEXT = ${JSON.stringify(colorControls.text)};
      var COLOR_SOURCE_BACKGROUND = ${JSON.stringify(colorControls.sourceBackground)};
      var COLOR_SOURCE_GRAPH_LINES = ${JSON.stringify(colorControls.sourceGraphLines)};
      var COLOR_SOURCE_AXIS_NUMBERS = ${JSON.stringify(colorControls.sourceAxisNumbers)};
      var COLOR_SOURCE_POINTS = ${JSON.stringify(colorControls.sourcePoints)};
      var COLOR_SOURCE_DATA_LINES = ${JSON.stringify(colorControls.sourceDataLines)};
      var COLOR_SOURCE_PANEL_ACCENT = ${JSON.stringify(colorControls.sourcePanelAccent)};
      var COLOR_SOURCE_TEXT = ${JSON.stringify(colorControls.sourceText)};
      var PIXEL_SAMPLE_THRESHOLD = ${PIXEL_SAMPLE_THRESHOLD};
      var DEFAULT_VIEW = { yaw: 0, pitch: 0.48, distance: 92, targetX: 0, targetY: 0, targetZ: 0 };
      var container = document.getElementById("ocean-container");
      var fallback = document.getElementById("fallback-message");
      var renderer = null;
      var scene = null;
      var camera = null;
      var oceanPoints = null;
      var oceanWire = null;
      var oceanSolid = null;
      var gridLines = null;
      var positions = null;
      var lastFrameTimestamp = 0;
      var activePointers = new Map();
      var dragState = null;
      var pinchState = null;
      var threeCapabilities = probeThreeCapabilities();
      var proof = window.GR4PH1C4_OCEAN_PROOF = {
        rendererReady: false, canvasWidth: 0, canvasHeight: 0, threeLoaded: typeof window.THREE !== "undefined", webglReady: false, sceneReady: false, cameraReady: false,
        threeCapabilities: threeCapabilities, pointCount: 0, objectCount: 0, animationFrameCount: 0, firstRenderCompleted: false, renderLoopAlive: false, visiblePixelSamplePassed: false, nonBackgroundPixelCount: 0, screenshotDataUrlLength: 0,
        controlsReady: false, cameraDistance: DEFAULT_VIEW.distance, cameraYaw: DEFAULT_VIEW.yaw, cameraPitch: DEFAULT_VIEW.pitch, cameraTargetX: 0, cameraTargetY: 0, cameraTargetZ: 0,
        autoSpinEnabled: false, gridEnabled: true, viewMode: "points", animationPaused: false, interactionCount: 0, wheelCount: 0, dragCount: 0, touchCount: 0, lastControlEvent: "none",
        color_background: COLOR_BACKGROUND, color_graph_lines: COLOR_GRAPH_LINES, color_axis_numbers: COLOR_AXIS_NUMBERS, color_points: COLOR_POINTS, color_data_lines: COLOR_DATA_LINES, color_panel_accent: COLOR_PANEL_ACCENT, color_text: COLOR_TEXT,
        color_source_background: COLOR_SOURCE_BACKGROUND, color_source_graph_lines: COLOR_SOURCE_GRAPH_LINES, color_source_axis_numbers: COLOR_SOURCE_AXIS_NUMBERS, color_source_points: COLOR_SOURCE_POINTS, color_source_data_lines: COLOR_SOURCE_DATA_LINES, color_source_panel_accent: COLOR_SOURCE_PANEL_ACCENT, color_source_text: COLOR_SOURCE_TEXT,
        sceneState: { colors: { background: COLOR_BACKGROUND, points: COLOR_POINTS, lineGrid: COLOR_GRAPH_LINES, panelAccent: COLOR_PANEL_ACCENT, text: COLOR_TEXT }, windowsMinimized: { controlPanel: false, debugPanel: false } },
        lastError: null
      };
      var view = { yaw: DEFAULT_VIEW.yaw, pitch: DEFAULT_VIEW.pitch, distance: DEFAULT_VIEW.distance, target: makeTarget(DEFAULT_VIEW.targetX, DEFAULT_VIEW.targetY, DEFAULT_VIEW.targetZ) };

      window.GR4PH1C4_CAPTURE_RENDER_PROOF = async function () {
        var errors = [];
        await waitForFrames(30);
        sampleVisiblePixels();
        proof.screenshotDataUrlLength = safeScreenshotLength();
        proof.renderLoopAlive = proof.animationFrameCount >= 30 && performance.now() - lastFrameTimestamp < 1000;
        syncProofCamera();
        if (proof.canvasWidth <= 0) errors.push("canvas width is 0");
        if (proof.canvasHeight <= 0) errors.push("canvas height is 0");
        if (proof.pointCount === 0) errors.push("point_count is 0");
        if (proof.animationFrameCount === 0) errors.push("animation_frame_count is 0");
        if (proof.pointCount < 10000) errors.push("point_count is below 10000");
        if (proof.animationFrameCount < 30) errors.push("animationFrameCount is below 30");
        if (!proof.firstRenderCompleted) errors.push("firstRenderCompleted is false");
        if (!proof.renderLoopAlive) errors.push("renderLoopAlive is false");
        if (proof.nonBackgroundPixelCount < PIXEL_SAMPLE_THRESHOLD) errors.push("nonBackgroundPixelCount is below threshold " + PIXEL_SAMPLE_THRESHOLD);
        if (!proof.visiblePixelSamplePassed) errors.push("visiblePixelSamplePassed is false");
        if (proof.controlsReady !== true) errors.push("controlsReady is false");
        if (proof.lastError) errors.push("lastError was " + proof.lastError);
        updateDebugPanel();
        return {
          ok: errors.length === 0, canvasWidth: proof.canvasWidth, canvasHeight: proof.canvasHeight, pointCount: proof.pointCount, objectCount: proof.objectCount,
          animationFrameCount: proof.animationFrameCount, firstRenderCompleted: proof.firstRenderCompleted, renderLoopAlive: proof.renderLoopAlive, nonBackgroundPixelCount: proof.nonBackgroundPixelCount,
          visiblePixelSamplePassed: proof.visiblePixelSamplePassed, screenshotDataUrlLength: proof.screenshotDataUrlLength, controlsReady: proof.controlsReady, cameraDistance: proof.cameraDistance,
          cameraYaw: proof.cameraYaw, cameraPitch: proof.cameraPitch, cameraTargetX: proof.cameraTargetX, cameraTargetY: proof.cameraTargetY, cameraTargetZ: proof.cameraTargetZ,
          autoSpinEnabled: proof.autoSpinEnabled, gridEnabled: proof.gridEnabled, viewMode: proof.viewMode, animationPaused: proof.animationPaused, interactionCount: proof.interactionCount,
          wheelCount: proof.wheelCount, dragCount: proof.dragCount, touchCount: proof.touchCount, lastControlEvent: proof.lastControlEvent, lastError: proof.lastError, sceneState: proof.sceneState, colors: proof.sceneState.colors, windowsMinimized: proof.sceneState.windowsMinimized, threeCapabilities: proof.threeCapabilities,
          three_loaded: proof.threeLoaded, webgl_ready: proof.webglReady, scene_ready: proof.sceneReady, camera_ready: proof.cameraReady, renderer_ready: proof.rendererReady,
          point_count: proof.pointCount, animation_frame_count: proof.animationFrameCount, last_error: proof.lastError, color_background: proof.color_background, color_graph_lines: proof.color_graph_lines, color_axis_numbers: proof.color_axis_numbers, color_points: proof.color_points, color_data_lines: proof.color_data_lines, color_panel_accent: proof.color_panel_accent, color_text: proof.color_text, colors_json: JSON.stringify(proof.sceneState.colors), window_control_panel_minimized: proof.sceneState.windowsMinimized.controlPanel, window_debug_panel_minimized: proof.sceneState.windowsMinimized.debugPanel, windows_minimized_json: JSON.stringify(proof.sceneState.windowsMinimized), color_source_background: proof.color_source_background, color_source_graph_lines: proof.color_source_graph_lines, color_source_axis_numbers: proof.color_source_axis_numbers, color_source_points: proof.color_source_points, color_source_data_lines: proof.color_source_data_lines, color_source_panel_accent: proof.color_source_panel_accent, color_source_text: proof.color_source_text, three_capabilities: proof.threeCapabilities, errors: errors
        };
      };

      window.addEventListener("error", function (event) { reportError(event.message || "Unknown browser error"); });
      window.addEventListener("unhandledrejection", function (event) { reportError(event.reason && event.reason.message ? event.reason.message : String(event.reason)); });
      updateDebugPanel();
      initializeOcean();

      function initializeOcean() {
        if (!proof.threeLoaded) return failRender("Three.js did not load from vendor/three.min.js");
        threeCapabilities = probeThreeCapabilities();
        proof.threeCapabilities = threeCapabilities;
        verifyMainRenderConstructors();
        proof.webglReady = hasWebGLSupport();
        if (!proof.webglReady) return failRender("WebGL is not available in this browser, so the point ocean cannot render.");
        scene = new THREE.Scene();
        scene.background = new THREE.Color(COLOR_BACKGROUND);
        proof.sceneReady = true;
        var width = Math.max(320, container.clientWidth || window.innerWidth || 960);
        var height = Math.max(240, container.clientHeight || window.innerHeight || 540);
        camera = new THREE.PerspectiveCamera(58, width / height, 0.1, 1000);
        view.target = makeTarget(DEFAULT_VIEW.targetX, DEFAULT_VIEW.targetY, DEFAULT_VIEW.targetZ);
        applyCameraView();
        proof.cameraReady = true;
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance", preserveDrawingBuffer: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(width, height, false);
        renderer.domElement.setAttribute("aria-label", "canvas rendering visible animated controllable ocean point field");
        renderer.domElement.addEventListener("contextmenu", function (event) { event.preventDefault(); });
        container.appendChild(renderer.domElement);
        proof.rendererReady = true;
        proof.canvasWidth = renderer.domElement.width;
        proof.canvasHeight = renderer.domElement.height;
        buildOceanObjects();
        addLocalGridLines(scene);
        applySceneColors();
        wireControls();
        window.addEventListener("resize", resizeRenderer);
        updateViewMode("points");
        updateDebugPanel();
        requestAnimationFrame(animate);
      }

      function buildOceanObjects() {
        var geometry = new THREE.BufferGeometry();
        positions = new Float32Array(POINT_COUNT * 3);
        var cursor = 0;
        for (var zIndex = 0; zIndex < POINT_GRID_SIZE; zIndex += 1) {
          for (var xIndex = 0; xIndex < POINT_GRID_SIZE; xIndex += 1) {
            var x = (xIndex - (POINT_GRID_SIZE - 1) / 2) * 1.0;
            var z = (zIndex - (POINT_GRID_SIZE - 1) / 2) * 1.0;
            positions[cursor] = x; positions[cursor + 1] = waveHeight(x, z, 0); positions[cursor + 2] = z; cursor += 3;
          }
        }
        geometry.setAttribute("position", makeFloat32Attribute(positions, 3));
        addOptionalSurfaceIndex(geometry);
        if (typeof geometry.computeBoundingSphere === "function") geometry.computeBoundingSphere();
        var material = new THREE.PointsMaterial({ color: COLOR_POINTS, size: 1.9, sizeAttenuation: true, transparent: false, opacity: 1.0 });
        oceanPoints = new THREE.Points(geometry, material);
        scene.add(oceanPoints);
        proof.pointCount = getGeometryAttribute(geometry, "position").count;
        if (proof.pointCount < 10000) return failRender("Point geometry contains fewer than 10000 vertices.");
        tryAddWireObject(geometry);
        tryAddSolidObject(geometry);
        proof.objectCount = scene.children.length;
      }

      function addOptionalSurfaceIndex(geometry) {
        try {
          if (typeof geometry.setIndex !== "function") return;
          var indices = [];
          for (var z = 0; z < POINT_GRID_SIZE - 1; z += 1) {
            for (var x = 0; x < POINT_GRID_SIZE - 1; x += 1) {
              var a = z * POINT_GRID_SIZE + x;
              var b = a + 1;
              var c = a + POINT_GRID_SIZE;
              var d = c + 1;
              indices.push(a, c, b, b, c, d);
            }
          }
          geometry.setIndex(indices);
        } catch (error) { console.warn("Optional surface index failed and ocean render will continue:", error); }
      }

      function tryAddWireObject(geometry) {
        try {
          if (typeof THREE.WireframeGeometry !== "function" || typeof THREE.LineSegments !== "function" || typeof THREE.LineBasicMaterial !== "function") return;
          oceanWire = new THREE.LineSegments(new THREE.WireframeGeometry(geometry), new THREE.LineBasicMaterial({ color: COLOR_DATA_LINES, transparent: true, opacity: 0.55 }));
          oceanWire.visible = false;
          scene.add(oceanWire);
        } catch (error) { console.warn("Optional wireframe failed and ocean render will continue:", error); oceanWire = null; }
      }

      function tryAddSolidObject(geometry) {
        try {
          if (typeof THREE.MeshBasicMaterial !== "function" || typeof THREE.Mesh !== "function") return;
          oceanSolid = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: COLOR_DATA_LINES, wireframe: false, transparent: true, opacity: 0.34, side: THREE.DoubleSide || 2 }));
          oceanSolid.visible = false;
          scene.add(oceanSolid);
        } catch (error) { console.warn("Optional solid mesh failed and ocean render will continue:", error); oceanSolid = null; }
      }

      function animate(time) {
        try {
          proof.animationFrameCount += 1;
          lastFrameTimestamp = performance.now();
          proof.renderLoopAlive = true;
          var seconds = time * 0.001;
          if (!proof.animationPaused) updateOceanGeometry(seconds);
          if (proof.autoSpinEnabled) { view.yaw += 0.0035; markControl("auto_spin_frame", false); }
          applyCameraView();
          renderer.render(scene, camera);
          proof.firstRenderCompleted = true;
          proof.canvasWidth = renderer.domElement.width;
          proof.canvasHeight = renderer.domElement.height;
          if (proof.animationFrameCount === 1 || proof.animationFrameCount % 15 === 0) sampleVisiblePixels();
          updateDebugPanel();
          requestAnimationFrame(animate);
        } catch (error) { failRender(error && error.message ? error.message : String(error)); }
      }

      function updateOceanGeometry(seconds) {
        var attr = getGeometryAttribute(oceanPoints.geometry, "position");
        for (var index = 0; index < POINT_COUNT; index += 1) {
          var offset = index * 3;
          attr.array[offset + 1] = waveHeight(attr.array[offset], attr.array[offset + 2], seconds);
        }
        attr.needsUpdate = true;
        if (oceanPoints.geometry.attributes && oceanPoints.geometry.attributes.position) oceanPoints.geometry.attributes.position.needsUpdate = true;
        if (oceanPoints.geometry.computeBoundingSphere) oceanPoints.geometry.computeBoundingSphere();
      }

      function wireControls() {
        var canvas = renderer.domElement;
        canvas.addEventListener("wheel", onWheel, { passive: false });
        canvas.addEventListener("pointerdown", onPointerDown, { passive: false });
        canvas.addEventListener("pointermove", onPointerMove, { passive: false });
        canvas.addEventListener("pointerup", onPointerUp, { passive: false });
        canvas.addEventListener("pointercancel", onPointerUp, { passive: false });
        canvas.addEventListener("dblclick", function (event) { event.preventDefault(); resetView("double_click_reset"); });
        document.getElementById("reset-view").addEventListener("click", function () { resetView("button_reset"); });
        document.getElementById("auto-spin-toggle").addEventListener("change", function (event) { proof.autoSpinEnabled = event.target.checked; markControl("auto_spin_toggle"); });
        document.getElementById("grid-toggle").addEventListener("change", function (event) { setGridEnabled(event.target.checked); markControl("grid_toggle"); });
        document.getElementById("pause-toggle").addEventListener("change", function (event) { proof.animationPaused = event.target.checked; markControl(proof.animationPaused ? "pause_animation" : "resume_animation"); });
        document.getElementById("view-mode").addEventListener("change", function (event) { updateViewMode(event.target.value); markControl("view_mode_" + proof.viewMode); });
        Array.from(document.querySelectorAll("input[data-color-key]")).forEach(function (input) {
          input.addEventListener("input", function (event) { applySceneColors(event.target.getAttribute("data-color-key"), event.target.value); markControl("color_" + event.target.getAttribute("data-color-key")); });
        });
        Array.from(document.querySelectorAll(".minimize-button[data-window-target]")).forEach(function (button) {
          button.addEventListener("click", function () { toggleWindow(button.getAttribute("data-window-target")); });
        });
        proof.controlsReady = true;
      }

      function toggleWindow(windowId) {
        var panel = document.getElementById(windowId);
        if (!panel) return;
        var key = panel.getAttribute("data-window-key");
        if (!key) return;
        var minimized = !panel.classList.contains("is-minimized");
        setWindowMinimized(key, minimized);
        markControl((minimized ? "minimize_" : "restore_") + key);
      }

      function setWindowMinimized(key, minimized) {
        proof.sceneState.windowsMinimized[key] = Boolean(minimized);
        var selector = '[data-window-key="' + key + '"]';
        var panel = document.querySelector(selector);
        if (!panel) return;
        panel.classList.toggle("is-minimized", Boolean(minimized));
        var button = panel.querySelector(".minimize-button");
        if (button) {
          button.textContent = minimized ? "Restore" : "Minimize";
          button.setAttribute("aria-expanded", minimized ? "false" : "true");
        }
        updateDebugPanel();
      }

      function applySceneColors(key, value) {
        if (key && value) proof.sceneState.colors[key] = value;
        proof.color_background = proof.sceneState.colors.background;
        proof.color_points = proof.sceneState.colors.points;
        proof.color_graph_lines = proof.sceneState.colors.lineGrid;
        proof.color_data_lines = proof.sceneState.colors.lineGrid;
        proof.color_axis_numbers = proof.sceneState.colors.text;
        proof.color_panel_accent = proof.sceneState.colors.panelAccent;
        proof.color_text = proof.sceneState.colors.text;
        BACKGROUND_RGB = hexToRgbArray(proof.sceneState.colors.background);
        document.documentElement.style.setProperty("--ocean-bg", proof.sceneState.colors.background);
        document.documentElement.style.setProperty("--ocean-grid", proof.sceneState.colors.lineGrid);
        document.documentElement.style.setProperty("--ocean-lines", proof.sceneState.colors.lineGrid);
        document.documentElement.style.setProperty("--ocean-points", proof.sceneState.colors.points);
        document.documentElement.style.setProperty("--ocean-accent", proof.sceneState.colors.panelAccent);
        document.documentElement.style.setProperty("--ocean-text", proof.sceneState.colors.text);
        document.documentElement.style.setProperty("--ocean-axis", proof.sceneState.colors.text);
        if (scene) scene.background = new THREE.Color(proof.sceneState.colors.background);
        setMaterialColor(oceanPoints && oceanPoints.material, proof.sceneState.colors.points);
        setMaterialColor(oceanWire && oceanWire.material, proof.sceneState.colors.lineGrid);
        setMaterialColor(oceanSolid && oceanSolid.material, proof.sceneState.colors.lineGrid);
        setMaterialColor(gridLines && gridLines.material, proof.sceneState.colors.lineGrid);
        updateDebugPanel();
      }

      function setMaterialColor(material, color) {
        if (material && material.color && typeof material.color.set === "function") material.color.set(color);
      }

      function hexToRgbArray(color) {
        return [parseInt(color.slice(1, 3), 16), parseInt(color.slice(3, 5), 16), parseInt(color.slice(5, 7), 16)];
      }

      function onWheel(event) {
        event.preventDefault();
        var zoomFactor = Math.exp(event.deltaY * 0.0015);
        view.distance = clamp(view.distance * zoomFactor, 18, 220);
        proof.wheelCount += 1;
        markControl("wheel_zoom");
        applyCameraView();
      }

      function onPointerDown(event) {
        event.preventDefault();
        renderer.domElement.setPointerCapture(event.pointerId);
        activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        if (event.pointerType === "touch") proof.touchCount += 1;
        if (activePointers.size >= 2) {
          var pair = pointerPair();
          pinchState = { distance: pointerDistance(pair[0], pair[1]), center: pointerCenter(pair[0], pair[1]), viewDistance: view.distance, targetX: view.target.x, targetY: view.target.y, targetZ: view.target.z };
          dragState = null;
        } else {
          dragState = { x: event.clientX, y: event.clientY, mode: (event.button === 2 || event.shiftKey) ? "pan" : "orbit" };
        }
      }

      function onPointerMove(event) {
        if (!activePointers.has(event.pointerId)) return;
        event.preventDefault();
        activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        if (activePointers.size >= 2 && pinchState) {
          var pair = pointerPair();
          var center = pointerCenter(pair[0], pair[1]);
          var dist = Math.max(1, pointerDistance(pair[0], pair[1]));
          view.distance = clamp(pinchState.viewDistance * (pinchState.distance / dist), 18, 220);
          panByPixels(center.x - pinchState.center.x, center.y - pinchState.center.y, pinchState.targetX, pinchState.targetY, pinchState.targetZ);
          proof.dragCount += 1;
          proof.touchCount += event.pointerType === "touch" ? 1 : 0;
          markControl("touch_pinch_pan");
          applyCameraView();
          return;
        }
        if (!dragState) return;
        var dx = event.clientX - dragState.x;
        var dy = event.clientY - dragState.y;
        dragState.x = event.clientX; dragState.y = event.clientY;
        if (dragState.mode === "pan" || event.shiftKey) panByPixels(dx, dy);
        else { view.yaw -= dx * 0.008; view.pitch = clamp(view.pitch - dy * 0.006, -1.18, 1.18); }
        proof.dragCount += 1;
        if (event.pointerType === "touch") proof.touchCount += 1;
        markControl(dragState.mode === "pan" || event.shiftKey ? "drag_pan" : "drag_orbit");
        applyCameraView();
      }

      function onPointerUp(event) {
        event.preventDefault();
        activePointers.delete(event.pointerId);
        pinchState = null;
        dragState = null;
        if (activePointers.size === 1) {
          var remaining = Array.from(activePointers.values())[0];
          dragState = { x: remaining.x, y: remaining.y, mode: "orbit" };
        }
      }

      function panByPixels(dx, dy, baseX, baseY, baseZ) {
        var targetBase = makeTarget(baseX !== undefined ? baseX : view.target.x, baseY !== undefined ? baseY : view.target.y, baseZ !== undefined ? baseZ : view.target.z);
        var rightX = Math.cos(view.yaw);
        var rightZ = -Math.sin(view.yaw);
        var upX = -Math.sin(view.yaw) * Math.sin(view.pitch);
        var upY = Math.cos(view.pitch);
        var upZ = -Math.cos(view.yaw) * Math.sin(view.pitch);
        var scale = view.distance * 0.0018;
        view.target.x = targetBase.x + rightX * (-dx * scale) + upX * (dy * scale);
        view.target.y = targetBase.y + upY * (dy * scale);
        view.target.z = targetBase.z + rightZ * (-dx * scale) + upZ * (dy * scale);
      }

      function resetView(eventName) {
        view.yaw = DEFAULT_VIEW.yaw; view.pitch = DEFAULT_VIEW.pitch; view.distance = DEFAULT_VIEW.distance; setTarget(view.target, DEFAULT_VIEW.targetX, DEFAULT_VIEW.targetY, DEFAULT_VIEW.targetZ);
        applyCameraView();
        markControl(eventName || "reset_view");
      }

      function setGridEnabled(enabled) {
        proof.gridEnabled = Boolean(enabled);
        if (gridLines) gridLines.visible = proof.gridEnabled;
        var toggle = document.getElementById("grid-toggle");
        if (toggle) toggle.checked = proof.gridEnabled;
      }

      function updateViewMode(mode) {
        proof.viewMode = mode === "wire" || mode === "solid" ? mode : "points";
        if (oceanPoints) oceanPoints.visible = proof.viewMode === "points" || (!oceanWire && !oceanSolid);
        if (oceanWire) oceanWire.visible = proof.viewMode === "wire";
        if (oceanSolid) oceanSolid.visible = proof.viewMode === "solid";
        var select = document.getElementById("view-mode");
        if (select) select.value = proof.viewMode;
      }

      function markControl(name, countInteraction) {
        if (countInteraction !== false) proof.interactionCount += 1;
        proof.lastControlEvent = name;
        syncProofCamera();
        updateDebugPanel();
      }

      function applyCameraView() {
        if (!camera || !view.target) return;
        var cp = Math.cos(view.pitch);
        camera.position.set(view.target.x + Math.sin(view.yaw) * cp * view.distance, view.target.y + Math.sin(view.pitch) * view.distance, view.target.z + Math.cos(view.yaw) * cp * view.distance);
        safeLookAt(camera, view.target);
        syncProofCamera();
      }

      function syncProofCamera() {
        if (!view.target) return;
        proof.cameraDistance = Number(view.distance.toFixed(3));
        proof.cameraYaw = Number(view.yaw.toFixed(4));
        proof.cameraPitch = Number(view.pitch.toFixed(4));
        proof.cameraTargetX = Number(view.target.x.toFixed(3));
        proof.cameraTargetY = Number(view.target.y.toFixed(3));
        proof.cameraTargetZ = Number(view.target.z.toFixed(3));
      }

      function pointerPair() { return Array.from(activePointers.values()).slice(0, 2); }
      function pointerDistance(a, b) { var dx = a.x - b.x; var dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy); }
      function pointerCenter(a, b) { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; }
      function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }

      function probeThreeCapabilities() {
        return {
          Vector3: typeof window.THREE !== "undefined" && typeof THREE.Vector3 === "function",
          BufferGeometry: typeof window.THREE !== "undefined" && typeof THREE.BufferGeometry === "function",
          Points: typeof window.THREE !== "undefined" && typeof THREE.Points === "function",
          PointsMaterial: typeof window.THREE !== "undefined" && typeof THREE.PointsMaterial === "function",
          Float32BufferAttribute: typeof window.THREE !== "undefined" && typeof THREE.Float32BufferAttribute === "function",
          PerspectiveCamera: typeof window.THREE !== "undefined" && typeof THREE.PerspectiveCamera === "function",
          Scene: typeof window.THREE !== "undefined" && typeof THREE.Scene === "function",
          WebGLRenderer: typeof window.THREE !== "undefined" && typeof THREE.WebGLRenderer === "function"
        };
      }

      function verifyMainRenderConstructors() {
        var requiredConstructors = ["Scene", "PerspectiveCamera", "WebGLRenderer", "BufferGeometry", "Float32BufferAttribute", "PointsMaterial", "Points"];
        var missing = requiredConstructors.filter(function (name) { return typeof THREE[name] !== "function"; });
        if (missing.length > 0) failRender("G4-OCEAN-MISSING-THREE-API:" + missing[0]);
      }

      function addLocalGridLines(scene) {
        try {
          if (typeof THREE.LineSegments !== "function" || typeof THREE.LineBasicMaterial !== "function" || typeof THREE.BufferGeometry !== "function") { setGridEnabled(false); return null; }
          var vertices = [];
          var size = 110;
          var divisions = 22;
          var step = size / divisions;
          var half = size / 2;
          for (var i = 0; i <= divisions; i += 1) {
            var k = -half + i * step;
            vertices.push(-half, -5.4, k, half, -5.4, k);
            vertices.push(k, -5.4, -half, k, -5.4, half);
          }
          var geometry = new THREE.BufferGeometry();
          geometry.setAttribute("position", makeFloat32Attribute(new Float32Array(vertices), 3));
          gridLines = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: proof.sceneState.colors.lineGrid, transparent: true, opacity: 0.45 }));
          scene.add(gridLines);
          setGridEnabled(true);
          return gridLines;
        } catch (error) {
          console.warn("Local grid line construction failed and ocean render will continue:", error);
          proof.gridEnabled = false;
          return null;
        }
      }

      function makeFloat32Attribute(array, itemSize) {
        return new THREE.Float32BufferAttribute(array, itemSize);
      }

      function makeTarget(x, y, z) { return { x: x || 0, y: y || 0, z: z || 0 }; }
      function setTarget(target, x, y, z) { target.x = x; target.y = y; target.z = z; return target; }
      function safeLookAt(camera, target) {
        try { camera.lookAt(target.x, target.y, target.z); return; } catch (_) {}
        try { camera.lookAt(target); return; } catch (_) {}
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
          function check() { if (proof.animationFrameCount >= minFrames) resolve(); else requestAnimationFrame(check); }
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

      function failRender(message) { reportError(message); throw new Error(message); }

      function updateDebugPanel() {
        setDebug("color_background", proof.color_background);
        setDebug("color_graph_lines", proof.color_graph_lines);
        setDebug("color_axis_numbers", proof.color_axis_numbers);
        setDebug("color_points", proof.color_points);
        setDebug("color_data_lines", proof.color_data_lines);
        setDebug("color_panel_accent", proof.color_panel_accent);
        setDebug("color_text", proof.color_text);
        setDebug("colors_json", JSON.stringify(proof.sceneState.colors));
        setDebug("color_source_background", proof.color_source_background);
        setDebug("color_source_graph_lines", proof.color_source_graph_lines);
        setDebug("color_source_axis_numbers", proof.color_source_axis_numbers);
        setDebug("color_source_points", proof.color_source_points);
        setDebug("color_source_data_lines", proof.color_source_data_lines);
        setDebug("color_source_panel_accent", proof.color_source_panel_accent);
        setDebug("color_source_text", proof.color_source_text);
        setDebug("window_control_panel_minimized", proof.sceneState.windowsMinimized.controlPanel);
        setDebug("window_debug_panel_minimized", proof.sceneState.windowsMinimized.debugPanel);
        setDebug("windows_minimized_json", JSON.stringify(proof.sceneState.windowsMinimized));
        setDebug("renderer_ready", proof.rendererReady);
        setDebug("canvas_width", proof.canvasWidth);
        setDebug("canvas_height", proof.canvasHeight);
        setDebug("three_loaded", proof.threeLoaded);
        setDebug("webgl_ready", proof.webglReady);
        setDebug("scene_ready", proof.sceneReady);
        setDebug("camera_ready", proof.cameraReady);
        setDebug("three_capabilities", JSON.stringify(proof.threeCapabilities));
        setDebug("point_count", proof.pointCount);
        setDebug("animation_frame_count", proof.animationFrameCount);
        setDebug("first_render_completed", proof.firstRenderCompleted);
        setDebug("render_loop_alive", proof.renderLoopAlive);
        setDebug("visible_pixel_sample_passed", proof.visiblePixelSamplePassed);
        setDebug("non_background_pixel_count", proof.nonBackgroundPixelCount);
        setDebug("screenshot_data_url_length", proof.screenshotDataUrlLength);
        setDebug("controls_ready", proof.controlsReady);
        setDebug("camera_distance", proof.cameraDistance);
        setDebug("camera_yaw", proof.cameraYaw);
        setDebug("camera_pitch", proof.cameraPitch);
        setDebug("camera_target_x", proof.cameraTargetX);
        setDebug("camera_target_y", proof.cameraTargetY);
        setDebug("camera_target_z", proof.cameraTargetZ);
        setDebug("auto_spin_enabled", proof.autoSpinEnabled);
        setDebug("grid_enabled", proof.gridEnabled);
        setDebug("view_mode", proof.viewMode);
        setDebug("animation_paused", proof.animationPaused);
        setDebug("interaction_count", proof.interactionCount);
        setDebug("wheel_count", proof.wheelCount);
        setDebug("drag_count", proof.dragCount);
        setDebug("touch_count", proof.touchCount);
        setDebug("last_control_event", proof.lastControlEvent);
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
  "Commandable Ocean Field", "GR4PH1C4_OCEAN_PROOF", "GR4PH1C4_CAPTURE_RENDER_PROOF", "visiblePixelSamplePassed", "nonBackgroundPixelCount", "screenshotDataUrlLength",
  "firstRenderCompleted", "renderLoopAlive", "readPixels", "threeCapabilities", "three_capabilities", "THREE.WebGLRenderer", "THREE.Scene", "THREE.PerspectiveCamera", "THREE.BufferGeometry", "THREE.Float32BufferAttribute", "THREE.PointsMaterial", "THREE.Points",
  "requestAnimationFrame", "visible_pixel_sample_passed", "non_background_pixel_count", "screenshot_data_url_length", "controls_ready", "camera_distance", "camera_target_x",
  "auto_spin_enabled", "grid_enabled", "view_mode", "interaction_count", "wheel_count", "drag_count", "touch_count", "last_control_event", "last_error",
  "color_background", "color_graph_lines", "color_axis_numbers", "color_points", "color_data_lines", "color_panel_accent", "color_text", "colors_json", "color_source_background", "color_source_graph_lines", "color_source_axis_numbers", "color_source_points", "color_source_data_lines", "color_source_panel_accent", "color_source_text", "window_control_panel_minimized", "window_debug_panel_minimized", "windows_minimized_json",
  "axis-number-strip", "COLOR_BACKGROUND", "COLOR_GRAPH_LINES", "COLOR_AXIS_NUMBERS", "COLOR_POINTS", "COLOR_DATA_LINES",
  "Reset View", "Auto Spin", "Grid", "Points", "Wire", "Solid", "Pause", "Background", "Panel Accent", "color-control", "data-color-key", "Minimize", "Restore", "data-window-key", "is-minimized", "pointerdown", "wheel", "touch-action: none"
];
for (const needle of htmlNeedles) if (!html.includes(needle)) fail("index.html is missing required text: " + needle);

for (const constructorName of ["WebGLRenderer", "Scene", "PerspectiveCamera", "BufferGeometry", "Float32BufferAttribute", "PointsMaterial", "Points"]) {
  if (!vendor.includes(constructorName + ":")) fail("vendor three bundle does not export main render constructor: " + constructorName);
}
if (html.includes("THREE.GridHelper") || html.includes("new GridHelper")) fail("GridHelper must not be used by the generated demo");
if (!html.includes("function addLocalGridLines") || !html.includes("THREE.LineSegments") || !html.includes("catch (error)")) fail("local grid lines must be inspectable and catch-wrapped");
if (html.includes("new THREE.Vector3")) fail("index.html must not construct THREE.Vector3");
if (html.includes("https://") || html.includes("http://")) fail("index.html must not use a remote runtime");
if (!html.includes("var POINT_COUNT = 10000")) fail("index.html must declare 10000 points");
if (!html.includes("size: 1.9")) fail("points must be large enough for immediate visibility");

let state;
try { state = JSON.parse(stateText); } catch (error) { fail("three-ocean-state.json is not valid JSON: " + error.message); }
if (state.point_count < 10000) fail("three-ocean-state.json point_count must be >= 10000");
if (!Array.isArray(state.inspected_three_exports) || state.inspected_three_exports.includes("Vector3") || state.inspected_three_exports.includes("GridHelper")) fail("inspected_three_exports must reflect the tiny local vendor exports without Vector3/GridHelper usage");
if (state.proof_state_global !== "window.GR4PH1C4_OCEAN_PROOF") fail("state proof global mismatch");
const requiredColorStateFields = ["color_background", "color_graph_lines", "color_axis_numbers", "color_points", "color_data_lines", "color_panel_accent", "color_text", "colors", "windows_minimized", "color_source_background", "color_source_graph_lines", "color_source_axis_numbers", "color_source_points", "color_source_data_lines", "color_source_panel_accent", "color_source_text", "last_error"];
for (const field of requiredColorStateFields) if (!(field in state)) fail("state missing color/window field " + field);
for (const field of ["background", "point", "lineGrid", "panelAccent", "text"]) if (!(field in state.colors)) fail("state.colors missing " + field);
for (const field of ["controlPanel", "debugPanel"]) if (!(field in state.windows_minimized)) fail("state.windows_minimized missing " + field);
for (const field of ${JSON.stringify(DEBUG_PANEL_FIELDS)}) if (!state.debug_panel_fields.includes(field)) fail("state missing debug field " + field);

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
const http = require("node:http");

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
  catch (error) { fail("Playwright is not installed. Run npm install so devDependencies are present.", error && error.stack ? error.stack : String(error)); }
}

function systemBrowserExecutable() {
  const candidates = process.platform === "win32" ? [] : ["chromium", "chromium-browser", "google-chrome", "google-chrome-stable", "microsoft-edge", "msedge"];
  for (const candidate of candidates) {
    try { return execFileSync("/bin/sh", ["-lc", "command -v " + candidate], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); }
    catch (_) {}
  }
  return undefined;
}

function nearlyEqual(a, b, tolerance = 0.02) { return Math.abs(a - b) <= tolerance; }

function contentType(filePath) {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (filePath.endsWith(".json")) return "application/json; charset=utf-8";
  if (filePath.endsWith(".png")) return "image/png";
  return "application/octet-stream";
}

function startLocalServer() {
  const server = http.createServer((request, response) => {
    try {
      const url = new URL(request.url || "/", "http://127.0.0.1");
      const decoded = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
      const requestedPath = path.normalize(path.join(root, decoded));
      if (!requestedPath.startsWith(root)) {
        response.writeHead(403); response.end("Forbidden"); return;
      }
      if (!fs.existsSync(requestedPath) || fs.statSync(requestedPath).isDirectory()) {
        response.writeHead(404); response.end("Not found"); return;
      }
      response.writeHead(200, { "Content-Type": contentType(requestedPath) });
      fs.createReadStream(requestedPath).pipe(response);
    } catch (error) {
      response.writeHead(500); response.end(error && error.message ? error.message : String(error));
    }
  });
  return new Promise((resolve, reject) => {
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolve({ server, url: "http://127.0.0.1:" + address.port + "/index.html" });
    });
  });
}

async function main() {
  if (!fs.existsSync(htmlPath)) fail("index.html does not exist at " + htmlPath);
  const { chromium } = loadPlaywright();
  const executablePath = process.env.GR4PH1C4_BROWSER_EXECUTABLE || systemBrowserExecutable();
  const launchOptions = { headless: true, args: ["--ignore-gpu-blocklist", "--enable-webgl", "--use-gl=swiftshader", "--no-sandbox"] };
  if (executablePath) launchOptions.executablePath = executablePath;
  let browser;
  try { browser = await chromium.launch(launchOptions); }
  catch (firstError) {
    if (!executablePath) {
      try { console.error("Chromium launch failed; attempting Playwright Chromium browser install before retrying."); execFileSync(process.platform === "win32" ? "npx.cmd" : "npx", ["playwright", "install", "chromium"], { stdio: "inherit" }); browser = await chromium.launch(launchOptions); }
      catch (installOrRetryError) { fail("Could not launch a real Chromium browser after Playwright install attempt. Run: npx playwright install chromium", (firstError && firstError.stack ? firstError.stack : String(firstError)) + "\\n" + (installOrRetryError && installOrRetryError.stack ? installOrRetryError.stack : String(installOrRetryError))); }
    } else fail("Could not launch a real Chromium browser at " + executablePath, firstError && firstError.stack ? firstError.stack : String(firstError));
  }

  const localServer = await startLocalServer();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  const consoleMessages = [];
  const pageErrors = [];
  page.on("console", message => consoleMessages.push(message.type() + ": " + message.text()));
  page.on("pageerror", error => pageErrors.push(error.message));

  try {
    await page.goto(localServer.url, { waitUntil: "load", timeout: 30000 });
    await page.waitForFunction(() => Boolean(window.GR4PH1C4_OCEAN_PROOF), null, { timeout: 15000 });
    await page.waitForFunction(() => window.GR4PH1C4_OCEAN_PROOF.animationFrameCount >= 30, null, { timeout: 15000 });
    const before = await page.evaluate(async () => window.GR4PH1C4_CAPTURE_RENDER_PROOF());
    const errors = Array.isArray(before.errors) ? before.errors.slice() : [];
    if (before.canvasWidth <= 0) errors.push("canvasWidth <= 0");
    if (before.canvasHeight <= 0) errors.push("canvasHeight <= 0");
    if (before.pointCount === 0) errors.push("point_count is 0");
    if (before.animationFrameCount === 0) errors.push("animation_frame_count is 0");
    if (before.pointCount < 10000) errors.push("point_count < 10000");
    if (before.renderLoopAlive !== true) errors.push("renderLoopAlive !== true");
    if (before.firstRenderCompleted !== true) errors.push("firstRenderCompleted !== true");
    if (before.visiblePixelSamplePassed !== true) errors.push("visiblePixelSamplePassed !== true");
    if (before.nonBackgroundPixelCount < threshold) errors.push("nonBackgroundPixelCount < " + threshold);
    if (before.controlsReady !== true) errors.push("controlsReady !== true");
    if (before.renderer_ready !== true) errors.push("renderer_ready !== true");

    const canvas = page.locator("canvas");
    const box = await canvas.boundingBox();
    if (!box) errors.push("canvas bounding box missing");
    else {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.wheel(0, -420);
      await page.waitForTimeout(100);
      const afterWheel = await page.evaluate(() => ({ distance: window.GR4PH1C4_OCEAN_PROOF.cameraDistance, wheelCount: window.GR4PH1C4_OCEAN_PROOF.wheelCount }));
      if (afterWheel.wheelCount <= before.wheelCount) errors.push("wheelCount did not increase");
      if (nearlyEqual(afterWheel.distance, before.cameraDistance)) errors.push("simulated wheel did not change camera_distance");

      await page.mouse.move(box.x + box.width * 0.45, box.y + box.height * 0.45);
      await page.mouse.down({ button: "left" });
      await page.mouse.move(box.x + box.width * 0.65, box.y + box.height * 0.58, { steps: 8 });
      await page.mouse.up({ button: "left" });
      await page.waitForTimeout(100);
      const afterDrag = await page.evaluate(() => ({ yaw: window.GR4PH1C4_OCEAN_PROOF.cameraYaw, pitch: window.GR4PH1C4_OCEAN_PROOF.cameraPitch, dragCount: window.GR4PH1C4_OCEAN_PROOF.dragCount }));
      if (afterDrag.dragCount <= before.dragCount) errors.push("dragCount did not increase");
      if (nearlyEqual(afterDrag.yaw, before.cameraYaw) && nearlyEqual(afterDrag.pitch, before.cameraPitch)) errors.push("simulated drag did not change camera orientation");
    }

    await page.click("#reset-view");
    await page.waitForTimeout(100);
    const afterReset = await page.evaluate(() => ({ distance: window.GR4PH1C4_OCEAN_PROOF.cameraDistance, yaw: window.GR4PH1C4_OCEAN_PROOF.cameraYaw, pitch: window.GR4PH1C4_OCEAN_PROOF.cameraPitch, targetX: window.GR4PH1C4_OCEAN_PROOF.cameraTargetX, targetY: window.GR4PH1C4_OCEAN_PROOF.cameraTargetY, targetZ: window.GR4PH1C4_OCEAN_PROOF.cameraTargetZ }));
    if (!nearlyEqual(afterReset.distance, 92) || !nearlyEqual(afterReset.yaw, 0) || !nearlyEqual(afterReset.pitch, 0.48) || !nearlyEqual(afterReset.targetX, 0) || !nearlyEqual(afterReset.targetY, 0) || !nearlyEqual(afterReset.targetZ, 0)) errors.push("Reset View did not restore known camera values");

    const autoBefore = await page.evaluate(() => window.GR4PH1C4_OCEAN_PROOF.autoSpinEnabled);
    await page.click("#auto-spin-toggle");
    await page.waitForTimeout(60);
    const autoAfter = await page.evaluate(() => window.GR4PH1C4_OCEAN_PROOF.autoSpinEnabled);
    if (autoAfter === autoBefore) errors.push("Auto Spin toggle did not change auto_spin_enabled");

    const gridBefore = await page.evaluate(() => window.GR4PH1C4_OCEAN_PROOF.gridEnabled);
    await page.click("#grid-toggle");
    await page.waitForTimeout(60);
    const gridAfter = await page.evaluate(() => window.GR4PH1C4_OCEAN_PROOF.gridEnabled);
    if (gridAfter === gridBefore) errors.push("Grid toggle did not change grid_enabled");

    const colorInputs = await page.locator("input[type=color][data-color-key]").count();
    if (colorInputs < 5) errors.push("expected at least 5 color controls, found " + colorInputs);
    const colorBefore = await page.evaluate(() => window.GR4PH1C4_OCEAN_PROOF.sceneState.colors.points);
    await page.locator("#color-points").fill("#ff00aa");
    await page.waitForTimeout(80);
    const colorAfter = await page.evaluate(() => ({ point: window.GR4PH1C4_OCEAN_PROOF.sceneState.colors.points, legacy: window.GR4PH1C4_OCEAN_PROOF.color_points, event: window.GR4PH1C4_OCEAN_PROOF.lastControlEvent }));
    if (colorAfter.point !== "#ff00aa" || colorAfter.legacy !== "#ff00aa") errors.push("point color control did not update scene state");
    if (colorAfter.point === colorBefore) errors.push("point color did not change from its previous value");

    const minimizeButtons = await page.locator(".minimize-button[data-window-target]").count();
    if (minimizeButtons < 2) errors.push("expected minimize buttons for both visible windows");
    await page.click("#control-panel-minimize");
    await page.waitForTimeout(80);
    const minimizedControl = await page.evaluate(() => ({ state: window.GR4PH1C4_OCEAN_PROOF.sceneState.windowsMinimized.controlPanel, visibleRestore: document.querySelector("#control-panel-minimize") && document.querySelector("#control-panel-minimize").textContent }));
    if (minimizedControl.state !== true) errors.push("control panel minimized state did not become true");
    if (minimizedControl.visibleRestore !== "Restore") errors.push("control panel restore path is not visible");
    await page.click("#control-panel-minimize");
    await page.waitForTimeout(80);
    const restoredControl = await page.evaluate(() => window.GR4PH1C4_OCEAN_PROOF.sceneState.windowsMinimized.controlPanel);
    if (restoredControl !== false) errors.push("control panel minimized state did not restore to false");
    await page.click("#debug-panel-minimize");
    await page.waitForTimeout(80);
    const minimizedDebug = await page.evaluate(() => window.GR4PH1C4_OCEAN_PROOF.sceneState.windowsMinimized.debugPanel);
    if (minimizedDebug !== true) errors.push("debug panel minimized state did not become true");
    await page.click("#debug-panel-minimize");
    await page.waitForTimeout(80);
    const restoredDebug = await page.evaluate(() => window.GR4PH1C4_OCEAN_PROOF.sceneState.windowsMinimized.debugPanel);
    if (restoredDebug !== false) errors.push("debug panel minimized state did not restore to false");

    const proof = await page.evaluate(async () => window.GR4PH1C4_CAPTURE_RENDER_PROOF());
    if (proof.lastError !== null && proof.lastError !== "") errors.push("lastError was " + proof.lastError);
    for (const field of ["color_background", "color_graph_lines", "color_axis_numbers", "color_points", "color_data_lines", "color_panel_accent", "color_text", "colors_json", "window_control_panel_minimized", "window_debug_panel_minimized", "windows_minimized_json", "color_source_background", "color_source_graph_lines", "color_source_axis_numbers", "color_source_points", "color_source_data_lines", "color_source_panel_accent", "color_source_text", "last_error"]) if (!(field in proof)) errors.push("browser proof missing " + field);
    if (pageErrors.length > 0) errors.push("page errors: " + pageErrors.join(" | "));
    if (proof.pointCount === 0) errors.push("point_count is 0 after proof capture");
    if (proof.animationFrameCount === 0) errors.push("animation_frame_count is 0 after proof capture");
    if (proof.pointCount < 10000) errors.push("point_count < 10000 after proof capture");
    const output = { ...proof, controlProof: { before, afterReset, autoBefore, autoAfter, gridBefore, gridAfter, colorBefore, colorAfter, minimizedControl, restoredControl, minimizedDebug, restoredDebug }, ok: errors.length === 0, threshold, htmlPath, pageUrl: localServer.url, screenshotPath, consoleMessages, pageErrors, capturedAt: new Date().toISOString() };
    await page.screenshot({ path: screenshotPath, fullPage: true });
    fs.writeFileSync(proofJsonPath, JSON.stringify(output, null, 2) + "\\n", "utf8");
    if (errors.length > 0) fail(errors.join("; "), JSON.stringify(output, null, 2));
    console.log("GR4PH1C4_BROWSER_RENDER_SMOKE_TEST_PASS");
  } finally { await browser.close(); localServer.server.close(); }
}

main().catch(error => fail(error && error.message ? error.message : String(error), error && error.stack ? error.stack : undefined));
`;
}

export async function runThreeOceanPointsDemo(colorControls: OceanColorControls = defaultOceanColorControls()): Promise<void> {
  await rm(OUTPUT_DIR, { recursive: true, force: true });
  await mkdir(VENDOR_DIR, { recursive: true });
  await copyFile(SOURCE_BUNDLE_PATH, BUNDLE_PATH);
  await writeFile(HTML_PATH, renderThreeOceanHtml(colorControls), "utf8");
  await writeFile(STATE_PATH, `${JSON.stringify(threeOceanState(colorControls), null, 2)}\n`, "utf8");
  await writeFile(PROOF_PATH, `${proofLines().join("\n")}\n`, "utf8");
  await writeFile(SMOKE_PATH, renderSmokeTest(), "utf8");
  await writeFile(BROWSER_SMOKE_PATH, renderBrowserSmokeTest(), "utf8");
  console.log(proofLines().join("\n"));
}
