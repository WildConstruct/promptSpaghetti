/**
 * Epic 16 Help Integration Widget
 * Task: E16-1753114247188-28937F - Design help integration
 *
 * Main help integration widget that provides contextual help for Epic 16
 * marketplace features with seamless transitions to Epic 8 graph editor help.
 */
import React from 'react';
import { HelpContent } from '../ContextualHelp/ContextualHelpSystem';
import './HelpIntegrationWidget.css';

}
export interface HelpIntegrationProps {
    currentSystem: 'graph-editor' | 'marketplace';
    currentView: string;
    templateId?: string;
    userId: string;
    userRole: 'buyer' | 'seller' | 'admin';
    onTransitionToSystem?: (system: 'graph-editor' | 'marketplace') => void;
    onEscalateToSupport?: (reason: string, description: string) => void;
    onSessionUpdate?: (updates: Record<string, any>) => void;
    theme?: 'light' | 'dark' | 'auto';
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'floating';
    minimized?: boolean;
    hidden?: boolean;

}
export interface HelpSession {
    id: string;
    sessionType: string;
    currentStep: number;
    totalSteps: number;
    content: HelpContent[];
    startTime: Date;
    userProgress: {
        completedActions: string[];
        skippedContent: string[];
        ratings: Record<string, number>;
}
    };
    escalationLevel: number;

}
export interface TransitionContext {
    fromSystem: 'graph-editor' | 'marketplace';
    toSystem: 'graph-editor' | 'marketplace';
    reason: string;
    preserveHelp: boolean;
    bridgeContent?: HelpContent[];

export declare const HelpIntegrationWidget: React.FC<HelpIntegrationProps>;
export default HelpIntegrationWidget;
//# sourceMappingURL=HelpIntegrationWidget.d.ts.map
}