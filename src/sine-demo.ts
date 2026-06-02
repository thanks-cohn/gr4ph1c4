declare const require: (name: string) => {
  mkdir?: (path: string, options: { recursive: boolean }) => Promise<void>;
  writeFile?: (path: string, data: string, encoding: "utf8") => Promise<void>;
  join?: (...parts: string[]) => string;
};

declare const process: {
  stdin: {
    setEncoding: (encoding: "utf8") => void;
    on: (event: "data" | "end" | "error", handler: (chunk?: string | Error) => void) => void;
    resume: () => void;
  };
};

const fsPromises = require("node:fs/promises");
const pathModule = require("node:path");

import { G4Error } from "./errors";

const { mkdir, writeFile } = fsPromises as {
  mkdir: (path: string, options: { recursive: boolean }) => Promise<void>;
  writeFile: (path: string, data: string, encoding: "utf8") => Promise<void>;
};
const { join } = pathModule as { join: (...parts: string[]) => string };

export interface SineRecord {
  t: number;
  series: "sine_wave";
  x: number;
  y: number;
}

interface SineDemoOptions {
  stdin: boolean;
  windowSize: number;
  out: string;
}

interface SineControls {
  amplitude: number;
  frequency: number;
  phase: number;
  yOffset: number;
  xScale: number;
  graphWidth: number;
  graphHeight: number;
  visiblePoints: number;
  displayMode: "line" | "dots" | "bars";
  showGrid: boolean;
  showValues: boolean;
}

const DEFAULT_CONTROLS: SineControls = {
  amplitude: 1,
  frequency: 1,
  phase: 0,
  yOffset: 0,
  xScale: 1,
  graphWidth: 960,
  graphHeight: 420,
  visiblePoints: 48,
  displayMode: "line",
  showGrid: true,
  showValues: false,
};

export function emitSineStream(): void {
  for (let t = 0; t < 120; t += 1) {
    const record: SineRecord = {
      t,
      series: "sine_wave",
      x: t,
      y: Number(Math.sin(t * 0.2).toFixed(6)),
    };
    console.log(JSON.stringify(record));
  }
}

export function parseSineDemoOptions(args: string[]): SineDemoOptions {
  const options: Partial<SineDemoOptions> = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--stdin") {
      options.stdin = true;
      continue;
    }
    if (arg === "--window") {
      const value = args[index + 1];
      const parsed = Number(value);
      if (!value || !Number.isInteger(parsed) || parsed <= 0) {
        throw new G4Error({
          code: "GR4_STREAM_BAD_WINDOW",
          where: "sine-demo --window",
          what: "missing or invalid positive integer window size",
          why: "sine-demo needs a finite rolling window so older stream records can be discarded.",
          next: "Run `node dist/main.js emit-sine-stream | node dist/main.js sine-demo --stdin --window 48 --out dist/sine-demo`.",
        });
      }
      options.windowSize = parsed;
      index += 1;
      continue;
    }
    if (arg === "--out") {
      const value = args[index + 1];
      if (!value) {
        throw new G4Error({
          code: "GR4_STREAM_MISSING_OUT",
          where: "sine-demo --out",
          what: "missing output directory",
          why: "sine-demo writes index.html, sine-window.json, and proof.log into one local directory.",
          next: "Pass `--out dist/sine-demo`.",
        });
      }
      options.out = value;
      index += 1;
      continue;
    }
    throw new G4Error({
      code: "GR4_STREAM_UNKNOWN_ARG",
      where: "sine-demo arguments",
      what: `unknown sine-demo argument ${arg}`,
      why: "sine-demo only accepts --stdin, --window <n>, and --out <directory>.",
      next: "Run `node dist/main.js emit-sine-stream | node dist/main.js sine-demo --stdin --window 48 --out dist/sine-demo`.",
    });
  }

  if (!options.stdin) {
    throw new G4Error({
      code: "GR4_STREAM_STDIN_REQUIRED",
      where: "sine-demo input",
      what: "sine-demo was run without --stdin",
      why: "PASS 4 proves local JSONL stream ingestion through stdin, not a server or database.",
      next: "Pipe `emit-sine-stream` into `sine-demo --stdin`.",
    });
  }

  return {
    stdin: true,
    windowSize: options.windowSize ?? 48,
    out: options.out ?? join("dist", "sine-demo"),
  };
}

function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let input = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      input += String(chunk ?? "");
    });
    process.stdin.on("end", () => resolve(input));
    process.stdin.on("error", (error) => reject(error));
    process.stdin.resume();
  });
}

function invalidRecord(lineNumber: number, what: string, why: string): G4Error {
  return new G4Error({
    code: "GR4_STREAM_INVALID_RECORD",
    where: `stdin JSONL line ${lineNumber}`,
    what,
    why,
    next: "Emit records shaped like {\"t\":0,\"series\":\"sine_wave\",\"x\":0,\"y\":0} with numeric t, x, and y fields.",
  });
}

function validateRecord(value: unknown, lineNumber: number): SineRecord {
  if (!value || typeof value !== "object") {
    throw invalidRecord(lineNumber, "record is not a JSON object", "Each JSONL line must parse to one stream record object.");
  }
  const record = value as Partial<SineRecord>;
  if (typeof record.t !== "number" || !Number.isFinite(record.t)) {
    throw invalidRecord(lineNumber, "record.t is missing or not a finite number", "The rolling window is ordered by numeric t values.");
  }
  if (record.series !== "sine_wave") {
    throw invalidRecord(lineNumber, "record.series is missing or not sine_wave", "PASS 4 only accepts the deterministic local sine_wave series.");
  }
  if (typeof record.x !== "number" || !Number.isFinite(record.x)) {
    throw invalidRecord(lineNumber, "record.x is missing or not a finite number", "The graph needs a numeric x coordinate for each retained value.");
  }
  if (typeof record.y !== "number" || !Number.isFinite(record.y)) {
    throw invalidRecord(lineNumber, "record.y is missing or not a finite number", "The SVG graph needs a numeric y value for each retained point.");
  }
  return { t: record.t, series: "sine_wave", x: record.x, y: record.y };
}

function parseJsonl(input: string): SineRecord[] {
  const records: SineRecord[] = [];
  const lines = input.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) {
      continue;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(line) as unknown;
    } catch {
      throw invalidRecord(index + 1, "line is not valid JSON", "sine-demo reads newline-delimited JSON records from stdin.");
    }
    records.push(validateRecord(parsed, index + 1));
  }
  return records;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function computePoint(record: SineRecord, visibleRecords: SineRecord[], controls: SineControls): { x: number; y: number; label: string } {
  const padding = 44;
  const drawableWidth = controls.graphWidth - padding * 2;
  const drawableHeight = controls.graphHeight - padding * 2;
  const index = visibleRecords.indexOf(record);
  const denominator = Math.max(1, visibleRecords.length - 1);
  const centered = index / denominator - 0.5;
  const x = padding + drawableWidth / 2 + centered * drawableWidth * controls.xScale;
  const visualY = Math.sin(record.x * 0.2 * controls.frequency + controls.phase) * controls.amplitude + controls.yOffset;
  const y = padding + drawableHeight / 2 - (visualY / 3.5) * drawableHeight;
  return { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)), label: `${record.t}: ${visualY.toFixed(3)}` };
}

function buildInitialPolyline(records: SineRecord[], controls: SineControls): string {
  return records.map((record) => {
    const point = computePoint(record, records, controls);
    return `${point.x},${point.y}`;
  }).join(" ");
}

function buildGrid(width: number, height: number): string {
  const lines: string[] = [];
  for (let i = 0; i <= 6; i += 1) {
    const x = Number(((width / 6) * i).toFixed(2));
    lines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${height}" class="grid-line"></line>`);
  }
  for (let i = 0; i <= 4; i += 1) {
    const y = Number(((height / 4) * i).toFixed(2));
    lines.push(`<line x1="0" y1="${y}" x2="${width}" y2="${y}" class="grid-line"></line>`);
  }
  return lines.join("\n          ");
}

function proofLines(options: SineDemoOptions, state: { recordsIngested: number; recordsRetained: number; recordsDiscarded: number; firstRetainedT: number; lastRetainedT: number }): string[] {
  return [
    "input: stdin JSONL sine stream",
    "emitter: emit-sine-stream",
    "demo: sine-stream-control",
    "series: sine_wave",
    `records ingested: ${state.recordsIngested}`,
    `window size: ${options.windowSize}`,
    `records retained: ${state.recordsRetained}`,
    `records discarded: ${state.recordsDiscarded}`,
    `first retained t: ${state.firstRetainedT}`,
    `last retained t: ${state.lastRetainedT}`,
    "controls: amplitude, frequency, phase, y-offset, x-scale, graph-width, graph-height, visible-points, display-mode, show-grid, show-values, pause-resume, capture-moment",
    `output: ${join(options.out, "index.html")}`,
    `state: ${join(options.out, "sine-window.json")}`,
    "PASS GR4PH1C4 V0 PASS 4 sine demo proof",
  ];
}

function renderSineDemoHtml(records: SineRecord[], windowSize: number, recordsIngested: number, recordsDiscarded: number): string {
  const controls = DEFAULT_CONTROLS;
  const firstRetainedT = records[0]?.t ?? 0;
  const lastRetainedT = records[records.length - 1]?.t ?? 0;
  const recordsJson = JSON.stringify(records);
  const polyline = buildInitialPolyline(records, controls);
  const stateJson = JSON.stringify({
    demoName: "sine-stream-control",
    series: "sine_wave",
    amplitude: controls.amplitude,
    frequency: controls.frequency,
    phase: controls.phase,
    yOffset: controls.yOffset,
    xScale: controls.xScale,
    graphWidth: controls.graphWidth,
    graphHeight: controls.graphHeight,
    visiblePoints: controls.visiblePoints,
    displayMode: controls.displayMode,
    showGrid: controls.showGrid,
    showValues: controls.showValues,
    recordsIngested,
    recordsRetained: records.length,
    recordsDiscarded,
    firstVisibleT: firstRetainedT,
    lastVisibleT: lastRetainedT,
    currentWindow: `t=${firstRetainedT}..${lastRetainedT}`,
  }, null, 2);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Gr4ph1c4 Sine Stream Control Demo</title>
  <style>
    :root { color-scheme: dark; --bg: #070914; --panel: rgba(19, 25, 48, 0.82); --line: #72f2ff; --hot: #ff4fd8; --text: #f5f7ff; --muted: #aab4d4; }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: var(--text); background: radial-gradient(circle at 15% 10%, rgba(255,79,216,.28), transparent 30%), radial-gradient(circle at 85% 15%, rgba(114,242,255,.22), transparent 32%), linear-gradient(145deg, #050713 0%, #111832 55%, #050713 100%); }
    main { width: min(1180px, calc(100vw - 32px)); margin: 0 auto; padding: 32px 0 48px; }
    .hero { padding: 34px; border: 1px solid rgba(255,255,255,.14); border-radius: 28px; background: linear-gradient(135deg, rgba(255,255,255,.12), rgba(255,255,255,.04)); box-shadow: 0 26px 80px rgba(0,0,0,.45); }
    h1 { margin: 0 0 12px; font-size: clamp(2rem, 6vw, 4.8rem); line-height: .95; letter-spacing: -.06em; }
    .hero p { max-width: 820px; color: var(--muted); font-size: 1.08rem; line-height: 1.65; }
    .proof-strip { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-top: 20px; }
    .proof-strip span, .panel { border: 1px solid rgba(255,255,255,.13); background: var(--panel); border-radius: 18px; padding: 14px; backdrop-filter: blur(12px); }
    .stage { margin-top: 20px; padding: 18px; border-radius: 28px; border: 1px solid rgba(255,255,255,.14); background: rgba(3, 6, 18, .62); box-shadow: inset 0 0 80px rgba(114,242,255,.06); overflow-x: auto; }
    svg { display: block; max-width: 100%; border-radius: 20px; background: linear-gradient(180deg, rgba(14,19,40,.96), rgba(4,8,22,.98)); }
    .grid-line { stroke: rgba(255,255,255,.1); stroke-width: 1; }
    .axis-line { stroke: rgba(255,255,255,.32); stroke-width: 1.5; }
    .wave-line { fill: none; stroke: var(--line); stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; filter: drop-shadow(0 0 10px rgba(114,242,255,.8)); }
    .dot { fill: var(--hot); stroke: white; stroke-width: 1.5; filter: drop-shadow(0 0 8px rgba(255,79,216,.65)); }
    .bar { fill: rgba(114,242,255,.42); stroke: var(--line); stroke-width: 1; }
    .value-label { fill: #f5f7ff; font-size: 11px; paint-order: stroke; stroke: rgba(0,0,0,.75); stroke-width: 3px; }
    .workspace { display: grid; grid-template-columns: minmax(280px, 360px) 1fr; gap: 20px; margin-top: 20px; align-items: start; }
    .controls { display: grid; gap: 14px; }
    label { display: grid; gap: 7px; color: var(--text); font-weight: 750; }
    input, select, button { width: 100%; accent-color: #72f2ff; border-radius: 12px; border: 1px solid rgba(255,255,255,.16); background: rgba(255,255,255,.08); color: var(--text); padding: 10px 12px; }
    button { cursor: pointer; font-weight: 800; background: linear-gradient(135deg, rgba(114,242,255,.24), rgba(255,79,216,.2)); }
    .checks label { grid-template-columns: auto 1fr; display: grid; align-items: center; }
    .checks input { width: auto; }
    pre { margin: 0; white-space: pre-wrap; color: #dffcff; font-size: .86rem; line-height: 1.45; }
    .stat { color: var(--muted); }
    @media (max-width: 860px) { .workspace, .proof-strip { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <main
    data-demo="sine-stream-control"
    data-stream-source="stdin"
    data-series="sine_wave"
    data-records-ingested="${recordsIngested}"
    data-window-size="${windowSize}"
    data-records-retained="${records.length}"
    data-records-discarded="${recordsDiscarded}"
    data-first-retained-t="${firstRetainedT}"
    data-last-retained-t="${lastRetainedT}"
    data-amplitude="1"
    data-frequency="1"
    data-phase="0"
    data-y-offset="0"
    data-x-scale="1"
    data-graph-width="960"
    data-graph-height="420"
    data-display-mode="line">
    <section class="hero">
      <p class="stat">local deterministic JSONL stdin stream · no server · no external telemetry claim</p>
      <h1>Gr4ph1c4 Sine Stream Control Demo</h1>
      <p>A real deterministic sine stream emitted ${recordsIngested} JSONL records. Gr4ph1c4 ingested the stream through stdin, discarded older values, kept the latest rolling window, and rendered that retained window as an inspectable SVG graph with browser-side controls.</p>
      <div class="proof-strip" aria-label="stream proof">
        <span>records ingested: ${recordsIngested}</span>
        <span>records retained: ${records.length}</span>
        <span>records discarded: ${recordsDiscarded}</span>
        <span>current window: t=${firstRetainedT}..${lastRetainedT}</span>
      </div>
    </section>

    <section class="stage" aria-label="sine graph stage">
      <svg id="sineGraph" width="960" height="420" viewBox="0 0 960 420" role="img" aria-label="Retained sine wave window">
        <g id="gridLayer">${buildGrid(controls.graphWidth, controls.graphHeight)}</g>
        <line class="axis-line" x1="0" y1="210" x2="960" y2="210"></line>
        <g id="plotLayer"><polyline class="wave-line" points="${polyline}"></polyline></g>
      </svg>
    </section>

    <section class="workspace">
      <div class="panel controls" aria-label="graph controls">
        <label>Amplitude <input id="amplitude" type="range" min="0.25" max="3" step="0.05" value="1"></label>
        <label>Frequency <input id="frequency" type="range" min="0.25" max="4" step="0.05" value="1"></label>
        <label>Phase <input id="phase" type="range" min="0" max="6.283" step="0.001" value="0"></label>
        <label>Y Offset <input id="yOffset" type="range" min="-2" max="2" step="0.05" value="0"></label>
        <label>X Scale <input id="xScale" type="range" min="0.5" max="3" step="0.05" value="1"></label>
        <label>Graph Width <select id="graphWidth"><option>720</option><option selected>960</option><option>1200</option></select></label>
        <label>Graph Height <select id="graphHeight"><option>280</option><option selected>420</option><option>640</option></select></label>
        <label>Visible Points <select id="visiblePoints"><option>24</option><option selected>48</option><option>72</option></select></label>
        <label>Display Mode <select id="displayMode"><option selected>line</option><option>dots</option><option>bars</option></select></label>
        <div class="checks">
          <label><input id="showGrid" type="checkbox" checked> Show Grid</label>
          <label><input id="showValues" type="checkbox"> Show Values</label>
        </div>
        <button id="pauseButton" type="button">Pause</button>
        <button id="captureButton" type="button">Capture Moment</button>
      </div>
      <div class="panel" aria-label="captured state panel">
        <h2>Live / Captured State</h2>
        <p class="stat">Capture Moment writes the current visual state into this on-page JSON block. The local file does not silently write files to disk.</p>
        <pre id="captureBlock"><code>${escapeHtml(stateJson)}</code></pre>
      </div>
    </section>
  </main>
  <script>
    const allRecords = ${recordsJson};
    const meta = { demoName: "sine-stream-control", series: "sine_wave", recordsIngested: ${recordsIngested}, recordsRetained: ${records.length}, recordsDiscarded: ${recordsDiscarded} };
    const els = {
      svg: document.getElementById("sineGraph"), grid: document.getElementById("gridLayer"), plot: document.getElementById("plotLayer"), capture: document.getElementById("captureBlock"),
      amplitude: document.getElementById("amplitude"), frequency: document.getElementById("frequency"), phase: document.getElementById("phase"), yOffset: document.getElementById("yOffset"), xScale: document.getElementById("xScale"), graphWidth: document.getElementById("graphWidth"), graphHeight: document.getElementById("graphHeight"), visiblePoints: document.getElementById("visiblePoints"), displayMode: document.getElementById("displayMode"), showGrid: document.getElementById("showGrid"), showValues: document.getElementById("showValues"), pauseButton: document.getElementById("pauseButton"), captureButton: document.getElementById("captureButton")
    };
    let paused = false;
    let animationPhase = 0;
    function controls() { return { amplitude: Number(els.amplitude.value), frequency: Number(els.frequency.value), phase: Number(els.phase.value) + animationPhase, yOffset: Number(els.yOffset.value), xScale: Number(els.xScale.value), graphWidth: Number(els.graphWidth.value), graphHeight: Number(els.graphHeight.value), visiblePoints: Number(els.visiblePoints.value), displayMode: els.displayMode.value, showGrid: els.showGrid.checked, showValues: els.showValues.checked }; }
    function visibleRecords(c) { return allRecords.slice(Math.max(0, allRecords.length - c.visiblePoints)); }
    function point(record, index, records, c) { const pad = 44; const w = c.graphWidth - pad * 2; const h = c.graphHeight - pad * 2; const denom = Math.max(1, records.length - 1); const centered = index / denom - 0.5; const x = pad + w / 2 + centered * w * c.xScale; const v = Math.sin(record.x * 0.2 * c.frequency + c.phase) * c.amplitude + c.yOffset; const y = pad + h / 2 - (v / 3.5) * h; return { x, y, value: v }; }
    function gridLines(c) { let html = ""; for (let i = 0; i <= 6; i++) { const x = c.graphWidth / 6 * i; html += '<line x1="' + x + '" y1="0" x2="' + x + '" y2="' + c.graphHeight + '" class="grid-line"></line>'; } for (let i = 0; i <= 4; i++) { const y = c.graphHeight / 4 * i; html += '<line x1="0" y1="' + y + '" x2="' + c.graphWidth + '" y2="' + y + '" class="grid-line"></line>'; } return html; }
    function draw() { const c = controls(); const records = visibleRecords(c); els.svg.setAttribute("width", c.graphWidth); els.svg.setAttribute("height", c.graphHeight); els.svg.setAttribute("viewBox", "0 0 " + c.graphWidth + " " + c.graphHeight); els.grid.style.display = c.showGrid ? "block" : "none"; els.grid.innerHTML = gridLines(c); const pts = records.map((r, i) => point(r, i, records, c)); let html = '<line class="axis-line" x1="0" y1="' + (c.graphHeight / 2) + '" x2="' + c.graphWidth + '" y2="' + (c.graphHeight / 2) + '"></line>'; if (c.displayMode === "line") { html += '<polyline class="wave-line" points="' + pts.map(p => p.x.toFixed(2) + ',' + p.y.toFixed(2)).join(' ') + '"></polyline>'; } if (c.displayMode === "dots") { html += pts.map(p => '<circle class="dot" cx="' + p.x.toFixed(2) + '" cy="' + p.y.toFixed(2) + '" r="5"></circle>').join(''); } if (c.displayMode === "bars") { html += pts.map(p => '<rect class="bar" x="' + (p.x - 3).toFixed(2) + '" y="' + Math.min(p.y, c.graphHeight / 2).toFixed(2) + '" width="6" height="' + Math.abs(c.graphHeight / 2 - p.y).toFixed(2) + '"></rect>').join(''); } if (c.showValues) { html += pts.map((p, i) => '<text class="value-label" x="' + (p.x + 6).toFixed(2) + '" y="' + (p.y - 8).toFixed(2) + '">' + records[i].t + ': ' + p.value.toFixed(2) + '</text>').join(''); } els.plot.innerHTML = html; return { c, records }; }
    function captureMoment() { const drawn = draw(); const c = drawn.c; const records = drawn.records; const first = records[0] ? records[0].t : null; const last = records[records.length - 1] ? records[records.length - 1].t : null; const payload = { demoName: meta.demoName, series: meta.series, amplitude: c.amplitude, frequency: c.frequency, phase: Number(c.phase.toFixed(3)), yOffset: c.yOffset, xScale: c.xScale, graphWidth: c.graphWidth, graphHeight: c.graphHeight, visiblePoints: c.visiblePoints, displayMode: c.displayMode, showGrid: c.showGrid, showValues: c.showValues, recordsIngested: meta.recordsIngested, recordsRetained: meta.recordsRetained, recordsDiscarded: meta.recordsDiscarded, firstVisibleT: first, lastVisibleT: last, currentWindow: "t=" + first + ".." + last }; els.capture.textContent = JSON.stringify(payload, null, 2); }
    for (const key of ["amplitude", "frequency", "phase", "yOffset", "xScale", "graphWidth", "graphHeight", "visiblePoints", "displayMode", "showGrid", "showValues"]) { els[key].addEventListener("input", draw); els[key].addEventListener("change", draw); }
    els.pauseButton.addEventListener("click", () => { paused = !paused; els.pauseButton.textContent = paused ? "Resume" : "Pause"; });
    els.captureButton.addEventListener("click", captureMoment);
    function tick() { if (!paused) { animationPhase = (animationPhase + 0.006) % 6.283; draw(); } requestAnimationFrame(tick); }
    draw(); requestAnimationFrame(tick);
  </script>
</body>
</html>`;
}

export async function runSineDemo(args: string[]): Promise<void> {
  const options = parseSineDemoOptions(args);
  const input = await readStdin();
  const records = parseJsonl(input);
  const retained = records.slice(Math.max(0, records.length - options.windowSize));
  const recordsDiscarded = records.length - retained.length;
  const firstRetainedT = retained[0]?.t ?? 0;
  const lastRetainedT = retained[retained.length - 1]?.t ?? 0;

  const state = {
    demoName: "sine-stream-control",
    streamSource: "stdin",
    series: "sine_wave",
    recordsIngested: records.length,
    windowSize: options.windowSize,
    recordsRetained: retained.length,
    recordsDiscarded,
    firstRetainedT,
    lastRetainedT,
    controls: DEFAULT_CONTROLS,
    records: retained,
  };

  const html = renderSineDemoHtml(retained, options.windowSize, records.length, recordsDiscarded);
  const proof = proofLines(options, { recordsIngested: records.length, recordsRetained: retained.length, recordsDiscarded, firstRetainedT, lastRetainedT });

  await mkdir(options.out, { recursive: true });
  await writeFile(join(options.out, "index.html"), html, "utf8");
  await writeFile(join(options.out, "sine-window.json"), `${JSON.stringify(state, null, 2)}\n`, "utf8");
  await writeFile(join(options.out, "proof.log"), `${proof.join("\n")}\n`, "utf8");
  console.log(proof.join("\n"));
}
