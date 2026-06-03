(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.G4LiveProbabilitySeaIngest = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const ERROR = {
    EMPTY_STREAM: 'G4_LPS_EMPTY_STREAM',
    BAD_JSON: 'G4_LPS_BAD_JSON',
    BAD_RECORD: 'G4_LPS_BAD_RECORD',
    BAD_TIMESTAMP: 'G4_LPS_BAD_TIMESTAMP',
    BAD_ENTITY: 'G4_LPS_BAD_ENTITY',
    BAD_PROBABILITY: 'G4_LPS_BAD_PROBABILITY'
  };

  function fail(code, message, line) {
    const error = new Error(line ? `${code} at line ${line}: ${message}` : `${code}: ${message}`);
    error.code = code;
    error.line = line || null;
    return error;
  }

  function parseJsonl(text) {
    if (typeof text !== 'string' || text.trim() === '') throw fail(ERROR.EMPTY_STREAM, 'stream is empty');
    return text.split(/\r?\n/).map((line, index) => ({ line, number: index + 1 })).filter((entry) => entry.line.trim()).map((entry) => {
      try { return validateRecord(JSON.parse(entry.line), entry.number); }
      catch (error) {
        if (error && error.code) throw error;
        throw fail(ERROR.BAD_JSON, error.message || 'invalid JSON', entry.number);
      }
    }).sort((a, b) => a.t - b.t || a.entity.localeCompare(b.entity));
  }

  function validateRecord(record, line) {
    if (!record || typeof record !== 'object' || Array.isArray(record)) throw fail(ERROR.BAD_RECORD, 'record must be an object', line);
    const t = Date.parse(record.timestamp);
    if (!Number.isFinite(t)) throw fail(ERROR.BAD_TIMESTAMP, 'timestamp must be an ISO date string', line);
    if (typeof record.entity !== 'string' || !record.entity) throw fail(ERROR.BAD_ENTITY, 'entity must be a non-empty string', line);
    if (!Number.isFinite(record.probability) || record.probability < 0 || record.probability > 1) throw fail(ERROR.BAD_PROBABILITY, 'probability must be between 0 and 1', line);
    const range = record.range || {};
    const low = Number.isFinite(range.low) ? range.low : Math.max(0, record.probability - 0.08);
    const high = Number.isFinite(range.high) ? range.high : Math.min(1, record.probability + 0.08);
    return { timestamp: record.timestamp, t, entity: record.entity, probability: record.probability, range: { low, high }, x: Number(record.x) || 0, z: Number(record.z) || 0 };
  }

  function createReplay(records) {
    if (!records.length) throw fail(ERROR.EMPTY_STREAM, 'no records after parsing');
    const entities = Array.from(new Set(records.map((record) => record.entity))).sort();
    const start = records[0].t;
    const end = records[records.length - 1].t;
    function stateAt(timestamp) {
      const target = typeof timestamp === 'number' ? timestamp : Date.parse(timestamp);
      if (!Number.isFinite(target)) throw fail(ERROR.BAD_TIMESTAMP, 'stateAt timestamp is invalid');
      const byEntity = new Map();
      for (const record of records) {
        if (record.t <= target) byEntity.set(record.entity, record);
        else break;
      }
      return entities.map((entity, index) => byEntity.get(entity) || firstRecordFor(records, entity, index));
    }
    return { records, entities, start, end, stateAt };
  }

  function firstRecordFor(records, entity, index) {
    return records.find((record) => record.entity === entity) || { entity, probability: 0, range: { low: 0, high: 0 }, x: index, z: 0, t: 0, timestamp: '' };
  }

  function ingestJsonl(text) {
    return createReplay(parseJsonl(text));
  }

  return { ERROR, parseJsonl, createReplay, ingestJsonl };
});
