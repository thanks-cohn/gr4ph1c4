export type TokenKind = "word" | "string" | "angle" | "number" | "eof";

export interface Token {
  kind: TokenKind;
  value: string;
  line: number;
  column: number;
}

function isWhitespace(char: string): boolean {
  return char === " " || char === "\t" || char === "\r" || char === "\n";
}

function isWordChar(char: string): boolean {
  return /[A-Za-z0-9_]/.test(char);
}

export function lex(source: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;
  let line = 1;
  let column = 1;

  const advance = (): string => {
    const char = source[index] ?? "";
    index += 1;
    if (char === "\n") {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
    return char;
  };

  while (index < source.length) {
    const char = source[index] ?? "";

    if (isWhitespace(char)) {
      advance();
      continue;
    }

    const tokenLine = line;
    const tokenColumn = column;

    if (char === '"') {
      advance();
      let value = "";
      while (index < source.length && source[index] !== '"') {
        value += advance();
      }
      if (source[index] === '"') {
        advance();
      }
      tokens.push({ kind: "string", value, line: tokenLine, column: tokenColumn });
      continue;
    }

    if (char === ":" && source[index + 1] === "<") {
      advance();
      advance();
      let value = "";
      while (index < source.length && source[index] !== ">") {
        value += advance();
      }
      if (source[index] === ">") {
        advance();
      }
      tokens.push({ kind: "angle", value, line: tokenLine, column: tokenColumn });
      continue;
    }

    if (/[0-9]/.test(char)) {
      let value = "";
      while (index < source.length && /[0-9]/.test(source[index] ?? "")) {
        value += advance();
      }
      tokens.push({ kind: "number", value, line: tokenLine, column: tokenColumn });
      continue;
    }

    if (isWordChar(char)) {
      let value = "";
      while (index < source.length && isWordChar(source[index] ?? "")) {
        value += advance();
      }
      tokens.push({ kind: "word", value, line: tokenLine, column: tokenColumn });
      continue;
    }

    tokens.push({ kind: "word", value: advance(), line: tokenLine, column: tokenColumn });
  }

  tokens.push({ kind: "eof", value: "", line, column });
  return tokens;
}
