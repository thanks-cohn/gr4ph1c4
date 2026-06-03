const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const root = __dirname;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jsonl': 'application/x-ndjson' };
const required = [
  'renderer_ready', 'canvas_ready', 'stream_loaded', 'timestamps_parsed', 'state_reconstructed',
  'probability_sea_rendered', 'entity_points_rendered', 'range_columns_rendered', 'timeline_ready',
  'inspector_ready', 'playback_ready', 'nonblank_pixel_sample_passed'
];

(async () => {
  const server = http.createServer((request, response) => {
    const url = new URL(request.url, 'http://127.0.0.1');
    const filePath = path.join(root, url.pathname === '/' ? 'index.html' : url.pathname);
    if (!filePath.startsWith(root) || !fs.existsSync(filePath)) { response.writeHead(404); response.end('not found'); return; }
    response.writeHead(200, { 'content-type': types[path.extname(filePath)] || 'text/plain' });
    fs.createReadStream(filePath).pipe(response);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 760 } });
    await page.goto(`http://127.0.0.1:${port}/index.html`);
    await page.waitForFunction(() => {
      const proof = window.__G4_LIVE_PROBABILITY_SEA_PROOF__;
      return proof && proof.animation_frame_count > 0 && proof.nonblank_pixel_sample_passed;
    }, null, { timeout: 10000 });
    const proof = await page.evaluate(() => window.__G4_LIVE_PROBABILITY_SEA_PROOF__);
    for (const key of required) if (proof[key] !== true) throw new Error(`${key} was ${proof[key]}`);
    if (proof.stream_record_count < 600) throw new Error(`stream_record_count ${proof.stream_record_count} < 600`);
    if (proof.entity_count < 24) throw new Error(`entity_count ${proof.entity_count} < 24`);
    if (proof.visible_object_count <= 0) throw new Error('visible_object_count was not positive');
    if (proof.point_count < 24) throw new Error(`point_count ${proof.point_count} < 24`);
    if (proof.range_column_count < 24) throw new Error(`range_column_count ${proof.range_column_count} < 24`);
    if (proof.last_error !== null) throw new Error(`last_error ${proof.last_error}`);
    fs.writeFileSync(path.join(root, 'browser-proof.json'), JSON.stringify(proof, null, 2), 'utf8');
    console.log('GR4PH1C4_LIVE_PROBABILITY_SEA_BROWSER_RENDER_SMOKE_TEST_PASS');
  } finally {
    await browser.close();
    server.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
