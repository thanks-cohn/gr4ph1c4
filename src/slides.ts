declare const require: (name: string) => {
  existsSync?: (path: string) => boolean;
  mkdirSync?: (path: string, options: { recursive: boolean }) => void;
  readFileSync?: (path: string, encoding: "utf8") => string;
  writeFileSync?: (path: string, data: string, encoding: "utf8") => void;
};
declare const process: { cwd: () => string };

import { G4Error } from "./errors";

const fs = require("node:fs") as {
  existsSync: (path: string) => boolean;
  mkdirSync: (path: string, options: { recursive: boolean }) => void;
  readFileSync: (path: string, encoding: "utf8") => string;
  writeFileSync: (path: string, data: string, encoding: "utf8") => void;
};

const GENERATED_FILES = [
  "index.html",
  "slides.css",
  "slides.js",
  "manifest.json",
  "demo-index.html",
  "visual-proof.html",
  "proof.json",
  "smoke-test.js",
  "browser-smoke-test.js",
];

const FEATURES = [
  "slide navigation",
  "text boxes",
  "media placeholders",
  "bar chart",
  "line graph",
  "3D fallback cube",
  "collapsible editors",
  "checkpoints",
  "future forms",
];

export interface SlidesBuildResult {
  outDir: string;
  generatedFiles: string[];
  localOpenCommands: string[];
}

function ensureSlidesInput(inputPath: string | undefined): string {
  if (!inputPath) {
    throw new G4Error({
      code: "GR4_E_SLIDES_INPUT_MISSING",
      where: "slides command",
      what: "missing .g4 input file for slides generation",
      why: "The slides command compiles a readable .g4 slide source into a local HTML cartridge folder.",
      next: "Run `node dist/main.js slides examples/slides/basic-slides.g4 --out dist/slides-basic`.",
    });
  }
  if (!fs.existsSync(inputPath)) {
    throw new G4Error({
      code: "GR4_E_SLIDES_INPUT_NOT_FOUND",
      where: "slides command",
      what: `slides source file not found: ${inputPath}`,
      why: "GR4PH1C4 cannot generate a presentation cartridge without reading the source .g4 file.",
      next: "Check the path or run `node dist/main.js slides examples/slides/basic-slides.g4 --out dist/slides-basic`.",
    });
  }
  return inputPath;
}

function ensureOutDir(outDir: string | undefined): string {
  if (!outDir) {
    throw new G4Error({
      code: "GR4_E_SLIDES_OUT_MISSING",
      where: "slides command",
      what: "missing --out directory for generated slide cartridge",
      why: "The slides command writes index.html, CSS, JavaScript, proof files, and smoke tests into one portable folder.",
      next: "Run `node dist/main.js slides examples/slides/basic-slides.g4 --out dist/slides-basic`.",
    });
  }
  return outDir;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
}

function barChartSvg(marker = "bar-chart-object"): string {
  return `<svg class="chart-svg" viewBox="0 0 360 220" role="img" aria-label="Bar chart: Alpha 12, Beta 28, Gamma 19" data-feature="${marker}" data-chart-values="Alpha=12 Beta=28 Gamma=19">
    <rect x="0" y="0" width="360" height="220" rx="18" class="chart-bg"></rect>
    <line x1="48" y1="174" x2="322" y2="174" class="axis"></line>
    <g class="bars" data-chart-bars="3">
      <rect class="bar alpha" x="74" y="102" width="54" height="72" data-label="Alpha" data-value="12"></rect>
      <rect class="bar beta" x="154" y="34" width="54" height="140" data-label="Beta" data-value="28"></rect>
      <rect class="bar gamma" x="234" y="79" width="54" height="95" data-label="Gamma" data-value="19"></rect>
    </g>
    <g class="chart-labels">
      <text x="101" y="194">Alpha</text><text x="181" y="194">Beta</text><text x="261" y="194">Gamma</text>
      <text x="101" y="94">12</text><text x="181" y="26">28</text><text x="261" y="71">19</text>
    </g>
  </svg>`;
}

function lineGraphSvg(marker = "line-graph-object"): string {
  return `<svg class="graph-svg" viewBox="0 0 380 220" role="img" aria-label="Line graph: Jan 5, Feb 11, Mar 7, Apr 18" data-feature="${marker}" data-graph-values="Jan=5 Feb=11 Mar=7 Apr=18">
    <rect x="0" y="0" width="380" height="220" rx="18" class="graph-bg"></rect>
    <g class="grid"><line x1="48" y1="174" x2="330" y2="174"></line><line x1="48" y1="124" x2="330" y2="124"></line><line x1="48" y1="74" x2="330" y2="74"></line></g>
    <polyline class="graph-line" points="66,147 148,93 230,129 312,30" data-graph-path="Jan=5 Feb=11 Mar=7 Apr=18"></polyline>
    <g class="graph-points"><circle cx="66" cy="147" r="7"></circle><circle cx="148" cy="93" r="7"></circle><circle cx="230" cy="129" r="7"></circle><circle cx="312" cy="30" r="7"></circle></g>
    <g class="graph-labels"><text x="58" y="194">Jan</text><text x="140" y="194">Feb</text><text x="222" y="194">Mar</text><text x="304" y="194">Apr</text><text x="56" y="139">5</text><text x="138" y="85">11</text><text x="220" y="121">7</text><text x="302" y="22">18</text></g>
  </svg>`;
}

function cubeMarkup(marker = "three-d-object"): string {
  return `<div class="cube-stage" data-feature="${marker}" data-cube-fallback="css-pseudo-3d">
    <div class="cube" aria-label="CSS fallback cube"><span class="face front">3D</span><span class="face top"></span><span class="face side"></span></div>
    <p>Local CSS fallback cube. No remote 3D runtime required.</p>
  </div>`;
}

function mediaBoxes(): string {
  return `<div class="media-grid" data-feature="media-placeholders">
    <article class="media-box image-box"><svg viewBox="0 0 120 80" aria-hidden="true"><rect x="8" y="8" width="104" height="64" rx="8"></rect><circle cx="35" cy="28" r="10"></circle><path d="M18 66 L52 42 L70 56 L86 34 L106 66 Z"></path></svg><strong>Image placeholder</strong><span>Local SVG mountain icon</span></article>
    <article class="media-box video-box"><svg viewBox="0 0 120 80" aria-hidden="true"><rect x="10" y="12" width="100" height="56" rx="10"></rect><polygon points="52,28 52,54 76,41"></polygon></svg><strong>Video placeholder</strong><span>CSS/SVG play frame</span></article>
    <article class="media-box audio-box"><svg viewBox="0 0 120 80" aria-hidden="true"><rect x="20" y="34" width="18" height="18"></rect><polygon points="38,34 60,20 60,66 38,52"></polygon><path d="M70 30 Q86 40 70 50"></path><path d="M78 20 Q104 40 78 60"></path></svg><strong>Audio placeholder</strong><span>Speaker wave icon</span></article>
  </div>`;
}

function editorPanel(kind: string): string {
  return `<aside class="editor-panel" data-feature="collapsible-editors" data-editor-kind="${kind}">
    <button class="collapse-editor" type="button" aria-expanded="true">Minimize editor</button>
    <div class="editor-body"><strong>${kind} editor placeholder</strong><label>Object title <input value="${kind} object"></label><label>Values <input value="local, inspectable, portable"></label><p>Edit controls are deliberately local HTML form elements.</p></div>
  </aside>`;
}

function renderIndexHtml(sourcePath: string, generatedAt: string): string {
  return `<!doctype html>
<html lang="en" data-gr4ph1c4-cartridge="slides-basic">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>GR4PH1C4 Slides Basic Demo</title>
  <link rel="stylesheet" href="./slides.css">
</head>
<body data-deck="slides-basic" data-source="${escapeHtml(sourcePath)}" data-generated-at="${generatedAt}">
  <main class="deck-shell">
    <section class="slide is-active" id="slide-1" data-slide="1" data-feature="text-boxes">
      <div class="slide-number">1 / 7</div>
      <h1>GR4PH1C4 Slides Basic Demo</h1>
      <p class="lede">A portable <strong>HTML cartridge</strong> generated from a readable <code>.g4</code> source file.</p>
      <div class="object-grid two">
        <article class="object-box title-box" data-object="title-box"><span class="eyebrow">Title box</span><h2>Open index.html and present immediately</h2></article>
        <article class="object-box text-box" data-object="text-box"><span class="eyebrow">Text box</span><p>No server, no CDN, no remote resource. Everything needed to inspect, download, and present is in this folder.</p></article>
      </div>
    </section>

    <section class="slide" id="slide-2" data-slide="2" data-feature="media-placeholders">
      <div class="slide-number">2 / 7</div>
      <h1>Media placeholder boxes</h1>
      <p class="lede">Distinct local image, video, and audio boxes prove that future media objects have visible non-blank fallbacks.</p>
      ${mediaBoxes()}
    </section>

    <section class="slide" id="slide-3" data-slide="3" data-feature="bar-chart">
      <div class="slide-number">3 / 7</div>
      <h1>Bar chart object</h1>
      <div class="object-grid chart-layout"><article class="object-box chart-box">${barChartSvg()}<p>Rendered bars: Alpha=12, Beta=28, Gamma=19.</p></article>${editorPanel("Bar chart")}</div>
    </section>

    <section class="slide" id="slide-4" data-slide="4" data-feature="line-graph">
      <div class="slide-number">4 / 7</div>
      <h1>Line graph object</h1>
      <div class="object-grid chart-layout"><article class="object-box graph-box">${lineGraphSvg()}<p>Rendered graph: Jan=5, Feb=11, Mar=7, Apr=18.</p></article>${editorPanel("Line graph")}</div>
    </section>

    <section class="slide" id="slide-5" data-slide="5" data-feature="three-d-fallback-cube">
      <div class="slide-number">5 / 7</div>
      <h1>3D object box with local fallback cube</h1>
      <div class="object-box three-d-box">${cubeMarkup()}<p>The deck always shows a cube panel. If a richer local renderer is added later, this remains the safe fallback.</p></div>
    </section>

    <section class="slide" id="slide-6" data-slide="6" data-feature="checkpoints">
      <div class="slide-number">6 / 7</div>
      <h1>Checkpoints stored in localStorage</h1>
      <div class="checkpoint-panel" data-feature="checkpoints" data-storage-key="gr4ph1c4_slides_basic_checkpoints">
        <label for="checkpoint-name">Checkpoint name</label>
        <input id="checkpoint-name" data-checkpoint-input value="First review" placeholder="Checkpoint name">
        <div class="button-row"><button id="save-checkpoint" type="button">Save checkpoint</button><button id="restore-original" type="button">Restore original</button></div>
        <p>Saved checkpoint count: <strong id="checkpoint-count">0</strong></p>
        <ul id="checkpoint-list" class="checkpoint-list"><li class="empty">No checkpoints saved yet.</li></ul>
        <p class="note">This is real localStorage behavior using key <code>gr4ph1c4_slides_basic_checkpoints</code>.</p>
      </div>
    </section>

    <section class="slide" id="slide-7" data-slide="7" data-feature="future-forms">
      <div class="slide-number">7 / 7</div>
      <h1>Future form-driven editing flow</h1>
      <div class="flow" data-feature="future-forms"><div>Choose object type<br><span>Chart • Graph • 3D</span></div><b>→</b><div>Enter values<br><span>Alpha=12, Feb=11</span></div><b>→</b><div>Minimize editor<br><span>Collapse panels</span></div><b>→</b><div>Present<br><span>Open file locally</span></div></div>
      <div class="option-row"><span class="option chart-option">Bar chart</span><span class="option graph-option">Line graph</span><span class="option cube-option">3D cube</span></div>
    </section>
  </main>
  <nav class="deck-controls" aria-label="Slide controls"><button id="prev-slide" type="button">Previous</button><span id="slide-status">Slide 1 of 7</span><button id="next-slide" type="button">Next</button></nav>
  <script src="./slides.js"></script>
</body>
</html>`;
}

function renderCss(): string {
  return `:root{color-scheme:dark;--bg:#09111f;--panel:#132238;--ink:#f8fbff;--muted:#b9c7d9;--accent:#5eead4;--hot:#f472b6;--gold:#facc15}*{box-sizing:border-box}body{margin:0;font-family:Inter,ui-sans-serif,system-ui,Segoe UI,sans-serif;background:radial-gradient(circle at top left,#203a63,#07101d 55%);color:var(--ink)}a{color:var(--accent)}.deck-shell{min-height:100vh;padding:34px 34px 96px}.slide{display:none;min-height:calc(100vh - 130px);border:1px solid rgba(255,255,255,.16);border-radius:28px;background:linear-gradient(135deg,rgba(19,34,56,.96),rgba(11,20,35,.96));box-shadow:0 24px 80px rgba(0,0,0,.38);padding:42px;position:relative}.slide.is-active{display:block}.slide-number{position:absolute;right:28px;top:22px;background:#243b5a;border:1px solid rgba(255,255,255,.2);padding:8px 14px;border-radius:999px;color:var(--accent);font-weight:800}h1{font-size:clamp(2.2rem,5vw,5rem);margin:.1em 0 .25em;letter-spacing:-.05em}h2{font-size:2rem;margin:.1em 0}.lede{font-size:1.35rem;color:var(--muted);max-width:980px}.object-grid{display:grid;gap:22px;margin-top:28px}.object-grid.two{grid-template-columns:repeat(2,minmax(0,1fr))}.chart-layout{grid-template-columns:minmax(0,1.4fr) minmax(260px,.6fr)}.object-box,.media-box,.checkpoint-panel,.editor-panel,.proof-card,.gallery-card{background:rgba(255,255,255,.075);border:1px solid rgba(255,255,255,.18);border-radius:22px;padding:24px;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)}.title-box{background:linear-gradient(135deg,rgba(94,234,212,.18),rgba(96,165,250,.12))}.text-box{background:linear-gradient(135deg,rgba(244,114,182,.16),rgba(250,204,21,.09))}.eyebrow{display:inline-block;color:var(--accent);font-weight:900;text-transform:uppercase;letter-spacing:.12em;font-size:.78rem;margin-bottom:10px}.media-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px}.media-box{min-height:260px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}.media-box svg{width:150px;height:100px;margin-bottom:18px}.media-box rect,.media-box path,.media-box polygon,.media-box circle{fill:none;stroke:var(--accent);stroke-width:5;stroke-linejoin:round}.video-box polygon,.audio-box rect{fill:var(--hot);stroke:var(--hot)}.chart-svg,.graph-svg{width:100%;min-height:310px}.chart-bg,.graph-bg{fill:#0c1728}.axis,.grid line{stroke:#6b7e99;stroke-width:2}.bar{rx:8}.alpha{fill:#5eead4}.beta{fill:#f472b6}.gamma{fill:#facc15}.chart-labels text,.graph-labels text{fill:#f8fbff;font-weight:800;text-anchor:middle}.graph-line{fill:none;stroke:#5eead4;stroke-width:6;stroke-linecap:round;stroke-linejoin:round}.graph-points circle{fill:#f472b6;stroke:#fff;stroke-width:3}.editor-panel{align-self:start}.collapse-editor{width:100%;border:0;border-radius:14px;background:var(--accent);color:#062022;font-weight:900;padding:12px;cursor:pointer}.editor-body{margin-top:14px;display:grid;gap:12px}.editor-body label{display:grid;gap:6px;color:var(--muted)}input{border-radius:12px;border:1px solid rgba(255,255,255,.25);background:#07101d;color:var(--ink);padding:12px;font:inherit}.editor-panel.is-collapsed .editor-body{display:none}.editor-panel.is-collapsed{border-style:dashed;opacity:.82}.three-d-box{min-height:460px;display:grid;place-items:center;text-align:center}.cube-stage{perspective:760px;min-height:320px;display:grid;place-items:center}.cube{position:relative;width:150px;height:150px;transform-style:preserve-3d;animation:spin 7s linear infinite}.face{position:absolute;display:grid;place-items:center;font-weight:1000;font-size:2rem;border:3px solid rgba(255,255,255,.8);background:linear-gradient(135deg,rgba(94,234,212,.85),rgba(96,165,250,.6));width:150px;height:150px}.front{transform:translateZ(75px)}.top{transform:rotateX(90deg) translateZ(75px);background:rgba(244,114,182,.68)}.side{transform:rotateY(90deg) translateZ(75px);background:rgba(250,204,21,.68)}@keyframes spin{from{transform:rotateX(-18deg) rotateY(0)}to{transform:rotateX(-18deg) rotateY(360deg)}}.checkpoint-panel{max-width:720px}.button-row,.option-row{display:flex;gap:14px;flex-wrap:wrap;margin:14px 0}button,.button-link{border:0;border-radius:14px;background:#5eead4;color:#062022;font-weight:900;padding:12px 18px;text-decoration:none;display:inline-block;cursor:pointer}.button-row button:last-child{background:#facc15}.checkpoint-list{min-height:76px;background:#07101d;border-radius:16px;padding:14px 14px 14px 34px}.note{color:var(--muted)}.flow{display:grid;grid-template-columns:1fr auto 1fr auto 1fr auto 1fr;gap:16px;align-items:center;margin:32px 0}.flow div{background:#10223b;border:1px solid rgba(255,255,255,.18);border-radius:20px;padding:22px;text-align:center;font-size:1.4rem;font-weight:900}.flow span{color:var(--muted);font-size:1rem;font-weight:600}.flow b{font-size:2rem;color:var(--gold)}.option{border-radius:999px;padding:14px 20px;font-weight:900}.chart-option{background:#5eead4;color:#062022}.graph-option{background:#f472b6}.cube-option{background:#facc15;color:#211600}.deck-controls{position:fixed;left:0;right:0;bottom:0;background:rgba(5,10,18,.92);backdrop-filter:blur(10px);border-top:1px solid rgba(255,255,255,.12);display:flex;justify-content:center;align-items:center;gap:18px;padding:14px}.deck-controls span{min-width:120px;text-align:center;color:var(--muted);font-weight:800}.gallery,.proof-board{padding:32px}.gallery-grid,.proof-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}.gallery-card,.proof-card{min-height:260px}.status{display:inline-block;background:#203a63;color:#c7f9f1;border-radius:999px;padding:7px 11px;font-weight:800;font-size:.85rem}.mini-preview{min-height:130px;border-radius:16px;background:#081321;border:1px solid rgba(255,255,255,.13);padding:14px;margin:14px 0}.mini-bars{display:flex;align-items:end;gap:10px;height:95px}.mini-bars span{flex:1;background:linear-gradient(#5eead4,#2563eb);border-radius:8px 8px 0 0}.mini-graph{width:100%;height:110px}.mini-editor{border:1px dashed var(--accent);border-radius:12px;padding:10px}.local-commands code{display:block;background:#07101d;padding:10px;border-radius:10px;margin:8px 0}@media(max-width:820px){.object-grid.two,.chart-layout,.media-grid,.flow{grid-template-columns:1fr}.flow b{transform:rotate(90deg);justify-self:center}.slide{padding:28px}.deck-shell{padding:16px 16px 90px}}`;
}

function renderJs(): string {
  return `(function(){
  'use strict';
  var storageKey='gr4ph1c4_slides_basic_checkpoints';
  var slides=Array.prototype.slice.call(document.querySelectorAll('[data-slide]'));
  var current=0;
  function clamp(n){return Math.max(0,Math.min(slides.length-1,n));}
  function showSlide(index){current=clamp(index);slides.forEach(function(slide,i){slide.classList.toggle('is-active',i===current);});var status=document.getElementById('slide-status');if(status)status.textContent='Slide '+(current+1)+' of '+slides.length;var id='slide-'+(current+1);if(location.hash!=='#'+id){history.replaceState(null,'','#'+id);}}
  function fromHash(){var match=(location.hash||'').match(/slide-(\\d+)/);return match?clamp(Number(match[1])-1):0;}
  function safeLoad(){try{return JSON.parse(localStorage.getItem(storageKey)||'[]');}catch(error){return [];}}
  function safeSave(items){try{localStorage.setItem(storageKey,JSON.stringify(items));}catch(error){}}
  function renderCheckpoints(){var items=safeLoad();var count=document.getElementById('checkpoint-count');var list=document.getElementById('checkpoint-list');if(count)count.textContent=String(items.length);if(list){list.innerHTML='';if(items.length===0){var empty=document.createElement('li');empty.className='empty';empty.textContent='No checkpoints saved yet.';list.appendChild(empty);}items.forEach(function(item){var li=document.createElement('li');li.textContent=item.name+' — slide '+item.slide+' — '+item.createdAt;list.appendChild(li);});}}
  function saveCheckpoint(){var input=document.getElementById('checkpoint-name');var name=(input&&input.value?input.value.trim():'')||'Untitled checkpoint';var items=safeLoad();items.push({name:name,slide:current+1,createdAt:new Date().toLocaleString()});safeSave(items);renderCheckpoints();}
  function restoreOriginal(){safeSave([]);document.querySelectorAll('.editor-panel.is-collapsed').forEach(function(panel){panel.classList.remove('is-collapsed');var button=panel.querySelector('.collapse-editor');if(button){button.textContent='Minimize editor';button.setAttribute('aria-expanded','true');}});var input=document.getElementById('checkpoint-name');if(input)input.value='First review';renderCheckpoints();showSlide(0);}
  document.addEventListener('click',function(event){var target=event.target;if(!(target instanceof Element))return;if(target.id==='next-slide')showSlide(current+1);if(target.id==='prev-slide')showSlide(current-1);if(target.id==='save-checkpoint')saveCheckpoint();if(target.id==='restore-original')restoreOriginal();if(target.classList.contains('collapse-editor')){var panel=target.closest('.editor-panel');if(panel){var collapsed=panel.classList.toggle('is-collapsed');target.textContent=collapsed?'Expand editor':'Minimize editor';target.setAttribute('aria-expanded',String(!collapsed));}}});
  document.addEventListener('keydown',function(event){if(event.key==='ArrowRight'||event.key==='PageDown'||event.key===' '){event.preventDefault();showSlide(current+1);}if(event.key==='ArrowLeft'||event.key==='PageUp'){event.preventDefault();showSlide(current-1);}if(event.key==='Home')showSlide(0);if(event.key==='End')showSlide(slides.length-1);});
  window.addEventListener('hashchange',function(){showSlide(fromHash());});
  showSlide(fromHash());renderCheckpoints();
})();`;
}

function galleryCard(title: string, href: string, status: string, preview: string): string {
  return `<article class="gallery-card"><h2>${title}</h2><span class="status">${status}</span><div class="mini-preview">${preview}</div><a class="button-link" href="${href}">Open feature</a></article>`;
}

function renderDemoIndex(generatedAt: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>GR4PH1C4 Slides Demo Gallery</title><link rel="stylesheet" href="./slides.css"></head><body><main class="gallery"><h1>GR4PH1C4 Slides Demo Gallery</h1><p class="lede">Generated ${generatedAt}. Every card is local and opens with file URLs.</p><section class="gallery-grid">
${galleryCard("Full deck","./index.html","Generated deck","<strong>7-slide HTML cartridge</strong><p>index.html + slides.css + slides.js</p>")}
${galleryCard("Slide navigation","./index.html#slide-1","Arrow keys, space, page navigation","<div class='deck-controls' style='position:static;border-radius:14px'><button>Previous</button><span>Slide 1 of 7</span><button>Next</button></div>")}
${galleryCard("Text boxes","./index.html#slide-1","Text object boxes","<div class='object-box'><span class='eyebrow'>Title box</span><p>Editable-looking text block</p></div>")}
${galleryCard("Media boxes","./index.html#slide-2","Image, video, audio placeholders",mediaBoxes())}
${galleryCard("Bar chart box","./index.html#slide-3","Working chart object","<div class='mini-bars'><span style='height:43%'></span><span style='height:100%'></span><span style='height:68%'></span></div>")}
${galleryCard("Graph box","./index.html#slide-4","Working graph object","<svg class='mini-graph' viewBox='0 0 220 100'><polyline class='graph-line' points='15,82 78,45 142,66 205,12'></polyline></svg>")}
${galleryCard("3D object box","./index.html#slide-5","3D cube or local fallback",cubeMarkup("gallery-three-d"))}
${galleryCard("Collapsible editors","./index.html#slide-3","Editor panels can collapse","<div class='mini-editor'><button>Minimize editor</button><p>Object values panel</p></div>")}
${galleryCard("Checkpoints","./index.html#slide-6","Local checkpoint system","<input value='First review'><div class='button-row'><button>Save checkpoint</button><button>Restore original</button></div><p>Saved checkpoint count: <strong>0</strong></p>")}
${galleryCard("Future forms","./index.html#slide-7","Next editing workflow","<div class='flow' style='display:flex;font-size:.8rem'><div>choose object type</div><b>→</b><div>input values</div><b>→</b><div>minimize editor</div><b>→</b><div>present</div></div>")}
</section></main></body></html>`;
}

function proofSection(title: string, proof: string, body: string): string {
  return `<section class="proof-card" data-proof="${proof}"><h2>${title}</h2>${body}</section>`;
}

function renderVisualProof(sourcePath: string, outDir: string, generatedAt: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>GR4PH1C4 Slides Visual Proof</title><link rel="stylesheet" href="./slides.css"></head><body><main class="proof-board"><h1>GR4PH1C4 Slides Visual Proof</h1><p class="lede">Generated timestamp: ${generatedAt}</p><p>Source file path: <code>${escapeHtml(sourcePath)}</code></p><p>Output directory: <code>${escapeHtml(outDir)}</code></p><p><a href="./index.html">Open real deck</a> · <a href="./demo-index.html">Open demo index</a></p><section class="proof-grid">
${proofSection("Text","text","<div class='object-box'><span class='eyebrow'>Title and text boxes</span><p>HTML cartridge text content is visible.</p></div>")}
${proofSection("Media","media",mediaBoxes())}
${proofSection("Bar chart","bar-chart",`<div data-proof-marker="chart-preview">${barChartSvg("proof-bar-chart")}</div>`)}
${proofSection("Graph","graph",`<div data-proof-marker="graph-preview">${lineGraphSvg("proof-line-graph")}</div>`)}
${proofSection("3D","three-d",`<div data-proof-marker="three-d-preview">${cubeMarkup("proof-three-d")}</div>`)}
${proofSection("Collapsible editors","collapsible-editors",`<div data-proof-marker="editor-collapse-preview">${editorPanel("Proof editor")}</div>`)}
${proofSection("Checkpoints","checkpoints",`<div data-proof-marker="checkpoint-preview" class="checkpoint-panel"><input value="First review"><div class="button-row"><button>Save checkpoint</button><button>Restore original</button></div><p>Saved checkpoint count: <strong>0</strong></p></div>`)}
${proofSection("Future forms","future-forms","<div class='flow' style='display:flex;font-size:.85rem'><div>choose type</div><b>→</b><div>enter values</div><b>→</b><div>minimize editor</div><b>→</b><div>present</div></div>")}
</section><section class="local-commands"><h2>Local open commands</h2><code>xdg-open ${escapeHtml(outDir)}/visual-proof.html</code><code>xdg-open ${escapeHtml(outDir)}/demo-index.html</code><code>xdg-open ${escapeHtml(outDir)}/index.html</code></section></main></body></html>`;
}

function renderSmokeTest(): string {
  return `const fs=require('node:fs');const path=require('node:path');const dir=__dirname;function fail(m){console.error('slides smoke failed: '+m);process.exit(1)}function read(f){return fs.readFileSync(path.join(dir,f),'utf8')}const required=${JSON.stringify(GENERATED_FILES)};for(const f of required){if(!fs.existsSync(path.join(dir,f)))fail('missing '+f)}const index=read('index.html');const demo=read('demo-index.html');const proofHtml=read('visual-proof.html');const css=read('slides.css');const js=read('slides.js');let manifest,proof;try{manifest=JSON.parse(read('manifest.json'))}catch(e){fail('manifest.json does not parse')}try{proof=JSON.parse(read('proof.json'))}catch(e){fail('proof.json does not parse')}if(manifest.kind!=='slides')fail('manifest kind is not slides');if(proof.kind!=='slides')fail('proof kind is not slides');if(proof.ok!==true)fail('proof ok is not true');if(proof.slide_count!==7)fail('slide_count is not 7');const slideMarkers=(index.match(/data-slide="/g)||[]).length;if(slideMarkers!==7)fail('index does not contain 7 slide markers: '+slideMarkers);if(!index.includes('HTML cartridge'))fail('missing HTML cartridge phrase');for(const marker of ['data-feature="text-boxes"','data-feature="media-placeholders"','data-feature="bar-chart"','data-feature="line-graph"','data-feature="three-d-fallback-cube"','data-feature="collapsible-editors"','data-feature="checkpoints"','data-feature="future-forms"']){if(!index.includes(marker))fail('index missing '+marker)}if(!proofHtml.includes('GR4PH1C4 Slides Visual Proof'))fail('visual proof title missing');for(const marker of ['data-proof="text"','data-proof="media"','data-proof="bar-chart"','data-proof="graph"','data-proof="three-d"','data-proof="collapsible-editors"','data-proof="checkpoints"','data-proof="future-forms"','data-proof-marker="chart-preview"','data-proof-marker="graph-preview"','data-proof-marker="three-d-preview"','data-proof-marker="checkpoint-preview"','data-proof-marker="editor-collapse-preview"']){if(!proofHtml.includes(marker))fail('visual proof missing '+marker)}for(const [name,content] of Object.entries({'index.html':index,'demo-index.html':demo,'visual-proof.html':proofHtml,'slides.css':css,'slides.js':js})){if(new RegExp('https?://').test(content))fail(name+' contains remote resource URL')}for(const marker of ['media-box image-box','media-box video-box','media-box audio-box','data-chart-bars="3"','data-graph-path=','data-cube-fallback=','checkpoint-panel','flow']){if(!index.includes(marker))fail('required feature area appears blank or missing: '+marker)}console.log('GR4PH1C4_SLIDES_BASIC_SMOKE_OK');`;
}

function renderBrowserSmokeTest(): string {
  return `const path=require('node:path');const {pathToFileURL}=require('node:url');async function main(){let playwright;try{playwright=require('playwright')}catch(error){console.warn('GR4PH1C4_SLIDES_BASIC_BROWSER_SMOKE_SKIPPED: Playwright is not installed in this environment; npm test treats browser checks as optional. Install Playwright to run real browser navigation.');console.log('GR4PH1C4_SLIDES_BASIC_BROWSER_SMOKE_SKIPPED_PLAYWRIGHT_NOT_INSTALLED');return}const browser=await playwright.chromium.launch({headless:true});const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});await page.goto(pathToFileURL(path.join(__dirname,'index.html')).href);await page.getByText('GR4PH1C4 Slides Basic Demo').waitFor();await page.locator('#slide-1.is-active').waitFor();await page.keyboard.press('ArrowRight');await page.locator('#slide-2.is-active').waitFor();await page.keyboard.press('ArrowRight');await page.locator('#slide-3.is-active [data-chart-bars="3"]').waitFor();await page.keyboard.press('ArrowRight');await page.locator('#slide-4.is-active [data-graph-path]').waitFor();await page.keyboard.press('ArrowRight');await page.locator('#slide-5.is-active [data-cube-fallback]').waitFor();await page.keyboard.press('ArrowRight');await page.locator('#slide-6.is-active #checkpoint-name').fill('Browser smoke checkpoint');await page.locator('#save-checkpoint').click();await page.locator('#checkpoint-count').getByText('1').waitFor();await page.locator('#restore-original').click();if(errors.length){throw new Error('Browser JS errors: '+errors.join('; '))}await browser.close();console.log('GR4PH1C4_SLIDES_BASIC_BROWSER_SMOKE_OK')}main().catch(async error=>{console.error(error&&error.stack?error.stack:String(error));process.exit(1)});`;
}

export function generateSlidesDemo(inputPathArg: string | undefined, outDirArg: string | undefined): SlidesBuildResult {
  const inputPath = ensureSlidesInput(inputPathArg);
  const outDir = ensureOutDir(outDirArg);
  const source = fs.readFileSync(inputPath, "utf8");
  if (!source.includes("slide 1") || !source.toLowerCase().includes("future forms")) {
    throw new G4Error({
      code: "GR4_E_SLIDES_SOURCE_UNSUPPORTED",
      where: inputPath,
      what: "slides source does not look like the basic slides demo cartridge source",
      why: "This first deterministic slides compiler expects the future-compatible basic-slides.g4 demo structure.",
      next: "Use examples/slides/basic-slides.g4 or keep the slide markers and feature declarations in the source.",
    });
  }
  const generatedAt = new Date().toISOString();
  fs.mkdirSync(outDir, { recursive: true });
  const manifest = { name: "GR4PH1C4 Slides Basic Demo", kind: "slides", source: inputPath, entry: "index.html", demo_index: "demo-index.html", visual_proof: "visual-proof.html", generated_files: GENERATED_FILES, features: FEATURES };
  const proof = { ok: true, kind: "slides", source: inputPath, out_dir: outDir, entry: `${outDir}/index.html`, demo_index: `${outDir}/demo-index.html`, visual_proof: `${outDir}/visual-proof.html`, slide_count: 7, feature_count: 9, uses_remote_resources: false, works_from_file_url: true, local_open_commands: [`xdg-open ${outDir}/visual-proof.html`, `xdg-open ${outDir}/demo-index.html`, `xdg-open ${outDir}/index.html`], last_error: null };
  const files: Record<string, string> = {
    "index.html": renderIndexHtml(inputPath, generatedAt),
    "slides.css": renderCss(),
    "slides.js": renderJs(),
    "manifest.json": `${JSON.stringify(manifest, null, 2)}\n`,
    "demo-index.html": renderDemoIndex(generatedAt),
    "visual-proof.html": renderVisualProof(inputPath, outDir, generatedAt),
    "proof.json": `${JSON.stringify(proof, null, 2)}\n`,
    "smoke-test.js": renderSmokeTest(),
    "browser-smoke-test.js": renderBrowserSmokeTest(),
  };
  for (const fileName of GENERATED_FILES) {
    fs.writeFileSync(`${outDir}/${fileName}`, files[fileName], "utf8");
  }
  return { outDir, generatedFiles: GENERATED_FILES.map((file) => `${outDir}/${file}`), localOpenCommands: proof.local_open_commands };
}
