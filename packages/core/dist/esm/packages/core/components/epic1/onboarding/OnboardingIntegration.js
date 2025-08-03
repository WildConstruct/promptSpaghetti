import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Onboarding Integration - Main wrapper component
 */
import { useEffect } from 'react';
import { TutorialProvider, useTutorial } from './TutorialContext';
import { TutorialOverlay } from './TutorialOverlay';
import { SuccessCelebration, useSuccessCelebration } from './SuccessCelebration';
import { ProgressWidget } from './ProgressTracker';
const OnboardingContent = ({ children, showProgress = true, onFirstEdit, }) => {
    const { onboardingState } = useTutorial();
    const { celebration, celebrateFirstEdit, celebrateTutorialComplete } = useSuccessCelebration();
    // Detect first edit
    useEffect(() => {
        if (onFirstEdit) {
            const handleFirstEdit = () => {
                if (!onboardingState.achievementsUnlocked.includes('first_edit')) {
                    celebrateFirstEdit();
                    onFirstEdit();
                }
            };
            // Add listener for first edit (you'd connect this to your actual edit event)
            window.addEventListener('epic1:firstEdit', handleFirstEdit);
            return () => window.removeEventListener('epic1:firstEdit', handleFirstEdit);
        }
    }, [onFirstEdit, celebrateFirstEdit, onboardingState.achievementsUnlocked]);
    // Celebrate tutorial completion
    useEffect(() => {
        if (onboardingState.tutorialProgress === 100 &&
            !onboardingState.achievementsUnlocked.includes('tutorial_complete')) {
            celebrateTutorialComplete();
        }
    }, [onboardingState.tutorialProgress, onboardingState.achievementsUnlocked, celebrateTutorialComplete]);
    return (_jsxs(_Fragment, { children: [children, _jsx(TutorialOverlay, {}), celebration && _jsx(SuccessCelebration, { ...celebration }), showProgress && onboardingState.tutorialProgress < 100 && (_jsx("div", { style: {
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    zIndex: 100,
                }, children: _jsx(ProgressWidget, {}) }))] }));
};
// Updated to work as an overlay without wrapping children
export const OnboardingIntegration = ({ onComplete, onSkip }) => {
    return (_jsx(TutorialProvider, { children: _jsx(OnboardingContent, { showProgress: true, onFirstEdit: () => { }, children: _jsx("div", {}) }) }));
};
// Original component for backward compatibility
export const OnboardingIntegrationWrapper = (props) => {
    return (_jsx(TutorialProvider, { children: _jsx(OnboardingContent, { ...props }) }));
};
// Hook for external components to interact with onboarding
export const useOnboarding = () => {
    const tutorial = useTutorial();
    const celebration = useSuccessCelebration();
    return {
        ...tutorial,
        ...celebration,
        // Helper methods
        triggerFirstEdit: () => {
            window.dispatchEvent(new Event('epic1:firstEdit'));
        },
        isNewUser: () => {
            return tutorial.onboardingState.completedSteps.length === 0;
        },
        hasCompletedTutorial: () => {
            return tutorial.onboardingState.tutorialProgress === 100;
        },
        getPreferences: () => {
            return tutorial.onboardingState.preferences;
        },
    };
};
