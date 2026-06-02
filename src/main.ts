declare const require: (name: string) => {
  mkdir?: (path: string, options: { recursive: boolean }) => Promise<void>;
  readFile?: (path: string, encoding: "utf8") => Promise<string>;
  writeFile?: (path: string, data: string, encoding: "utf8") => Promise<void>;
  join?: (...parts: string[]) => string;
};
declare const process: { argv: string[]; exitCode?: number };

const fsPromises = require("node:fs/promises");
const pathModule = require("node:path");

import { formatCliCommandList } from "./commands";
import { formatDoctor, runDoctor } from "./doctor";
import { formatUnknownError, G4Error } from "./errors";
import { ModuleRegistry } from "./module-registry";
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
    "  node dist/main.js rollback-demo",
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


function assertProof(condition: boolean, what: string): void {
  if (!condition) {
    throw new G4Error({
      code: "GR4_E_ROLLBACK_PROOF_FAILED",
      where: "rollback-demo",
      what,
      why: "The PASS 2 rollback proof only passes when each inspected state matches real rendered evidence.",
      next: "Inspect examples/rollback-demo.g4, src/module-registry.ts, and the rendered output in dist/rollback-demo/index.html.",
    });
  }
}

function proofLine(label: string, value: string): void {
  console.log(`${label}: ${value}`);
}

async function runRollbackDemo(): Promise<void> {
  const inputPath = join("examples", "rollback-demo.g4");
  const source = await readFile(inputPath, "utf8");
  const document = parseG4(source);
  const registry = new ModuleRegistry();
  const originalChart = document.screen.chart;

  const registered = registry.register("revenue", originalChart);
  const fetched = registry.get("revenue");
  assertProof(fetched.name === "revenue", "registry get(\"revenue\") returned the registered module name");
  assertProof(fetched === registered, "registry stores and retrieves the same registered revenue module");

  const originalAstTypeAtStart = originalChart.type;
  try {
    registry.get("missing_revenue");
    assertProof(false, "missing module lookup unexpectedly succeeded");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    assertProof(message === "module not registered: missing_revenue", "missing module lookup returned an unclear error");
    proofLine("missing module lookup rejected", "missing_revenue");
  }

  proofLine("input", inputPath);
  proofLine("registered module", fetched.name);
  proofLine("original chart type", originalAstTypeAtStart);
  proofLine("registry working type before edit", fetched.working.type);

  const beforeResendSvg = fetched.rendered;
  assertProof(beforeResendSvg.includes('data-rendered-chart-type="bars"'), "before resend output contains bars SVG evidence");
  assertProof(originalAstTypeAtStart === "bars", "original AST starts as bars");

  registry.edit("revenue", { type: "line" });
  const edited = registry.get("revenue").working;
  proofLine("edited chart type", edited.type);
  proofLine("original AST type after edit", originalChart.type);
  assertProof(edited.type === "line", "edit changed working copy revenue type to line");
  assertProof(originalChart.type === "bars", "edit did not mutate original AST");

  const afterResendSvg = registry.resend("revenue");
  const updatedDocument = {
    ...document,
    screen: {
      ...document.screen,
      chart: registry.get("revenue").working,
    },
  };
  const updatedHtml = renderHtml(updatedDocument);
  await mkdir(join("dist", "rollback-demo"), { recursive: true });
  await writeFile(join("dist", "rollback-demo", "index.html"), updatedHtml, "utf8");

  proofLine("resend rendered chart type", afterResendSvg.includes('data-rendered-chart-type="line"') ? "line" : "unknown");
  proofLine("rendered output", join("dist", "rollback-demo", "index.html"));
  assertProof(afterResendSvg.includes('data-rendered-chart-type="line"'), "after resend output contains line SVG evidence");
  assertProof(!afterResendSvg.includes('data-rendered-chart-type="bars"'), "after resend output no longer contains bars SVG evidence");
  assertProof(beforeResendSvg !== afterResendSvg, "resend changed rendered SVG output after edit");
  assertProof(updatedHtml.includes('data-chart-type="line"'), "updated HTML records edited chart type line");
  assertProof(updatedHtml.includes('data-rendered-chart-type="line"'), "updated HTML contains line SVG evidence");
  assertProof(originalChart.type === "bars", "resend did not mutate original AST");

  registry.rollback("revenue");
  const rolledBack = registry.get("revenue").working;
  proofLine("rollback chart type", rolledBack.type);
  proofLine("original AST type after rollback", originalChart.type);
  assertProof(rolledBack.type === "bars", "rollback restored working copy to first registered state bars");
  assertProof(registry.get("revenue").rendered.includes('data-rendered-chart-type="bars"'), "rollback restored bars SVG evidence");
  assertProof(originalChart.type === "bars", "rollback did not mutate original AST");
  assertProof(originalAstTypeAtStart === originalChart.type, "original AST remained bars for the entire proof");

  console.log("PASS GR4PH1C4 V0 PASS 2 rollback proof");
}

async function main(argv: string[]): Promise<void> {
  const [command, filePath, ...rest] = argv;

  if (command === "rollback-demo") {
    if (filePath !== undefined) {
      throw new G4Error({
        code: "GR4_E_ROLLBACK_ARGS",
        where: "command line",
        what: "rollback-demo received extra arguments",
        why: "The PASS 2 rollback proof loads examples/rollback-demo.g4 directly.",
        next: "Run `node dist/main.js rollback-demo` with no file path.",
      });
    }
    await runRollbackDemo();
    return;
  }

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
    why: `PASS 2 supports ${formatCliCommandList()}.`,
    next: usage(),
  });
}

main(process.argv.slice(2)).catch((error: unknown) => {
  console.error(formatUnknownError(error));
  process.exitCode = 1;
});
