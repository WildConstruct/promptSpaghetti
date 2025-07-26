import React from 'react';
import { HelpContent } from './ContextualHelpSystem';
export interface HelpContextState {
    helpContent: HelpContent[];
    onboardingEnabled: boolean;
    onboardingStep: number;
    onboardingComplete: boolean;
    showHelpHints: boolean;
    getHelpContent: (id: string) => HelpContent | undefined;
    addHelpContent: (content: HelpContent) => void;
    updateHelpContent: (id: string, updates: Partial<HelpContent>) => void;
    removeHelpContent: (id: string) => void;
    startOnboarding: () => void;
    nextOnboardingStep: () => void;
    previousOnboardingStep: () => void;
    skipOnboarding: () => void;
    completeOnboarding: () => void;
    toggleHelpHints: () => void;
    resetHelpSystem: () => void;
}
export declare export interface HelpProviderProps {
    children: React.ReactNode;
    customHelpContent?: HelpContent[];
    enableOnboarding?: boolean;
    enableHelpHints?: boolean;
}
export declare const HelpProvider: React.FC<HelpProviderProps>;
export declare const useHelpManager: () => {
    registerHelpContent: (content: HelpContent | HelpContent[]) => void;
    useHelpContent: (content: HelpContent | HelpContent[]) => void;
    updateHelpContent: (id: string, updates: Partial<HelpContent>) => void;
    removeHelpContent: (id: string) => void;
};
export declare export declare     currentStep: HelpContent;
    currentStepIndex: number;
    totalSteps: number;
    allSteps: HelpContent[];
    nextStep: () => void;
    previousStep: () => void;
    skipOnboarding: () => void;
    completeOnboarding: () => void;
    startOnboarding: () => void;
    isComplete: boolean;
};
export declare const HelpSystemSettings: React.FC<{
    className?: string;
}>;
export default HelpProvider;
//# sourceMappingURL=HelpContentManager.d.ts.map