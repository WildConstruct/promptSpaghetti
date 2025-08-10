declare module '../scripts/build/lib.cjs' {
  export function collectGraphEntries(dir: string): Promise<Array<any>>;
  export function toTitleCase(s: string): string;
}
