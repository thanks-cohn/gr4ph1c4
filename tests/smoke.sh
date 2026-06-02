#!/usr/bin/env bash
set -euo pipefail

rm -rf dist
npm run build >/tmp/gr4ph1c4-build.log
node dist/main.js doctor >/tmp/gr4ph1c4-doctor.log
if ! grep -Fxq -- '- CLI commands available: doctor, parse, render, rollback-demo, snapshot-demo' /tmp/gr4ph1c4-doctor.log; then
  echo "smoke failed: doctor did not report the exact real CLI command list" >&2
  exit 1
fi
for fake in sql csv server chartjs d3 plugin future; do
  if grep -Fiq "$fake" /tmp/gr4ph1c4-doctor.log; then
    echo "smoke failed: doctor claimed fake command or future capability $fake" >&2
    exit 1
  fi
done

node dist/main.js parse examples/classroom-report.g4 --json > dist/classroom-report.ast.json
for expected in quarterly_report "Quarterly Report" revenue "Quarterly Revenue" Q4; do
  if ! grep -Fq "$expected" dist/classroom-report.ast.json; then
    echo "smoke failed: AST missing $expected" >&2
    exit 1
  fi
done

node dist/main.js render examples/classroom-report.g4 --out dist/site >/tmp/gr4ph1c4-render.log
if [ ! -f dist/site/index.html ]; then
  echo "smoke failed: dist/site/index.html was not exported" >&2
  exit 1
fi

for expected in "<html" "<svg" 'data-rendered-chart-type="bars"' "Revenue Continues To Rise" "Quarterly Revenue" "Q4 produced the strongest quarter of the year." Q1 Q2 Q3 Q4; do
  if ! grep -Fq "$expected" dist/site/index.html; then
    echo "smoke failed: HTML missing $expected" >&2
    exit 1
  fi
done

if node dist/main.js parse examples/bad-syntax.g4 --json >/tmp/gr4ph1c4-bad-stdout.log 2>/tmp/gr4ph1c4-bad-stderr.log; then
  echo "smoke failed: bad syntax parsed successfully" >&2
  exit 1
fi

for expected in "error: GR4_E_" "where:" "what:" "why:" "next:"; do
  if ! grep -Fq "$expected" /tmp/gr4ph1c4-bad-stderr.log; then
    echo "smoke failed: bad syntax error missing $expected" >&2
    exit 1
  fi
done

node dist/main.js parse examples/rollback-demo.g4 --json > dist/rollback-demo.ast.json
for expected in rollback_demo "Rollback Demo" revenue "Revenue" '"type": "bars"' Jan Feb Mar; do
  if ! grep -Fq "$expected" dist/rollback-demo.ast.json; then
    echo "smoke failed: rollback-demo AST missing $expected" >&2
    exit 1
  fi
done

node dist/main.js rollback-demo > dist/rollback-demo.proof.log
for expected in \
  "input: examples/rollback-demo.g4" \
  "missing module lookup rejected: missing_revenue" \
  "registered module: revenue" \
  "original chart type: bars" \
  "registry working type before edit: bars" \
  "edited chart type: line" \
  "original AST type after edit: bars" \
  "resend rendered chart type: line" \
  "rendered output: dist/rollback-demo/index.html" \
  "rollback chart type: bars" \
  "original AST type after rollback: bars" \
  "PASS GR4PH1C4 V0 PASS 2 rollback proof"; do
  if ! grep -Fq "$expected" dist/rollback-demo.proof.log; then
    echo "smoke failed: rollback proof log missing $expected" >&2
    exit 1
  fi
done

if ! grep -Fq 'data-chart="revenue"' dist/rollback-demo/index.html; then
  echo "smoke failed: rollback rendered HTML missing registered chart revenue" >&2
  exit 1
fi
if ! grep -Fq 'data-chart-type="line"' dist/rollback-demo/index.html; then
  echo "smoke failed: rollback rendered HTML missing edited line chart type" >&2
  exit 1
fi
if ! grep -Fq 'data-rendered-chart-type="line"' dist/rollback-demo/index.html; then
  echo "smoke failed: rollback rendered HTML missing line SVG evidence" >&2
  exit 1
fi
if grep -Fq 'data-rendered-chart-type="bars"' dist/rollback-demo/index.html; then
  echo "smoke failed: rollback rendered HTML still contains bars SVG evidence after resend" >&2
  exit 1
fi
if ! grep -Fq '<polyline points=' dist/rollback-demo/index.html; then
  echo "smoke failed: rollback rendered HTML missing line polyline evidence" >&2
  exit 1
fi
node dist/main.js parse examples/rollback-demo.g4 --json > dist/rollback-demo.after.ast.json
if ! grep -Fq '"type": "bars"' dist/rollback-demo.after.ast.json; then
  echo "smoke failed: original rollback-demo AST is no longer bars after rollback-demo ran" >&2
  exit 1
fi
if grep -Fq '"type": "line"' dist/rollback-demo.after.ast.json; then
  echo "smoke failed: original rollback-demo AST mutated to line after rollback-demo ran" >&2
  exit 1
fi

node dist/main.js snapshot-demo > dist/snapshot-demo.proof.stdout.log
snapshot_dir=dist/snapshots/pass-3-demo
for snapshot_file in \
  "$snapshot_dir/source.g4" \
  "$snapshot_dir/working-state.json" \
  "$snapshot_dir/index.html" \
  "$snapshot_dir/proof.log" \
  "$snapshot_dir/manifest.json"; do
  if [ ! -f "$snapshot_file" ]; then
    echo "smoke failed: snapshot file missing $snapshot_file" >&2
    exit 1
  fi
done

if ! grep -Fq 'screen rollback_demo "Rollback Demo"' "$snapshot_dir/source.g4"; then
  echo "smoke failed: snapshot source.g4 missing rollback demo source evidence" >&2
  exit 1
fi
if ! grep -Fq '"type": "line"' "$snapshot_dir/working-state.json"; then
  echo "smoke failed: snapshot working-state.json missing edited line type evidence" >&2
  exit 1
fi
for expected in \
  '"chartName": "revenue"' \
  '"originalChartType": "bars"' \
  '"workingChartType": "line"' \
  '"originalAstUnchanged": true'; do
  if ! grep -Fq "$expected" "$snapshot_dir/manifest.json"; then
    echo "smoke failed: snapshot manifest.json missing $expected" >&2
    exit 1
  fi
done
for expected in \
  'data-chart="revenue"' \
  'data-chart-type="line"' \
  'data-rendered-chart-type="line"' \
  '<polyline points='; do
  if ! grep -Fq "$expected" "$snapshot_dir/index.html"; then
    echo "smoke failed: snapshot index.html missing $expected" >&2
    exit 1
  fi
done
for expected in \
  "input: examples/rollback-demo.g4" \
  "registered module: revenue" \
  "original chart type: bars" \
  "edited working chart type: line" \
  "original AST type after edit: bars" \
  "snapshot written: dist/snapshots/pass-3-demo" \
  "manifest written" \
  "working state written" \
  "rendered output written" \
  "source copied" \
  "PASS GR4PH1C4 V0 PASS 3 snapshot proof"; do
  if ! grep -Fq "$expected" "$snapshot_dir/proof.log"; then
    echo "smoke failed: snapshot proof.log missing $expected" >&2
    exit 1
  fi
  if ! grep -Fq "$expected" dist/snapshot-demo.proof.stdout.log; then
    echo "smoke failed: snapshot stdout proof missing $expected" >&2
    exit 1
  fi
done

printf '%s\n' 'PASS GR4PH1C4 V0 PASS 3 smoke'
