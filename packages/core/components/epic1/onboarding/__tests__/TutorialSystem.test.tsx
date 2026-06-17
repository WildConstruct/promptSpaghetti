/**
 * High-level onboarding flow smoke tests
 */

import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
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
      screen.queryByText('Start With Structure')
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('start'));

    expect(screen.getByText('Start with structure')).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 8')).toBeInTheDocument();
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
    expect(screen.getByText('Step 1 of 8')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    await waitFor(() => expect(screen.getByText('Step 2 of 8')).toBeInTheDocument());

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    await waitFor(() => expect(screen.getByText('Step 1 of 8')).toBeInTheDocument());
  });

  it('skipTutorial marks tutorial complete and hides overlay', async () => {
    renderWithTutorial(
      <>
        <TutorialControls />
        <TutorialOverlay />
      </>
    );

    fireEvent.click(screen.getByTestId('start'));
    expect(screen.getByText('Step 1 of 8')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Skip tutorial'));

    await waitFor(() =>
      expect(screen.queryByText('Step 1 of 8')).not.toBeInTheDocument()
    );
    expect(screen.getByTestId('status').textContent).toContain('100%');
  });

  it('uses a spotlight cutout and anchored tooltip for the wizard step', async () => {
    renderWithTutorial(
      <>
        <div data-tutorial-anchor="wizard-button" style={{ position: 'absolute', top: 80, left: 120, width: 120, height: 40 }} />
        <TutorialControls />
        <TutorialOverlay />
      </>
    );

    fireEvent.click(screen.getByTestId('start'));
    fireEvent.click(screen.getByTestId('next'));
    fireEvent.click(screen.getByTestId('next'));

    await waitFor(() => {
      expect(screen.getByTestId('tutorial-overlay')).toHaveAttribute(
        'data-tutorial-step',
        'open-wizard'
      );
    });

    expect(screen.getByTestId('tutorial-backdrop')).not.toHaveStyle({ clipPath: 'none' });
    expect(screen.getByTestId('tutorial-highlight')).toBeInTheDocument();
    expect(screen.getByTestId('tutorial-tooltip').style.top).not.toBe('');
    expect(screen.getByTestId('tutorial-tooltip').style.left).not.toBe('');
  });

  it('dispatches pasted tutorial prompts to the editor event bridge', async () => {
    const promptListener = jest.fn();
    window.addEventListener('epic1:promptPasted', promptListener);

    renderWithTutorial(
      <>
        <div data-tutorial-anchor="wizard-button" />
        <TutorialControls />
        <TutorialOverlay />
      </>
    );

    fireEvent.click(screen.getByTestId('start'));
    fireEvent.click(screen.getByTestId('next'));
    fireEvent.click(screen.getByTestId('next'));
    fireEvent.click(screen.getByTestId('next'));

    await waitFor(() => {
      expect(screen.getByText(/Paste your prompt/)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/paste your prompt here/i), {
      target: { value: 'A {driver|mechanic} watches the Indy 500 from the grandstand' }
    });
    fireEvent.click(screen.getByText('Create nodes'));

    await waitFor(() => {
      expect(promptListener).toHaveBeenCalledTimes(1);
    });
    expect(promptListener.mock.calls[0][0]).toMatchObject({
      detail: {
        prompt: 'A {driver|mechanic} watches the Indy 500 from the grandstand'
      }
    });

    window.removeEventListener('epic1:promptPasted', promptListener);
  });

  it('OnboardingIntegrationWrapper surfaces callback hooks and lifecycle', async () => {
    const onFirstEdit = jest.fn();
    const onComplete = jest.fn();

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

    act(() => {
      fireEvent.click(screen.getByTestId('start'));
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
      act(() => {
        fireEvent.click(screen.getByTestId('advance'));
      });
    }

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(screen.getByTestId('progress').textContent).toBe('100');
  });
});
