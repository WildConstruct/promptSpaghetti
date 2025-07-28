import React from 'react';
import { HelpContent } from './ContextualHelpSystem';
export declare function withHelp<P extends object>(): any;
export interface HelpfulInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    helpId: string;
    helpTitle: string;
    helpDescription: string;
    helpCategory?: 'basic' | 'advanced' | 'debug';
    helpExamples?: string;
    helpShortcut?: string;
    label?: string;
    error?: string;
    export const: any;
    HelpfulInput: React.FC<HelpfulInputProps>;
}
export interface HelpfulButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    helpId: string;
    helpTitle: string;
    helpDescription: string;
    helpCategory?: 'basic' | 'advanced' | 'debug';
    helpExamples?: string;
    helpShortcut?: string;
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'small' | 'medium' | 'large';
    export const: any;
    HelpfulButton: React.FC<HelpfulButtonProps>;
}
export interface HelpfulSectionProps {
    helpId: string;
    helpTitle: string;
    helpDescription: string;
    helpCategory?: 'basic' | 'advanced' | 'debug';
    helpExamples?: string;
    title: string;
    children: React.ReactNode;
    collapsible?: boolean;
    defaultExpanded?: boolean;
    className?: string;
    style?: React.CSSProperties;
}
export declare const HelpfulSection: React.FC<HelpfulSectionProps>;
export declare const useContextualHelp: (helpContent: HelpContent) => void;
export declare const OnboardingOverlay: React.FC<{}, isActive>, boolean: any;
declare const _default: {
    withHelp: typeof withHelp;
    HelpfulInput: any;
    HelpfulButton: any;
    HelpfulSection: React.FC<HelpfulSectionProps>;
    useContextualHelp: (helpContent: HelpContent) => void;
    OnboardingOverlay: any;
};
export default _default;
//# sourceMappingURL=HelpIntegration.d.ts.map