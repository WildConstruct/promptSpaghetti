/**
 * Enhanced Error Reporting and Test Feedback Framework for Epic 18
 * Provides comprehensive error tracking, reporting, and analysis capabilities
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Types for error reporting
export interface ErrorContext {
  testSuite: string;
  testCase: string;
  timestamp: string;
  environment: string;
  executionId: string;
  userId?: string;
  sessionId?: string;
}

export interface ErrorDetails {
  type:
    | 'network'
    | 'validation'
    | 'authentication'
    | 'system'
    | 'performance'
    | 'unknown';
  severity: 'critical' | 'high' | 'medium' | 'low';
  code: string;
  message: string;
  stack?: string;
  innerError?: ErrorDetails;
  metadata?: Record<string, unknown>;
}

export interface ErrorReport {
  id: string;
  context: ErrorContext;
  error: ErrorDetails;
  reproducible: boolean;
  reproductionSteps?: string[];
  expectedBehavior?: string;
  actualBehavior?: string;
  workaround?: string;
  resolution?: string;
  tags: string[];
  attachments?: string[];
}

export interface ErrorAnalytics {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  errorTrends: {
    timeframe: string;
    count: number;
    growth: number;
  }[];
  topErrors: {
    code: string;
    count: number;
    lastOccurrence: string;
  }[];
  resolutionRate: number;
  averageResolutionTime: number;
}

export interface TestFeedback {
  testId: string;
  status: 'passed' | 'failed' | 'skipped' | 'timeout';
  duration: number;
  assertions: {
    total: number;
    passed: number;
    failed: number;
  };
  coverage: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
  performance: {
    memoryUsage: number;
    cpuUsage: number;
    networkRequests: number;
  };
  errors?: ErrorReport[];
  warnings?: string[];
  suggestions?: string[];
}

export interface ErrorMetrics {
  errorRate: number;
  meanTimeToDetection: number;
  meanTimeToResolution: number;
  errorDistribution: Record<string, number>;
  impactScore: number;
  userExposure: number;
}

// Error Classification System
export class ErrorClassifier {
  private static patterns = {
    network: [
      /connection.*refused/i,
      /timeout/i,
      /network.*error/i,
      /fetch.*failed/i,
      /websocket.*error/i
    ],
    validation: [
      /validation.*error/i,
      /invalid.*input/i,
      /schema.*mismatch/i,
      /type.*error/i,
      /missing.*required/i
    ],
    authentication: [
      /auth.*failed/i,
      /token.*expired/i,
      /unauthorized/i,
      /forbidden/i,
      /invalid.*credentials/i
    ],
    system: [
      /out.*of.*memory/i,
      /stack.*overflow/i,
      /resource.*exhausted/i,
      /system.*error/i,
      /internal.*server.*error/i
    ],
    performance: [
      /performance.*degraded/i,
      /slow.*response/i,
      /high.*latency/i,
      /resource.*contention/i,
      /bottleneck/i
    ]
  };

  static classifyError(error: Error): ErrorDetails['type'] {
    const message = error.message.toLowerCase();

    for (const [type, patterns] of Object.entries(this.patterns)) {
      for (const pattern of patterns) {
        if (pattern.test(message)) {
          return type as ErrorDetails['type'];
        }
      }
    }

    return 'unknown';
  }

  static determineSeverity(
    error: Error,
    context: ErrorContext
  ): ErrorDetails['severity'] {
    const message = error.message.toLowerCase();

    // Critical errors
    if (
      message.includes('security') ||
      message.includes('data loss') ||
      message.includes('corruption') ||
      context.testSuite.includes('critical')
    ) {
      return 'critical';
    }

    // High severity
    if (
      message.includes('authentication') ||
      message.includes('authorization') ||
      message.includes('system') ||
      context.testSuite.includes('integration')
    ) {
      return 'high';
    }

    // Medium severity
    if (
      message.includes('validation') ||
      message.includes('network') ||
      context.testSuite.includes('api')
    ) {
      return 'medium';
    }

    return 'low';
  }

  static generateErrorCode(error: ErrorDetails): string {
    const typePrefix = error.type.toUpperCase().substring(0, 3);
    const severityCode = error.severity.substring(0, 1).toUpperCase();
    const hash = this.hashString(error.message);
    return `${typePrefix}_${severityCode}_${hash}`;
  }

  private static hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).substring(0, 6).toUpperCase();
  }
}

// Enhanced Error Reporter
export class EnhancedErrorReporter {
  private reports: ErrorReport[] = [];
  private analytics: ErrorAnalytics | null = null;
  private reportingEnabled = true;
  private outputDirectory: string;

  constructor(outputDir = './error-reports') {
    this.outputDirectory = outputDir;
    this.ensureOutputDirectory();
  }

  private ensureOutputDirectory(): void {
    if (!existsSync(this.outputDirectory)) {
      mkdirSync(this.outputDirectory, { recursive: true });
    }
  }

  reportError(
    error: Error,
    context: ErrorContext,
    options: {
      reproducible?: boolean;
      reproductionSteps?: string[];
      expectedBehavior?: string;
      actualBehavior?: string;
      workaround?: string;
      tags?: string[];
      metadata?: Record<string, unknown>;
    } = {}
  ): ErrorReport {
    if (!this.reportingEnabled) {
      return {} as ErrorReport;
    }

    const errorType = ErrorClassifier.classifyError(error);
    const severity = ErrorClassifier.determineSeverity(error, context);

    const errorDetails: ErrorDetails = {
      type: errorType,
      severity,
      code: '',
      message: error.message,
      stack: error.stack,
      metadata: options.metadata
    };

    errorDetails.code = ErrorClassifier.generateErrorCode(errorDetails);

    const report: ErrorReport = {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      context,
      error: errorDetails,
      reproducible: options.reproducible ?? false,
      reproductionSteps: options.reproductionSteps,
      expectedBehavior: options.expectedBehavior,
      actualBehavior: options.actualBehavior,
      workaround: options.workaround,
      resolution: undefined,
      tags: options.tags ?? [],
      attachments: []
    };

    this.reports.push(report);
    this.saveReport(report);

    return report;
  }

  reportTestResult(feedback: TestFeedback): void {
    if (!this.reportingEnabled) return;

    const reportPath = join(
      this.outputDirectory,
      `test-feedback-${Date.now()}.json`
    );
    writeFileSync(reportPath, JSON.stringify(feedback, null, 2));

    console.log(`Test feedback saved: ${reportPath}`);
  }

  generateAnalytics(): ErrorAnalytics {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const oneDay = 24 * oneHour;
    const oneWeek = 7 * oneDay;

    const recentReports = this.reports.filter(
      report => new Date(report.context.timestamp).getTime() > now - oneWeek
    );

    // Error counts by type
    const errorsByType: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {};

    recentReports.forEach(report => {
      errorsByType[report.error.type] =
        (errorsByType[report.error.type] || 0) + 1;
      errorsBySeverity[report.error.severity] =
        (errorsBySeverity[report.error.severity] || 0) + 1;
    });

    // Error trends
    const errorTrends = [
      {
        timeframe: '1h',
        count: this.getErrorCountInTimeframe(oneHour),
        growth: 0
      },
      {
        timeframe: '24h',
        count: this.getErrorCountInTimeframe(oneDay),
        growth: 0
      },
      {
        timeframe: '7d',
        count: this.getErrorCountInTimeframe(oneWeek),
        growth: 0
      }
    ];

    // Calculate growth rates
    errorTrends[0].growth = this.calculateGrowthRate(oneHour, oneHour * 2);
    errorTrends[1].growth = this.calculateGrowthRate(oneDay, oneDay * 2);
    errorTrends[2].growth = this.calculateGrowthRate(oneWeek, oneWeek * 2);

    // Top errors by frequency
    const errorCodeCounts: Record<
      string,
      { count: number; lastOccurrence: string }
    > = {};

    recentReports.forEach(report => {
      const code = report.error.code;
      if (!errorCodeCounts[code]) {
        errorCodeCounts[code] = {
          count: 0,
          lastOccurrence: report.context.timestamp
        };
      }
      errorCodeCounts[code].count++;
      if (
        new Date(report.context.timestamp) >
        new Date(errorCodeCounts[code].lastOccurrence)
      ) {
        errorCodeCounts[code].lastOccurrence = report.context.timestamp;
      }
    });

    const topErrors = Object.entries(errorCodeCounts)
      .map(([code, data]) => ({
        code,
        count: data.count,
        lastOccurrence: data.lastOccurrence
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Resolution metrics
    const resolvedReports = this.reports.filter(r => r.resolution);
    const resolutionRate =
      this.reports.length > 0
        ? resolvedReports.length / this.reports.length
        : 0;

    const resolutionTimes = resolvedReports.map(report => {
      const errorTime = new Date(report.context.timestamp).getTime();
      const resolutionTime = Date.now(); // Simplified - would use actual resolution timestamp
      return resolutionTime - errorTime;
    });

    const averageResolutionTime =
      resolutionTimes.length > 0
        ? resolutionTimes.reduce((sum, time) => sum + time, 0) /
          resolutionTimes.length
        : 0;

    this.analytics = {
      totalErrors: recentReports.length,
      errorsByType,
      errorsBySeverity,
      errorTrends,
      topErrors,
      resolutionRate,
      averageResolutionTime
    };

    return this.analytics;
  }

  private getErrorCountInTimeframe(timeframe: number): number {
    const cutoff = Date.now() - timeframe;
    return this.reports.filter(
      report => new Date(report.context.timestamp).getTime() > cutoff
    ).length;
  }

  private calculateGrowthRate(
    currentTimeframe: number,
    previousTimeframe: number
  ): number {
    const currentCount = this.getErrorCountInTimeframe(currentTimeframe);
    const previousCount =
      this.getErrorCountInTimeframe(previousTimeframe) - currentCount;

    if (previousCount === 0) return currentCount > 0 ? 100 : 0;
    return ((currentCount - previousCount) / previousCount) * 100;
  }

  private saveReport(report: ErrorReport): void {
    const reportPath = join(this.outputDirectory, `error-${report.id}.json`);
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
  }

  getReports(filter?: Partial<ErrorDetails>): ErrorReport[] {
    if (!filter) return [...this.reports];

    return this.reports.filter(report => {
      if (filter.type && report.error.type !== filter.type) return false;
      if (filter.severity && report.error.severity !== filter.severity)
        return false;
      if (filter.code && report.error.code !== filter.code) return false;
      return true;
    });
  }

  markResolved(reportId: string, resolution: string): boolean {
    const report = this.reports.find(r => r.id === reportId);
    if (!report) return false;

    report.resolution = resolution;
    this.saveReport(report);
    return true;
  }

  exportReports(format: 'json' | 'csv' | 'xml' = 'json'): string {
    const analytics = this.generateAnalytics();

    const exportData = {
      metadata: {
        exportTime: new Date().toISOString(),
        totalReports: this.reports.length,
        format
      },
      analytics,
      reports: this.reports
    };

    const fileName = `error-export-${Date.now()}.${format}`;
    const filePath = join(this.outputDirectory, fileName);

    if (format === 'json') {
      writeFileSync(filePath, JSON.stringify(exportData, null, 2));
    } else if (format === 'csv') {
      const csvContent = this.convertToCSV(this.reports);
      writeFileSync(filePath, csvContent);
    } else if (format === 'xml') {
      const xmlContent = this.convertToXML(exportData);
      writeFileSync(filePath, xmlContent);
    }

    return filePath;
  }

  private convertToCSV(reports: ErrorReport[]): string {
    const headers = [
      'ID',
      'Timestamp',
      'TestSuite',
      'TestCase',
      'ErrorType',
      'Severity',
      'Code',
      'Message',
      'Reproducible',
      'Resolution',
      'Tags'
    ];

    const rows = reports.map(report => [
      report.id,
      report.context.timestamp,
      report.context.testSuite,
      report.context.testCase,
      report.error.type,
      report.error.severity,
      report.error.code,
      `"${report.error.message.replace(/"/g, '""')}"`,
      report.reproducible,
      report.resolution || '',
      report.tags.join(';')
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private convertToXML(data: unknown): string {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
    const xmlContent = this.objectToXML(data, 'errorExport');
    return xmlHeader + xmlContent;
  }

  private objectToXML(obj: Record<string, unknown>, rootName = 'root'): string {
    const indent = '  ';

    const toXML = (value: unknown, key: string, level = 0): string => {
      const indentation = indent.repeat(level);

      if (Array.isArray(value)) {
        return value.map(item => toXML(item, key, level)).join('');
      }

      if (typeof value === 'object' && value !== null) {
        const children = Object.entries(value)
          .map(([k, v]) => toXML(v, k, level + 1))
          .join('');
        return `${indentation}<${key}>\n${children}${indentation}</${key}>\n`;
      }

      const escapedValue = String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

      return `${indentation}<${key}>${escapedValue}</${key}>\n`;
    };

    return toXML(obj, rootName);
  }

  enableReporting(): void {
    this.reportingEnabled = true;
  }

  disableReporting(): void {
    this.reportingEnabled = false;
  }

  clear(): void {
    this.reports = [];
    this.analytics = null;
  }

  // Integration with Jest/Testing Framework
  static createJestReporter(outputDir?: string): EnhancedErrorReporter {
    const reporter = new EnhancedErrorReporter(outputDir);

    // Add to global test environment
    (global as Record<string, unknown>).__errorReporter = reporter;

    return reporter;
  }

  // Helper method for test assertions
  static expectNoErrors(testSuite: string): void {
    const reporter = (global as Record<string, unknown>)
      .__errorReporter as EnhancedErrorReporter;
    if (!reporter) return;

    const errors = reporter
      .getReports()
      .filter(report => report.context.testSuite === testSuite);

    if (errors.length > 0) {
      const errorMessages = errors.map(
        e => `${e.error.code}: ${e.error.message}`
      );
      throw new Error(
        `Expected no errors in test suite "${testSuite}", but found ${errors.length} errors:\n` +
          errorMessages.join('\n')
      );
    }
  }

  // Utility for creating error context
  static createContext(
    testSuite: string,
    testCase: string,
    environment = 'test'
  ): ErrorContext {
    return {
      testSuite,
      testCase,
      timestamp: new Date().toISOString(),
      environment,
      executionId: `exec-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
    };
  }
}

// Global error reporter instance
export const globalErrorReporter = new EnhancedErrorReporter();

// Export for use in tests
export default {
  EnhancedErrorReporter,
  ErrorClassifier,
  globalErrorReporter
};
