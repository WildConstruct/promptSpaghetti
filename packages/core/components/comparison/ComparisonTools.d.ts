/**
 * Comparison Tools (Epic 16)
 *
 * DEPLOYMENT BLOCKER FIX: Advanced comparison tools for analyzing differences
 * between graph versions, content variations, and system configurations.
 * Provides intelligent diff algorithms, visual comparison interfaces,
 * and comprehensive analysis capabilities.
 *
 * Features:
 * - Multi-level comparison (structural, semantic, visual)
 * - Side-by-side diff viewer
 * - Unified diff display
 * - Change timeline visualization
 * - Merge conflict resolution
 * - Export comparison reports
 * - Performance impact analysis
 * - Batch comparison processing
 */
import React from 'react';
import { GraphComparison, ViewMode, HighlightMode, ComparisonType, MatchType } from '../../types/comparison';
export interface ComparisonItem {
    id: string;
    name: string;
    type: 'graph' | 'content' | 'config' | 'schema' | 'permission';
    version: string;
    lastModified: Date;
    author: string;
    size: number;
    checksum: string;
    metadata: Record<string, any>;
}
export interface ComparisonSession {
    id: string;
    name: string;
    sourceItem: ComparisonItem;
    targetItem: ComparisonItem;
    comparisonType: ComparisonType;
    viewMode: ViewMode;
    highlightMode: HighlightMode;
    filters: ComparisonFilters;
    annotations: ComparisonAnnotation[];
    createdAt: Date;
    lastAccessed: Date;
    isBookmarked: boolean;
}
export interface ComparisonFilters {
    showUnchanged: boolean;
    showMetadata: boolean;
    nodeTypes: string[];
    changeTypes: MatchType[];
    confidenceThreshold: number;
    severityLevels: ('low' | 'medium' | 'high' | 'critical')[];
    dateRange?: {
        start: Date;
        end: Date;
    };
    author?: string;
    searchQuery?: string;
}
export interface ComparisonAnnotation {
    id: string;
    type: 'comment' | 'highlight' | 'bookmark' | 'issue';
    targetId: string;
    title: string;
    content: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    author: string;
    createdAt: Date;
    resolved: boolean;
    position?: {
        x: number;
        y: number;
    };
}
export interface ComparisonMetrics {
    structuralSimilarity: number;
    semanticSimilarity: number;
    visualSimilarity: number;
    overallSimilarity: number;
    complexity: number;
    impactScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    performanceImpact: {
        estimated: boolean;
        cpuDelta: number;
        memoryDelta: number;
        networkDelta: number;
    };
    breakingChanges: number;
    deprecations: number;
    newFeatures: number;
}
export interface ComparisonReport {
    session: ComparisonSession;
    comparison: GraphComparison;
    metrics: ComparisonMetrics;
    summary: {
        title: string;
        description: string;
        recommendations: string[];
        warnings: string[];
        errors: string[];
    };
    timeline: Array<{
        timestamp: Date;
        event: string;
        impact: 'low' | 'medium' | 'high';
        description: string;
    }>;
    exportFormats: ('pdf' | 'html' | 'json' | 'csv')[];
}
export interface ComparisonToolsProps {
    sessions: ComparisonSession[];
    activeSessionId?: string;
    onSessionSelect: (sessionId: string) => void;
    onSessionCreate: (source: ComparisonItem, target: ComparisonItem) => void;
    onSessionUpdate: (sessionId: string, updates: Partial<ComparisonSession>) => void;
    onSessionDelete: (sessionId: string) => void;
    onExportReport: (sessionId: string, format: string) => void;
    className?: string;
}
export declare const ComparisonTools: React.FC<ComparisonToolsProps>;
interface ComparisonSessionCardProps {
    session: ComparisonSession;
    isActive: boolean;
    isSelected: boolean;
    onSelect: () => void;
    onToggleSelection: (selected: boolean) => void;
    onUpdate: (updates: Partial<ComparisonSession>) => void;
    onDelete: () => void;
    onExport: (format: string) => void;
}
interface ComparisonSessionRowProps {
    session: ComparisonSession;
    isActive: boolean;
    isSelected: boolean;
    onSelect: () => void;
    onToggleSelection: (selected: boolean) => void;
    onUpdate: (updates: Partial<ComparisonSession>) => void;
    onDelete: () => void;
}
interface ComparisonTimelineProps {
    sessions: ComparisonSession[];
    activeSessionId?: string;
    onSessionSelect: (sessionId: string) => void;
}
export interface AdvancedDiffViewerProps {
    comparison: GraphComparison;
    session: ComparisonSession;
    onSessionUpdate: (updates: Partial<ComparisonSession>) => void;
    onAnnotationAdd: (annotation: Omit<ComparisonAnnotation, 'id' | 'createdAt'>) => void;
    onAnnotationUpdate: (id: string, updates: Partial<ComparisonAnnotation>) => void;
    onAnnotationDelete: (id: string) => void;
    className?: string;
}
export declare const AdvancedDiffViewer: React.FC<AdvancedDiffViewerProps>;
declare const _default: {
    ComparisonTools: React.FC<ComparisonToolsProps>;
    AdvancedDiffViewer: React.FC<AdvancedDiffViewerProps>;
    ComparisonSessionCard: React.FC<ComparisonSessionCardProps>;
    ComparisonSessionRow: React.FC<ComparisonSessionRowProps>;
    ComparisonTimeline: React.FC<ComparisonTimelineProps>;
};
export default _default;
//# sourceMappingURL=ComparisonTools.d.ts.map