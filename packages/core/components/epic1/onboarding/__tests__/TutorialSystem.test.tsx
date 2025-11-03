/**
 * High-level onboarding flow smoke tests
 */

import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithTutorial, resetOnboardingStorage } from './testUtils';
import { TutorialOverlay } from '../TutorialOverlay';
import { useTutorial } from '../TutorialContext';
import { OnboardingIntegrationWrapper, useOnboarding } from '../OnboardingIntegration';

const TutorialControls: React.FC = () => {
  const tutorial = useTutorial();

  return (
    <div>
      <button data-testid="start" onClick={tutorial.startTutorial}>
        Start Tutorial
      </button>
      <button data-testid="next" onClick={() => tutorial.nextStep()}>
        Next Step
      </button>
      <button data-testid="skip" onClick={tutorial.skipTutorial}>
        Skip Tutorial
      </button>
      <div data-testid="status">
        {tutorial.onboardingState.tutorialProgress}% | step {tutorial.currentStep + 1} of{' '}
        {tutorial.tutorialSteps.length}
      </div>
    </div>
  );
};

describe('Tutorial system behaviour', () => {
  beforeEach(() => {
    resetOnboardingStorage();
  });

  it('keeps the overlay hidden until the tutorial starts', () => {
    renderWithTutorial(
      <>
        <TutorialControls />
        <TutorialOverlay />
      </>
    );

    expect(
      screen.queryByText('Welcome to Prompt Spaghetti! 🍝')
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('start'));

    expect(screen.getByText('Welcome to Prompt Spaghetti! 🍝')).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 10')).toBeInTheDocument();
  });

  it('allows users to advance steps via keyboard shortcuts', async () => {
    renderWithTutorial(
      <>
        <div className="react-flow__viewport" />
        <TutorialControls />
        <TutorialOverlay />
      </>
    );

    fireEvent.click(screen.getByTestId('start'));
    expect(screen.getByText('Step 1 of 10')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    await waitFor(() => expect(screen.getByText('Step 2 of 10')).toBeInTheDocument());

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    await waitFor(() => expect(screen.getByText('Step 1 of 10')).toBeInTheDocument());
  });

  it('skipTutorial marks tutorial complete and hides overlay', async () => {
    renderWithTutorial(
      <>
        <TutorialControls />
        <TutorialOverlay />
      </>
    );

    fireEvent.click(screen.getByTestId('start'));
    expect(screen.getByText('Step 1 of 10')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Skip tutorial'));

    await waitFor(() =>
      expect(screen.queryByText('Step 1 of 10')).not.toBeInTheDocument()
    );
    expect(screen.getByTestId('status').textContent).toContain('100%');
  });

  it('OnboardingIntegrationWrapper surfaces callback hooks and lifecycle', async () => {
    const onFirstEdit = jest.fn();
    const onComplete = jest.fn();
    const user = userEvent.setup();

    const TestApp: React.FC = () => {
      const { startTutorial, nextStep, onboardingState, isActive, tutorialSteps } =
        useOnboarding();

      return (
        <div>
          <button data-testid="start" onClick={startTutorial}>
            Start
          </button>
          <button data-testid="advance" onClick={() => nextStep()}>
            Advance
          </button>
          <div data-testid="progress">{onboardingState.tutorialProgress}</div>
          <div data-testid="active">{isActive ? 'active' : 'inactive'}</div>
          <div data-testid="total-steps">{tutorialSteps.length}</div>
        </div>
      );
    };

    render(
      <OnboardingIntegrationWrapper onFirstEdit={onFirstEdit} onComplete={onComplete}>
        <TestApp />
      </OnboardingIntegrationWrapper>
    );

    expect(screen.getByTestId('active').textContent).toBe('inactive');

    await act(async () => {
      await user.click(screen.getByTestId('start'));
    });
    expect(screen.getByTestId('active').textContent).toBe('active');

    act(() => {
      window.dispatchEvent(new Event('epic1:firstEdit'));
    });
    await waitFor(() => expect(onFirstEdit).toHaveBeenCalledTimes(1));

    act(() => {
      window.dispatchEvent(new Event('epic1:firstEdit'));
    });
    await waitFor(() => expect(onFirstEdit).toHaveBeenCalledTimes(1));

    const totalSteps = Number(screen.getByTestId('total-steps').textContent);
    for (let i = 0; i < totalSteps; i += 1) {
      await act(async () => {
        await user.click(screen.getByTestId('advance'));
      });
    }

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(screen.getByTestId('progress').textContent).toBe('100');
  });
});
