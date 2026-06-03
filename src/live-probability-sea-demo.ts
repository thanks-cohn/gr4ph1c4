declare const require: (name: string) => unknown;

const fsPromises = require("node:fs/promises") as {
  mkdir: (path: string, options: { recursive: boolean }) => Promise<void>;
  copyFile: (from: string, to: string) => Promise<void>;
  writeFile: (path: string, data: string, encoding: "utf8") => Promise<void>;
};
const pathModule = require("node:path") as { join: (...parts: string[]) => string };
const generator = require("./live-probability-sea/generateStream.js") as {
  generateStreamFromSeedFile: (seedPath: string, outPath: string) => { recordCount: number; entityCount: number; outPath: string };
};

const { mkdir, copyFile, writeFile } = fsPromises;
const { join } = pathModule;

const DEMO = "live-probability-sea";
const SOURCE_DIR = join("src", DEMO);
const OUTPUT_DIR = join("dist", DEMO);
const STREAM_PATH = join(OUTPUT_DIR, "streams", "probability-demo.jsonl");
const SEED_PATH = join("examples", DEMO, "seed.json");
const SOURCE_FILES = ["index.html", "style.css", "main.js", "ingest.js", "smoke-test.js", "browser-render-smoke-test.js"];

export async function runLiveProbabilitySeaDemo(): Promise<void> {
  await mkdir(OUTPUT_DIR, { recursive: true });
  await mkdir(join(OUTPUT_DIR, "streams"), { recursive: true });
  await Promise.all(SOURCE_FILES.map((file) => copyFile(join(SOURCE_DIR, file), join(OUTPUT_DIR, file))));
  const generated = generator.generateStreamFromSeedFile(SEED_PATH, STREAM_PATH);
  const proofLines = [
    "GR4PH1C4_LIVE_PROBABILITY_SEA_SOURCE_ONLY",
    `demo: ${DEMO}`,
    `seed: ${SEED_PATH}`,
    `stream: ${generated.outPath}`,
    `records generated: ${generated.recordCount}`,
    `entities: ${generated.entityCount}`,
    "proof global: window.__G4_LIVE_PROBABILITY_SEA_PROOF__",
    "commands:",
    "node dist/main.js live-probability-sea",
    "node dist/live-probability-sea/smoke-test.js",
    "node dist/live-probability-sea/browser-render-smoke-test.js"
  ];
  await writeFile(join(OUTPUT_DIR, "proof.log"), `${proofLines.join("\n")}\n`, "utf8");
  console.log(proofLines.join("\n"));
}
