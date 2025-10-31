/// <reference types="react" />
/// <reference types="@types/react" />
/// <reference types="react-dom" />
/// <reference types="@types/react-dom" />
/// <reference types="@testing-library/react" />
/// <reference types="@testing-library/jest-dom" />

declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

export {};
