import type { G4Document } from "./ast.js";
import { renderCss } from "./render-css.js";
import { escapeHtml, renderScreen } from "./render-screen.js";

export function renderHtml(document: G4Document): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(document.screen.title)}</title>
  <style>${renderCss()}</style>
</head>
<body>${renderScreen(document.screen)}
</body>
</html>
`;
}
