declare const require: (name: string) => {
  mkdir?: (path: string, options: { recursive: boolean }) => Promise<void>;
  readFile?: (path: string, encoding: "utf8") => Promise<string>;
  writeFile?: (path: string, data: string, encoding: "utf8") => Promise<void>;
  join?: (...parts: string[]) => string;
};
declare const process: { argv: string[]; exitCode?: number };

const fsPromises = require("node:fs/promises");
const pathModule = require("node:path");

import { formatDoctor, runDoctor } from "./doctor";
import { formatUnknownError, G4Error } from "./errors";
import { parseG4 } from "./parser";
import { renderHtml } from "./render-html";

const { mkdir, readFile, writeFile } = fsPromises as {
  mkdir: (path: string, options: { recursive: boolean }) => Promise<void>;
  readFile: (path: string, encoding: "utf8") => Promise<string>;
  writeFile: (path: string, data: string, encoding: "utf8") => Promise<void>;
};
const { join } = pathModule as { join: (...parts: string[]) => string };

interface CliOptions {
  json: boolean;
  out?: string;
}

function usage(): string {
  return [
    "usage:",
    "  node dist/main.js doctor",
    "  node dist/main.js parse <file.g4> --json",
    "  node dist/main.js render <file.g4> --out <directory>",
  ].join("\n");
}

function parseOptions(args: string[]): CliOptions {
  const options: CliOptions = { json: false };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--json") {
      options.json = true;
      continue;
    }
    if (arg === "--out") {
      const value = args[index + 1];
      if (!value) {
        throw new G4Error({
          code: "GR4_E_MISSING_OUT",
          where: "command line",
          what: "missing output directory after --out",
          why: "The render command writes index.html into the requested directory.",
          next: "Run `node dist/main.js render examples/classroom-report.g4 --out dist/site`.",
        });
      }
      options.out = value;
      index += 1;
      continue;
    }
    throw new G4Error({
      code: "GR4_E_UNKNOWN_FLAG",
      where: "command line",
      what: `unknown flag or argument ${arg}`,
      why: "PASS 1 only accepts --json for parse and --out for render.",
      next: usage(),
    });
  }
  return options;
}

async function readAndParse(filePath: string) {
  const source = await readFile(filePath, "utf8");
  return parseG4(source);
}

async function main(argv: string[]): Promise<void> {
  const [command, filePath, ...rest] = argv;

  if (command === "doctor") {
    if (filePath !== undefined) {
      throw new G4Error({
        code: "GR4_E_DOCTOR_ARGS",
        where: "command line",
        what: "doctor received extra arguments",
        why: "The doctor command only checks whether the built CLI can load its V0 PASS 1 modules.",
        next: "Run `node dist/main.js doctor` with no file path.",
      });
    }
    console.log(formatDoctor(runDoctor()));
    return;
  }

  if (!filePath) {
    throw new G4Error({
      code: "GR4_E_MISSING_FILE",
      where: "command line",
      what: "missing .g4 input file",
      why: "The parse and render commands need a source file.",
      next: usage(),
    });
  }

  if (command === "parse") {
    const options = parseOptions(rest);
    const document = await readAndParse(filePath);
    if (!options.json) {
      throw new G4Error({
        code: "GR4_E_PARSE_FORMAT",
        where: "command line",
        what: "parse requires --json in PASS 1",
        why: "The supported parse output is a JSON AST for smoke-test inspection.",
        next: "Run `node dist/main.js parse examples/classroom-report.g4 --json`.",
      });
    }
    console.log(JSON.stringify(document, null, 2));
    return;
  }

  if (command === "render") {
    const options = parseOptions(rest);
    if (!options.out) {
      throw new G4Error({
        code: "GR4_E_RENDER_OUT",
        where: "command line",
        what: "render requires --out <directory>",
        why: "PASS 1 exports a single index.html file into an output directory.",
        next: "Run `node dist/main.js render examples/classroom-report.g4 --out dist/site`.",
      });
    }
    const document = await readAndParse(filePath);
    const html = renderHtml(document);
    await mkdir(options.out, { recursive: true });
    await writeFile(join(options.out, "index.html"), html, "utf8");
    console.log(`wrote ${join(options.out, "index.html")}`);
    return;
  }

  throw new G4Error({
    code: "GR4_E_UNKNOWN_COMMAND",
    where: "command line",
    what: command ? `unknown command ${command}` : "missing command",
    why: "PASS 1 supports doctor, parse, and render.",
    next: usage(),
  });
}

main(process.argv.slice(2)).catch((error: unknown) => {
  console.error(formatUnknownError(error));
  process.exitCode = 1;
});
