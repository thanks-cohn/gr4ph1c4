(function () {
  'use strict';
  const proof = {
    renderer_ready: false, canvas_ready: false, stream_loaded: false, stream_record_count: 0, entity_count: 0,
    timestamps_parsed: false, state_reconstructed: false, probability_sea_rendered: false, entity_points_rendered: false,
    range_columns_rendered: false, timeline_ready: false, inspector_ready: false, playback_ready: false,
    visible_object_count: 0, point_count: 0, range_column_count: 0, animation_frame_count: 0,
    nonblank_pixel_sample_passed: false, last_error: null
  };
  window.__G4_LIVE_PROBABILITY_SEA_PROOF__ = proof;

  const canvas = document.getElementById('sea');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const play = document.getElementById('play');
  const reset = document.getElementById('reset');
  const scrubber = document.getElementById('scrubber');
  const inspector = document.getElementById('inspector');
  const status = document.getElementById('status');
  let replay = null;
  let currentTime = 0;
  let playing = true;
  let lastFrame = performance.now();

  proof.renderer_ready = !!ctx;
  proof.canvas_ready = !!canvas && canvas.width > 0 && canvas.height > 0;
  proof.timeline_ready = !!scrubber;
  proof.inspector_ready = !!inspector;
  proof.playback_ready = !!play && !!reset;

  fetch('streams/probability-demo.jsonl').then((response) => response.text()).then((text) => {
    replay = window.G4LiveProbabilitySeaIngest.ingestJsonl(text);
    currentTime = replay.start;
    proof.stream_loaded = true;
    proof.stream_record_count = replay.records.length;
    proof.entity_count = replay.entities.length;
    proof.timestamps_parsed = replay.records.every((record) => Number.isFinite(record.t));
    proof.state_reconstructed = replay.stateAt(currentTime).length === replay.entities.length;
    status.textContent = `${proof.stream_record_count} records / ${proof.entity_count} entities`;
    requestAnimationFrame(frame);
  }).catch((error) => { proof.last_error = error.message || String(error); status.textContent = proof.last_error; });

  play.addEventListener('click', () => { playing = !playing; play.textContent = playing ? 'Pause' : 'Play'; });
  reset.addEventListener('click', () => { if (replay) { currentTime = replay.start; scrubber.value = '0'; playing = false; play.textContent = 'Play'; draw(); } });
  scrubber.addEventListener('input', () => { if (replay) { currentTime = replay.start + Number(scrubber.value) * (replay.end - replay.start); draw(); } });
  window.GR4_LIVE_PROBABILITY_SEA_DRAW_ONCE = draw;

  function frame(now) {
    proof.animation_frame_count += 1;
    if (replay && playing) {
      currentTime += (now - lastFrame) * 18;
      if (currentTime > replay.end) currentTime = replay.start;
      scrubber.value = String((currentTime - replay.start) / (replay.end - replay.start));
    }
    lastFrame = now;
    draw();
    requestAnimationFrame(frame);
  }

  function draw() {
    if (!ctx || !replay) return;
    resizeCanvas();
    const w = canvas.width, h = canvas.height;
    const state = replay.stateAt(currentTime);
    ctx.clearRect(0, 0, w, h);
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#07172a'); gradient.addColorStop(1, '#020617');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, w, h);
    drawGrid(w, h);
    let points = 0, columns = 0;
    for (const item of state) {
      const p = project(item.x, item.z, item.probability, w, h);
      const floor = project(item.x, item.z, 0, w, h);
      const high = project(item.x, item.z, item.range.high, w, h);
      ctx.strokeStyle = 'rgba(103,232,249,.72)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(floor.x, floor.y); ctx.lineTo(high.x, high.y); ctx.stroke(); columns += 1;
      ctx.fillStyle = '#79f2ff'; ctx.beginPath(); ctx.arc(p.x, p.y, 4 + item.probability * 5, 0, Math.PI * 2); ctx.fill(); points += 1;
    }
    proof.point_count = points;
    proof.range_column_count = columns;
    proof.visible_object_count = points + columns + 1;
    proof.probability_sea_rendered = true;
    proof.entity_points_rendered = points >= 24;
    proof.range_columns_rendered = columns >= 24;
    proof.nonblank_pixel_sample_passed = samplePixels();
    updateInspector(state);
  }

  function drawGrid(w, h) {
    ctx.strokeStyle = 'rgba(29,78,216,.48)'; ctx.lineWidth = 1;
    for (let i = -12; i <= 12; i += 1) {
      const a = project(i, -12, 0, w, h), b = project(i, 12, 0, w, h), c = project(-12, i, 0, w, h), d = project(12, i, 0, w, h);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.moveTo(c.x, c.y); ctx.lineTo(d.x, d.y); ctx.stroke();
    }
  }

  function project(x, z, probability, w, h) {
    return { x: w * 0.5 + (x - z) * 24, y: h * 0.62 + (x + z) * 9 - probability * 210 };
  }

  function resizeCanvas() {
    const ratio = window.devicePixelRatio || 1;
    const width = Math.max(640, Math.floor(canvas.clientWidth * ratio));
    const height = Math.max(420, Math.floor(canvas.clientHeight * ratio));
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
  }

  function samplePixels() {
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let lit = 0;
    for (let i = 0; i < pixels.length; i += 400) if (pixels[i] + pixels[i + 1] + pixels[i + 2] > 80) lit += 1;
    return lit > 40;
  }

  function updateInspector(state) {
    const avg = state.reduce((sum, item) => sum + item.probability, 0) / state.length;
    inspector.innerHTML = `<dt>records</dt><dd>${proof.stream_record_count}</dd><dt>entities</dt><dd>${proof.entity_count}</dd><dt>avg probability</dt><dd>${avg.toFixed(3)}</dd><dt>visible objects</dt><dd>${proof.visible_object_count}</dd><dt>frames</dt><dd>${proof.animation_frame_count}</dd>`;
  }
})();
