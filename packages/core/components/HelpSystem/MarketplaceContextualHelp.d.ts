/**
 * Epic 16 - Marketplace Contextual Help System
 * Task: E16-1753114247194-DB73D0 - Implement contextual help
 *
 * Intelligent contextual help system that provides smart assistance based on
 * user actions, marketplace context, and user behavior patterns. Extends the
 * Epic 8.4 foundation with marketplace-specific contextual intelligence.
 *
 * Features:
 * - Smart contextual triggers based on user actions
 * - Marketplace-specific help content
 * - User behavior pattern recognition
 * - Progressive help complexity adaptation
 * - Community-driven help suggestions
 */
import React from 'react';
import { HelpContentManager } from '../ContextualHelp/HelpContentManager';
import { MarketplaceHelpContent } from './MarketplaceHelpOverlay';
export type ContextualTriggerType = 'hover' | 'click' | 'focus' | 'scroll' | 'idle' | 'error' | 'success' | 'first-time' | 'struggle-detected' | 'feature-discovery';

export interface UserBehaviorContext {
    currentPage: string;
    previousPage?: string;
    timeOnPage: number;
    scrollDepth: number;
    clickCount: number;
    hoverCount: number;
    searchAttempts: number;
    filterChanges: number;
    templatesViewed: number;
    templatesAddedToCart: number;
    purchasesCompleted: number;
    reviewsWritten: number;
    backButtonUse: number;
    searchRefinements: number;
    timeWithoutProgress: number;
    errorEncounters: number;
    helpRequestCount: number;
    taskCompletionRate: number;
    featureDiscoveryCount: number;
    returnUserBehavior: boolean;

export interface ContextualHelpRule {
    id: string;
    name: string;
    triggerType: ContextualTriggerType;
    conditions: {,
        pagePattern?: RegExp;
        elementSelector?: string;
        userBehavior?: Partial<UserBehaviorContext>;
        timeThreshold?: number;
        eventCount?: number;
    };
    helpContent: MarketplaceHelpContent;
    priority: number;
    cooldownMinutes?: number;
    maxTriggers?: number;

export interface MarketplaceContextualHelpProps {
    userId?: string;
    userRole?: 'buyer' | 'creator' | 'community-member' | 'new-user';
    userLevel?: 'beginner' | 'intermediate' | 'advanced' | 'professional';
    currentPage: string;
    pageContext?: Record<string, any>;
    behaviorContext?: Partial<UserBehaviorContext>;
    enabled?: boolean;
    intelligenceLevel?: 'basic' | 'smart' | 'adaptive';
    triggerSensitivity?: 'low' | 'medium' | 'high';
    helpContentManager?: HelpContentManager;
    onContextualHelpTriggered?: (rule: ContextualHelpRule, context: unknown) => void;
    onUserStruggleDetected?: (struggleType: string, severity: number) => void;
    onHelpEffectiveness?: (helpId: string, wasEffective: boolean) => void;

export declare const MarketplaceContextualHelp: React.FC<MarketplaceContextualHelpProps>;
export default MarketplaceContextualHelp;
//# sourceMappingURL=MarketplaceContextualHelp.d.ts.map