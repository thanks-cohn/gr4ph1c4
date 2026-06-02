import type { G4Document, ChartNode, DataRow, HeroNode, NoteNode, ScreenNode } from "./ast.js";
import { G4Error } from "./errors.js";
import { lex, type Token, type TokenKind } from "./lexer.js";

class Parser {
  private readonly tokens: Token[];
  private cursor = 0;

  constructor(source: string) {
    this.tokens = lex(source);
  }

  parseDocument(): G4Document {
    const screen = this.parseScreen();
    this.expectKind("eof", "end of file");
    return { kind: "document", screen };
  }

  private parseScreen(): ScreenNode {
    this.expectWord("screen");
    const name = this.expectKind("word", "screen name").value;
    const title = this.expectKind("string", "screen title").value;
    const format = this.parseOptionalSetting("format", "projector");
    const hero = this.current().kind === "word" && this.current().value === "hero"
      ? this.parseHero()
      : { kind: "hero", text: title } as HeroNode;
    const chart = this.parseChart();
    const note = this.current().kind === "word" && this.current().value === "note"
      ? this.parseNote()
      : { kind: "note", text: "" } as NoteNode;
    return { kind: "screen", name, title, format, hero, chart, note };
  }

  private parseHero(): HeroNode {
    this.expectWord("hero");
    const text = this.expectKind("string", "hero text in double quotes").value;
    return { kind: "hero", text };
  }

  private parseChart(): ChartNode {
    this.expectWord("chart");
    const name = this.expectKind("word", "chart name").value;
    const title = this.expectKind("string", "chart title").value;
    const type = this.parseSetting("type");
    const width = this.parseOptionalSetting("width", "full");
    const height = this.parseOptionalSetting("height", "large");
    const labels = this.parseOptionalSetting("labels", "large");
    const highlight = this.parseOptionalSetting("highlight", "");
    this.expectWord("data");
    const data = this.parseDataRows();

    if (data.length === 0) {
      this.fail("GR4_E_EMPTY_DATA", this.current(), "at least one chart data row", "A bars chart cannot be rendered without numeric rows.", "Add rows like `Q1 120` under the data block.");
    }

    return { kind: "chart", name, title, type, width, height, labels, highlight: highlight || data[data.length - 1]!.label, data };
  }

  private parseSetting(name: string): string {
    this.expectWord(name);
    return this.expectKind("angle", `${name}:<value>`).value;
  }

  private parseOptionalSetting(name: string, defaultValue: string): string {
    const token = this.current();
    if (token.kind === "word" && token.value === name) {
      return this.parseSetting(name);
    }
    return defaultValue;
  }

  private parseDataRows(): DataRow[] {
    const rows: DataRow[] = [];
    while (this.current().kind !== "eof" && !(this.current().kind === "word" && this.current().value === "note")) {
      const label = this.expectKind("word", "data row label").value;
      const valueToken = this.expectKind("number", `numeric value for ${label}`);
      const value = Number(valueToken.value);
      if (!Number.isFinite(value)) {
        this.fail("GR4_E_BAD_NUMBER", valueToken, `numeric value for ${label}`, "Chart values must be finite numbers.", "Use a whole number such as `Q4 390`.");
      }
      rows.push({ label, value });
    }
    return rows;
  }

  private parseNote(): NoteNode {
    this.expectWord("note");
    const text = this.expectKind("string", "note text in double quotes").value;
    return { kind: "note", text };
  }

  private expectWord(value: string): Token {
    const token = this.current();
    if (token.kind === "word" && token.value === value) {
      this.cursor += 1;
      return token;
    }
    this.fail("GR4_E_EXPECTED_WORD", token, value, `The parser needs the ${value} keyword at this point in the PASS 1 grammar.`, `Add ${value} in the expected position or compare with examples/classroom-report.g4.`);
  }

  private expectKind(kind: TokenKind, description: string): Token {
    const token = this.current();
    if (token.kind === kind) {
      this.cursor += 1;
      return token;
    }
    this.fail("GR4_E_EXPECTED_TOKEN", token, description, `The parser found ${this.describe(token)} instead of ${description}.`, "Use the exact PASS 1 syntax documented in docs/LANGUAGE.md.");
  }

  private current(): Token {
    return this.tokens[this.cursor] ?? this.tokens[this.tokens.length - 1]!;
  }

  private describe(token: Token): string {
    if (token.kind === "eof") {
      return "end of file";
    }
    return `${token.kind} ${token.value}`;
  }

  private fail(code: string, token: Token, what: string, why: string, next: string): never {
    throw new G4Error({
      code,
      where: `line ${token.line}, column ${token.column}`,
      what,
      why,
      next,
    });
  }
}

export function parseG4(source: string): G4Document {
  return new Parser(source).parseDocument();
}
