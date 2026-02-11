type ConsoleMethod = 'debug' | 'info' | 'log' | 'warn' | 'error';

const SUPPRESSED_LOG_PATTERNS: RegExp[] = [
  /Warning: An update to .* inside a test was not wrapped in act/i,
  /Not implemented: navigation \(except hash changes\)/i,
  /\[AssetBrowserLoader\] Failed to load integrated asset browser:/i,
  /\[AssetBrowserLoader\] Asset browser module not available, using fallback/i
];

const shouldSuppressConsoleOutput = (args: unknown[]): boolean => {
  const message = args
    .map(value => {
      if (typeof value === 'string') {
        return value;
      }
      if (value instanceof Error) {
        return `${value.name}: ${value.message}`;
      }
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    })
    .join(' ');

  return SUPPRESSED_LOG_PATTERNS.some(pattern => pattern.test(message));
};

(['debug', 'info', 'log', 'warn', 'error'] as const).forEach(method => {
  const original = console[method].bind(console);
  const filtered = (...args: unknown[]) => {
    if (shouldSuppressConsoleOutput(args)) {
      return;
    }
    original(...args);
  };
  Object.defineProperty(console, method, {
    value: filtered,
    writable: true,
    configurable: true
  });
});
