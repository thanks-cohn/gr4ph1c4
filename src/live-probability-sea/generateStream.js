const fs = require('node:fs');
const path = require('node:path');

function makeRng(seed) {
  let value = seed >>> 0;
  return function rng() {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 0x100000000;
  };
}

function generateRecords(seedConfig) {
  const demo = seedConfig.demo || 'live-probability-sea';
  const entityCount = seedConfig.entityCount || 24;
  const recordCount = seedConfig.recordCount || 600;
  const start = Date.parse(seedConfig.startTimestamp || '2026-01-01T00:00:00.000Z');
  const durationMs = seedConfig.durationMs || 120000;
  const rng = makeRng(seedConfig.seed || 1);
  const entities = Array.from({ length: entityCount }, (_, index) => ({
    id: `entity-${String(index + 1).padStart(2, '0')}`,
    phase: rng() * Math.PI * 2,
    bias: 0.25 + rng() * 0.5
  }));
  const records = [];
  for (let index = 0; index < recordCount; index += 1) {
    const entityIndex = index % entityCount;
    const entity = entities[entityIndex];
    const turn = Math.floor(index / entityCount);
    const progress = recordCount === 1 ? 0 : index / (recordCount - 1);
    const wave = Math.sin(progress * Math.PI * 8 + entity.phase) * 0.22;
    const drift = Math.cos(turn * 0.27 + entity.phase) * 0.11;
    const probability = clamp(entity.bias + wave + drift, 0.02, 0.98);
    const spread = 0.05 + ((entityIndex + turn) % 7) * 0.008;
    const angle = (entityIndex / entityCount) * Math.PI * 2;
    records.push({
      demo,
      timestamp: new Date(start + Math.round(progress * durationMs)).toISOString(),
      entity: entity.id,
      probability: round(probability),
      range: { low: round(clamp(probability - spread, 0, 1)), high: round(clamp(probability + spread, 0, 1)) },
      x: round(Math.cos(angle) * 10 + Math.sin(turn * 0.13 + entity.phase) * 2),
      z: round(Math.sin(angle) * 10 + Math.cos(turn * 0.11 + entity.phase) * 2)
    });
  }
  return records;
}

function generateJsonl(seedConfig) {
  return generateRecords(seedConfig).map((record) => JSON.stringify(record)).join('\n') + '\n';
}

function generateStreamFromSeedFile(seedPath, outPath) {
  const seedConfig = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, generateJsonl(seedConfig), 'utf8');
  return { outPath, recordCount: seedConfig.recordCount || 600, entityCount: seedConfig.entityCount || 24 };
}

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function round(value) { return Math.round(value * 10000) / 10000; }

module.exports = { generateRecords, generateJsonl, generateStreamFromSeedFile };
