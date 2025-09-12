declare module '../scripts/build/lib.cjs' {
  export function collectGraphEntries(dir: string): Promise<
    Array<{
      filename: string;
      title: string;
      updatedAt: string;
      tags?: string[];
    }>
  >;
  export function toTitleCase(name: string): string;
}
