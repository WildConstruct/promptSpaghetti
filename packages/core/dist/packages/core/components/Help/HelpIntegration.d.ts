import React from 'react';
import { HelpContent } from './ContextualHelpSystem';
export declare function withHelp<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  helpContent: HelpContent
): {
    (props: P): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
export interface HelpfulInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    helpId: string;
    helpTitle: string;
    helpDescription: string;
    helpCategory?: 'basic' | 'advanced' | 'debug';
    helpExamples?: string[];
    helpShortcut?: string;
    label?: string;
    error?: string;
}
export declare const HelpfulInput: React.FC<HelpfulInputProps>;
export interface HelpfulButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    helpId: string;
    helpTitle: string;
    helpDescription: string;
    helpCategory?: 'basic' | 'advanced' | 'debug';
    helpExamples?: string[];
    helpShortcut?: string;
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'small' | 'medium' | 'large';
}
export declare const HelpfulButton: React.FC<HelpfulButtonProps>;
export interface HelpfulSectionProps {
    helpId: string;
    helpTitle: string;
    helpDescription: string;
    helpCategory?: 'basic' | 'advanced' | 'debug';
    helpExamples?: string[];
    title: string;
    children: React.ReactNode;
    collapsible?: boolean;
    defaultExpanded?: boolean;
    className?: string;
    style?: React.CSSProperties;
}
export declare const HelpfulSection: React.FC<HelpfulSectionProps>;
export declare const useContextualHelp: (helpContent: HelpContent) => {
    wrapWithHelp: (element: React.ReactElement) => import("react/jsx-runtime").JSX.Element;
    showHelp: boolean;
};
export declare const OnboardingOverlay: React.FC<{
    isActive: boolean;
    children: React.ReactNode;
}>;
declare const _default: {
    withHelp: typeof withHelp;
    HelpfulInput: React.FC<HelpfulInputProps>;
    HelpfulButton: React.FC<HelpfulButtonProps>;
    HelpfulSection: React.FC<HelpfulSectionProps>;
    useContextualHelp: (helpContent: HelpContent) => {
        wrapWithHelp: (element: React.ReactElement) => import("react/jsx-runtime").JSX.Element;
        showHelp: boolean;
    };
    OnboardingOverlay: React.FC<{
        isActive: boolean;
        children: React.ReactNode;
    }>;
};
export default _default;
//# sourceMappingURL=HelpIntegration.d.ts.map