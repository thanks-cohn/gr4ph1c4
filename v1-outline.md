GR4PH1C4 V1 outline
The first modular architecture.



```

gr4ph1c4/
  README.md                                      (the public vision, founding quote, core laws, feature map, and quick demos)
  ROADMAP.md                                     (v0 to v1 to native compiler path, with honest milestones)
  LICENSE                                        (the legal permission boundary)
  package.json                                   (workspace commands for TypeScript packages and CLI tools)
  tsconfig.base.json                             (shared TypeScript compiler settings)
  pnpm-workspace.yaml                            (workspace package map if using pnpm)
  .gitignore                                     (excludes node_modules, dist, temp state, logs, caches, and exports)

  examples/                                      (real examples that sell the language at a glance)
    00-hello/
      main.g4                                    (smallest possible Gr4ph1c4 example)
      README.md                                  (explains the example and expected output)

    01-classroom/
      classroom-report.g4                        (classroom-safe presentation with chart, note, and readable layout)
      README.md                                  (explains classroom format choices)

    02-live-data/
      revenue-live.g4                            (live chart with edit, resend, history compression, and safe defaults)
      data.csv                                   (sample read-only data source)
      README.md                                  (explains live data behavior)

    03-safe-sql/
      safe-sql.g4                                (SQL import example using read-only source rules)
      mock-sales.sql                             (mock SQL schema and sample query for documentation/testing)
      README.md                                  (explains source safety and working copies)

    04-rollback/
      rollback-demo.g4                           (temporary edit and rollback demonstration)
      README.md                                  (explains first-state restoration)

    05-website/
      business-site.g4                           (simple website generated from Gr4ph1c4)
      README.md                                  (explains site export)

    06-dashboard/
      operations-dashboard.g4                    (multi-panel dashboard proof)
      README.md                                  (explains modular screen composition)

  packages/                                      (separate modules with clear contracts)
    cli/                                         (user-facing command-line tool)
      package.json                               (package metadata and executable definition)
      src/
        main.ts                                  (CLI entry point)
        command-new.ts                           (creates new Gr4ph1c4 projects from templates)
        command-live.ts                          (starts live preview)
        command-export.ts                        (exports HTML, assets, and later other formats)
        command-doctor.ts                        (runs environment and project checks)
        command-shell.ts                         (starts live command shell)
        command-rollback.ts                      (rolls back module, data, screen, or full session)
        command-resend.ts                        (resends a changed module into live view)
        command-inspect.ts                       (prints module, data, AST, and working-state details)

    language/                                    (syntax, AST, parser, and semantic rules)
      package.json                               (language package metadata)
      src/
        lexer.ts                                 (turns .g4 source text into tokens)
        parser.ts                                (turns tokens into AST)
        ast.ts                                   (canonical Gr4ph1c4 object model)
        grammar.ts                               (declares allowed syntax shapes and property forms)
        properties.ts                            (defines width, height, type, format, live-view, source, rollback, and visual handles)
        semantic-check.ts                        (validates meaning after parsing)
        diagnostics.ts                           (language-level warnings and errors)
        format-file.ts                           (pretty-prints .g4 files into consistent readable form)

    runtime/                                     (live state, module state, edits, resends, and rollback)
      package.json                               (runtime package metadata)
      src/
        session.ts                               (represents a live Gr4ph1c4 session)
        module-registry.ts                       (stores every nameable visual object)
        working-state.ts                         (current safe editable state of charts, data, screens, and modules)
        first-state.ts                           (remembered first received state for rollback)
        edit-apply.ts                            (applies granular edits to a module)
        resend-apply.ts                          (sends changed modules back to the live renderer)
        rollback-apply.ts                        (restores first state for selected object or full session)
        history.ts                               (tracks reversible edit history)
        snapshots.ts                             (stores temporary state snapshots without overwriting original sources)

    data/                                        (read-only import and safe working copies)
      package.json                               (data package metadata)
      src/
        source.ts                                (shared interface for all data sources)
        source-csv.ts                            (loads CSV data as read-only source data)
        source-table.ts                          (loads simple table-like data)
        source-json.ts                           (loads JSON data)
        source-sql.ts                            (connects to SQL sources in read-only mode)
        source-api.ts                            (future API data source boundary)
        read-only-guard.ts                       (prevents accidental writes to source data)
        working-copy.ts                          (creates editable temporary copies)
        data-shape.ts                            (normalizes rows, columns, fields, types, and labels)
        query-result.ts                          (stores imported query results in Gr4ph1c4 format)
        transform.ts                             (filters, sorts, groups, maps, and reshapes working data)
        rollback-data.ts                         (returns working data to first imported state)

    renderer-web/                                (HTML, CSS, SVG, and browser output)
      package.json                               (web renderer package metadata)
      src/
        render-page.ts                           (renders full HTML pages)
        render-screen.ts                         (renders screen-level visual composition)
        render-chart.ts                          (routes chart rendering by type)
        render-bars.ts                           (renders bar charts)
        render-line.ts                           (renders line charts)
        render-scatter.ts                        (renders scatter charts)
        render-table.ts                          (renders tables)
        render-card.ts                           (renders cards and number panels)
        render-timeline.ts                       (renders timelines)
        render-flow.ts                           (renders flow diagrams)
        render-assets.ts                         (copies images, CSS, JS, and static assets)
        stage-safe.ts                            (enforces readable labels, margins, contrast, and projector safety)
        responsive.ts                            (handles website and screen resizing rules)

    live-view/                                   (browser live preview and live updates)
      package.json                               (live view package metadata)
      src/
        live-server.ts                           (runs local HTTP/WebSocket preview server)
        file-watch.ts                            (watches .g4 files, data files, and theme files)
        update-protocol.ts                       (defines live update messages between CLI and browser)
        browser-client.ts                        (receives live changes in the browser)
        hot-swap.ts                              (replaces one module without refreshing the whole screen)
        live-errors.ts                           (shows safe visible errors without crashing the presentation)

    themes/                                      (visual systems with dependable defaults)
      package.json                               (theme package metadata)
      projector/
        theme.css                                (projector-safe type, spacing, contrast, and chart defaults)
        theme.json                               (machine-readable projector theme settings)
      classroom/
        theme.css                                (classroom-safe visual hierarchy and readable teaching layout)
        theme.json                               (machine-readable classroom theme settings)
      website/
        theme.css                                (responsive website layout and navigation defaults)
        theme.json                               (machine-readable website theme settings)
      dashboard/
        theme.css                                (dense operational display defaults)
        theme.json                               (machine-readable dashboard theme settings)
      print/
        theme.css                                (print-safe output)
        theme.json                               (machine-readable print settings)

    exporter/                                    (turns working visuals into durable artifacts)
      package.json                               (export package metadata)
      src/
        export-html.ts                           (exports static HTML folder)
        export-single-file.ts                    (exports a single self-contained HTML file)
        export-assets.ts                         (copies generated assets)
        export-manifest.ts                       (writes an export manifest for repeatability)
        export-report.ts                         (summarizes what was exported and where)
        export-pdf.ts                            (future PDF export boundary)
        export-png.ts                            (future PNG export boundary)
        export-slides.ts                         (future slide export boundary)

    errors/                                      (shared diagnostics and breadcrumb errors)
      package.json                               (error package metadata)
      src/
        error-code.ts                            (canonical Gr4ph1c4 error codes)
        breadcrumb.ts                            (where, what, why, path, next diagnostic structure)
        warning.ts                               (non-fatal stage-safety and data warnings)
        reporter.ts                              (prints errors for terminal, browser, and exported reports)

    contracts/                                   (neutral contracts between language, renderers, and future Zig/WASM engines)
      package.json                               (contract package metadata)
      src/
        graphica-ast.schema.json                 (JSON schema for the Gr4ph1c4 AST)
        module.schema.json                       (JSON schema for nameable modules)
        data.schema.json                         (JSON schema for normalized data)
        edit.schema.json                         (JSON schema for edit/resend commands)
        theme.schema.json                        (JSON schema for theme settings)
        export.schema.json                       (JSON schema for export manifests)

  engines/                                       (future non-TypeScript engines, kept clearly separate)
    zig-native/                                  (future Zig-native parser, packer, renderer, or compiler)
      README.md                                  (states future purpose without pretending it exists yet)
      build.zig                                  (future Zig build file)
      src/
        main.zig                                 (future Zig CLI entry)
        parser.zig                               (future Zig parser boundary)
        ast.zig                                  (future Zig AST structures)
        packer.zig                               (future static asset packer)

    wasm-modules/                                (future interactive modules compiled to WebAssembly)
      README.md                                  (explains future WASM role)
      examples/
        live-simulator.g4                        (future example that calls a WASM module)

  templates/                                     (starter projects for users)
    basic/
      README.md                                  (basic starter explanation)
      main.g4                                    (minimal starter file)

    classroom/
      README.md                                  (classroom starter explanation)
      lesson.g4                                  (presentation starter)

    website/
      README.md                                  (website starter explanation)
      site.g4                                    (site starter)

    dashboard/
      README.md                                  (dashboard starter explanation)
      dashboard.g4                               (dashboard starter)

    sql-safe/
      README.md                                  (safe SQL starter explanation)
      report.g4                                  (SQL-backed visual starter)
      sample.sql                                 (example schema and query)

  docs/                                          (human documents, short and useful)
    VISION.md                                    (full philosophical proposal and founding quote)
    LANGUAGE.md                                  (syntax rules, visual handles, modules, and examples)
    MODULES.md                                   (nameable modules, granular edits, resend behavior, and composition)
    LIVE-VIEW.md                                 (live preview, hot swap, shell, and presentation workflow)
    SAFE-DATA.md                                 (read-only sources, working copies, rollback, and source protection)
    ROLLBACK.md                                  (first-state memory, edit history, and restoration behavior)
    THEMES.md                                    (projector, classroom, website, dashboard, and print formats)
    EXPORTS.md                                   (HTML export and future PDF, PNG, and slides)
    ERRORS.md                                    (error codes, warnings, and recovery messages)
    V1-SCOPE.md                                  (what v1 promises and what it refuses to fake)

  tests/                                         (automated proof of the public promises)
    smoke/
      smoke-basic.sh                             (checks install, parse, render, export)
      smoke-live.sh                              (checks live server startup and update path)
      smoke-rollback.sh                          (checks edit and rollback path)
      smoke-safe-data.sh                         (checks read-only import and working-copy behavior)

    fixtures/
      hello.g4                                   (simple parser/render fixture)
      bad-syntax.g4                              (intentional syntax failure fixture)
      revenue.csv                                (CSV fixture for chart tests)
      safe-sql-result.json                       (mock SQL result fixture)
      rollback-before.json                       (expected first state)
      rollback-after.json                        (expected edited state)

    unit/
      parser.test.ts                             (parser correctness)
      semantic-check.test.ts                     (meaning validation)
      data-source.test.ts                        (source loading and read-only guards)
      working-copy.test.ts                       (temporary edit safety)
      rollback.test.ts                           (first-state restoration)
      render-chart.test.ts                       (chart rendering behavior)
      live-update.test.ts                        (module hot-swap behavior)

  scripts/                                       (developer commands that keep the repo honest)
    doctor.sh                                    (runs environment checks)
    smoke.sh                                     (runs the full smoke ladder)
    format.sh                                    (formats TypeScript and .g4 fixtures)
    clean.sh                                     (removes generated output, temp state, logs, and caches)
    demo.sh                                      (starts a known-good live demo)

  .gr4ph1c4/                                     (local project memory, ignored by git except placeholder)
    .gitkeep                                     (keeps the folder visible)
    temp-edits/                                  (temporary edit states, ignored by git)
      .gitkeep                                   (keeps temp edit folder visible)
    snapshots/                                   (rollback snapshots, ignored by git)
      .gitkeep                                   (keeps snapshot folder visible)
    sessions/                                    (live session state, ignored by git)
      .gitkeep                                   (keeps session folder visible)

  dist/                                          (generated exports, ignored by git)
    .gitkeep                                     (keeps output folder visible)

  logs/                                          (diagnostic logs, ignored by git)
    .gitkeep                                     (keeps logs folder visible)


```
