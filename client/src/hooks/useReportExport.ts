/**
 * Report Export Hook
 * 
 * Custom React hook for managing report export functionality,
 * integrating with the ReportExportService API.
 * 
 * Task: T-1752989143998-788 - Add report export options
 */

import { useState, useCallback } from 'react';

// Types
interface ReportData {
  metadata: {
    title: string;
    description: string;
    generatedAt: Date;
    generatedBy: string;
    version: string;
  };
  summary: Record<string, any>;
  data: Array<Record<string, any>>;
  charts?: Array<{
    type: 'line' | 'bar' | 'pie' | 'area';
    title: string;
    data: any[];
    options?: Record<string, any>;
  }>;
  customSections?: Array<{
    title: string;
    content: string | Record<string, any>;
    type: 'text' | 'table' | 'chart' | 'html';
  }>;
}

interface ExportConfig {
  format: 'pdf' | 'excel' | 'csv' | 'json' | 'xml' | 'html';
  delivery: 'file' | 'email' | 'webhook' | 'api';
  filename?: string;
  options?: {
    includeCharts?: boolean;
    includeRawData?: boolean;
    compression?: boolean;
    encryption?: boolean;
    password?: string;
    customStyling?: Record<string, any>;
  };
  delivery_config?: {
    email?: {
      to: string[];
      cc?: string[];
      subject: string;
      message?: string;
    };
    webhook?: {
      url: string;
      headers?: Record<string, string>;
      method?: 'POST' | 'PUT';
    };
    api?: {
      endpoint: string;
      method: 'POST' | 'PUT';
      headers?: Record<string, string>;
    };
  };
}

interface ExportResult {
  id: string;
  success: boolean;
  format: string;
  delivery: string;
  filename: string;
  size: number;
  generatedAt: Date;
  deliveredAt?: Date;
  error?: string;
  downloadUrl?: string;
  metadata: {
    recordCount: number;
    processingTime: number;
    compressionRatio?: number;
  };
}

interface ScheduledExport {
  id: string;
  name: string;
  description: string;
  reportQuery: string;
  exportConfig: ExportConfig;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
    time: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
    cron?: string;
  };
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  createdBy: string;
}

interface ExportFormats {
  formats: string[];
  deliveryMethods: string[];
  supportedFeatures: {
    compression: boolean;
    encryption: boolean;
    scheduling: boolean;
    bulkExport: boolean;
    customStyling: boolean;
    charts: boolean;
    email: boolean;
    webhooks: boolean;
  };
}

interface UseReportExportReturn {
  // State
  isExporting: boolean;
  isLoadingHistory: boolean;
  isLoadingSchedules: boolean;
  exportHistory: ExportResult[];
  scheduledExports: ScheduledExport[];
  exportFormats: ExportFormats | null;
  
  // Actions
  exportReport: (reportData: ReportData, config: ExportConfig) => Promise<ExportResult>;
  bulkExportReports: (reports: Array<{
    name: string;
    reportData: ReportData;
    config: ExportConfig;
  }>, options?: {
    parallel?: boolean;
    maxConcurrency?: number;
    failFast?: boolean;
  }) => Promise<any>;
  scheduleExport: (schedule: Omit<ScheduledExport, 'id'>) => Promise<ScheduledExport>;
  testExport: (format: string, delivery?: string) => Promise<ExportResult>;
  previewReport: (reportData: ReportData, format: string) => Promise<{
    format: string;
    preview: string;
    metadata: {
      recordCount: number;
      estimatedSize: number;
      previewTruncated: boolean;
    };
  }>;
  
  // Data loading
  loadExportHistory: (limit?: number, formatFilter?: string, deliveryFilter?: string) => Promise<void>;
  loadScheduledExports: () => Promise<void>;
  loadExportFormats: () => Promise<void>;
  
  // Management
  cancelScheduledExport: (scheduleId: string) => Promise<boolean>;
  downloadExport: (exportId: string) => void;
  getExportStatistics: () => Promise<any>;
}

export const useReportExport = (): UseReportExportReturn => {
  // State
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  const [exportHistory, setExportHistory] = useState<ExportResult[]>([]);
  const [scheduledExports, setScheduledExports] = useState<ScheduledExport[]>([]);
  const [exportFormats, setExportFormats] = useState<ExportFormats | null>(null);

  // Export report immediately
  const exportReport = useCallback(async (reportData: ReportData, config: ExportConfig): Promise<ExportResult> => {
    setIsExporting(true);
    
    try {
      const response = await fetch('/api/reports/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reportData,
          config
        })
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Export failed');
      }

      // Refresh export history
      await loadExportHistory();

      return result.data;
    } finally {
      setIsExporting(false);
    }
  }, []);

  // Bulk export multiple reports
  const bulkExportReports = useCallback(async (
    reports: Array<{
      name: string;
      reportData: ReportData;
      config: ExportConfig;
    }>,
    options?: {
      parallel?: boolean;
      maxConcurrency?: number;
      failFast?: boolean;
    }
  ) => {
    setIsExporting(true);
    
    try {
      const response = await fetch('/api/reports/bulk-export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reports,
          options
        })
      });

      if (!response.ok) {
        throw new Error(`Bulk export failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Refresh export history
      await loadExportHistory();

      return result.data;
    } finally {
      setIsExporting(false);
    }
  }, []);

  // Schedule recurring export
  const scheduleExport = useCallback(async (schedule: Omit<ScheduledExport, 'id'>): Promise<ScheduledExport> => {
    const response = await fetch('/api/reports/schedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(schedule)
    });

    if (!response.ok) {
      throw new Error(`Scheduling failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Scheduling failed');
    }

    // Refresh scheduled exports
    await loadScheduledExports();

    return result.data;
  }, []);

  // Test export with sample data
  const testExport = useCallback(async (format: string, delivery: string = 'file'): Promise<ExportResult> => {
    setIsExporting(true);
    
    try {
      const response = await fetch('/api/reports/test-export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          format,
          delivery
        })
      });

      if (!response.ok) {
        throw new Error(`Test export failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Test export failed');
      }

      return result.data;
    } finally {
      setIsExporting(false);
    }
  }, []);

  // Preview report before export
  const previewReport = useCallback(async (reportData: ReportData, format: string) => {
    const response = await fetch('/api/reports/preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reportData,
        format
      })
    });

    if (!response.ok) {
      throw new Error(`Preview failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Preview failed');
    }

    return result.data;
  }, []);

  // Load export history
  const loadExportHistory = useCallback(async (limit: number = 100, formatFilter?: string, deliveryFilter?: string) => {
    setIsLoadingHistory(true);
    
    try {
      const params = new URLSearchParams({ limit: limit.toString() });
      if (formatFilter) params.append('format', formatFilter);
      if (deliveryFilter) params.append('delivery', deliveryFilter);

      const response = await fetch(`/api/reports/history?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setExportHistory(result.data);
      }
    } catch (error) {
      console.error('Failed to load export history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // Load scheduled exports
  const loadScheduledExports = useCallback(async () => {
    setIsLoadingSchedules(true);
    
    try {
      const response = await fetch('/api/reports/schedules');
      const result = await response.json();
      
      if (result.success) {
        setScheduledExports(result.data);
      }
    } catch (error) {
      console.error('Failed to load scheduled exports:', error);
    } finally {
      setIsLoadingSchedules(false);
    }
  }, []);

  // Load available export formats and options
  const loadExportFormats = useCallback(async () => {
    try {
      const response = await fetch('/api/reports/options');
      const result = await response.json();
      
      if (result.success) {
        setExportFormats(result.data);
      }
    } catch (error) {
      console.error('Failed to load export formats:', error);
    }
  }, []);

  // Cancel scheduled export
  const cancelScheduledExport = useCallback(async (scheduleId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/reports/schedules/${scheduleId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Refresh scheduled exports
        await loadScheduledExports();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to cancel scheduled export:', error);
      return false;
    }
  }, [loadScheduledExports]);

  // Download exported report
  const downloadExport = useCallback((exportId: string) => {
    window.open(`/api/reports/download/${exportId}`, '_blank');
  }, []);

  // Get export statistics
  const getExportStatistics = useCallback(async () => {
    try {
      const response = await fetch('/api/reports/statistics');
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to get export statistics:', error);
      return null;
    }
  }, []);

  return {
    // State
    isExporting,
    isLoadingHistory,
    isLoadingSchedules,
    exportHistory,
    scheduledExports,
    exportFormats,
    
    // Actions
    exportReport,
    bulkExportReports,
    scheduleExport,
    testExport,
    previewReport,
    
    // Data loading
    loadExportHistory,
    loadScheduledExports,
    loadExportFormats,
    
    // Management
    cancelScheduledExport,
    downloadExport,
    getExportStatistics
  };
};