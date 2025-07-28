/**
 * Epic 17 Navigation Manager Service
 *
 * Service for managing navigation state, user preferences, and
 * navigation behavior across Epic 17 admin controls.
 */
import { EventEmitter } from 'events';
export interface NavigationPreferences {
    userId: string;
    expandedSections: string;
    pinnedItems: string;
    favoriteItems: string;
    recentItems: NavigationHistoryItem;
    layout: 'sidebar' | 'top' | 'mobile';
    theme: 'light' | 'dark' | 'auto';
    compactMode: boolean;
    showDescriptions: boolean;
    enableAnimations: boolean;
    searchHistory: string;
    lastSection: string;
    customSections: CustomNavigationSection;
}
export interface NavigationHistoryItem {
    id: string;
    label: string;
    path: string;
    icon: string;
    timestamp: Date;
    category: string;
    accessCount: number;
    lastAccessed: Date;
}
export interface CustomNavigationSection {
    id: string;
    label: string;
    description: string;
    path: string;
    icon: string;
    permissions: string;
    active: boolean;
    order: number;
    category: string;
    createdBy: string;
    created: Date;
}
export interface NavigationAnalytics {
    userId: string;
    sessionId: string;
    pathHistory: NavigationPathEvent;
    timeSpent: Map<string, number>;
    clickCounts: Map<string, number>;
    searchQueries: SearchQueryEvent;
    errorEvents: NavigationErrorEvent;
    performanceMetrics: NavigationPerformanceMetric;
}
export interface NavigationPathEvent {
    path: string;
    section: string;
    timestamp: Date;
    duration: number;
    source: 'click' | 'keyboard' | 'bookmark' | 'direct' | 'search';
}
export interface SearchQueryEvent {
    query: string;
    timestamp: Date;
    resultsCount: number;
    selectedResult?: string;
    source: 'header' | 'sidebar' | 'modal';
}
export interface NavigationErrorEvent {
    path: string;
    error: string;
    timestamp: Date;
    userAgent: string;
    resolved: boolean;
}
export interface NavigationPerformanceMetric {
    action: string;
    duration: number;
    timestamp: Date;
    metadata: Record<string, any>;
}
export interface NavigationSearchOptions {
    query: string;
    categories?: string;
    permissions?: string;
    limit?: number;
    fuzzyMatch?: boolean;
    includeDescriptions?: boolean;
    userId?: string;
}
export interface NavigationSearchResult {
    item: {
        id: string;
        label: string;
        description: string;
        path: string;
        icon: string;
        category: string;
    };
    score: number;
    matchType: 'exact' | 'partial' | 'fuzzy' | 'description';
    highlightedText: string;
}
export declare class NavigationManagerService extends EventEmitter {
    private preferences;
    private analytics;
    private navigationCache;
    private searchIndex;
    constructor();
}
//# sourceMappingURL=NavigationManagerService.d.ts.map