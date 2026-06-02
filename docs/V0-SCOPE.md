# V0 PASS 1 Scope

V0 PASS 1 is one working vertical slice only.

## Included

- Read a `.g4` file.
- Lex and parse the PASS 1 language shape.
- Produce a typed AST for one screen.
- Render the AST to a complete HTML document.
- Render the chart as inline SVG bars.
- Export `index.html` to the requested output directory.
- Run a smoke test that inspects AST and HTML evidence.
- Emit breadcrumb-style errors for bad syntax.

## Excluded

- SQL
- live editing
- rollback
- image points
- plugin systems
- multiple screens
- extra chart types
- V1 behavior
