# GR4PH1C4

<p align="center">
  <img src="sharx_mascot.png" alt="the_gr4ph1c4_mascot_sharx" width="720">
</p>

Gr4ph1c4 is a live visual command language. The long-term idea is to let a `.g4` command file describe visual screens that can become presentation-safe outputs.

This repository is a **V0 proof-of-capability project**. It currently includes one real `.g4` parsing/rendering vertical slice plus several local demo proofs:

    .g4 input -> parser -> AST -> HTML/SVG renderer -> exported index.html -> smoke test inspection

## One-paste startup for most people

Use this if you want the project to install, build, test, render the included example, start a local browser server, and open the generated page automatically.

Before you paste the launcher, you need:

    git
    node
    npm
    python3
    a modern browser with WebGL enabled

First get the repo and enter it:

    git clone git@github.com:thanks-cohn/GR4PH1C4.git
    cd GR4PH1C4

If you downloaded the ZIP instead, unzip it and open a terminal inside the GR4PH1C4 folder.

Then paste this from the repository root:

    bash <<'DEMO'
    set -euo pipefail

    echo "== GR4PH1C4 one-paste launcher =="

    if [ ! -f package.json ]; then
      echo "ERROR: run this from the GR4PH1C4 repository root."
      exit 1
    fi

    echo
    echo "== install dependencies =="
    npm install

    echo
    echo "== build project =="
    npm run build

    echo
    echo "== run doctor check =="
    node dist/main.js doctor

    echo
    echo "== generate Three.js ocean points demo =="
    node dist/main.js three-ocean-points-demo

    echo
    echo "== run smoke tests =="
    npm test

    echo
    echo "== start local browser server =="
    HOST="127.0.0.1"
    PORT="${PORT:-4173}"
    SITE_DIR="dist/three-ocean-points-demo"
    URL="http://${HOST}:${PORT}/"

    if [ ! -d "$SITE_DIR" ]; then
      echo "ERROR: missing $SITE_DIR"
      exit 1
    fi

    python3 -m http.server "$PORT" --bind "$HOST" --directory "$SITE_DIR" >/tmp/gr4ph1c4-http.log 2>&1 &
    SERVER_PID="$!"

    cleanup() {
      if kill -0 "$SERVER_PID" >/dev/null 2>&1; then
        kill "$SERVER_PID" >/dev/null 2>&1 || true
      fi
    }
    trap cleanup EXIT

    sleep 1

    echo
    echo "== open browser =="
    echo "Local URL: $URL"

    if command -v xdg-open >/dev/null 2>&1; then
      xdg-open "$URL" >/dev/null 2>&1 || true
    elif command -v google-chrome-stable >/dev/null 2>&1; then
      google-chrome-stable "$URL" >/dev/null 2>&1 || true
    elif command -v google-chrome >/dev/null 2>&1; then
      google-chrome "$URL" >/dev/null 2>&1 || true
    elif command -v chromium >/dev/null 2>&1; then
      chromium "$URL" >/dev/null 2>&1 || true
    elif command -v chromium-browser >/dev/null 2>&1; then
      chromium-browser "$URL" >/dev/null 2>&1 || true
    elif command -v firefox >/dev/null 2>&1; then
      firefox "$URL" >/dev/null 2>&1 || true
    else
      echo "No browser opener found."
      echo "Open this URL manually:"
      echo "$URL"
    fi

    echo
    echo "GR4PH1C4 is being served from:"
    echo "$SITE_DIR"
    echo
    echo "Browser URL:"
    echo "$URL"
    echo
    echo "Press Ctrl+C to stop the local server."

    while true; do
      sleep 3600
    done
    DEMO

Expected result:

    npm install runs
    the TypeScript CLI builds
    doctor passes
    the local Three.js ocean points demo generates
    the smoke tests run
    a local browser server starts
    Chromium, Chrome, Firefox, or the system browser opens automatically

The page is hosted here:

    http://127.0.0.1:4173/

The generated file is here:

    dist/three-ocean-points-demo/index.html

If the browser does not open automatically, copy this into Chromium, Chrome, Firefox, or another browser:

    http://127.0.0.1:4173/

## Fast manual startup

Use this if you only want to build and render the included example without starting a local server.

    npm install
    npm run build
    node dist/main.js three-ocean-points-demo

Then open this file in a browser:

    dist/three-ocean-points-demo/index.html

Optional quick health check:

    node dist/main.js doctor

Optional full smoke test:

    npm test

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
- `live-probability-sea`: generates a local/offline animated probability sea proof.

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

    error: GR4_E_...
    where:
    what:
    why:
    next:

`examples/bad-syntax.g4` is intentionally invalid and is checked by the smoke test to ensure this error shape is emitted.

## Advanced: complete command list

Install dependencies:

    npm install

Build the TypeScript CLI into `dist/`:

    npm run build

Run the full smoke test suite:

    npm run smoke

`npm test` is an alias for the smoke test:

    npm test

Check that the built CLI can load its modules:

    node dist/main.js doctor

Parse a `.g4` file and print the AST as JSON:

    node dist/main.js parse examples/classroom-report.g4 --json

Render a `.g4` file into an output directory containing `index.html`:

    node dist/main.js three-ocean-points-demo

Run the rollback proof demo:

    node dist/main.js rollback-demo

Generated file:

    dist/rollback-demo/index.html

Run the snapshot proof demo:

    node dist/main.js snapshot-demo

Generated directory:

    dist/snapshots/pass-3-demo/

Emit the deterministic sine stream as JSONL:

    node dist/main.js emit-sine-stream

Generate the SVG sine stream control demo from stdin:

    node dist/main.js emit-sine-stream | node dist/main.js sine-demo --stdin --window 48 --out dist/sine-demo

Generated file:

    dist/sine-demo/index.html

Generate the local Chart.js sine demo:

    node dist/main.js chartjs-sine-demo

Generated file:

    dist/chartjs-sine-demo/index.html

Generate the local Three.js ocean points demo:

    node dist/main.js three-ocean-points-demo

Generated file:

    dist/three-ocean-points-demo/index.html

Generate the Three.js ocean points demo with custom colors:

    node dist/main.js three-ocean-points-demo --bg black --grid green --axis white --point cyan --line cyan --accent purple --text white

Supported color values include named colors, short hex, long hex, bare long hex, and `rgb(r,g,b)` values. Supported color flags are:

- `--background` or `--bg`
- `--graph-lines` or `--grid`
- `--axis-numbers` or `--axis`
- `--points` or `--point`
- `--data-lines` or `--line`
- `--panel-accent` or `--accent`
- `--text`

Generate the local live probability sea demo:

    node dist/main.js live-probability-sea

Generated directory:

    dist/live-probability-sea/

Run the live probability sea data smoke test:

    node dist/live-probability-sea/smoke-test.js

Run the live probability sea browser render proof:

    node dist/live-probability-sea/browser-render-smoke-test.js

Generated proof file:

    dist/live-probability-sea/browser-render-proof.json

## Slides demo

Commands:

    npm install
    npm run build
    npm run slides:demo

Open:

    xdg-open dist/slides-basic/visual-proof.html
    xdg-open dist/slides-basic/demo-index.html
    xdg-open dist/slides-basic/index.html

`visual-proof.html` shows every implemented slide feature on one page. `demo-index.html` is the visual gallery with feature cards and links into the deck. `index.html` is the actual generated presentation cartridge. The generated `dist/slides-basic/` folder is portable, uses local files only, and can be opened directly from `file://` without a server.
