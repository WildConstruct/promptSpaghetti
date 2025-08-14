import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Tutorial Context - State management for onboarding
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
const defaultOnboardingState = {
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
const tutorialSteps = [
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
const TutorialContext = createContext(null);
export const useTutorial = () => {
    const context = useContext(TutorialContext);
    if (!context) {
        throw new Error('useTutorial must be used within TutorialProvider');
    }
    return context;
};
export const TutorialProvider = ({ children }) => {
    const [isActive, setIsActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [onboardingState, setOnboardingState] = useState(defaultOnboardingState);
    // Load state from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('onboardingState');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setOnboardingState(parsed);
            }
            catch (e) {
                console.error('Failed to parse onboarding state:', e);
            }
        }
        else {
            // First time user - auto start tutorial
            setIsActive(true);
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
    const skipTutorial = useCallback(() => {
        setIsActive(false);
        setOnboardingState(prev => ({
            ...prev,
            completedSteps: tutorialSteps.map(s => s.id),
            tutorialProgress: 100,
        }));
    }, []);
    const nextStep = useCallback(() => {
        if (currentStep < tutorialSteps.length - 1) {
            const stepId = tutorialSteps[currentStep].id;
            setCurrentStep(prev => prev + 1);
            setOnboardingState(prev => ({
                ...prev,
                completedSteps: [...new Set([...prev.completedSteps, stepId])],
                tutorialProgress: ((currentStep + 1) / tutorialSteps.length) * 100,
            }));
        }
        else {
            completeTutorial();
        }
    }, [currentStep]);
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
    const updatePreferences = useCallback((prefs) => {
        setOnboardingState(prev => ({
            ...prev,
            preferences: { ...prev.preferences, ...prefs },
        }));
    }, []);
    const markHelpViewed = useCallback((helpId) => {
        setOnboardingState(prev => ({
            ...prev,
            helpViewed: { ...prev.helpViewed, [helpId]: true },
        }));
    }, []);
    const unlockAchievement = useCallback((achievementId) => {
        setOnboardingState(prev => ({
            ...prev,
            achievementsUnlocked: [...new Set([...prev.achievementsUnlocked, achievementId])],
        }));
    }, []);
    const value = {
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
    return (_jsx(TutorialContext.Provider, { value: value, children: children }));
};
