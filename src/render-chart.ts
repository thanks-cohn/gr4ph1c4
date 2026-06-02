import type { ChartNode } from "./ast.js";

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function renderBarsChart(chart: ChartNode): string {
  const width = 960;
  const height = 500;
  const padding = { top: 32, right: 28, bottom: 72, left: 70 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const maxValue = Math.max(...chart.data.map((row) => row.value));
  const gap = 28;
  const barWidth = (plotWidth - gap * (chart.data.length - 1)) / chart.data.length;

  const bars = chart.data.map((row, index) => {
    const barHeight = (row.value / maxValue) * plotHeight;
    const x = padding.left + index * (barWidth + gap);
    const y = padding.top + plotHeight - barHeight;
    const isHighlighted = row.label === chart.highlight;
    const fill = isHighlighted ? "#facc15" : "#60a5fa";
    const label = escapeHtml(row.label);
    return `
      <g aria-label="${label} ${row.value}">
        <rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${barWidth.toFixed(2)}" height="${barHeight.toFixed(2)}" rx="14" fill="${fill}" />
        <text x="${(x + barWidth / 2).toFixed(2)}" y="${(y - 12).toFixed(2)}" text-anchor="middle" fill="#f8fbff" font-size="24" font-weight="700">${row.value}</text>
        <text x="${(x + barWidth / 2).toFixed(2)}" y="${height - 24}" text-anchor="middle" fill="#dbeafe" font-size="30" font-weight="800">${label}</text>
      </g>`;
  }).join("\n");

  return `
    <svg class="chart-svg" data-rendered-chart-type="bars" role="img" aria-labelledby="chart-title" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <title id="chart-title">${escapeHtml(chart.title)}</title>
      <rect x="0" y="0" width="${width}" height="${height}" rx="24" fill="#111827" />
      <line x1="${padding.left}" y1="${padding.top + plotHeight}" x2="${width - padding.right}" y2="${padding.top + plotHeight}" stroke="#64748b" stroke-width="3" />
      ${bars}
    </svg>`;
}


function renderLineChart(chart: ChartNode): string {
  const width = 960;
  const height = 500;
  const padding = { top: 32, right: 28, bottom: 72, left: 70 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const maxValue = Math.max(...chart.data.map((row) => row.value));
  const xStep = chart.data.length > 1 ? plotWidth / (chart.data.length - 1) : 0;
  const points = chart.data.map((row, index) => {
    const x = padding.left + index * xStep;
    const y = padding.top + plotHeight - (row.value / maxValue) * plotHeight;
    return { row, x, y };
  });
  const polylinePoints = points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ");
  const markers = points.map((point) => {
    const label = escapeHtml(point.row.label);
    return `
      <g aria-label="${label} ${point.row.value}">
        <circle cx="${point.x.toFixed(2)}" cy="${point.y.toFixed(2)}" r="12" fill="#34d399" stroke="#ecfeff" stroke-width="4" />
        <text x="${point.x.toFixed(2)}" y="${(point.y - 22).toFixed(2)}" text-anchor="middle" fill="#f8fbff" font-size="24" font-weight="700">${point.row.value}</text>
        <text x="${point.x.toFixed(2)}" y="${height - 24}" text-anchor="middle" fill="#dbeafe" font-size="30" font-weight="800">${label}</text>
      </g>`;
  }).join("\n");

  return `
    <svg class="chart-svg" data-rendered-chart-type="line" role="img" aria-labelledby="chart-title" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <title id="chart-title">${escapeHtml(chart.title)}</title>
      <rect x="0" y="0" width="${width}" height="${height}" rx="24" fill="#111827" />
      <line x1="${padding.left}" y1="${padding.top + plotHeight}" x2="${width - padding.right}" y2="${padding.top + plotHeight}" stroke="#64748b" stroke-width="3" />
      <polyline points="${polylinePoints}" fill="none" stroke="#34d399" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
      ${markers}
    </svg>`;
}

export function renderChart(chart: ChartNode): string {
  if (chart.type === "line") {
    return renderLineChart(chart);
  }
  return renderBarsChart(chart);
}
