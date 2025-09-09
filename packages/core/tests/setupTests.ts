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
  window.scrollTo = () => {};
}

if (!HTMLElement.prototype.scrollIntoView) {
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    value: function () {},
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
  URL.revokeObjectURL = () => {};
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
  const BlobCtor: any = (globalThis as any).Blob;
  if (!BlobCtor || !BlobCtor.prototype) return;
  const proto = BlobCtor.prototype as any;
  const Resp: any = (globalThis as any).Response;
  if (typeof proto.text !== 'function') {
    proto.text = function (): Promise<string> {
      if (Resp) return new Resp(this).text();
      // Best-effort fallback
      return Promise.resolve(String(this));
    };
  }
  if (typeof proto.arrayBuffer !== 'function') {
    proto.arrayBuffer = function (): Promise<ArrayBuffer> {
      if (Resp) return new Resp(this).arrayBuffer();
      // Best-effort fallback
      const enc = new TextEncoder();
      return Promise.resolve(enc.encode(String(this)).buffer);
    };
  }
})();
