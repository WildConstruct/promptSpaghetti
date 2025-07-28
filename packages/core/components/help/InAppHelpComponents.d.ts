/**
 * In-App Help Components (Epic 16)
 *
 * DEPLOYMENT BLOCKER FIX: Comprehensive suite of in-app help components
 * providing contextual assistance, interactive tutorials, tooltips,
 * guided tours, and integrated help experiences.
 *
 * Features:
 * - Interactive tooltips and popovers
 * - Guided tour system
 * - Contextual help panels
 * - Progressive disclosure help
 * - Interactive onboarding flows
 * - Smart help suggestions
 * - Accessibility-first design
 * - Responsive help interfaces
 */
import React, { ReactNode } from 'react';
export interface HelpContentItem {
    id: string;
    title: string;
    description: string;
    content: string;
    type: 'tooltip' | 'article' | 'video' | 'tutorial' | 'faq' | 'guide';
    category: string;
    tags: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedReadTime?: number;
    thumbnail?: string;
    videoUrl?: string;
    lastUpdated: Date;
    helpfulness: {,
        helpful: number;
        unhelpful: number;
    };
}
export interface TourStep {
    id: string;
    title: string;
    content: string;
    target: string;
    position: 'top' | 'bottom' | 'left' | 'right' | 'center';
    action?: 'click' | 'hover' | 'scroll' | 'wait';
    actionTarget?: string;
    validation?: () => boolean;
    skippable?: boolean;
    optional?: boolean;
    highlight?: boolean;
    delay?: number;
}
export interface HelpTour {
    id: string;
    name: string;
    description: string;
    category: string;
    steps: TourStep[];
    autoStart?: boolean;
    skippable?: boolean;
    repeatable?: boolean;
    prerequisites?: string[];
    estimatedDuration: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
}
export interface HelpContext {
    currentPage: string;
    userRole?: string;
    userExperience?: 'beginner' | 'intermediate' | 'advanced';
    completedTours?: string[];
    dismissedHelp?: string[];
    preferences?: {
        showTooltips: boolean;
        showTours: boolean;
        preferredHelpType: 'text' | 'video' | 'interactive';
        autoplayVideos: boolean;
    };
}
export interface HelpTooltipProps {
    content: string | ReactNode;
    title?: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    trigger?: 'hover' | 'click' | 'focus';
    delay?: number;
    maxWidth?: number;
    showArrow?: boolean;
    helpLink?: string;
    helpText?: string;
    className?: string;
    children: ReactNode;
    onShow?: () => void;
    onHide?: () => void;
}
export declare const HelpTooltip: React.FC<HelpTooltipProps>;
export interface ContextualHelpPanelProps {
    title: string;
    content: HelpContentItem[];
    context: HelpContext;
    position?: 'right' | 'left' | 'bottom';
    collapsible?: boolean;
    defaultCollapsed?: boolean;
    searchable?: boolean;
    filterable?: boolean;
    className?: string;
    onContentSelect?: (content: HelpContentItem) => void;
    onFeedback?: (contentId: string, helpful: boolean) => void;
}
export declare const ContextualHelpPanel: React.FC<ContextualHelpPanelProps>;
export interface GuidedTourProps {
    tour: HelpTour;
    isActive: boolean;
    onComplete?: () => void;
    onSkip?: () => void;
    onStepChange?: (stepIndex: number) => void;
    className?: string;
}
export declare const GuidedTour: React.FC<GuidedTourProps>;
export interface HelpHubProps {
    tours: HelpTour[];
    content: HelpContentItem[];
    context: HelpContext;
    onTourStart?: (tourId: string) => void;
    onContentView?: (contentId: string) => void;
    className?: string;
}
export declare const HelpHub: React.FC<HelpHubProps>;
export interface QuickHelpProps {
    helpContent: HelpContentItem[];
    onHelpRequest?: () => void;
    className?: string;
}
export declare const QuickHelp: React.FC<QuickHelpProps>;
declare const _default: {
    HelpTooltip: React.FC<HelpTooltipProps>;
    ContextualHelpPanel: React.FC<ContextualHelpPanelProps>;
    GuidedTour: React.FC<GuidedTourProps>;
    HelpHub: React.FC<HelpHubProps>;
    QuickHelp: React.FC<QuickHelpProps>;
};
export default _default;
//# sourceMappingURL=InAppHelpComponents.d.ts.map