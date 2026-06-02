export const CLI_COMMANDS = ["doctor", "parse", "render", "rollback-demo", "snapshot-demo", "emit-sine-stream", "sine-demo", "chartjs-sine-demo"] as const;

export function formatCliCommandList(): string {
  return CLI_COMMANDS.join(", ");
}
