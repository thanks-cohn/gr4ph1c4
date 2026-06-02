export function renderCss(): string {
  return `
:root {
  color-scheme: dark;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: #0b1020;
  color: #f8fbff;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(96, 165, 250, 0.22), transparent 34rem),
    linear-gradient(135deg, #0b1020 0%, #111827 55%, #172033 100%);
}

.stage {
  width: min(1180px, calc(100vw - 48px));
  min-height: calc(100vh - 48px);
  margin: 24px auto;
  padding: 56px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 32px;
  background: rgba(15, 23, 42, 0.84);
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.34);
}

.screen-title {
  margin: 0 0 16px;
  color: #93c5fd;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.hero {
  margin: 0 0 40px;
  max-width: 920px;
  font-size: clamp(3rem, 7vw, 6.5rem);
  line-height: 0.95;
}

.chart-card {
  padding: 30px;
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.chart-title {
  margin: 0 0 18px;
  font-size: 2rem;
}

.chart-svg {
  display: block;
  width: 100%;
  height: auto;
}

.note {
  margin: 34px 0 0;
  color: #dbeafe;
  font-size: 1.6rem;
  line-height: 1.35;
}
`;
}
