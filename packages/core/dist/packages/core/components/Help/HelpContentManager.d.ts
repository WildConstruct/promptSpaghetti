import { HelpContent } from './ContextualHelpSystem';
export interface HelpContextState {
    helpContent: HelpContent;
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
export declare const useHelpSystem: () => HelpContextState;
export default HelpProvider;
//# sourceMappingURL=HelpContentManager.d.ts.map