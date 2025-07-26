import { Database } from '../database';
import { 
  AnalyticsEvent,
  AnalyticsEventInput,
  AnalyticsQueryInput,
  TemplateMetrics,
  CreatorDashboard,
  CustomReport,
  CustomReportInput,
  AnalyticsInsight,
  TimeRange
} from './analytics.types';
export declare class AnalyticsService {
    private db;
    constructor(db: Database);
    trackEvent(eventData: AnalyticsEventInput): Promise<AnalyticsEvent>;
    batchTrackEvents(events: AnalyticsEventInput[]): Promise<AnalyticsEvent[]>;
    queryAnalytics(queryInput: AnalyticsQueryInput): Promise<any[]>;
    getTemplateMetrics(
      templateId: string,
      timeRange: TimeRange,
      startDate?: Date,
      endDate?: Date
    ): Promise<TemplateMetrics>;
    getCreatorDashboard(
      creatorId: string,
      timeRange: TimeRange,
      startDate?: Date,
      endDate?: Date
    ): Promise<CreatorDashboard>;
    createCustomReport(creatorId: string, reportData: CustomReportInput): Promise<CustomReport>;
    getCustomReports(creatorId: string): Promise<CustomReport[]>;
    generateReport(reportId: string): Promise<any>;
    generateInsights(creatorId: string, templateIds?: string[]): Promise<AnalyticsInsight[]>;
    private buildAnalyticsQuery;
    private getTimeRangeDates;
    private getTemplateDemographics;
    private getTemplateTrends;
    private calculateConversionRate;
    private getEmptyCreatorDashboard;
    private getCreatorOverview;
    private getCreatorPerformance;
    private getCreatorTraffic;
    private getCreatorFinancials;
    private generateTrendInsights;
    private detectAnomalies;
    private findOpportunities;
    private mapEventRow;
    private mapReportRow;
}
//# sourceMappingURL=analytics.service.d.ts.map