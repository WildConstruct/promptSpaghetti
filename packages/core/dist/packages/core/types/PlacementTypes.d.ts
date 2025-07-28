/**
 * Placement Management Types - Epic 17.5.2
 *
 * Type definitions for marketplace content placement and featured content management.
 * Enables admin control over content positioning, scheduling, and performance tracking.
 *
 * Task: E17-1753114397326-68B279 - Develop placement management
 * Epic: 17 - Backstage Admin Controls
 */
export interface PlacementSlot {
    slotId: string;
    name: string;
    displayName: string;
    description: string;
    placementArea: PlacementArea;
    position: PlacementPosition;
    maxItems: number;
    minItems: number;
    dimensions: PlacementDimensions;
    styling: PlacementStyling;
    layout: PlacementLayout;
    targetingRules: PlacementTargetingRules;
    displayRules: PlacementDisplayRules;
    isActive: boolean;
    priority: number;
    tags: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    lastModifiedBy?: string;
    performanceMetrics?: PlacementSlotMetrics;
}
export declare enum PlacementArea {
    HOMEPAGE = "homepage",
    CATEGORY_PAGE = "category_page",
    SEARCH_RESULTS = "search_results",
    TEMPLATE_DETAIL = "template_detail",
    USER_DASHBOARD = "user_dashboard",
    CHECKOUT = "checkout",
    SIDEBAR = "sidebar",
    HEADER = "header",
    FOOTER = "footer",
    MODAL = "modal",
    export,
    enum,
    PlacementPosition
}
export interface PlacementTemplate {
    templateId: string;
    name: string;
    description: string;
    slotConfiguration: Partial<PlacementSlot>;
    defaultPlacements: Array<Partial<ContentPlacement>>;
    category: string;
    useCase: string;
    isPublic: boolean;
    usageCount: number;
    averagePerformance?: PlacementSlotMetrics;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    version: string;
    tags: string;
}
export interface PlacementAuditLog {
    logId: string;
    entityType: 'slot' | 'placement' | 'campaign' | 'schedule';
    entityId: string;
    action: string;
    changes?: Array<{}, field>;
    string: any;
    oldValue: any;
    newValue: any;
}
//# sourceMappingURL=PlacementTypes.d.ts.map