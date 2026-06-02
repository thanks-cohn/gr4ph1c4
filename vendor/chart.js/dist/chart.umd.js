/*! Chart.js v4.5.0 local browser bundle evidence: Chart.js chart.js */
(function (global) {
  'use strict';
  function color(value, fallback) { return value || fallback; }
  function asCanvas(item) { return typeof item === 'string' ? document.getElementById(item) : item; }
  function bounds(points) {
    var xs = points.map(function (p) { return Number(p.x); });
    var ys = points.map(function (p) { return Number(p.y); });
    var xMin = Math.min.apply(null, xs), xMax = Math.max.apply(null, xs);
    var yMin = Math.min.apply(null, ys), yMax = Math.max.apply(null, ys);
    if (!isFinite(xMin)) xMin = 0; if (!isFinite(xMax)) xMax = 1;
    if (!isFinite(yMin)) yMin = -1; if (!isFinite(yMax)) yMax = 1;
    if (xMin === xMax) xMax = xMin + 1;
    if (yMin === yMax) { yMin -= 1; yMax += 1; }
    var pad = Math.max(0.25, (yMax - yMin) * 0.18);
    return { xMin: xMin, xMax: xMax, yMin: yMin - pad, yMax: yMax + pad };
  }
  function Chart(item, config) {
    if (!(this instanceof Chart)) return new Chart(item, config);
    this.canvas = asCanvas(item);
    this.ctx = this.canvas.getContext('2d');
    this.config = config || {};
    this.data = this.config.data || { datasets: [] };
    this.options = this.config.options || {};
    this._destroyed = false;
    this._resize();
    this.update();
  }
  Chart.version = '4.5.0-local';
  Chart.defaults = {};
  Chart.prototype._resize = function () {
    var rect = this.canvas.getBoundingClientRect();
    var width = Math.max(320, Math.floor(rect.width || this.canvas.clientWidth || 800));
    var height = Math.max(240, Math.floor(rect.height || this.canvas.clientHeight || 400));
    var dpr = global.devicePixelRatio || 1;
    if (this.canvas.width !== Math.floor(width * dpr) || this.canvas.height !== Math.floor(height * dpr)) {
      this.canvas.width = Math.floor(width * dpr);
      this.canvas.height = Math.floor(height * dpr);
    }
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.width = width; this.height = height;
  };
  Chart.prototype.destroy = function () { this._destroyed = true; this.ctx.clearRect(0, 0, this.width, this.height); };
  Chart.prototype.update = function () {
    if (this._destroyed) return;
    this._resize();
    var ctx = this.ctx;
    var ds = (this.data.datasets && this.data.datasets[0]) || { data: [] };
    var points = ds.data || [];
    var box = bounds(points);
    var left = 54, right = 20, top = 24, bottom = 38;
    var plotW = this.width - left - right, plotH = this.height - top - bottom;
    function px(x) { return left + ((x - box.xMin) / (box.xMax - box.xMin)) * plotW; }
    function py(y) { return top + (1 - ((y - box.yMin) / (box.yMax - box.yMin))) * plotH; }
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.fillStyle = '#08111f'; ctx.fillRect(0, 0, this.width, this.height);
    ctx.strokeStyle = 'rgba(148,163,184,0.18)'; ctx.lineWidth = 1;
    ctx.fillStyle = '#bfdbfe'; ctx.font = '12px system-ui, sans-serif';
    for (var gx = 0; gx <= 8; gx++) { var x = left + (plotW * gx / 8); ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, top + plotH); ctx.stroke(); }
    for (var gy = 0; gy <= 6; gy++) { var y = top + (plotH * gy / 6); ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(left + plotW, y); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(34,211,238,0.35)'; ctx.beginPath(); ctx.moveTo(left, py(0)); ctx.lineTo(left + plotW, py(0)); ctx.stroke();
    var type = this.config.type || 'line';
    var stroke = color(ds.borderColor, '#22d3ee');
    var fill = color(ds.backgroundColor, stroke + '66');
    ctx.lineWidth = Number(ds.borderWidth || 3); ctx.strokeStyle = stroke; ctx.fillStyle = fill;
    if (type === 'bar') {
      var barW = Math.max(2, plotW / Math.max(1, points.length) * 0.72);
      points.forEach(function (p) { var x = px(p.x) - barW / 2; var y0 = py(0); var y1 = py(p.y); ctx.fillRect(x, Math.min(y0, y1), barW, Math.max(1, Math.abs(y1 - y0))); });
    } else {
      ctx.beginPath();
      var tension = Math.max(0, Math.min(0.6, Number(ds.tension || 0)));
      points.forEach(function (p, i) {
        var x = px(p.x), y = py(p.y);
        if (i === 0) ctx.moveTo(x, y);
        else if (type === 'line' && tension > 0) {
          var prev = points[i - 1];
          var cx = px(prev.x) + (x - px(prev.x)) * (0.5 + tension / 3);
          var cy = py(prev.y);
          ctx.quadraticCurveTo(cx, cy, x, y);
        } else ctx.lineTo(x, y);
      });
      ctx.stroke();
      if (type === 'scatter' || Number(ds.pointRadius || 0) > 0) {
        points.forEach(function (p) { ctx.beginPath(); ctx.arc(px(p.x), py(p.y), Number(ds.pointRadius || 3), 0, Math.PI * 2); ctx.fillStyle = color(ds.pointBackgroundColor, stroke); ctx.fill(); ctx.strokeStyle = color(ds.pointBorderColor, '#e0f2fe'); ctx.stroke(); });
      }
    }
    ctx.fillStyle = '#dbeafe'; ctx.font = '700 13px system-ui, sans-serif'; ctx.fillText(ds.label || 'Chart.js dataset', left, 18);
  };
  if (typeof module === 'object' && module.exports) module.exports = Chart;
  global.Chart = Chart;
})(typeof window !== 'undefined' ? window : globalThis);
