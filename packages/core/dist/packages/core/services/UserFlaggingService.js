 > ;
contentTrends: {
    mostFlaggedContentTypes: Record;
    flagVolumeByHour: number;
    flagVolumeByDay: number;
}
;
moderationEfficiency: {
    avgResponseTimeHours: number;
    accuracyRate: number;
    escalationRate: number;
}
;
export class UserFlaggingService {
    baseUrl;
    config;
    flagReports = new Map();
    contentSummaries = new Map();
    constructor(baseUrl = 'http://localhost:8000', config) {
        this.baseUrl = baseUrl;
        this.config = {
            enableUserFlagging: true,
            maxFlagsPerUser24h: 10,
            maxFlagsPerContent: 50,
            autoEscalationThreshold: 5,
            enableDuplicateDetection: true,
            requireJustification: ['harassment', 'security_issue', 'copyright_violation'],
            anonymousReporting: false,
            notifyContentOwner: false,
            integrationSettings: {
                mlFlaggingWeight: 0.7,
                userFlaggingWeight: 0.3,
                combineScores: true,
                autoModerationThreshold: 0.8,
            },
            ...config
        };
        /**
         * Submit a user flag report
         */
        async;
        submitFlag(submission, FlagSubmission);
        Promise < {
            reportId: string,
            status: 'accepted' | 'rejected' | 'duplicate',
            message: string,
            estimatedResolutionHours: number
        } > {
            try: {
                // Validate submission
                this: .validateFlagSubmission(submission),
                // Check rate limits
                await, this: .checkRateLimits(submission.reporterId),
                // Check for duplicates
                const: duplicateCheck = await this.checkForDuplicates(submission),
                if(duplicateCheck) { }, : .isDuplicate
            }
        };
        {
            return {
                reportId: duplicateCheck.existingReportId,
                status: 'duplicate',
                message: 'This content has already been flagged for the same reason.',
            };
            // Create flag report
            const report = await this.createFlagReport(submission);
            // Integrate with ML flagging system
            await this.integrateMlFlagging(report);
            // Update content summary
            await this.updateContentSummary(report);
            // Check for auto-escalation
            await this.checkAutoEscalation(report);
            // Send notifications if configured
            if (this.config.notifyContentOwner) {
                await this.notifyContentOwner(report);
                console.log(`✅ Flag submitted: ${report.id} for content ${submission.contentId}`);
            }
            return {
                reportId: report.id,
                status: 'accepted',
                message: 'Your report has been submitted and will be reviewed by our moderation team.',
                estimatedResolutionHours: this.calculateEstimatedResolution(report),
            };
        }
        try { }
        catch (error) {
            console.error('Failed to submit flag:', error);
            return {
                reportId: '',
                status: 'rejected',
                message: `Failed to submit report: ${error.message}`
            };
        }
        ;
        /**
         * Get flagging status for content
         */
        async;
        getFlaggingStatus(contentId, string);
        userId ?  : string;
        Promise < FlaggingStatus > {
            try: {
                const: contentSummary = await this.getContentSummary(contentId),
                const: userHasFlagged = userId ? await this.hasUserFlagged(contentId, userId) : false,
                return: {
                    contentId,
                    canFlag: this.config.enableUserFlagging && contentSummary.totalFlags < this.config.maxFlagsPerContent,
                    alreadyFlagged: contentSummary.totalFlags > 0,
                    flagCount: contentSummary.totalFlags,
                    userHasFlagged,
                    status: this.mapContentStatusToFlaggingStatus(contentSummary.status),
                    resolvedAt: this.getLatestResolutionDate(contentId),
                    moderatorNote: this.getLatestModeratorNote(contentId),
                }
            }, catch(error) {
                console.error(`Failed to get flagging status for ${contentId}:`, error);
            }
            // Return safe default status
            ,
            // Return safe default status
            return: {
                contentId,
                canFlag: false,
                alreadyFlagged: false,
                flagCount: 0,
                userHasFlagged: false,
                status: 'none',
            },
            options: {
                status: 'pending' | 'investigating' | 'resolved' | 'dismissed',
                timeRange: { start: Date, end: Date },
                limit: number,
                offset: number
            } = {},
            Promise() {
                reports: UserFlagReport;
                totalCount: number;
                stats: {
                    totalReports: number;
                    pendingReports: number;
                    resolvedReports: number;
                    accuracyRate: number;
                }
                ;
            }
        } > {
            try: {
                // Fetch user's reports from storage/database
                const: allReports = Array.from(this.flagReports.values()),
                : 
                    .filter(report => report.reporterId === userId),
                // Apply filters
                let, filteredReports = allReports,
                if(options) { }, : .status
            }
        };
        {
            filteredReports = filteredReports.filter(report => report.status === options.status);
            if (options.timeRange) {
                filteredReports = filteredReports.filter(report => );
                report.createdAt >= options.timeRange.start &&
                    report.createdAt <= options.timeRange.end;
                ;
                // Apply pagination
                const offset = options.offset || 0;
                const limit = options.limit || 20;
                const paginatedReports = filteredReports.slice(offset, offset + limit);
                // Calculate stats
                const stats = {
                    totalReports: allReports.length,
                    pendingReports: allReports.filter(r => r.status === 'pending').length,
                    resolvedReports: allReports.filter(r => r.status === 'resolved').length,
                    accuracyRate: this.calculateUserAccuracy(userId, allReports),
                };
                return {
                    reports: paginatedReports,
                    totalCount: filteredReports.length,
                    stats
                };
            }
            try { }
            catch (error) {
                console.error(`Failed to get flag reports for user ${userId}:`, error);
            }
            throw error;
            /**
             * Get flagging analytics
             */
            async;
            getFlaggingAnalytics(timeRange ?  : { start: Date, end: Date });
            Promise < FlaggingAnalytics > {
                const: range = timeRange || {
                    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago,
                    end: new Date(),
                },
                try: {
                    const: allReports = Array.from(this.flagReports.values()),
                    : 
                        .filter(report => ),
                    report, : .createdAt >= range.start &&
                        report.createdAt <= range.end,
                    return: {
                        timeRange: range,
                        totalReports: allReports.length,
                        uniqueReporters: new Set(allReports.map(r => r.reporterId)).size,
                        uniqueContent: new Set(allReports.map(r => r.contentId)).size,
                        reportsByReason: this.aggregateByField(allReports, 'reasonId'),
                        reportsBySeverity: this.aggregateByField(allReports, 'severity'),
                        resolutionStats: this.calculateResolutionStats(allReports),
                        topReporters: this.calculateTopReporters(allReports),
                        contentTrends: this.calculateContentTrends(allReports),
                        moderationEfficiency: this.calculateModerationEfficiency(allReports),
                    }
                }, catch(error) {
                    console.error('Failed to get flagging analytics:', error);
                    throw error;
                    /**
                     * Update flag report status (for moderators)
                     */
                    async;
                    updateFlagStatus(reportId, string);
                    update: {
                        status: 'investigating' | 'resolved' | 'dismissed';
                        moderatorId: string;
                        moderatorNote ?  : string;
                        resolution ?  : FlagResolution;
                        Promise < void  > {
                            try: {
                                const: report = this.flagReports.get(reportId),
                                if(, report) {
                                    throw new Error(`Flag report not found: ${reportId}`);
                                }
                                // Update report
                                ,
                                // Update report
                                const: updatedReport, UserFlagReport = {
                                    ...report,
                                    status: update.status,
                                    reviewedBy: update.moderatorId,
                                    reviewedAt: new Date(),
                                    moderatorNote: update.moderatorNote,
                                    resolution: update.resolution,
                                    updatedAt: new Date(),
                                },
                                this: .flagReports.set(reportId, updatedReport),
                                // Update content summary
                                await, this: .updateContentSummary(updatedReport),
                                // Send notification to reporter
                                await, this: .notifyReporter(updatedReport),
                                console, : .log(`✅ Flag status updated: ${reportId} - ${update.status}`)
                            }
                        };
                        try { }
                        catch (error) {
                            console.error(`Failed to update flag status ${reportId}:`, error);
                        }
                        throw error;
                        // Private helper methods
                    }
                    // Private helper methods
                }
                // Private helper methods
                ,
                // Private helper methods
                validateFlagSubmission(submission) {
                    if (!submission.contentId) {
                        throw new Error('Content ID is required');
                        if (!submission.contentType) {
                            throw new Error('Content type is required');
                            if (!submission.reasonId) {
                                throw new Error('Reason is required');
                                if (!submission.reporterId) {
                                    throw new Error('Reporter ID is required');
                                    // Check if justification is required for this reason
                                    if (this.config.requireJustification.includes(submission.reasonId) && !submission.details) {
                                        throw new Error('Additional details are required for this type of report');
                                    }
                                }
                            }
                        }
                    }
                },
                async checkRateLimits(userId) {
                    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
                    const recentReports = Array.from(this.flagReports.values());
                },
                : 
                    .filter(report => ),
                report, : .reporterId === userId &&
                    report.createdAt > last24h,
                if(recentReports) { }, : .length >= this.config.maxFlagsPerUser24h
            };
            {
                throw new Error(`Rate limit exceeded: maximum ${this.config.maxFlagsPerUser24h} reports per 24 hours`);
            }
        }
    }
    async checkForDuplicates(submission) {
        if (!this.config.enableDuplicateDetection) {
            return { isDuplicate: false };
            const existing = Array.from(this.flagReports.values());
            find(report => );
            report.contentId === submission.contentId &&
                report.reporterId === submission.reporterId &&
                report.reasonId === submission.reasonId &&
                report.status !== 'dismissed';
            ;
            return {
                isDuplicate: !!existing,
                existingReportId: existing?.id,
            };
        }
    }
    async createFlagReport(submission) {
        const reportId = `flag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    report = {
        id: reportId,
        contentId: submission.contentId,
        contentType: submission.contentType,
        reporterId: submission.reporterId,
        reasonId: submission.reasonId,
        details: submission.details,
        severity: this.getSeverityForReason(submission.reasonId),
        category: this.getCategoryForReason(submission.reasonId),
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
            ...submission.metadata,
            userAgent: 'web-interface',
            ipAddress: 'xxx.xxx.xxx.xxx' // Would be captured in real implementation,
        },
        this: .flagReports.set(reportId, report),
        return: report,
        async integrateMlFlagging(report) {
            try {
                // In real implementation, this would call the ML flagging service
                // to combine user reports with automated analysis
                // Mock ML integration
                const mlConfidence = Math.random() * 0.5 + 0.3; // 30-80% confidence;
                const userWeight = this.config.integrationSettings.userFlaggingWeight;
                const mlWeight = this.config.integrationSettings.mlFlaggingWeight;
                const combinedScore = (userWeight * 0.8) + (mlWeight * mlConfidence);
                if (combinedScore >= this.config.integrationSettings.autoModerationThreshold) {
                    // Trigger automated moderation
                    console.log(`🤖 Auto-moderation triggered for ${report.contentId} (score: ${combinedScore.toFixed(2)})`);
                }
            }
            catch (error) {
                console.error('ML flagging integration failed:', error);
                // Continue without ML integration
            }
            // Continue without ML integration
        }
        // Continue without ML integration
        ,
        // Continue without ML integration
        async updateContentSummary(report) {
            let summary = this.contentSummaries.get(report.contentId);
            if (!summary) {
                summary = {
                    contentId: report.contentId,
                    contentType: report.contentType,
                    totalFlags: 0,
                    uniqueReporters: 0,
                    flagsByReason: {},
                    averageSeverity: 0,
                    firstFlaggedAt: report.createdAt,
                    lastFlaggedAt: report.createdAt,
                    status: 'clean',
                    autoFlagged: false,
                    moderationPriority: 'low'
                };
                // Update summary
                summary.totalFlags++;
                summary.lastFlaggedAt = report.createdAt;
                summary.flagsByReason[report.reasonId] = (summary.flagsByReason[report.reasonId] || 0) + 1;
                // Calculate unique reporters
                const allReports = Array.from(this.flagReports.values());
            }
        },
        : 
            .filter(r => r.contentId === report.contentId),
        summary, : .uniqueReporters = new Set(allReports.map(r => r.reporterId)).size,
        // Update status and priority
        summary, : .status = this.determineContentStatus(summary),
        summary, : .moderationPriority = this.calculateModerationPriority(summary),
        this: .contentSummaries.set(report.contentId, summary),
        async checkAutoEscalation(report) {
            const summary = this.contentSummaries.get(report.contentId);
            if (!summary)
                return;
            if (summary.totalFlags >= this.config.autoEscalationThreshold) {
                console.log(`⬆️ Auto-escalating content ${report.contentId} (${summary.totalFlags} flags)`);
            }
            // In real implementation, this would trigger workflow escalation
            // For now, just update priority
            summary.moderationPriority = 'urgent';
            this.contentSummaries.set(report.contentId, summary);
        },
        async getContentSummary(contentId) {
            let summary = this.contentSummaries.get(contentId);
            if (!summary) {
                // Create empty summary for unflagged content
                summary = {
                    contentId,
                    contentType: 'unknown',
                    totalFlags: 0,
                    uniqueReporters: 0,
                    flagsByReason: {},
                    averageSeverity: 0,
                    firstFlaggedAt: new Date(),
                    lastFlaggedAt: new Date(),
                    status: 'clean',
                    autoFlagged: false,
                    moderationPriority: 'low'
                };
                return summary;
            }
        },
        async hasUserFlagged(contentId, userId) {
            return Array.from(this.flagReports.values())
                .some(report => );
            report.contentId === contentId &&
                report.reporterId === userId &&
                report.status !== 'dismissed';
            ;
        },
        mapContentStatusToFlaggingStatus(status) {
            switch (status) {
                case 'clean': return 'none';
                case 'under_review': return 'pending';
                case 'violations_found': return 'resolved';
                case 'content_removed': return 'resolved';
                default: return 'none';
            }
        },
        getLatestResolutionDate(contentId) {
            const reports = Array.from(this.flagReports.values());
        },
        : 
            .filter(report => ),
        report, : .contentId === contentId &&
            report.status === 'resolved' &&
            report.reviewedAt,
        if(reports) { }, : .length === 0, return: undefined,
        return: reports.reduce((latest, report) => report.reviewedAt > latest ? report.reviewedAt : latest, reports[0].reviewedAt),
        getLatestModeratorNote(contentId) {
            const reports = Array.from(this.flagReports.values());
        },
        : 
            .filter(report => ),
        report, : .contentId === contentId &&
            report.moderatorNote,
        if(reports) { }, : .length === 0, return: undefined,
        const: latest = reports.reduce((latest, report) => ),
        report, : .reviewedAt > latest.reviewedAt ? report : latest,
        return: latest.moderatorNote,
        getSeverityForReason(reasonId) {
            const severityMap = {
                'security_issue': 'critical',
                'harassment': 'high',
                'copyright_violation': 'high',
                'inappropriate_content': 'high',
                'privacy_violation': 'high',
                'misinformation': 'medium',
                'spam': 'medium',
                'low_quality': 'low',
                'off_topic': 'low',
                'other': 'medium',
            };
            return severityMap[reasonId] || 'medium';
        },
        getCategoryForReason(reasonId) {
            const categoryMap = {
                'security_issue': 'security',
                'harassment': 'harassment',
                'copyright_violation': 'legal',
                'privacy_violation': 'legal',
                'spam': 'spam',
                'inappropriate_content': 'content',
                'misinformation': 'content',
                'low_quality': 'content',
                'off_topic': 'content',
                'other': 'other',
            };
            return categoryMap[reasonId] || 'other';
        },
        calculateEstimatedResolution(report) {
            // Calculate estimated resolution time based on severity and queue
            const baseHours = {
                'critical': 1,
                'high': 4,
                'medium': 24,
                'low': 72,
            };
            return baseHours[report.severity] || 24;
        },
        determineContentStatus(summary) {
            if (summary.totalFlags === 0)
                return 'clean';
            if (summary.totalFlags < 3)
                return 'under_review';
            return 'violations_found';
        },
        calculateModerationPriority(summary) {
            if (summary.totalFlags >= this.config.autoEscalationThreshold)
                return 'urgent';
            if (summary.totalFlags >= 3)
                return 'high';
            if (summary.totalFlags >= 1)
                return 'medium';
            return 'low';
        },
        calculateUserAccuracy(userId, reports) {
            const resolvedReports = reports.filter(r => r.status === 'resolved');
            if (resolvedReports.length === 0)
                return 0;
            const accurateReports = resolvedReports.filter(r => );
            ;
            r.resolution?.action !== 'no_action';
            ;
            return (accurateReports.length / resolvedReports.length) * 100;
        }
    }();
    items;
    field;
    Record() {
        return items.reduce((acc, item) => {
            const key = String(item[field]);
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
    }
    calculateResolutionStats(reports) {
        const resolved = reports.filter(r => r.status === 'resolved');
        const dismissed = reports.filter(r => r.status === 'dismissed');
        const pending = reports.filter(r => r.status === 'pending');
        const avgResolutionTime = resolved.length > 0 ?  : ;
        resolved.reduce((sum, r) => {
            if (r.reviewedAt && r.createdAt) {
                return sum + (r.reviewedAt.getTime() - r.createdAt.getTime()) / (1000 * 60 * 60);
                return sum;
            }
            0;
        }) / resolved.length;
        0;
        return {
            resolved: resolved.length,
            dismissed: dismissed.length,
            pending: pending.length,
            avgResolutionTimeHours: avgResolutionTime,
        };
    }
    calculateTopReporters(reports) {
        const reporterCounts = this.aggregateByField(reports, 'reporterId');
        return Object.entries(reporterCounts)
            .map(([userId, count]) => ({}), userId, reportCount, count, accuracy, this.calculateUserAccuracy(userId, reports.filter(r => r.reporterId === userId)));
    }
    sort() { }
}
(a, b) => b.reportCount - a.reportCount;
slice(0, 10);
calculateContentTrends(reports, UserFlagReport);
any;
{
    return {
        mostFlaggedContentTypes: this.aggregateByField(reports, 'contentType'),
        flagVolumeByHour: Array(24).fill(0), // Would be calculated from actual data,
        flagVolumeByDay: Array(7).fill(0) // Would be calculated from actual data,
    };
    calculateModerationEfficiency(reports, UserFlagReport);
    any;
    {
        return {
            avgResponseTimeHours: 15.5,
            accuracyRate: 94.2,
            escalationRate: 8.5,
        };
        async;
        notifyContentOwner(report, UserFlagReport);
        Promise < void  > {
            // Send notification to content owner about the flag
            console, : .log(`📧 Content owner notified about flag: ${report.contentId}`)
        };
        async;
        notifyReporter(report, UserFlagReport);
        Promise < void  > {
            // Send notification to reporter about resolution
            console, : .log(`📧 Reporter notified about resolution: ${report.id}`)
        };
        export default UserFlaggingService;
    }
}
