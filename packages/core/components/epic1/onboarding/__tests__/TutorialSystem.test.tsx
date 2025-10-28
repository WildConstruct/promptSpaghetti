/**
 * Tests for Tutorial System
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { 
  OnboardingIntegration,
  useOnboarding,
  TutorialProvider,
  useTutorial,
} from '../index';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Tutorial System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe('TutorialContext', () => {
    test('auto-starts tutorial for new users', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const TestComponent = () => {
        const { isActive } = useTutorial();
        return <div>{isActive ? 'Tutorial Active' : 'Tutorial Inactive'}</div>;
      };

      render(
        <TutorialProvider>
          <TestComponent />
        </TutorialProvider>
      );

      expect(screen.getByText('Tutorial Active')).toBeInTheDocument();
    });

    test('loads saved state from localStorage', () => {
      const savedState = {
        tutorialProgress: 50,
        completedSteps: ['welcome', 'empty-canvas'],
        achievementsUnlocked: ['first_edit'],
        helpViewed: { keyboard_shortcuts: true },
        preferences: {
          showTooltips: false,
          enableCelebrations: true,
          keyboardShortcutsOverlay: true,
        },
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedState));

      const TestComponent = () => {
        const { onboardingState } = useTutorial();
        return (
          <div>
            <div>Progress: {onboardingState.tutorialProgress}%</div>
            <div>Completed: {onboardingState.completedSteps.join(', ')}</div>
          </div>
        );
      };

      render(
        <TutorialProvider>
          <TestComponent />
        </TutorialProvider>
      );

      expect(screen.getByText('Progress: 50%')).toBeInTheDocument();
      expect(screen.getByText('Completed: welcome, empty-canvas')).toBeInTheDocument();
    });

    test('saves state to localStorage on changes', async () => {
      const TestComponent = () => {
        const { nextStep } = useTutorial();
        return <button onClick={nextStep}>Next</button>;
      };

      render(
        <TutorialProvider>
          <TestComponent />
        </TutorialProvider>
      );

      fireEvent.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'onboardingState',
          expect.stringContaining('completedSteps')
        );
      });
    });
  });

  describe('TutorialOverlay', () => {
    test('shows tutorial steps', () => {
      render(
        <OnboardingIntegration>
          <div>App Content</div>
        </OnboardingIntegration>
      );

      // Should show welcome step
      expect(screen.getByText('Welcome to Prompt Spaghetti! 🍝')).toBeInTheDocument();
      expect(screen.getByText('Step 1 of 7')).toBeInTheDocument();
    });

    test('navigation through steps', () => {
      render(
        <OnboardingIntegration>
          <div className="react-flow__viewport">Canvas</div>
        </OnboardingIntegration>
      );

      // Click continue on welcome
      fireEvent.click(screen.getByText('Continue'));

      // Should move to next step
      expect(screen.getByText('Your Creative Canvas')).toBeInTheDocument();
      expect(screen.getByText('Step 2 of 7')).toBeInTheDocument();

      // Back button should appear
      expect(screen.getByText('Back')).toBeInTheDocument();
    });

    test('skip tutorial functionality', async () => {
      const TestComponent = () => {
        const { isActive, onboardingState } = useTutorial();
        return (
          <div>
            <div>Active: {isActive ? 'Yes' : 'No'}</div>
            <div>Progress: {onboardingState.tutorialProgress}%</div>
          </div>
        );
      };

      render(
        <TutorialProvider>
          <TestComponent />
          <TutorialOverlay />
        </TutorialProvider>
      );

      fireEvent.click(screen.getByText('Skip tutorial'));

      await waitFor(() => {
        expect(screen.getByText('Active: No')).toBeInTheDocument();
        expect(screen.getByText('Progress: 100%')).toBeInTheDocument();
      });
    });

    test('keyboard shortcuts', () => {
      const TestComponent = () => {
        const { currentStep } = useTutorial();
        return <div>Step: {currentStep}</div>;
      };

      render(
        <TutorialProvider>
          <TestComponent />
          <TutorialOverlay />
        </TutorialProvider>
      );

      // Arrow right to next
      fireEvent.keyDown(window, { key: 'ArrowRight' });
      expect(screen.getByText('Step: 1')).toBeInTheDocument();

      // Arrow left to previous
      fireEvent.keyDown(window, { key: 'ArrowLeft' });
      expect(screen.getByText('Step: 0')).toBeInTheDocument();

      // Escape to skip
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Welcome to Prompt Spaghetti!')).not.toBeInTheDocument();
    });
  });

  describe('Success Celebration', () => {
    test('shows celebration when enabled', async () => {
      const TestComponent = () => {
        const { celebrateAchievement } = useSuccessCelebration();
        return (
          <button onClick={() => celebrateAchievement('Test Achievement', 'Great job!')}>
            Celebrate
          </button>
        );
      };

      render(
        <TutorialProvider>
          <TestComponent />
          <SuccessCelebration />
        </TutorialProvider>
      );

      fireEvent.click(screen.getByText('Celebrate'));

      await waitFor(() => {
        expect(screen.getByText('Test Achievement')).toBeInTheDocument();
        expect(screen.getByText('Great job!')).toBeInTheDocument();
      });
    });

    test('respects celebration preferences', () => {
      const savedState = {
        preferences: {
          enableCelebrations: false,
        },
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedState));

      const TestComponent = () => {
        const { celebrateAchievement } = useSuccessCelebration();
        return (
          <button onClick={() => celebrateAchievement('Test', 'Message')}>
            Celebrate
          </button>
        );
      };

      render(
        <TutorialProvider>
          <TestComponent />
          <SuccessCelebration />
        </TutorialProvider>
      );

      fireEvent.click(screen.getByText('Celebrate'));

      // Should not show celebration
      expect(screen.queryByText('Test')).not.toBeInTheDocument();
    });
  });

  describe('Progress Tracking', () => {
    test('tracks tutorial progress', () => {
      render(
        <TutorialProvider>
          <ProgressWidget />
        </TutorialProvider>
      );

      expect(screen.getByText('Progress:')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    test('shows achievements', () => {
      const savedState = {
        achievementsUnlocked: ['tutorial_complete', 'first_edit'],
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedState));

      render(
        <TutorialProvider>
          <ProgressTracker />
        </TutorialProvider>
      );

      expect(screen.getByText('Your Progress')).toBeInTheDocument();
      expect(screen.getByText('Achievements')).toBeInTheDocument();
    });
  });

  describe('Onboarding Integration', () => {
    test('detects first edit', async () => {
      const onFirstEdit = jest.fn();

      render(
        <OnboardingIntegration onFirstEdit={onFirstEdit}>
          <div>App</div>
        </OnboardingIntegration>
      );

      // Trigger first edit event
      window.dispatchEvent(new Event('epic1:firstEdit'));

      await waitFor(() => {
        expect(onFirstEdit).toHaveBeenCalled();
      });
    });

    test('useOnboarding hook helpers', () => {
      const TestComponent = () => {
        const { isNewUser, hasCompletedTutorial, getPreferences } = useOnboarding();
        
        return (
          <div>
            <div>New User: {isNewUser() ? 'Yes' : 'No'}</div>
            <div>Completed: {hasCompletedTutorial() ? 'Yes' : 'No'}</div>
            <div>Tooltips: {getPreferences().showTooltips ? 'On' : 'Off'}</div>
          </div>
        );
      };

      render(
        <OnboardingIntegration>
          <TestComponent />
        </OnboardingIntegration>
      );

      expect(screen.getByText('New User: Yes')).toBeInTheDocument();
      expect(screen.getByText('Completed: No')).toBeInTheDocument();
      expect(screen.getByText('Tooltips: On')).toBeInTheDocument();
    });
  });
});