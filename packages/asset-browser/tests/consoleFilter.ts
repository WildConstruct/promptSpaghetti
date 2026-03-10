export function installConsoleFilter(
  patterns: RegExp[],
  methods: Array<'error' | 'warn' | 'log'> = ['error', 'warn', 'log']
): void {
  const formatArgs = (args: unknown[]): string =>
    args
      .map(arg => {
        if (typeof arg === 'string') {
          return arg;
        }

        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      })
      .join(' ');

  for (const method of methods) {
    const original = console[method];
    jest.spyOn(console, method).mockImplementation((...args: unknown[]) => {
      const message = formatArgs(args);
      if (patterns.some(pattern => pattern.test(message))) {
        return;
      }
      original(...args);
    });
  }
}
