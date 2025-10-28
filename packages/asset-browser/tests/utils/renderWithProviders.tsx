import React, { PropsWithChildren } from 'react';
import { render, RenderOptions } from '@testing-library/react';

const withProviders = ({ children }: PropsWithChildren) => <>{children}</>;

export function renderWithProviders(
  ui: React.ReactElement,
  options?: RenderOptions
) {
  return render(ui, { wrapper: withProviders, ...options });
}

