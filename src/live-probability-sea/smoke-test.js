const fs = require('node:fs');
const path = require('node:path');
const { ingestJsonl, ERROR } = require('./ingest.js');

const root = path.resolve(__dirname);
const streamPath = path.join(root, 'streams', 'probability-demo.jsonl');
const htmlPath = path.join(root, 'index.html');
const text = fs.readFileSync(streamPath, 'utf8');
const replay = ingestJsonl(text);
const midpoint = replay.start + (replay.end - replay.start) / 2;
const state = replay.stateAt(midpoint);

if (replay.records.length < 600) throw new Error(`record count ${replay.records.length} < 600`);
if (replay.entities.length < 24) throw new Error(`entity count ${replay.entities.length} < 24`);
if (state.length !== replay.entities.length) throw new Error('state reconstruction missed entities');
if (!fs.readFileSync(path.join(root, 'main.js'), 'utf8').includes('__G4_LIVE_PROBABILITY_SEA_PROOF__')) throw new Error('proof global missing from HTML');
if (!ERROR.BAD_PROBABILITY) throw new Error('ingest error codes unavailable');

console.log('GR4PH1C4_LIVE_PROBABILITY_SEA_STATIC_SMOKE_TEST_PASS');
