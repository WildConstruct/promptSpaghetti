// Browser shim for Node.js 'fs' module
// Provides no-op implementations for file system operations

export const readFileSync = () => {
  throw new Error('File system operations are not available in the browser');
};

export const writeFileSync = () => {
  throw new Error('File system operations are not available in the browser');
};

export const existsSync = () => false;

export const mkdirSync = () => {};

export const readdirSync = () => [];

export const statSync = () => ({
  isDirectory: () => false,
  isFile: () => false
});

export class ReadStream {
  constructor() {
    throw new Error('File streams are not available in the browser');
  }
}

export default {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  ReadStream
};
