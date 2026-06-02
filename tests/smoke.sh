#!/usr/bin/env bash
set -euo pipefail

rm -rf dist
npm run build >/tmp/gr4ph1c4-build.log
node dist/main.js doctor >/tmp/gr4ph1c4-doctor.log

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

for expected in "<html" "<svg" "Revenue Continues To Rise" "Quarterly Revenue" "Q4 produced the strongest quarter of the year." Q1 Q2 Q3 Q4; do
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

printf '%s\n' 'PASS GR4PH1C4 V0 PASS 1 smoke'
