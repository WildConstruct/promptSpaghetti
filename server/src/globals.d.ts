// Global type declarations for server-side compatibility
declare global {
  // Browser APIs that may not be available in Node.js
  var navigator: { userAgent: string } | undefined;
  var document: { referrer: string } | undefined;
  var localStorage: { getItem(key: string): string | null; setItem(key: string, value: string): void } | undefined;
  var sessionStorage: { getItem(key: string): string | null; setItem(key: string, value: string): void } | undefined;
  var window: { location: { search: string } } | undefined;
}

export {};
