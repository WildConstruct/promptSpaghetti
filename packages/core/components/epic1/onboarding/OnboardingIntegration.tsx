/**
 * Onboarding Integration - Main wrapper component
 */

import React, { useEffect } from 'react';
import { TutorialProvider, useTutorial } from './TutorialContext';
import { TutorialOverlay } from './TutorialOverlay';
import { SuccessCelebration, useSuccessCelebration } from './SuccessCelebration';
import { ProgressWidget } from './ProgressTracker';

interface OnboardingIntegrationProps {
  children: React.ReactNode;
  showProgress?: boolean;
  onFirstEdit?: () => void;
}

const OnboardingContent: React.FC<OnboardingIntegrationProps> = ({
  children,
  showProgress = true,
  onFirstEdit,
}) => {
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
    if (
      onboardingState.tutorialProgress === 100 &&
      !onboardingState.achievementsUnlocked.includes('tutorial_complete')
    ) {
      celebrateTutorialComplete();
    }
  }, [onboardingState.tutorialProgress, onboardingState.achievementsUnlocked, celebrateTutorialComplete]);

  return (
    <>
      {/* Main app content */}
      {children}

      {/* Tutorial overlay */}
      <TutorialOverlay />

      {/* Success celebrations */}
      {celebration && <SuccessCelebration {...celebration} />}

      {/* Progress widget in header */}
      {showProgress && onboardingState.tutorialProgress < 100 && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 100,
          }}
        >
          <ProgressWidget />
        </div>
      )}
    </>
  );
};

export const OnboardingIntegration: React.FC<OnboardingIntegrationProps> = (props) => {
  return (
    <TutorialProvider>
      <OnboardingContent {...props} />
    </TutorialProvider>
  );
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