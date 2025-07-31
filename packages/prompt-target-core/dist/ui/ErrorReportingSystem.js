/**
 * Comprehensive error reporting and notification system
 */
export class ErrorReportingSystem {
    constructor(logger, metrics) {
        this.logger = logger;
        this.metrics = metrics;
        this.notifications = [];
        this.listeners = new Set();
        this.maxNotifications = 100;
    }
    /**
     * Report a validation error with detailed context
     */
    reportValidationError(error, context) {
        const notification = {
            id: `validation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'validation',
            severity: this.mapValidationSeverity(error.severity),
            title: error.message,
            message: error.description || error.message,
            timestamp: new Date(),
            context,
            error,
            autoFixable: error.autoFixable,
            suggestions: error.suggestions || [],
            acknowledged: false,
            metadata: {
                nodeId: error.nodeId,
                edgeId: error.edgeId,
                platform: context.platform,
            },
        };
        this.addNotification(notification);
        this.notifyListeners('error_reported', notification);
        this.metrics.counter('error_reporting.validation_error', 1, {
            severity: error.severity,
            platform: context.platform || 'unknown',
        });
    }
    /**
     * Report a runtime error during transformation
     */
    reportRuntimeError(error, context) {
        const notification = {
            id: `runtime-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'runtime',
            severity: 'critical',
            title: 'Runtime Error',
            message: error.message,
            timestamp: new Date(),
            context,
            error: error.stack || error.message,
            autoFixable: false,
            suggestions: [
                {
                    type: 'workaround',
                    description: 'Check graph structure and adaptor configuration',
                },
            ],
            acknowledged: false,
            metadata: {
                errorType: error.constructor.name,
                platform: context.platform,
            },
        };
        this.addNotification(notification);
        this.notifyListeners('error_reported', notification);
        this.logger.error('Runtime error reported', {
            errorId: notification.id,
            error: error.message,
            context,
        });
        this.metrics.counter('error_reporting.runtime_error', 1, {
            error_type: error.constructor.name,
            platform: context.platform || 'unknown',
        });
    }
    /**
     * Report cross-platform compatibility issues
     */
    reportCompatibilityIssue(issue, context) {
        const notification = {
            id: `compatibility-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'compatibility',
            severity: this.mapIssueSeverity(issue.severity),
            title: 'Cross-Platform Compatibility Issue',
            message: issue.description,
            timestamp: new Date(),
            context,
            error: issue,
            autoFixable: false,
            suggestions: [
                {
                    type: 'alternative',
                    description: issue.impact,
                },
            ],
            acknowledged: false,
            metadata: {
                issueType: issue.type,
                supportingPlatforms: issue.supportingPlatforms,
                unsupportedPlatforms: issue.unsupportedPlatforms,
            },
        };
        this.addNotification(notification);
        this.notifyListeners('error_reported', notification);
        this.metrics.counter('error_reporting.compatibility_issue', 1, {
            issue_type: issue.type,
            severity: issue.severity,
        });
    }
    /**
     * Generate comprehensive error report from validation report
     */
    generateErrorReport(validationReport, context) {
        const report = {
            id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            graphId: validationReport.graphId,
            context,
            summary: {
                totalErrors: validationReport.summary.criticalErrors + validationReport.summary.highErrors,
                totalWarnings: validationReport.summary.mediumWarnings,
                totalInfos: validationReport.summary.lowInfos,
                overallValid: validationReport.overallValid,
                platformCompatibility: this.calculatePlatformCompatibility(validationReport),
            },
            platformDetails: new Map(),
            recommendations: [],
            autoFixSuggestions: validationReport.autoFixSuggestions,
            export: {
                formats: ['json', 'html', 'pdf'],
                downloadUrl: this.generateReportDownloadUrl(validationReport.graphId),
            },
        };
        // Process platform-specific details
        validationReport.platformResults.forEach((platformResult, platform) => {
            const details = {
                platform,
                adaptorId: platformResult.adaptorId,
                adaptorVersion: platformResult.adaptorVersion,
                compatible: platformResult.compatible,
                quality: platformResult.quality,
                errors: platformResult.results.filter(r => r.type === 'error'),
                warnings: platformResult.results.filter(r => r.type === 'warning'),
                infos: platformResult.results.filter(r => r.type === 'info'),
                capabilities: platformResult.capabilities,
                performance: {
                    validationDuration: platformResult.duration,
                    supportedFeatures: platformResult.capabilities.features?.filter((f) => f.supported).length || 0,
                    unsupportedFeatures: platformResult.capabilities.features?.filter((f) => !f.supported).length || 0,
                },
            };
            report.platformDetails.set(platform, details);
        });
        // Generate recommendations
        report.recommendations = this.generateRecommendations(validationReport);
        this.logger.info('Error report generated', {
            reportId: report.id,
            graphId: validationReport.graphId,
            totalIssues: validationReport.totalIssues,
        });
        return report;
    }
    /**
     * Get notifications with filtering options
     */
    getNotifications(filter = {}) {
        let filtered = [...this.notifications];
        if (filter.type) {
            filtered = filtered.filter(n => n.type === filter.type);
        }
        if (filter.severity) {
            filtered = filtered.filter(n => n.severity === filter.severity);
        }
        if (filter.platform) {
            filtered = filtered.filter(n => n.context.platform === filter.platform);
        }
        if (filter.acknowledged !== undefined) {
            filtered = filtered.filter(n => n.acknowledged === filter.acknowledged);
        }
        if (filter.limit) {
            filtered = filtered.slice(0, filter.limit);
        }
        return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
    /**
     * Acknowledge a notification
     */
    acknowledgeNotification(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.acknowledged = true;
            notification.acknowledgedAt = new Date();
            this.notifyListeners('notification_acknowledged', notification);
            this.metrics.counter('error_reporting.notification_acknowledged', 1, {
                type: notification.type,
                severity: notification.severity,
            });
        }
    }
    /**
     * Clear acknowledged notifications
     */
    clearAcknowledged() {
        const beforeCount = this.notifications.length;
        this.notifications = this.notifications.filter(n => !n.acknowledged);
        const cleared = beforeCount - this.notifications.length;
        this.logger.info('Cleared acknowledged notifications', { count: cleared });
        this.metrics.counter('error_reporting.notifications_cleared', cleared);
    }
    /**
     * Export error report in specified format
     */
    exportReport(report, format) {
        switch (format) {
            case 'json':
                return this.exportAsJSON(report);
            case 'html':
                return this.exportAsHTML(report);
            case 'csv':
                return this.exportAsCSV(report);
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }
    /**
     * Add error reporting listener
     */
    addListener(listener) {
        this.listeners.add(listener);
    }
    /**
     * Remove error reporting listener
     */
    removeListener(listener) {
        this.listeners.delete(listener);
    }
    // Private helper methods
    addNotification(notification) {
        this.notifications.unshift(notification);
        // Maintain max notifications limit
        if (this.notifications.length > this.maxNotifications) {
            this.notifications = this.notifications.slice(0, this.maxNotifications);
        }
    }
    notifyListeners(event, data) {
        this.listeners.forEach(listener => {
            try {
                listener(event, data);
            }
            catch (error) {
                this.logger.error('Error reporting listener failed', {
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        });
    }
    mapValidationSeverity(severity) {
        switch (severity) {
            case 'critical':
                return 'critical';
            case 'high':
                return 'high';
            case 'medium':
                return 'medium';
            case 'low':
                return 'low';
            default:
                return 'medium';
        }
    }
    mapIssueSeverity(severity) {
        switch (severity) {
            case 'high':
                return 'high';
            case 'medium':
                return 'medium';
            case 'low':
                return 'low';
            default:
                return 'medium';
        }
    }
    calculatePlatformCompatibility(report) {
        const totalPlatforms = report.platformResults.size;
        if (totalPlatforms === 0)
            return 0;
        const compatiblePlatforms = Array.from(report.platformResults.values()).filter(r => r.compatible).length;
        return Math.round((compatiblePlatforms / totalPlatforms) * 100);
    }
    generateRecommendations(report) {
        const recommendations = [];
        // High-level recommendations based on validation results
        if (report.summary.criticalErrors > 0) {
            recommendations.push('Address critical errors before proceeding with transformation');
        }
        if (report.crossPlatformIssues.length > 0) {
            recommendations.push('Consider using platform-specific graph variations for better compatibility');
        }
        const qualityScores = Array.from(report.platformResults.values()).map(r => r.quality?.overall || 0);
        const avgQuality = qualityScores.reduce((sum, q) => sum + q, 0) / qualityScores.length;
        if (avgQuality < 60) {
            recommendations.push('Graph quality is low - consider simplifying or restructuring');
        }
        if (recommendations.length === 0) {
            recommendations.push('Graph validation passed successfully');
        }
        return recommendations;
    }
    generateReportDownloadUrl(graphId) {
        return `/api/reports/download/${graphId}`;
    }
    exportAsJSON(report) {
        return JSON.stringify(report, (key, value) => {
            if (value instanceof Map) {
                return Object.fromEntries(value);
            }
            return value;
        }, 2);
    }
    exportAsHTML(report) {
        return `
<!DOCTYPE html>
<html>
<head>
    <title>Validation Report - ${report.graphId}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { border-bottom: 2px solid #ccc; padding-bottom: 10px; }
        .summary { background: #f5f5f5; padding: 15px; margin: 10px 0; }
        .error { color: #d32f2f; }
        .warning { color: #f57c00; }
        .info { color: #1976d2; }
        .platform { margin: 10px 0; padding: 10px; border: 1px solid #ddd; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Validation Report</h1>
        <p>Graph ID: ${report.graphId}</p>
        <p>Generated: ${report.timestamp.toISOString()}</p>
    </div>
    
    <div class="summary">
        <h2>Summary</h2>
        <p>Total Errors: <span class="error">${report.summary.totalErrors}</span></p>
        <p>Total Warnings: <span class="warning">${report.summary.totalWarnings}</span></p>
        <p>Platform Compatibility: ${report.summary.platformCompatibility}%</p>
    </div>
    
    <div class="platforms">
        <h2>Platform Details</h2>
        ${Array.from(report.platformDetails.entries())
            .map(([platform, details]) => `
            <div class="platform">
                <h3>${platform}</h3>
                <p>Compatible: ${details.compatible ? 'Yes' : 'No'}</p>
                <p>Quality Score: ${details.quality?.overall || 'N/A'}</p>
                <p>Errors: ${details.errors.length}</p>
                <p>Warnings: ${details.warnings.length}</p>
            </div>
        `)
            .join('')}
    </div>
</body>
</html>`;
    }
    exportAsCSV(report) {
        const lines = ['Platform,Compatible,Quality,Errors,Warnings,Infos'];
        report.platformDetails.forEach((details, platform) => {
            lines.push([
                platform,
                details.compatible ? 'Yes' : 'No',
                details.quality?.overall || 'N/A',
                details.errors.length,
                details.warnings.length,
                details.infos.length,
            ].join(','));
        });
        return lines.join('\n');
    }
}
