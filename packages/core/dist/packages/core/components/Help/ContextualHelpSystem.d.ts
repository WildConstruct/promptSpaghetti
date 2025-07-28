import React from 'react';
export interface HelpContent {
    id: string;
    title: string;
    description: string;
    category: 'basic' | 'advanced' | 'debug' | 'onboarding';
    trigger?: 'hover' | 'click' | 'focus' | 'manual';
    position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
    showOnDisclosureLevel?: ('basic' | 'advanced' | 'debug')[];
    learnMoreUrl?: string;
    examples?: string;
    shortcut?: string;
    relatedFeatures?: string;
    priority?: 'high' | 'medium' | 'low';
}
export interface ContextualTooltipProps {
    content: HelpContent;
    children: React.ReactNode;
    disabled?: boolean;
    delay?: number;
    className?: string;
}
export interface HelpSystemProps {
    helpContent: HelpContent;
    showOnboarding?: boolean;
    onboardingStep?: number;
    onOnboardingComplete?: () => void;
    className?: string;
}
export declare const ContextualTooltip: React.FC<ContextualTooltipProps>;
//# sourceMappingURL=ContextualHelpSystem.d.ts.map