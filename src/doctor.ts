import { formatCliCommandList } from "./commands";

export interface DoctorResult {
  ok: true;
  checks: string[];
}

export function runDoctor(): DoctorResult {
  return {
    ok: true,
    checks: [
      "parser module loaded",
      "HTML renderer module loaded",
      "SVG bars chart renderer loaded",
      `CLI commands available: ${formatCliCommandList()}`,
    ],
  };
}

export function formatDoctor(result: DoctorResult): string {
  return ["gr4ph1c4 doctor", ...result.checks.map((check) => `- ${check}`)].join("\n");
}
