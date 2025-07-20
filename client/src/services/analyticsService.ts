import {
  AnalyticsEvent,
  CreatorDashboard,
  TemplateMetrics,
  AnalyticsQuery,
  CustomReport,
  AnalyticsInsight,
  TimeRange,
  AnalyticsService as IAnalyticsService
} from '../types/analytics';

class AnalyticsService implements IAnalyticsService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || '';
  }

  // Track analytics event
  async trackEvent(event: Partial<AnalyticsEvent>): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/analytics/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(event)
      });

      if (!response.ok) {
        throw new Error(`Failed to track event: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error tracking analytics event:', error);
      // Don't throw error to avoid disrupting user experience
    }
  }

  // Batch track multiple events
  async batchTrackEvents(events: Partial<AnalyticsEvent>[]): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/analytics/events/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ events })
      });

      if (!response.ok) {
        throw new Error(`Failed to batch track events: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error batch tracking analytics events:', error);
    }
  }

  // Get creator dashboard data
  async getCreatorDashboard(
    creatorId: string,
    timeRange: TimeRange,
    startDate?: Date,
    endDate?: Date
  ): Promise<CreatorDashboard> {
    try {
      const params = new URLSearchParams({
        time_range: timeRange,
        ...(startDate && { start_date: startDate.toISOString() }),
        ...(endDate && { end_date: endDate.toISOString() })
      });

      const response = await fetch(
        `${this.baseUrl}/api/analytics/creators/${creatorId}/dashboard?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard: ${response.statusText}`);
      }

      const data = await response.json();
      return this.transformDashboardData(data);
    } catch (error) {
      console.error('Error fetching creator dashboard:', error);
      throw error;
    }
  }

  // Get template metrics
  async getTemplateMetrics(
    templateId: string,
    timeRange: TimeRange,
    startDate?: Date,
    endDate?: Date
  ): Promise<TemplateMetrics> {
    try {
      const params = new URLSearchParams({
        time_range: timeRange,
        ...(startDate && { start_date: startDate.toISOString() }),
        ...(endDate && { end_date: endDate.toISOString() })
      });

      const response = await fetch(
        `${this.baseUrl}/api/analytics/templates/${templateId}/metrics?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch template metrics: ${response.statusText}`);
      }

      const data = await response.json();
      return this.transformTemplateMetrics(data);
    } catch (error) {
      console.error('Error fetching template metrics:', error);
      throw error;
    }
  }

  // Query analytics data
  async queryAnalytics(query: AnalyticsQuery): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/analytics/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(query)
      });

      if (!response.ok) {
        throw new Error(`Failed to query analytics: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error querying analytics:', error);
      throw error;
    }
  }

  // Create custom report
  async createCustomReport(report: Partial<CustomReport>): Promise<CustomReport> {
    try {
      const response = await fetch(`${this.baseUrl}/api/analytics/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(report)
      });

      if (!response.ok) {
        throw new Error(`Failed to create report: ${response.statusText}`);
      }

      const data = await response.json();
      return this.transformCustomReport(data);
    } catch (error) {
      console.error('Error creating custom report:', error);
      throw error;
    }
  }

  // Get custom reports
  async getCustomReports(creatorId: string): Promise<CustomReport[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/analytics/creators/${creatorId}/reports`,
        {
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch reports: ${response.statusText}`);
      }

      const data = await response.json();
      return data.map(this.transformCustomReport);
    } catch (error) {
      console.error('Error fetching custom reports:', error);
      throw error;
    }
  }

  // Generate report
  async generateReport(reportId: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/analytics/reports/${reportId}/generate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to generate report: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  // Generate insights
  async generateInsights(
    creatorId: string,
    templateIds?: string[]
  ): Promise<AnalyticsInsight[]> {
    try {
      const params = new URLSearchParams();
      if (templateIds && templateIds.length > 0) {
        params.append('template_ids', templateIds.join(','));
      }

      const response = await fetch(
        `${this.baseUrl}/api/analytics/creators/${creatorId}/insights?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch insights: ${response.statusText}`);
      }

      const data = await response.json();
      return data.map(this.transformInsight);
    } catch (error) {
      console.error('Error fetching insights:', error);
      throw error;
    }
  }

  // Update custom report
  async updateCustomReport(
    reportId: string,
    updates: Partial<CustomReport>
  ): Promise<CustomReport> {
    try {
      const response = await fetch(`${this.baseUrl}/api/analytics/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`Failed to update report: ${response.statusText}`);
      }

      const data = await response.json();
      return this.transformCustomReport(data);
    } catch (error) {
      console.error('Error updating custom report:', error);
      throw error;
    }
  }

  // Delete custom report
  async deleteCustomReport(reportId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/analytics/reports/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete report: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting custom report:', error);
      throw error;
    }
  }

  // Dismiss insight
  async dismissInsight(insightId: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/analytics/insights/${insightId}/dismiss`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to dismiss insight: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error dismissing insight:', error);
      throw error;
    }
  }

  // Export analytics data
  async exportAnalyticsData(
    query: AnalyticsQuery,
    format: 'csv' | 'xlsx' | 'json' = 'csv'
  ): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/api/analytics/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ ...query, format })
      });

      if (!response.ok) {
        throw new Error(`Failed to export data: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting analytics data:', error);
      throw error;
    }
  }

  // Private helper methods
  private getAuthToken(): string {
    // Get auth token from localStorage, sessionStorage, or auth context
    return localStorage.getItem('auth_token') || '';
  }

  private transformDashboardData(data: any): CreatorDashboard {
    return {
      ...data,
      period_start: new Date(data.period_start),
      period_end: new Date(data.period_end)
    };
  }

  private transformTemplateMetrics(data: any): TemplateMetrics {
    return {
      ...data,
      period_start: new Date(data.period_start),
      period_end: new Date(data.period_end),
      trends: {
        ...data.trends,
        daily_metrics: data.trends.daily_metrics.map((metric: any) => ({
          ...metric,
          date: new Date(metric.date)
        }))
      }
    };
  }

  private transformCustomReport(data: any): CustomReport {
    return {
      ...data,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at)
    };
  }

  private transformInsight(data: any): AnalyticsInsight {
    return {
      ...data,
      created_at: new Date(data.created_at)
    };
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();