export const CLI_COMMANDS = ["doctor", "parse", "render", "rollback-demo"] as const;

export function formatCliCommandList(): string {
  return CLI_COMMANDS.join(", ");
}
