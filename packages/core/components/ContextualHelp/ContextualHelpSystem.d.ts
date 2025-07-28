/**
 * Epic 8.4 - Contextual Help System
 *
 * Director-friendly contextual help system designed for film industry professionals.
 * Provides intelligent, non-intrusive guidance using cinema terminology and workflows.
 *
 * Features:
 * - Smart contextual tooltips that appear based on user actions
 * - Progressive onboarding hints for new directors
 * - Film industry terminology and metaphors
 * - Professional cinema-appropriate UI design
 * - Help content management system
 */
import React from 'react';
import { Node, Edge } from 'reactflow';
export type HelpContentType = 'getting-started' | 'node-creation' | 'connection-flow' | 'weight-adjustment' | 'preview-generation' | 'professional-workflow' | 'troubleshooting' | 'advanced-features';

export interface HelpContent {
    id: string;
    type: HelpContentType;
    title: string;
    content: string;
    filmTerminology?: string;
    actionItems?: string[];
    relatedFeatures?: string[];
    level: 'beginner' | 'intermediate' | 'advanced' | 'professional';
    context: {,
        triggerElements?: string[];
        nodeTypes?: string[];
        actions?: string[];
        conditions?: Record<string, any>;
    };

export interface ContextualHelpProps {
    nodes: Node[];
    edges: Edge[];
    selectedNodeId?: string;
    selectedEdgeId?: string;
    userLevel?: 'beginner' | 'intermediate' | 'advanced' | 'professional';
    enabled?: boolean;
    autoTrigger?: boolean;
    showProgressiveHints?: boolean;
    onHelpContentViewed?: (contentId: string) => void;
    onUserLevelChange?: (level: string) => void;

export declare const ContextualHelpSystem: React.FC<ContextualHelpProps>;
export default ContextualHelpSystem;
//# sourceMappingURL=ContextualHelpSystem.d.ts.map