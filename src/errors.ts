export class G4Error extends Error {
  readonly code: string;
  readonly whereText: string;
  readonly whatText: string;
  readonly whyText: string;
  readonly nextText: string;

  constructor(args: { code: string; where: string; what: string; why: string; next: string }) {
    super(args.what);
    this.name = "G4Error";
    this.code = args.code;
    this.whereText = args.where;
    this.whatText = args.what;
    this.whyText = args.why;
    this.nextText = args.next;
  }

  format(): string {
    return [
      `error: ${this.code}`,
      `where: ${this.whereText}`,
      `what: ${this.whatText}`,
      `why: ${this.whyText}`,
      `next: ${this.nextText}`,
    ].join("\n");
  }
}

export function formatUnknownError(error: unknown): string {
  if (error instanceof G4Error) {
    return error.format();
  }

  const message = error instanceof Error ? error.message : String(error);
  return new G4Error({
    code: "GR4_E_INTERNAL",
    where: "runtime",
    what: message,
    why: "The command hit an unexpected internal failure.",
    next: "Run the command again with the same input and inspect the stack if it repeats.",
  }).format();
}
