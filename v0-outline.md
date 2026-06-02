
# GR4PH1C4 V0 OUTLINE
```
The first working confession.

gr4ph1c4/
  README.md                                      (the public promise, founding quote, vision, examples, and first sacred laws)
  LICENSE                                        (the legal permission boundary for use, sharing, and contribution)
  package.json                                   (Node/TypeScript package commands, dependencies, and executable entry)
  tsconfig.json                                  (TypeScript compiler settings for the v0 implementation)
  .gitignore                                     (keeps build output, dependency folders, temp edits, and logs out of git)

  examples/                                      (small proof files that show what Gr4ph1c4 means immediately)
    hello.g4                                     (the smallest possible Gr4ph1c4 screen)
    classroom-report.g4                          (a projector-safe classroom chart demo)
    revenue-live.g4                              (a live-view chart example with editable properties)
    safe-sql-mock.g4                             (a read-only data import example using mocked SQL-shaped data)
    rollback-demo.g4                             (shows temporary edits and rollback behavior)

  src/                                           (the working TypeScript core for v0)
    main.ts                                      (CLI entry point that receives commands and dispatches behavior)
    commands.ts                                  (defines gr4ph1c4 new, live, export, doctor, shell, and rollback commands)
    parser.ts                                    (turns .g4 text into structured Gr4ph1c4 objects)
    lexer.ts                                     (breaks raw .g4 text into tokens the parser can understand)
    ast.ts                                       (defines the neutral internal shape of screens, charts, data, edits, and commands)
    errors.ts                                    (stage-safe, breadcrumb-style errors with where, what, why, and next)
    doctor.ts                                    (checks environment, files, ports, renderer availability, and example health)
    project.ts                                   (detects project roots, paths, examples, output folders, and config files)

    live-server.ts                               (runs the local live preview server)
    live-reload.ts                               (watches .g4 files and tells the browser when to refresh or update)
    live-state.ts                                (tracks the current live working state without touching original sources)

    render-html.ts                               (renders Gr4ph1c4 AST into a browser-ready HTML page)
    render-css.ts                                (renders stage-safe CSS for projector, classroom, website, dashboard, and print modes)
    render-chart.ts                              (renders v0 charts into SVG or simple browser graphics)
    render-screen.ts                             (renders screens, heroes, notes, cards, sections, and layout blocks)

    data-source.ts                               (loads read-only data from CSV, table-like files, and mocked SQL sources)
    working-copy.ts                              (creates safe editable copies of imported data and visual modules)
    rollback.ts                                  (restores charts, data, screens, or the whole session to first received state)

    module-registry.ts                           (stores nameable visual modules so they can be edited and resent)
    edit-command.ts                              (applies granular edits to one named chart, screen, table, or module)
    resend-command.ts                            (pushes an edited module back into live view without rebuilding everything)

  public/                                        (browser assets used by the live preview)
    index.html                                   (minimal browser shell for live preview)
    viewer.js                                    (client-side receiver for live updates)
    viewer.css                                   (base preview styling before generated theme CSS is applied)

  themes/                                        (stage-safe visual defaults)
    projector.css                                (large readable labels, strong contrast, and room-safe chart spacing)
    classroom.css                                (teaching-first layout with readable hierarchy)
    website.css                                  (responsive website defaults)
    dashboard.css                                (dense panel layout for operational screens)
    print.css                                    (paper-safe margins, spacing, and monochrome-friendly behavior)

  templates/                                     (starter projects created by gr4ph1c4 new)
    basic/
      README.md                                  (explains the generated starter project)
      main.g4                                    (starter Gr4ph1c4 file)
    classroom/
      README.md                                  (explains the classroom presentation starter)
      lesson.g4                                  (starter classroom screen)
    business/
      README.md                                  (explains the business-site starter)
      site.g4                                    (starter website-style Gr4ph1c4 file)

  tests/                                         (proof that v0 works and does not lie)
    smoke.sh                                     (runs the basic proof ladder from install to render)
    parse.test.ts                                (checks that .g4 syntax becomes the expected AST)
    render.test.ts                               (checks that known input produces known HTML output)
    rollback.test.ts                             (checks that temporary edits can return to first state)
    live.test.ts                                 (checks that live preview can start and receive updates)

  docs/                                          (short human-readable explanations)
    LANGUAGE.md                                  (explains .g4 syntax, properties, modules, and edit/resend rules)
    ERRORS.md                                    (explains Gr4ph1c4 error codes and recovery guidance)
    DATA-SAFETY.md                               (explains read-only sources, working copies, rollback, and no overwrite by default)
    V0-SCOPE.md                                  (states what v0 does and what it refuses to pretend it does)

  dist/                                          (generated output folder, ignored by git)
    .gitkeep                                     (keeps the folder visible without committing generated exports)

```

  logs/                                          (local diagnostics folder, ignored by git)
    .gitkeep                                     (keeps the folder visible without committing machine-specific logs)
