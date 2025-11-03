/**
 * TutorialContext – state management and persistence contract
 */

import { act, renderHook } from '@testing-library/react';
import {
  renderTutorialHook,
  resetOnboardingStorage,
  seedOnboardingState,
} from './testUtils';
import { useTutorial } from '../TutorialContext';

describe('TutorialContext', () => {
  beforeEach(() => {
    resetOnboardingStorage();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('throws when useTutorial is consumed outside the provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => renderHook(() => useTutorial())).toThrow(
      'useTutorial must be used within TutorialProvider'
    );

    consoleSpy.mockRestore();
  });

  it('exposes the default onboarding state when mounted', () => {
    const { result } = renderTutorialHook(() => useTutorial());

    expect(result.current.isActive).toBe(false);
    expect(result.current.currentStep).toBe(0);
    expect(result.current.tutorialSteps.length).toBeGreaterThan(0);
    expect(result.current.onboardingState.tutorialProgress).toBe(0);
    expect(result.current.onboardingState.completedSteps).toHaveLength(0);
  });

  it('startTutorial activates the flow and resets progress', () => {
    const { result } = renderTutorialHook(() => useTutorial());

    act(() => {
      result.current.startTutorial();
    });

    expect(result.current.isActive).toBe(true);
    expect(result.current.currentStep).toBe(0);
    expect(result.current.onboardingState.tutorialProgress).toBe(0);
  });

  it('nextStep advances the tutorial and records completion progress', () => {
    const { result } = renderTutorialHook(() => useTutorial());

    act(() => {
      result.current.startTutorial();
    });

    act(() => {
      result.current.nextStep();
    });

    expect(result.current.currentStep).toBe(1);
    expect(result.current.onboardingState.completedSteps).toContain(
      result.current.tutorialSteps[0].id
    );
    expect(result.current.onboardingState.tutorialProgress).toBeGreaterThan(0);
  });

  it('previousStep navigates backward when possible', () => {
    const { result } = renderTutorialHook(() => useTutorial());

    act(() => {
      result.current.startTutorial();
    });

    act(() => {
      result.current.nextStep();
    });

    act(() => {
      result.current.previousStep();
    });

    expect(result.current.currentStep).toBe(0);
  });

  it('skipTutorial marks every step as completed and stops the flow', () => {
    const { result } = renderTutorialHook(() => useTutorial());

    act(() => {
      result.current.startTutorial();
      result.current.skipTutorial();
    });

    expect(result.current.isActive).toBe(false);
    expect(result.current.onboardingState.tutorialProgress).toBe(100);
    expect(result.current.onboardingState.completedSteps).toEqual(
      result.current.tutorialSteps.map(step => step.id)
    );
  });

  it('completeTutorial marks the run finished with an achievement', () => {
    const { result } = renderTutorialHook(() => useTutorial());

    act(() => {
      result.current.startTutorial();
    });

    const stepCount = result.current.tutorialSteps.length;
    for (let i = 0; i < stepCount; i += 1) {
      act(() => {
        result.current.nextStep();
      });
    }

    expect(result.current.isActive).toBe(false);
    expect(result.current.onboardingState.tutorialProgress).toBe(100);
    expect(result.current.onboardingState.achievementsUnlocked).toContain('tutorial_complete');
  });

  it('updatePreferences merges preferences without dropping defaults', () => {
    const { result } = renderTutorialHook(() => useTutorial());

    act(() => {
      result.current.updatePreferences({ showTooltips: false });
    });

    expect(result.current.onboardingState.preferences.showTooltips).toBe(false);
    expect(result.current.onboardingState.preferences.keyboardShortcutsOverlay).toBe(true);
  });

  it('markHelpViewed records contextual help and unlockAchievement deduplicates entries', () => {
    const { result } = renderTutorialHook(() => useTutorial());

    act(() => {
      result.current.markHelpViewed('keyboard-shortcuts');
      result.current.unlockAchievement('first_prompt');
      result.current.unlockAchievement('first_prompt');
    });

    expect(result.current.onboardingState.helpViewed['keyboard-shortcuts']).toBe(true);
    expect(
      result.current.onboardingState.achievementsUnlocked.filter(id => id === 'first_prompt')
    ).toHaveLength(1);
  });

  it('persists state changes to localStorage', () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
    const { result } = renderTutorialHook(() => useTutorial());

    act(() => {
      result.current.startTutorial();
      result.current.nextStep();
    });

    expect(setItemSpy).toHaveBeenCalledWith(
      'onboardingState',
      expect.stringContaining('"tutorialProgress"')
    );
  });

  it('hydrates from previously stored onboarding state', async () => {
    seedOnboardingState({
      tutorialProgress: 40,
      completedSteps: ['welcome'],
      achievementsUnlocked: ['first_edit'],
      helpViewed: { basics: true },
      preferences: {
        showTooltips: false,
        enableCelebrations: true,
        keyboardShortcutsOverlay: false,
      },
    });

    const { result } = renderTutorialHook(() => useTutorial());

    expect(result.current.onboardingState.tutorialProgress).toBe(40);
    expect(result.current.onboardingState.completedSteps).toContain('welcome');
    expect(result.current.onboardingState.helpViewed.basics).toBe(true);
    expect(result.current.onboardingState.preferences.showTooltips).toBe(false);
    expect(result.current.onboardingState.preferences.keyboardShortcutsOverlay).toBe(false);
  });
});
