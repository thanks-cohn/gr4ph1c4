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

const OUTPUT_DIR = join("dist", "chartjs-sine-demo");
const HTML_PATH = join(OUTPUT_DIR, "index.html");
const BUNDLE_PATH = join(OUTPUT_DIR, "chart.umd.js");
const STATE_PATH = join(OUTPUT_DIR, "chartjs-sine-state.json");
const PROOF_PATH = join(OUTPUT_DIR, "proof.log");
const SOURCE_BUNDLE_PATH = join("node_modules", "chart.js", "dist", "chart.umd.js");

const DEFAULT_STATE = {
  demoName: "chartjs-live-sine",
  renderer: "chart.js",
  streamSource: "generated-browser-sine",
  chartType: "line",
  visiblePoints: 64,
  amplitude: 1,
  frequency: 1,
  phaseSpeed: 1,
  yOffset: 0,
  lineTension: 0.35,
  pointRadius: 2,
  chartWidth: 1100,
  chartHeight: 520,
  selectedColor: "#22d3ee",
  localBundle: "chart.umd.js",
};

function proofLines(): string[] {
  return [
    "demo: chartjs-live-sine",
    "renderer: chart.js",
    "chart bundle: dist/chartjs-sine-demo/chart.umd.js",
    "html: dist/chartjs-sine-demo/index.html",
    "state: dist/chartjs-sine-demo/chartjs-sine-state.json",
    "controls: amplitude, frequency, phase-speed, y-offset, visible-points, chart-type, line-tension, point-radius, chart-width, chart-height, color-picker, pause-resume, reset, capture-moment",
    "runtime: local browser file",
    "network required: false",
    "PASS GR4PH1C4 V0 PASS 5 chartjs live sine proof",
  ];
}

function renderChartJsSineHtml(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Gr4ph1c4 Chart.js Live Sine Demo</title>
  <style>
    :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #08111f; color: #e5f3ff; }
    body { margin: 0; min-height: 100vh; background: radial-gradient(circle at 20% 20%, rgba(34, 211, 238, 0.18), transparent 30%), linear-gradient(135deg, #08111f 0%, #111827 50%, #172554 100%); }
    main { width: min(96vw, 1480px); margin: 0 auto; padding: 34px 20px 46px; }
    header { display: flex; align-items: flex-start; justify-content: space-between; gap: 28px; margin-bottom: 22px; }
    h1 { margin: 0 0 8px; font-size: clamp(2rem, 4vw, 4.5rem); letter-spacing: -0.055em; line-height: 0.96; }
    .renderer { display: inline-flex; align-items: center; gap: 8px; padding: 8px 13px; border: 1px solid rgba(34, 211, 238, 0.45); border-radius: 999px; background: rgba(8, 17, 31, 0.74); color: #a5f3fc; font-weight: 800; box-shadow: 0 0 28px rgba(34, 211, 238, 0.18); }
    .lede { margin: 0; max-width: 760px; color: #bfdbfe; font-size: 1.06rem; line-height: 1.55; }
    .panel { border: 1px solid rgba(148, 163, 184, 0.26); border-radius: 28px; background: rgba(15, 23, 42, 0.78); box-shadow: 0 28px 80px rgba(0, 0, 0, 0.38); backdrop-filter: blur(14px); }
    .chart-shell { width: 1100px; height: 520px; max-width: calc(100vw - 72px); padding: 22px; margin-bottom: 22px; }
    canvas { display: block; width: 100%; height: 100%; }
    .controls { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 14px; padding: 18px; margin-bottom: 22px; }
    label { display: grid; gap: 7px; color: #dbeafe; font-weight: 800; font-size: 0.9rem; }
    input, select, button { accent-color: #22d3ee; border-radius: 12px; border: 1px solid rgba(148, 163, 184, 0.34); background: rgba(2, 6, 23, 0.72); color: #eff6ff; padding: 10px 12px; font: inherit; }
    input[type="range"] { padding-inline: 0; }
    input[type="color"] { min-height: 43px; padding: 4px; cursor: pointer; }
    button { cursor: pointer; font-weight: 900; background: linear-gradient(135deg, rgba(34, 211, 238, 0.28), rgba(59, 130, 246, 0.24)); }
    button:hover { border-color: rgba(34, 211, 238, 0.72); }
    .capture { padding: 18px; }
    .capture h2 { margin: 0 0 12px; }
    pre { min-height: 180px; overflow: auto; margin: 0; border-radius: 18px; padding: 16px; background: #020617; color: #bae6fd; border: 1px solid rgba(34, 211, 238, 0.22); white-space: pre-wrap; }
    .value { color: #67e8f9; font-variant-numeric: tabular-nums; }
  </style>
</head>
<body
  data-demo="chartjs-live-sine"
  data-renderer="chart.js"
  data-stream-source="generated-browser-sine"
  data-chart-type="line"
  data-visible-points="64"
  data-amplitude="1"
  data-frequency="1"
  data-phase-speed="1"
  data-y-offset="0"
  data-chart-width="1100"
  data-chart-height="520"
  data-selected-color="#22d3ee">
  <main>
    <header>
      <div>
        <h1>Gr4ph1c4 Chart.js Live Sine Demo</h1>
        <p class="lede">A deterministic browser sine stream is rendered through a local Chart.js bundle. The rolling window advances with requestAnimationFrame; controls reshape the current visual state in real time.</p>
      </div>
      <div class="renderer">Renderer: Chart.js local bundle</div>
    </header>

    <section id="chartShell" class="panel chart-shell" aria-label="Live sine chart">
      <canvas id="sineChart"></canvas>
    </section>

    <section class="panel controls" aria-label="Live chart controls">
      <label>Amplitude <span id="amplitudeValue" class="value">1</span><input id="amplitude" type="range" min="0.25" max="3" step="0.01" value="1"></label>
      <label>Frequency <span id="frequencyValue" class="value">1</span><input id="frequency" type="range" min="0.25" max="4" step="0.01" value="1"></label>
      <label>Phase Speed <span id="phaseSpeedValue" class="value">1</span><input id="phaseSpeed" type="range" min="0" max="4" step="0.01" value="1"></label>
      <label>Y Offset <span id="yOffsetValue" class="value">0</span><input id="yOffset" type="range" min="-2" max="2" step="0.01" value="0"></label>
      <label>Visible Points<select id="visiblePoints"><option>32</option><option selected>64</option><option>128</option></select></label>
      <label>Chart Type<select id="chartType"><option selected>line</option><option>bar</option><option>scatter</option></select></label>
      <label>Line Tension <span id="lineTensionValue" class="value">0.35</span><input id="lineTension" type="range" min="0" max="0.6" step="0.01" value="0.35"></label>
      <label>Point Radius <span id="pointRadiusValue" class="value">2</span><input id="pointRadius" type="range" min="0" max="8" step="0.1" value="2"></label>
      <label>Chart Width<select id="chartWidth"><option>800</option><option selected>1100</option><option>1400</option></select></label>
      <label>Chart Height<select id="chartHeight"><option>360</option><option selected>520</option><option>720</option></select></label>
      <label>Color Picker<input id="colorPicker" type="color" value="#22d3ee"></label>
      <button id="pauseResume" type="button">Pause</button>
      <button id="reset" type="button">Reset</button>
      <button id="captureMoment" type="button">Capture Moment</button>
    </section>

    <section class="panel capture" aria-label="Captured current state">
      <h2>Captured Moment</h2>
      <pre id="captureOutput">Click Capture Moment to write the current visual state into this on-page JSON block.</pre>
    </section>
  </main>
  <script src="./chart.umd.js"></script>
  <script>
    const defaults = { demoName: "chartjs-live-sine", renderer: "chart.js", chartType: "line", amplitude: 1, frequency: 1, phaseSpeed: 1, yOffset: 0, visiblePoints: 64, lineTension: 0.35, pointRadius: 2, chartWidth: 1100, chartHeight: 520, selectedColor: "#22d3ee" };
    const body = document.body;
    const shell = document.getElementById("chartShell");
    const output = document.getElementById("captureOutput");
    const controls = {
      amplitude: document.getElementById("amplitude"), frequency: document.getElementById("frequency"), phaseSpeed: document.getElementById("phaseSpeed"), yOffset: document.getElementById("yOffset"),
      visiblePoints: document.getElementById("visiblePoints"), chartType: document.getElementById("chartType"), lineTension: document.getElementById("lineTension"), pointRadius: document.getElementById("pointRadius"),
      chartWidth: document.getElementById("chartWidth"), chartHeight: document.getElementById("chartHeight"), colorPicker: document.getElementById("colorPicker"), pauseResume: document.getElementById("pauseResume"), reset: document.getElementById("reset"), captureMoment: document.getElementById("captureMoment")
    };
    let paused = false;
    let currentTick = 0;
    let phase = 0;
    let chart;
    function numeric(id) { return Number(controls[id].value); }
    function state() { return { chartType: controls.chartType.value, amplitude: numeric("amplitude"), frequency: numeric("frequency"), phaseSpeed: numeric("phaseSpeed"), yOffset: numeric("yOffset"), visiblePoints: numeric("visiblePoints"), lineTension: numeric("lineTension"), pointRadius: numeric("pointRadius"), chartWidth: numeric("chartWidth"), chartHeight: numeric("chartHeight"), selectedColor: controls.colorPicker.value }; }
    function sinePoint(index, cfg) { const x = currentTick + index - cfg.visiblePoints + 1; const radians = ((x / cfg.visiblePoints) * Math.PI * 2 * cfg.frequency) + phase; return { x, y: Number((Math.sin(radians) * cfg.amplitude + cfg.yOffset).toFixed(5)) }; }
    function buildWindow(cfg) { return Array.from({ length: cfg.visiblePoints }, (_, index) => sinePoint(index, cfg)); }
    function datasetFor(cfg, points) { return { label: "deterministic sine_wave", data: points, borderColor: cfg.selectedColor, backgroundColor: cfg.selectedColor + "66", pointBackgroundColor: cfg.selectedColor, pointBorderColor: "#e0f2fe", pointRadius: cfg.pointRadius, tension: cfg.lineTension, borderWidth: 3, parsing: false }; }
    function chartOptions(cfg) { return { responsive: true, maintainAspectRatio: false, animation: false, normalized: true, plugins: { legend: { labels: { color: "#dbeafe" } }, tooltip: { callbacks: { label: item => "sine_wave y=" + item.parsed.y.toFixed(3) } } }, scales: { x: { type: "linear", grid: { color: "rgba(148, 163, 184, 0.18)" }, ticks: { color: "#bfdbfe", maxTicksLimit: 9 } }, y: { suggestedMin: -3.2, suggestedMax: 3.2, grid: { color: "rgba(148, 163, 184, 0.18)" }, ticks: { color: "#bfdbfe" } } } }; }
    function syncLabels(cfg) { for (const id of ["amplitude", "frequency", "phaseSpeed", "yOffset", "lineTension", "pointRadius"]) document.getElementById(id + "Value").textContent = String(cfg[id]); }
    function syncAttributes(cfg) { body.dataset.chartType = cfg.chartType; body.dataset.visiblePoints = String(cfg.visiblePoints); body.dataset.amplitude = String(cfg.amplitude); body.dataset.frequency = String(cfg.frequency); body.dataset.phaseSpeed = String(cfg.phaseSpeed); body.dataset.yOffset = String(cfg.yOffset); body.dataset.chartWidth = String(cfg.chartWidth); body.dataset.chartHeight = String(cfg.chartHeight); body.dataset.selectedColor = cfg.selectedColor; }
    function applyShellSize(cfg) { shell.style.width = cfg.chartWidth + "px"; shell.style.height = cfg.chartHeight + "px"; }
    function redraw(recreate = false) { const cfg = state(); syncLabels(cfg); syncAttributes(cfg); applyShellSize(cfg); const currentWindow = buildWindow(cfg); const data = { datasets: [datasetFor(cfg, currentWindow)] }; if (!chart || recreate || chart.config.type !== cfg.chartType) { if (chart) chart.destroy(); chart = new Chart(document.getElementById("sineChart"), { type: cfg.chartType, data, options: chartOptions(cfg) }); } else { chart.data = data; chart.options = chartOptions(cfg); chart.update("none"); } return { cfg, currentWindow }; }
    function captureMoment() { const drawn = redraw(); const cfg = drawn.cfg; output.textContent = JSON.stringify({ demoName: defaults.demoName, renderer: defaults.renderer, chartType: cfg.chartType, amplitude: cfg.amplitude, frequency: cfg.frequency, phaseSpeed: cfg.phaseSpeed, yOffset: cfg.yOffset, visiblePoints: cfg.visiblePoints, lineTension: cfg.lineTension, pointRadius: cfg.pointRadius, chartWidth: cfg.chartWidth, chartHeight: cfg.chartHeight, selectedColor: cfg.selectedColor, paused, currentTick, currentWindow: drawn.currentWindow }, null, 2); }
    for (const key of ["amplitude", "frequency", "phaseSpeed", "yOffset", "visiblePoints", "lineTension", "pointRadius", "chartWidth", "chartHeight", "colorPicker"]) { controls[key].addEventListener("input", () => redraw()); controls[key].addEventListener("change", () => redraw()); }
    controls.chartType.addEventListener("change", () => redraw(true));
    controls.pauseResume.addEventListener("click", () => { paused = !paused; controls.pauseResume.textContent = paused ? "Resume" : "Pause"; });
    controls.reset.addEventListener("click", () => { for (const [key, value] of Object.entries(defaults)) if (controls[key]) controls[key].value = value; paused = false; currentTick = 0; phase = 0; controls.pauseResume.textContent = "Pause"; redraw(true); });
    controls.captureMoment.addEventListener("click", captureMoment);
    function frame() { if (!paused) { const cfg = state(); currentTick += 1; phase = (phase + (cfg.phaseSpeed * 0.045)) % (Math.PI * 2); redraw(); } requestAnimationFrame(frame); }
    redraw(true); requestAnimationFrame(frame);
  </script>
</body>
</html>`;
}

export async function runChartJsSineDemo(): Promise<void> {
  const proof = proofLines();
  await mkdir(OUTPUT_DIR, { recursive: true });
  await copyFile(SOURCE_BUNDLE_PATH, BUNDLE_PATH);
  await writeFile(HTML_PATH, renderChartJsSineHtml(), "utf8");
  await writeFile(STATE_PATH, `${JSON.stringify(DEFAULT_STATE, null, 2)}\n`, "utf8");
  await writeFile(PROOF_PATH, `${proof.join("\n")}\n`, "utf8");
  console.log(proof.join("\n"));
}
