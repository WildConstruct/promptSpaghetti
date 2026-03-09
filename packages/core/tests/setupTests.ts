import '@testing-library/jest-dom';
import {
  TextDecoder as NodeTextDecoder,
  TextEncoder as NodeTextEncoder
} from 'util';

// Mock performance API for tests
Object.defineProperty(global, 'performance', {
  value: {
    now: jest.fn(() => Date.now())
  },
  writable: true
});

// Mock navigation API to prevent jsdom errors
Object.defineProperty(window, 'navigation', {
  value: {
    navigate: jest.fn()
  },
  writable: true
});

// Mock URL navigation to prevent jsdom errors
const originalLocation = window.location;
delete window.location;
window.location = {
  ...originalLocation,
  assign: jest.fn(),
  replace: jest.fn(),
  href: 'http://localhost:3000',
  origin: 'http://localhost:3000',
  protocol: 'http:',
  host: 'localhost:3000',
  hostname: 'localhost',
  port: '3000',
  pathname: '/',
  search: '',
  hash: ''
};

// Mock HTMLAnchorElement.prototype to prevent navigation errors
Object.defineProperty(HTMLAnchorElement.prototype, 'href', {
  get() {
    return this.getAttribute('href') || '';
  },
  set(value) {
    this.setAttribute('href', value);
  }
});

// Stop all navigation attempts
Object.defineProperty(window, 'onbeforeunload', {
  value: null,
  writable: true
});

// Add fetch polyfill for OpenAI
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    ok: true,
    status: 200
  } as Response)
);

// Optional safe polyfills for jsdom gaps used in some tests/components
if (!('scrollTo' in window)) {
  // @ts-expect-error jsdom doesn't implement scrollTo in older versions
  window.scrollTo = () => undefined;
}

if (!HTMLElement.prototype.scrollIntoView) {
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    value: function scrollIntoViewMock() {
      return undefined;
    },
    writable: true,
    configurable: true
  });
}

// Polyfill URL.createObjectURL/revokeObjectURL for jsdom
if (typeof URL.createObjectURL !== 'function') {
  // @ts-expect-error allow assignment in test env
  URL.createObjectURL = () => 'blob:mock-url';
}
if (typeof URL.revokeObjectURL !== 'function') {
  // @ts-expect-error allow assignment in test env
  URL.revokeObjectURL = () => undefined;
}

// Ensure TextEncoder/TextDecoder exist
if (typeof globalThis.TextEncoder === 'undefined') {
  // @ts-expect-error assign Node polyfill
  globalThis.TextEncoder = NodeTextEncoder as unknown as typeof TextEncoder;
}
if (typeof globalThis.TextDecoder === 'undefined') {
  // @ts-expect-error assign Node polyfill
  globalThis.TextDecoder = NodeTextDecoder as unknown as typeof TextDecoder;
}

// Polyfill Blob.prototype.text/arrayBuffer if missing
(() => {
  type BlobPrototypeOverrides = Blob & {
    text?: () => Promise<string>;
    arrayBuffer?: () => Promise<ArrayBuffer>;
  };

  const globalBlobSupport = globalThis as {
    Blob?: typeof Blob;
    Response?: typeof Response;
  };

  const BlobCtor = globalBlobSupport.Blob;
  if (!BlobCtor || !BlobCtor.prototype) {
    return;
  }

  const proto = BlobCtor.prototype as BlobPrototypeOverrides;
  const ResponseCtor = globalBlobSupport.Response;

  if (typeof proto.text !== 'function') {
    proto.text = function textShim(this: Blob): Promise<string> {
      if (ResponseCtor) {
        return new ResponseCtor(this).text();
      }
      // Best-effort fallback
      return Promise.resolve(String(this));
    };
  }

  if (typeof proto.arrayBuffer !== 'function') {
    proto.arrayBuffer = function arrayBufferShim(
      this: Blob
    ): Promise<ArrayBuffer> {
      if (ResponseCtor) {
        return new ResponseCtor(this).arrayBuffer();
      }
      // Best-effort fallback
      const encoder = new TextEncoder();
      return Promise.resolve(encoder.encode(String(this)).buffer);
    };
  }
})();

type ConsoleMethod = 'debug' | 'info' | 'log' | 'warn' | 'error';

const SUPPRESSED_LOG_PATTERNS: RegExp[] = [
  /Warning: An update to .* inside a test was not wrapped in act/i,
  /Not implemented: navigation \(except hash changes\)/i,
  /\[TutorialStepValidator\] Validating step:/i,
  /\[ElementDetector\] querySelector failed/i,
  /\[ElementDetector\] Element ".*" not found after/i,
  /\[ElementDetector\] Timeout: Element ".*" not found within/i,
  /\[ElementDetector\] Found element ".*"( immediately| after \d+ attempts| via MutationObserver)/i,
  /LLM parse attempt \d+ failed:/i,
  /LLM parse failed, falling back to standard/i,
  /LLM parsing failed:/i,
  /\[Parser Notice\] Using standard parser due to LLM unavailability/i,
  /Dedicated extractMetadata call failed:/i,
  /LLM completion metadata extraction failed:/i,
  /LLM extraction failed, using fallback:/i,
  /\[ApiLLMService\] populateChoices failed, falling back to offline suggestions:/i,
  /Metadata extraction failed:/i,
  /Failed to decompress data/i,
  /Storage quota exceeded/i,
  /Error saving state:/i
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
