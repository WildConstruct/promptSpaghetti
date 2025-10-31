/// <reference types="node" />
/// <reference types="@types/node" />

declare global {
  var __dirname: string;
  var __filename: string;
  var console: Console;
  var process: NodeJS.Process;
  var URLSearchParams: typeof globalThis.URLSearchParams;
  var Buffer: typeof Buffer;
  var global: typeof global;
}

export {};
