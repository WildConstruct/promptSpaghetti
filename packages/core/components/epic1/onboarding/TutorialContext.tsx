/**
 * Tutorial Context - State management for onboarding
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TutorialStepValidator, TutorialValidationContext } from './TutorialStepValidator';
import {
  tutorialSequences,
  type TutorialPlacement,
  type TutorialAnchorId,
  type TutorialSequenceId
} from './tutorialModel';

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector
  targetSelectors?: string[];
  anchorId?: TutorialAnchorId;
  action: 'click' | 'drag' | 'type' | 'observe' | 'paste' | 'lab';
  validation?: () => boolean;
  hint?: string;
  position?: TutorialPlacement;
  spotlight?: boolean;
  loadTemplateId?: string;
}

export interface OnboardingState {
  activeSequenceId: TutorialSequenceId;
  tutorialProgress: number;
  sequenceProgress: Record<TutorialSequenceId, number>;
  completedSequences: TutorialSequenceId[];
  completedSteps: string[];
  achievementsUnlocked: string[];
  helpViewed: Record<string, boolean>;
  preferences: {
    showTooltips: boolean;
    enableCelebrations: boolean;
    keyboardShortcutsOverlay: boolean;
  };
}

export interface TutorialContextType {
  // State
  isActive: boolean;
  currentStep: number;
  activeSequenceId: TutorialSequenceId;
  tutorialSteps: TutorialStep[];
  onboardingState: OnboardingState;

  // Actions
  startTutorial: (sequenceId?: TutorialSequenceId | React.SyntheticEvent) => void;
  skipTutorial: () => void;
  nextStep: (context?: TutorialValidationContext) => void;
  previousStep: () => void;
  completeTutorial: () => void;
  resetTutorial: () => void;
  updatePreferences: (prefs: Partial<OnboardingState['preferences']>) => void;
  markHelpViewed: (helpId: string) => void;
  unlockAchievement: (achievementId: string) => void;
}

const defaultOnboardingState: OnboardingState = {
  activeSequenceId: 'basic',
  tutorialProgress: 0,
  sequenceProgress: (Object.keys(tutorialSequences) as TutorialSequenceId[]).reduce(
    (acc, id) => {
      acc[id] = 0;
      return acc;
    },
    {} as Record<TutorialSequenceId, number>
  ),
  completedSequences: [],
  completedSteps: [],
  achievementsUnlocked: [],
  helpViewed: {},
  preferences: {
    showTooltips: true,
    enableCelebrations: true,
    keyboardShortcutsOverlay: true,
  },
};

const TutorialContext = createContext<TutorialContextType | null>(null);

const isTutorialSequenceId = (value: unknown): value is TutorialSequenceId =>
  typeof value === 'string' &&
  Object.prototype.hasOwnProperty.call(tutorialSequences, value);

const getTutorialCompletionCookieName = (sequenceId: TutorialSequenceId) =>
  `psg_tutorial_completed_${sequenceId}`;

const setTutorialCompletionCookie = (sequenceId: TutorialSequenceId) => {
  if (typeof document === 'undefined') {
    return;
  }

  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${getTutorialCompletionCookieName(sequenceId)}=true; Max-Age=${maxAge}; path=/; SameSite=Lax`;
};

const normalizeSequenceProgress = (value: unknown): Record<TutorialSequenceId, number> => {
  const candidate = value && typeof value === 'object'
    ? value as Partial<Record<TutorialSequenceId, unknown>>
    : {};

  // Build progress for every registered sequence so new tutorials are covered
  // automatically (and stale persisted progress for removed ones is dropped).
  return (Object.keys(tutorialSequences) as TutorialSequenceId[]).reduce(
    (acc, id) => {
      acc[id] = typeof candidate[id] === 'number' ? (candidate[id] as number) : 0;
      return acc;
    },
    {} as Record<TutorialSequenceId, number>
  );
};

const normalizeOnboardingState = (state: unknown): OnboardingState => {
  const candidate = state && typeof state === 'object'
    ? (state as Partial<OnboardingState>)
    : {};

  return {
    ...defaultOnboardingState,
    ...candidate,
    activeSequenceId: isTutorialSequenceId(candidate.activeSequenceId)
      ? candidate.activeSequenceId
      : 'basic',
    sequenceProgress: normalizeSequenceProgress(candidate.sequenceProgress),
    completedSequences: Array.isArray(candidate.completedSequences)
      ? candidate.completedSequences.filter(isTutorialSequenceId)
      : defaultOnboardingState.completedSequences,
    completedSteps: Array.isArray(candidate.completedSteps)
      ? candidate.completedSteps
      : defaultOnboardingState.completedSteps,
    achievementsUnlocked: Array.isArray(candidate.achievementsUnlocked)
      ? candidate.achievementsUnlocked
      : defaultOnboardingState.achievementsUnlocked,
    helpViewed: candidate.helpViewed && typeof candidate.helpViewed === 'object'
      ? candidate.helpViewed
      : defaultOnboardingState.helpViewed,
    preferences: {
      ...defaultOnboardingState.preferences,
      ...(candidate.preferences ?? {}),
    },
  };
};

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within TutorialProvider');
  }
  return context;
};

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingState, setOnboardingState] = useState<OnboardingState>(defaultOnboardingState);
  const activeSequenceId = onboardingState.activeSequenceId;
  const activeTutorialSteps = tutorialSequences[activeSequenceId] ?? tutorialSequences.basic;

  // Load state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('onboardingState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setOnboardingState(normalizeOnboardingState(parsed));
      } catch (e) {
        console.error('Failed to parse onboarding state:', e);
      }
    } else {
      // First time user - tutorial ready but not active
      setIsActive(false);
    }
  }, []);


  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('onboardingState', JSON.stringify(onboardingState));
  }, [onboardingState]);

  useEffect(() => {
    setCurrentStep(prev => Math.min(prev, Math.max(activeTutorialSteps.length - 1, 0)));
  }, [activeTutorialSteps.length]);

  const startTutorial = useCallback((sequenceId?: TutorialSequenceId | React.SyntheticEvent) => {
    const nextSequenceId = isTutorialSequenceId(sequenceId) ? sequenceId : 'basic';

    setIsActive(true);
    setCurrentStep(0);
    setOnboardingState(prev => ({
      ...prev,
      activeSequenceId: nextSequenceId,
      tutorialProgress: 0,
    }));
  }, []);

  // Listen for programmatic tutorial start event
  useEffect(() => {
    const handleStartTutorial = (event: Event) => {
      const detail = event instanceof CustomEvent ? event.detail : undefined;
      const requestedSequence = detail?.sequenceId;
      console.log('[TutorialContext] Received startTutorial event');
      startTutorial(isTutorialSequenceId(requestedSequence) ? requestedSequence : 'basic');
    };

    window.addEventListener('epic1:startTutorial', handleStartTutorial);
    return () => {
      window.removeEventListener('epic1:startTutorial', handleStartTutorial);
    };
  }, [startTutorial]);

  const skipTutorial = useCallback(() => {
    setIsActive(false);
  }, []);

  const completeTutorial = useCallback(() => {
    setTutorialCompletionCookie(activeSequenceId);
    setIsActive(false);
    setOnboardingState(prev => ({
      ...prev,
      completedSteps: activeTutorialSteps.map(s => s.id),
      tutorialProgress: 100,
      sequenceProgress: {
        ...prev.sequenceProgress,
        [activeSequenceId]: 100,
      },
      completedSequences: [...new Set([...prev.completedSequences, activeSequenceId])],
      achievementsUnlocked: [...new Set([...prev.achievementsUnlocked, 'tutorial_complete'])],
    }));
  }, [activeSequenceId, activeTutorialSteps]);

  const nextStep = useCallback((context?: TutorialValidationContext) => {
    if (currentStep < activeTutorialSteps.length - 1) {
      const nextStepId = activeTutorialSteps[currentStep + 1].id;

      // Validate prerequisites for next step if context provided
      if (context) {
        const validation = TutorialStepValidator.validateStep(nextStepId, context);
        if (!validation.isValid) {
          console.warn('[TutorialContext] Step validation failed:', validation.message);

          // For now, log the validation failure but still allow progression
          // In a future enhancement, we could show a validation error UI
          console.log('[TutorialContext] Validation error:', TutorialStepValidator.getValidationErrorMessage(validation));

          if (TutorialStepValidator.canRecover(validation)) {
            console.log('[TutorialContext] Recovery available:', validation.recoveryMessage);
          }
        }
      }

      const stepId = activeTutorialSteps[currentStep].id;
      setCurrentStep(prev => prev + 1);
      const nextProgress = ((currentStep + 1) / activeTutorialSteps.length) * 100;
      setOnboardingState(prev => ({
        ...prev,
        completedSteps: [...new Set([...prev.completedSteps, stepId])],
        tutorialProgress: nextProgress,
        sequenceProgress: {
          ...prev.sequenceProgress,
          [activeSequenceId]: nextProgress,
        },
      }));
    } else {
      completeTutorial();
    }
  }, [activeSequenceId, activeTutorialSteps, completeTutorial, currentStep]);

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const resetTutorial = useCallback(() => {
    setCurrentStep(0);
    setOnboardingState(prev => ({
      ...prev,
      completedSteps: [],
      tutorialProgress: 0,
      sequenceProgress: {
        ...prev.sequenceProgress,
        [activeSequenceId]: 0,
      },
    }));
    setIsActive(true);
  }, [activeSequenceId]);

  const updatePreferences = useCallback((prefs: Partial<OnboardingState['preferences']>) => {
    setOnboardingState(prev => ({
      ...prev,
      preferences: { ...prev.preferences, ...prefs },
    }));
  }, []);

  const markHelpViewed = useCallback((helpId: string) => {
    setOnboardingState(prev => ({
      ...prev,
      helpViewed: { ...prev.helpViewed, [helpId]: true },
    }));
  }, []);

  const unlockAchievement = useCallback((achievementId: string) => {
    setOnboardingState(prev => ({
      ...prev,
      achievementsUnlocked: [...new Set([...prev.achievementsUnlocked, achievementId])],
    }));
  }, []);

  const value: TutorialContextType = {
    isActive,
    currentStep,
    activeSequenceId,
    tutorialSteps: activeTutorialSteps,
    onboardingState,
    startTutorial,
    skipTutorial,
    nextStep,
    previousStep,
    completeTutorial,
    resetTutorial,
    updatePreferences,
    markHelpViewed,
    unlockAchievement,
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
};
