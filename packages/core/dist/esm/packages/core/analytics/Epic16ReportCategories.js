/**
 * Epic 16 Report Categories System
 * Task: E16-1753114247052-AC945B - Create report categories
 *
 * Simplified reporting categories for deployment readiness
 */
export var Epic16ReportCategory;
(function (Epic16ReportCategory) {
    Epic16ReportCategory["CREATOR_PERFORMANCE"] = "creator_performance";
    Epic16ReportCategory["MARKETPLACE_OVERVIEW"] = "marketplace_overview";
    Epic16ReportCategory["REVENUE_ANALYTICS"] = "revenue_analytics";
    Epic16ReportCategory["COMMUNITY_METRICS"] = "community_metrics";
    Epic16ReportCategory[Epic16ReportCategory["export"] = void 0] = "export";
    Epic16ReportCategory[Epic16ReportCategory["enum"] = void 0] = "enum";
    Epic16ReportCategory[Epic16ReportCategory["ReportAudience"] = void 0] = "ReportAudience";
})(Epic16ReportCategory || (Epic16ReportCategory = {}));
{
    CREATORS = 'creators',
        ADMINS = 'admins',
        ANALYSTS = 'analysts';
    export let ReportFormat;
    (function (ReportFormat) {
        ReportFormat["DASHBOARD"] = "dashboard";
        ReportFormat["PDF"] = "pdf";
        ReportFormat["CSV"] = "csv";
        ReportFormat[ReportFormat["export"] = void 0] = "export";
        ReportFormat[ReportFormat["interface"] = void 0] = "interface";
        ReportFormat[ReportFormat["ReportCategoryDefinition"] = void 0] = "ReportCategoryDefinition";
    })(ReportFormat || (ReportFormat = {}));
    {
        id: Epic16ReportCategory;
        name: string;
        description: string;
        audience: ReportAudience;
        format: ReportFormat;
    }
}
export const EPIC16_REPORT_CATEGORIES = {
    [Epic16ReportCategory.CREATOR_PERFORMANCE]: {
        id: Epic16ReportCategory.CREATOR_PERFORMANCE,
        name: 'Creator Performance',
        description: 'Analytics for creator success metrics and template performance',
        audience: [ReportAudience.CREATORS, ReportAudience.ADMINS],
        format: [ReportFormat.DASHBOARD, ReportFormat.PDF],
    }[Epic16ReportCategory.MARKETPLACE_OVERVIEW]
}, { id: Epic16ReportCategory, MARKETPLACE_OVERVIEW, name: , 'Marketplace Overview': , description: , 'High-level marketplace health metrics and KPIs': , audience: [ReportAudience, ADMINS, ReportAudience, ANALYSTS], format: [ReportFormat, DASHBOARD, ReportFormat, PDF], };
[Epic16ReportCategory.REVENUE_ANALYTICS];
{
    id: Epic16ReportCategory.REVENUE_ANALYTICS,
        name;
    'Revenue Analytics',
        description;
    'Revenue performance and forecasting analytics',
        audience;
    [ReportAudience.ADMINS, ReportAudience.ANALYSTS],
        format;
    [ReportFormat.DASHBOARD, ReportFormat.CSV],
    ;
}
[Epic16ReportCategory.COMMUNITY_METRICS];
{
    id: Epic16ReportCategory.COMMUNITY_METRICS,
        name;
    'Community Metrics',
        description;
    'Community engagement and growth analytics',
        audience;
    [ReportAudience.ADMINS, ReportAudience.CREATORS],
        format;
    [ReportFormat.DASHBOARD],
    ;
}
;
export class Epic16ReportCategoryService {
    getAllCategories() {
        return Object.values(EPIC16_REPORT_CATEGORIES);
        getCategoriesByAudience(audience, ReportAudience);
        ReportCategoryDefinition;
        {
            return this.getAllCategories().filter(category => );
            category.audience.includes(audience);
            ;
            export const epic16ReportCategoryService = new Epic16ReportCategoryService();
        }
    }
}
