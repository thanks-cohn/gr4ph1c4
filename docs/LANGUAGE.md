# Gr4ph1c4 PASS 1 Language

PASS 1 accepts one screen with this exact structure:

```g4
screen quarterly_report "Quarterly Report"
  format:<projector>

  hero "Revenue Continues To Rise"

  chart revenue "Quarterly Revenue"
    type:<bars>
    width:<full>
    height:<large>
    labels:<large>
    highlight:<Q4>
    data
      Q1 120
      Q2 180
      Q3 260
      Q4 390

  note "Q4 produced the strongest quarter of the year."
```

## AST fields

The parser records:

- screen name
- screen title
- format
- hero text
- chart name
- chart title
- chart type
- chart width
- chart height
- chart label size
- highlighted data label
- chart data rows
- note text

## Syntax notes

- Titles, hero text, and note text must be quoted strings.
- Settings use `name:<value>` form.
- Chart data rows use a label followed by a whole number.
- PASS 1 only renders `type:<bars>`.
