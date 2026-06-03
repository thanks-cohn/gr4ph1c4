import { G4Error } from "./errors";

export type ColorSlot = "background" | "graphLines" | "axisNumbers" | "points" | "dataLines";

export interface OceanColorControls {
  background: string;
  graphLines: string;
  axisNumbers: string;
  points: string;
  dataLines: string;
  sourceBackground: string;
  sourceGraphLines: string;
  sourceAxisNumbers: string;
  sourcePoints: string;
  sourceDataLines: string;
  lastError: null;
}

const DEFAULT_COLORS: Record<ColorSlot, string> = {
  background: "#081426",
  graphLines: "#1d4ed8",
  axisNumbers: "#93c5fd",
  points: "#7df9ff",
  dataLines: "#38bdf8",
};

const NAMED_COLORS: Record<string, string> = {
  black: "#000000",
  white: "#ffffff",
  green: "#00ff00",
  cyan: "#00ffff",
  blue: "#0000ff",
  red: "#ff0000",
  purple: "#800080",
  yellow: "#ffff00",
  orange: "#ffa500",
  grey: "#808080",
  gray: "#808080",
};

const COLOR_ALIASES: Record<string, string> = {
  blk: "black",
  wht: "white",
  grn: "green",
  cy: "cyan",
  blu: "blue",
  purp: "purple",
  ylw: "yellow",
  org: "orange",
  gry: "grey",
};

const FLAG_TO_SLOT: Record<string, ColorSlot> = {
  "--background": "background",
  "--bg": "background",
  "--graph-lines": "graphLines",
  "--grid": "graphLines",
  "--axis-numbers": "axisNumbers",
  "--axis": "axisNumbers",
  "--points": "points",
  "--point": "points",
  "--data-lines": "dataLines",
  "--line": "dataLines",
};

export function defaultOceanColorControls(): OceanColorControls {
  return {
    background: DEFAULT_COLORS.background,
    graphLines: DEFAULT_COLORS.graphLines,
    axisNumbers: DEFAULT_COLORS.axisNumbers,
    points: DEFAULT_COLORS.points,
    dataLines: DEFAULT_COLORS.dataLines,
    sourceBackground: "default",
    sourceGraphLines: "default",
    sourceAxisNumbers: "default",
    sourcePoints: "default",
    sourceDataLines: "default",
    lastError: null,
  };
}

export function parseOceanColorControls(args: string[]): OceanColorControls {
  const controls = defaultOceanColorControls();
  for (let index = 0; index < args.length; index += 1) {
    const flag = args[index];
    const slot = FLAG_TO_SLOT[flag];
    if (!slot) {
      throw new G4Error({
        code: "GR4_THREE_OCEAN_ARGS",
        where: "command line",
        what: `three-ocean-points-demo received unknown argument ${flag}`,
        why: "The Three.js ocean points demo only accepts color control flags.",
        next: "Run `node dist/main.js three-ocean-points-demo --bg black --grid green --axis white --point cyan --line cyan`.",
      });
    }
    const rawValue = args[index + 1];
    if (!rawValue || rawValue.startsWith("--")) throwColorError("G4-COLOR-MISSING-VALUE", flag);
    const normalized = normalizeColor(rawValue);
    assignColor(controls, slot, normalized, rawValue);
    index += 1;
  }
  return controls;
}

export function normalizeColor(input: string): string {
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();
  const named = NAMED_COLORS[COLOR_ALIASES[lower] || lower];
  if (named) return named;

  const shortHex = /^#([0-9a-f]{3})$/i.exec(trimmed);
  if (shortHex) return `#${shortHex[1].split("").map((part) => part + part).join("")}`.toLowerCase();

  const longHex = /^#?([0-9a-f]{6})$/i.exec(trimmed);
  if (longHex) return `#${longHex[1].toLowerCase()}`;

  const rgb = /^rgb\(\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*\)$/i.exec(trimmed);
  if (rgb) {
    const values = rgb.slice(1).map((value) => Number(value));
    if (values.some((value) => value < 0 || value > 255)) throwColorError("G4-COLOR-RGB-RANGE", input);
    return `#${values.map((value) => value.toString(16).padStart(2, "0")).join("")}`;
  }

  throwColorError("G4-COLOR-UNKNOWN", input);
}

function assignColor(controls: OceanColorControls, slot: ColorSlot, normalized: string, source: string): void {
  if (slot === "background") { controls.background = normalized; controls.sourceBackground = source; }
  else if (slot === "graphLines") { controls.graphLines = normalized; controls.sourceGraphLines = source; }
  else if (slot === "axisNumbers") { controls.axisNumbers = normalized; controls.sourceAxisNumbers = source; }
  else if (slot === "points") { controls.points = normalized; controls.sourcePoints = source; }
  else { controls.dataLines = normalized; controls.sourceDataLines = source; }
}

function throwColorError(code: "G4-COLOR-UNKNOWN" | "G4-COLOR-RGB-RANGE" | "G4-COLOR-MISSING-VALUE", input: string): never {
  throw new G4Error({
    code,
    where: "command line color controls",
    what: `${code}:${input}`,
    why: "Color controls accept named colors, supported aliases, #rgb, #rrggbb, rrggbb, or rgb(r,g,b).",
    next: "Use a supported color value, for example --bg black or --point \"rgb(0,255,255)\".",
  });
}
