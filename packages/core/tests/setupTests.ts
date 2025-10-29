import '@testing-library/jest-dom';
import {
  TextDecoder as NodeTextDecoder,
  TextEncoder as NodeTextEncoder
} from 'util';

// Add OpenAI Node.js shim for tests
import 'openai/shims/node';

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
    proto.arrayBuffer = function arrayBufferShim(this: Blob): Promise<ArrayBuffer> {
      if (ResponseCtor) {
        return new ResponseCtor(this).arrayBuffer();
      }
      // Best-effort fallback
      const encoder = new TextEncoder();
      return Promise.resolve(encoder.encode(String(this)).buffer);
    };
  }
})();
