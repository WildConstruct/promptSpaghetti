type ConsoleMethod = 'debug' | 'info' | 'log' | 'warn' | 'error';

type RestoreConsole = () => void;

function messageFromArgs(args: unknown[]): string {
  return args
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
}

export function installConsoleFilter(
  patterns: RegExp[],
  methods: readonly ConsoleMethod[] = ['debug', 'info', 'log', 'warn', 'error']
): RestoreConsole {
  const originals = new Map<ConsoleMethod, (...args: unknown[]) => void>();

  for (const method of methods) {
    const original = console[method].bind(console);
    originals.set(method, original);

    Object.defineProperty(console, method, {
      value: (...args: unknown[]) => {
        const message = messageFromArgs(args);
        if (patterns.some(pattern => pattern.test(message))) {
          return;
        }
        original(...args);
      },
      writable: true,
      configurable: true
    });
  }

  return () => {
    for (const [method, original] of originals.entries()) {
      Object.defineProperty(console, method, {
        value: original,
        writable: true,
        configurable: true
      });
    }
  };
}
