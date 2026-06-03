# Gr4ph1c4

<p align="center">
  <img src="sharx_mascot.png" alt="the_gr4ph1c4_mascot_sharx" width="720">
</p>

Gr4ph1c4 is a live visual command language. The long-term idea is to let a `.g4` command file describe visual screens that can become presentation-safe outputs.

This repository is a **V0 proof-of-capability project**. It currently includes one real `.g4` parsing/rendering vertical slice plus several local demo proofs:

```text
.g4 input -> parser -> AST -> HTML/SVG renderer -> exported index.html -> smoke test inspection
```

## Simple startup for most people

Use these commands if you just want to install, build, render the included example, and open the generated page.

```bash
npm install
npm run build
node dist/main.js render examples/classroom-report.g4 --out dist/site
```

Then open this file in a browser:

```text
dist/site/index.html
```

Optional quick health check:

```bash
node dist/main.js doctor
```

Optional full smoke test:

```bash
npm test
```

## What the main `.g4` slice supports

The parser and renderer support the `.g4` screen shape used by `examples/classroom-report.g4`:

- one `screen` with a name and title
- one `format:<projector>` setting
- one quoted `hero`
- one `chart` with bar-chart settings and data rows
- one quoted `note`

The renderer exports a real `index.html` containing stage-safe CSS and an inline SVG chart with visible labels.

## What is also included

The repository also contains local proof demos that exercise additional V0 capabilities:

- `rollback-demo`: registers a chart module, edits a working copy, renders the edited copy, and proves the original AST can remain unchanged.
- `snapshot-demo`: writes a reproducible snapshot directory with source, working state, rendered HTML, manifest, and proof log.
- `emit-sine-stream` and `sine-demo`: emit deterministic local JSONL sine records and render the retained window as an inspectable SVG control demo.
- `chartjs-sine-demo`: generates a local/offline Chart.js sine-wave browser demo.
- `three-ocean-points-demo`: generates a local/offline Three.js animated ocean point-field browser demo with optional color controls.

## What is not implemented yet

No fake claims are made in this V0 proof. These features are **not** implemented yet:

- no SQL ingestion
- no live `.g4` editor
- no external telemetry/database integration
- no image-point language syntax
- no plugin system
- no multiple-screen language support
- no V1 behavior

## Errors

Parser and CLI failures use breadcrumb-style errors:

```text
error: GR4_E_...
where:
what:
why:
next:
```

`examples/bad-syntax.g4` is intentionally invalid and is checked by the smoke test to ensure this error shape is emitted.

## Advanced: complete command list

Install dependencies:

```bash
npm install
```

Build the TypeScript CLI into `dist/`:

```bash
npm run build
```

Run the full smoke test suite:

```bash
npm run smoke
```

`npm test` is an alias for the smoke test:

```bash
npm test
```

Check that the built CLI can load its modules:

```bash
node dist/main.js doctor
```

Parse a `.g4` file and print the AST as JSON:

```bash
node dist/main.js parse examples/classroom-report.g4 --json
```

Render a `.g4` file into an output directory containing `index.html`:

```bash
node dist/main.js render examples/classroom-report.g4 --out dist/site
```

Run the rollback proof demo:

```bash
node dist/main.js rollback-demo
```

Generated file:

```text
dist/rollback-demo/index.html
```

Run the snapshot proof demo:

```bash
node dist/main.js snapshot-demo
```

Generated directory:

```text
dist/snapshots/pass-3-demo/
```

Emit the deterministic sine stream as JSONL:

```bash
node dist/main.js emit-sine-stream
```

Generate the SVG sine stream control demo from stdin:

```bash
node dist/main.js emit-sine-stream | node dist/main.js sine-demo --stdin --window 48 --out dist/sine-demo
```

Generated file:

```text
dist/sine-demo/index.html
```

Generate the local Chart.js sine demo:

```bash
node dist/main.js chartjs-sine-demo
```

Generated file:

```text
dist/chartjs-sine-demo/index.html
```

Generate the local Three.js ocean points demo:

```bash
node dist/main.js three-ocean-points-demo
```

Generated file:

```text
dist/three-ocean-points-demo/index.html
```

Generate the Three.js ocean points demo with custom colors:

```bash
node dist/main.js three-ocean-points-demo --bg black --grid green --axis white --point cyan --line cyan --accent purple --text white
```

Supported color values include named colors, short hex, long hex, bare long hex, and `rgb(r,g,b)` values. Supported color flags are:

- `--background` or `--bg`
- `--graph-lines` or `--grid`
- `--axis-numbers` or `--axis`
- `--points` or `--point`
- `--data-lines` or `--line`
- `--panel-accent` or `--accent`
- `--text`
