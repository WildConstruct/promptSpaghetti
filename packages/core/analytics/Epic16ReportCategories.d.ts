/**
 * Epic 16 Report Categories System
 * Task: E16-1753114247052-AC945B - Create report categories
 *
 * Simplified reporting categories for deployment readiness
 */
export declare enum Epic16ReportCategory {
    CREATOR_PERFORMANCE = "creator_performance",
    MARKETPLACE_OVERVIEW = "marketplace_overview",
    REVENUE_ANALYTICS = "revenue_analytics",
    COMMUNITY_METRICS = "community_metrics"
}
export declare enum ReportAudience {
    CREATORS = "creators",
    ADMINS = "admins",
    ANALYSTS = "analysts"
}
export declare enum ReportFormat {
    DASHBOARD = "dashboard",
    PDF = "pdf",
    CSV = "csv"
}
export interface ReportCategoryDefinition {
    id: Epic16ReportCategory;
    name: string;
    description: string;
    audience: ReportAudience[];
    format: ReportFormat[];
}
export declare const EPIC16_REPORT_CATEGORIES: Record<Epic16ReportCategory, ReportCategoryDefinition>;
export declare class Epic16ReportCategoryService {
    getAllCategories(): ReportCategoryDefinition[];
    getCategoriesByAudience(audience: ReportAudience): ReportCategoryDefinition[];
}
export declare const epic16ReportCategoryService: Epic16ReportCategoryService;
//# sourceMappingURL=Epic16ReportCategories.d.ts.map