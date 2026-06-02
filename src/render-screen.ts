import type { ScreenNode } from "./ast.js";
import { renderChart } from "./render-chart.js";

export function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

export function renderScreen(screen: ScreenNode): string {
  return `
    <main class="stage" data-screen="${escapeHtml(screen.name)}" data-format="${escapeHtml(screen.format)}">
      <p class="screen-title">${escapeHtml(screen.title)}</p>
      <h1 class="hero">${escapeHtml(screen.hero.text)}</h1>
      <section class="chart-card" data-chart="${escapeHtml(screen.chart.name)}" data-chart-type="${escapeHtml(screen.chart.type)}" data-width="${escapeHtml(screen.chart.width)}" data-height="${escapeHtml(screen.chart.height)}" data-labels="${escapeHtml(screen.chart.labels)}">
        <h2 class="chart-title">${escapeHtml(screen.chart.title)}</h2>
        ${renderChart(screen.chart)}
      </section>
      <p class="note">${escapeHtml(screen.note.text)}</p>
    </main>`;
}
