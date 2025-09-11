// Browser shim for OpenAI Node.js runtime
// Provides stub implementations for Node.js specific features

// Stub for Readable stream
export class Readable {
  constructor() {}
  pipe() {
    return this;
  }
  on() {
    return this;
  }
  read() {
    return null;
  }
}

// Stub for ReadStream
export class ReadStream extends Readable {}

// Stub for FormDataEncoder
export class FormDataEncoder {
  constructor() {}
  encode() {
    return new Uint8Array();
  }
}

// Stub for MultipartBody
export class MultipartBody {
  constructor() {}
}

// Stub for ReadableStream (Web Streams API)
export const ReadableStream =
  globalThis.ReadableStream ||
  class {
    constructor() {}
  };

// Export a no-op function for any Node.js specific initialization
export function init() {}

// Export default runtime configuration
export default {
  Readable,
  ReadStream,
  FormDataEncoder,
  MultipartBody,
  ReadableStream
};
