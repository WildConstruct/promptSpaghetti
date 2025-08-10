declare module '@testing-library/jest-dom/extend-expect' {}

declare namespace jest {
  interface Matchers<R> {
    toBeInTheDocument(): R;
    toHaveTextContent(text?: string | RegExp, options?: { selector?: string }): R;
    toBeVisible(): R;
    toHaveAttribute(attr: string, value?: string): R;
    toBeDisabled(): R;
    toBeEnabled(): R;
  }
}
