/**
 * Tutorial Context - State management for onboarding
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TutorialStepValidator, TutorialValidationContext } from './TutorialStepValidator';

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector
  action: 'click' | 'drag' | 'type' | 'observe' | 'paste';
  validation?: () => boolean;
  hint?: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  spotlight?: boolean;
}

export interface OnboardingState {
  tutorialProgress: number;
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
  tutorialSteps: TutorialStep[];
  onboardingState: OnboardingState;
  
  // Actions
  startTutorial: () => void;
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
  tutorialProgress: 0,
  completedSteps: [],
  achievementsUnlocked: [],
  helpViewed: {},
  preferences: {
    showTooltips: true,
    enableCelebrations: true,
    keyboardShortcutsOverlay: true,
  },
};

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Prompt Spaghetti! 🍝',
    description: 'Create dynamic prompts with our visual node editor. Let\'s learn by building a medieval character generator!',
    target: '.tutorial-welcome',
    action: 'observe',
    position: 'bottom',
  },
  {
    id: 'empty-canvas',
    title: 'Your Creative Canvas',
    description: 'This is where you\'ll build your prompt graphs. Click anywhere to continue.',
    target: '.react-flow__viewport',
    action: 'click',
    position: 'bottom',
    spotlight: true,
  },
  {
    id: 'paste-prompt',
    title: 'Paste the Medieval Prompt',
    description: 'Press Ctrl+V (or Cmd+V on Mac) to paste our example medieval prompt. Try it now!',
    target: '.react-flow__viewport',
    action: 'paste',
    hint: 'Copy this first: "A {brave|cunning|wise} {knight|wizard|rogue} ventures into the {dark forest|ancient ruins|dragon\'s lair}"',
    position: 'top',
  },
  {
    id: 'nodes-created',
    title: 'Look at Your Nodes!',
    description: 'Great! The prompt was automatically parsed into visual nodes. Each bracket creates a choice node.',
    target: '.react-flow__node',
    action: 'observe',
    position: 'right',
    spotlight: true,
  },
  {
    id: 'inline-edit',
    title: 'Edit Inline',
    description: 'Double-click any text in a node to edit it directly. Try changing "brave" to "fearless"!',
    target: '.react-flow__node-weighted',
    action: 'click',
    position: 'right',
    spotlight: true,
  },
  {
    id: 'preview-update',
    title: 'See Your Changes',
    description: 'Notice how the preview updates instantly? Click the Preview button to generate variations.',
    target: '.preview-button',
    action: 'click',
    position: 'left',
  },
  {
    id: 'completion',
    title: 'You Did It! 🎉',
    description: 'You\'ve mastered the basics! Press ? anytime to see keyboard shortcuts, or explore more features.',
    target: '.tutorial-complete',
    action: 'observe',
    position: 'bottom',
  },
];

const TutorialContext = createContext<TutorialContextType | null>(null);

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

  // Load state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('onboardingState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setOnboardingState(parsed);
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

  const startTutorial = useCallback(() => {
    setIsActive(true);
    setCurrentStep(0);
  }, []);

  // Listen for programmatic tutorial start event
  useEffect(() => {
    const handleStartTutorial = () => {
      console.log('[TutorialContext] Received startTutorial event');
      startTutorial();
    };

    window.addEventListener('epic1:startTutorial', handleStartTutorial);
    return () => {
      window.removeEventListener('epic1:startTutorial', handleStartTutorial);
    };
  }, [startTutorial]);

  const skipTutorial = useCallback(() => {
    setIsActive(false);
    setOnboardingState(prev => ({
      ...prev,
      completedSteps: tutorialSteps.map(s => s.id),
      tutorialProgress: 100,
    }));
  }, []);

  const nextStep = useCallback((context?: TutorialValidationContext) => {
    if (currentStep < tutorialSteps.length - 1) {
      const nextStepId = tutorialSteps[currentStep + 1].id;

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

      const stepId = tutorialSteps[currentStep].id;
      setCurrentStep(prev => prev + 1);
      setOnboardingState(prev => ({
        ...prev,
        completedSteps: [...new Set([...prev.completedSteps, stepId])],
        tutorialProgress: ((currentStep + 1) / tutorialSteps.length) * 100,
      }));
    } else {
      completeTutorial();
    }
  }, [currentStep, tutorialSteps]);

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const completeTutorial = useCallback(() => {
    setIsActive(false);
    setOnboardingState(prev => ({
      ...prev,
      completedSteps: tutorialSteps.map(s => s.id),
      tutorialProgress: 100,
      achievementsUnlocked: [...prev.achievementsUnlocked, 'tutorial_complete'],
    }));
  }, []);

  const resetTutorial = useCallback(() => {
    setCurrentStep(0);
    setOnboardingState(prev => ({
      ...prev,
      completedSteps: [],
      tutorialProgress: 0,
    }));
    setIsActive(true);
  }, []);

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
    tutorialSteps,
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