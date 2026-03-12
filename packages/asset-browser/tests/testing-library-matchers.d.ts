/// <reference types="jest" />

declare global {
  namespace jest {
    interface Matchers<R = void, T = unknown> {
      toBeEnabled(): R;
      toBeInTheDocument(): R;
      toHaveAttribute(attr: string, value?: unknown): R;
    }
  }
}

declare module 'expect' {
  interface Matchers<R = void, T = unknown> {
    toBeEnabled(): R;
    toBeInTheDocument(): R;
    toHaveAttribute(attr: string, value?: unknown): R;
  }
}

export {};
