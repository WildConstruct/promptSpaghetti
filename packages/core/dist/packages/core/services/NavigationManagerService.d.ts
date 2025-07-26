/**
 * Epic 17 Navigation Manager Service
 *
 * Service for managing navigation state, user preferences, and
 * navigation behavior across Epic 17 admin controls.
 */
import { EventEmitter } from 'events';
export interface NavigationPreferences {
    userId: string;
    expandedSections: string[];
    pinnedItems: string[];
    favoriteItems: string[];
    recentItems: NavigationHistoryItem[];
    layout: 'sidebar' | 'top' | 'mobile';
    theme: 'light' | 'dark' | 'auto';
    compactMode: boolean;
    showDescriptions: boolean;
    enableAnimations: boolean;
    searchHistory: string[];
    lastSection: string;
    customSections: CustomNavigationSection[];
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
    permissions: string[];
    active: boolean;
    order: number;
    category: string;
    createdBy: string;
    created: Date;
}
export interface NavigationAnalytics {
    userId: string;
    sessionId: string;
    pathHistory: NavigationPathEvent[];
    timeSpent: Map<string, number>;
    clickCounts: Map<string, number>;
    searchQueries: SearchQueryEvent[];
    errorEvents: NavigationErrorEvent[];
    performanceMetrics: NavigationPerformanceMetric[];
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
    categories?: string[];
    permissions?: string[];
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
/**
 * Navigation Manager Service
 *
 * Manages navigation state, preferences, analytics, and provides
 * intelligent navigation features for Epic 17.
 */
export declare class NavigationManagerService extends EventEmitter {
    private preferences;
    private analytics;
    private navigationCache;
    private searchIndex;
    constructor();
    /**
     * Get user navigation preferences
     */
    getUserPreferences(userId: string): Promise<NavigationPreferences>;
    /**
     * Update user navigation preferences
     */
    updateUserPreferences(userId: string, updates: Partial<NavigationPreferences>): Promise<NavigationPreferences>;
    /**
     * Add item to recent navigation
     */
    addToRecent(userId: string, item: NavigationHistoryItem): Promise<void>;
    /**
     * Toggle favorite status of navigation item
     */
    toggleFavorite(userId: string, itemId: string): Promise<boolean>;
    /**
     * Toggle pinned status of navigation item
     */
    togglePin(userId: string, itemId: string): Promise<boolean>;
    /**
     * Toggle section expansion
     */
    toggleSectionExpansion(userId: string, sectionId: string): Promise<boolean>;
    /**
     * Search navigation items
     */
    searchNavigation(options: NavigationSearchOptions): Promise<NavigationSearchResult[]>;
    /**
     * Record navigation analytics
     */
    recordNavigation(userId: string, event: NavigationPathEvent): Promise<void>;
    /**
     * Record search query
     */
    recordSearch(userId: string, event: SearchQueryEvent): Promise<void>;
    /**
     * Get navigation recommendations for user
     */
    getRecommendations(userId: string): Promise<NavigationHistoryItem[]>;
    /**
     * Get navigation analytics summary
     */
    getAnalyticsSummary(userId: string): Promise<{
        totalNavigations: number;
        averageSessionTime: number;
        mostVisitedSections: string[];
        searchQueriesCount: number;
        lastActivity: Date | null;
    }>;
    /**
     * Export user navigation data
     */
    exportUserData(userId: string): Promise<{
        preferences: NavigationPreferences;
        analytics: NavigationAnalytics;
        summary: any;
    }>;
    private createDefaultPreferences;
    private createEmptyAnalytics;
    private persistPreferences;
    private initializeSearchIndex;
    private highlightMatch;
    private generateSessionId;
}
export default NavigationManagerService;
//# sourceMappingURL=NavigationManagerService.d.ts.map