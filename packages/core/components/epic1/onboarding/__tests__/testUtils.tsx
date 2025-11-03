import React from 'react';
import {
  render,
  type RenderOptions,
  renderHook,
  type RenderHookOptions,
  type RenderHookResult,
} from '@testing-library/react';
import { TutorialProvider } from '../TutorialContext';

const TutorialWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <TutorialProvider>{children}</TutorialProvider>
);

export function renderWithTutorial(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: TutorialWrapper, ...options });
}

export function renderTutorialHook<Result, Props>(
  callback: (props: Props) => Result,
  options?: Omit<RenderHookOptions<Props>, 'wrapper'>
): RenderHookResult<Result, Props> {
  return renderHook(callback, {
    ...(options ?? {}),
    wrapper: TutorialWrapper,
  });
}

export function resetOnboardingStorage() {
  localStorage.removeItem('onboardingState');
}

export function seedOnboardingState(state: unknown) {
  localStorage.setItem('onboardingState', JSON.stringify(state));
}
