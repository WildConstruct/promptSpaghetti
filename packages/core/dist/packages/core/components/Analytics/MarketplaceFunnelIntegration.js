import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Marketplace Funnel Integration - Story 30.2 Task 8
 *
 * Integration component that embeds funnel insights into marketplace optimization tools,
 * providing seamless access to conversion analytics within the marketplace interface.
 *
 * Features:
 * - Embedded funnel widgets for marketplace dashboards
 * - Real-time conversion metrics display
 * - Integration with template performance analytics
 * - Creator-facing optimization recommendations
 * - Automated suggestion system integration
 * - Cross-platform analytics synchronization
 * - Performance impact indicators
 * - Revenue attribution displays
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { FunnelChart } from './FunnelChart';
import { FunnelOptimizationEngine } from './FunnelOptimizationEngine';
// Default widget configuration
const defaultWidgetConfig = {
    widgets: ['conversion_summary', 'performance_chart', 'optimization_recommendations'],
    layout: {
        columns: 3,
        rows: 2,
        responsive: true,
        spacing: 16,
        widgetSizes: {
            'conversion_summary': { width: 1, height: 1, resizable: false },
            'performance_chart': { width: 2, height: 1, resizable: true },
            'optimization_recommendations': { width: 3, height: 1, resizable: true },
            'anomaly_alerts': { width: 1, height: 1, resizable: false },
            'attribution_insights': { width: 2, height: 1, resizable: true },
            'predictive_forecast': { width: 2, height: 1, resizable: true },
            'template_performance': { width: 1, height: 1, resizable: false },
            'creator_dashboard': { width: 3, height: 2, resizable: true }
        }
    },
    refreshInterval: 30000, // 30 seconds
    compactMode: false,
    theme: 'auto',
    customizations: []
};
export const MarketplaceFunnelIntegration = ({ marketplaceData, funnelConfig, onIntegrationUpdate, onSyncComplete }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeWidget, setActiveWidget] = useState(widgetConfig.widgets[0]);
    const [refreshing, setRefreshing] = useState(false);
    const intervalRef = useRef(null);
    // Load integration data
    const loadIntegrationData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const query = {
                funnelId: funnelDefinition.id,
                timeRange: { start: Date.now() - 30 * 24 * 60 * 60 * 1000, end: Date.now() },
                segments: [],
                cohorts: [],
                metrics: ['marketplace_integration', 'template_performance', 'creator_optimization'],
                aggregation: 'marketplace',
                filters: [
                    { field: 'marketplace_id', operator: 'eq', value: marketplaceContext.marketplaceId },
                    { field: 'user_role', operator: 'eq', value: userRole }
                ]
            };
            if (marketplaceContext.templateContext) {
                query.filters?.push({ field: 'template_id',
                    operator: 'eq',
                    value: marketplaceContext.templateContext.templateId });
            }
            if (marketplaceContext.creatorContext) {
                query.filters?.push({ field: 'creator_id',
                    operator: 'eq',
                    value: marketplaceContext.creatorContext.creatorId });
            }
            const result = await analyticsInfrastructure.executeQuery(query);
            if (result.success && result.data) {
                const processedData = await processIntegrationData(result.data, marketplaceContext, userRole);
                setIntegrationData(processedData);
            }
            else {
                setError(result.error || 'Failed to load marketplace integration data');
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        }
        finally {
            setLoading(false);
        }
    }, [funnelDefinition, analyticsInfrastructure, marketplaceContext, userRole]);
    // Process integration data
    const processIntegrationData = async (rawData, context, role) => {
        // Simulate comprehensive marketplace integration processing
        return {
            funnelSummary: generateFunnelSummary(),
            templateInsights: context.templateContext ? generateTemplateInsights(context.templateContext) : [],
            creatorOptimizations: context.creatorContext ? generateCreatorOptimizations(context.creatorContext) : [],
            marketplaceMetrics: generateMarketplaceMetrics(),
            recommendedActions: generateRecommendedActions(role),
            performanceAlerts: generatePerformanceAlerts(),
            integrationHealth: generateIntegrationHealth()
        };
    };
    // Generate funnel summary
    const generateFunnelSummary = () => {
        return {
            overallConversionRate: 0.145,
            totalConversions: 2847,
            totalRevenue: 156780,
            averageOrderValue: 55.12,
            topPerformingSteps: [
                {
                    stepId: 'checkout',
                    stepName: 'Checkout Process',
                    conversionRate: 0.89,
                    dropOffRate: 0.11,
                    averageTimeSpent: 120,
                    performanceRank: 1,
                    optimizationPotential: 0.05
                },
                {
                    stepId: 'template_preview',
                    stepName: 'Template Preview',
                    conversionRate: 0.76,
                    dropOffRate: 0.24,
                    averageTimeSpent: 180,
                    performanceRank: 2,
                    optimizationPotential: 0.12
                }
            ],
            bottomleneckSteps: [
                {
                    stepId: 'registration',
                    stepName: 'User Registration',
                    conversionRate: 0.34,
                    dropOffRate: 0.66,
                    averageTimeSpent: 240,
                    performanceRank: 1,
                    optimizationPotential: 0.35
                }
            ],
            trendDirection: 'improving',
            lastUpdated: Date.now()
        };
    };
    // Generate template insights
    const generateTemplateInsights = (templateContext) => {
        return [
            {
                templateId: templateContext.templateId,
                templateName: templateContext.templateName,
                creatorId: templateContext.creatorId,
                conversionMetrics: {
                    viewToDownloadRate: 0.18,
                    downloadToUseRate: 0.67,
                    useToSubscribeRate: 0.23,
                    overallConversionRate: 0.028,
                    revenuePerView: 1.24,
                    userRetentionRate: 0.45
                },
                performanceInsights: [
                    {
                        insightType: 'conversion_opportunity',
                        title: 'High Drop-off at Download Stage',
                        description: 'Users are viewing but not downloading at expected rates',
                        impact: 'high',
                        confidence: 0.87,
                        actionable: true,
                        recommendations: [
                            {
                                action: 'Improve preview quality and add more sample content',
                                expectedImpact: 0.25,
                                effort: 'medium',
                                priority: 'high',
                                timeline: '2 weeks',
                                resources: ['Content Team', 'Design Team']
                            }
                        ]
                    },
                    {
                        insightType: 'pricing_optimization',
                        title: 'Price Point Analysis',
                        description: 'Current pricing may be above market average for category',
                        impact: 'medium',
                        confidence: 0.73,
                        actionable: true,
                        recommendations: [
                            {
                                action: 'Consider A/B testing lower price points',
                                expectedImpact: 0.15,
                                effort: 'low',
                                priority: 'medium',
                                timeline: '1 week',
                                resources: ['Marketing Team']
                            }
                        ]
                    }
                ],
                optimizationOpportunities: [
                    {
                        opportunity: 'Improve template preview experience',
                        currentPerformance: 0.18,
                        potentialPerformance: 0.27,
                        improvementPercentage: 50,
                        implementationSteps: [
                            {
                                step: 'Add interactive preview',
                                description: 'Implement live preview functionality',
                                effort: 'high',
                                timeline: 14,
                                dependencies: ['UI Framework Update']
                            },
                            {
                                step: 'Enhance preview content',
                                description: 'Add more sample data and use cases',
                                effort: 'medium',
                                timeline: 7,
                                dependencies: []
                            }
                        ],
                        successProbability: 0.78
                    }
                ],
                competitivePosition: {
                    categoryRank: 15,
                    totalInCategory: 156,
                    competitiveAdvantages: ['Unique design style', 'High quality assets'],
                    competitiveWeaknesses: ['Limited customization options', 'Higher price point'],
                    marketShare: 0.034,
                    trendDirection: 'gaining'
                }
            }
        ];
    };
    // Generate creator optimizations
    const generateCreatorOptimizations = (creatorContext) => {
        return [
            {
                creatorId: creatorContext.creatorId,
                creatorName: creatorContext.creatorName,
                portfolioMetrics: {
                    totalTemplates: creatorContext.totalTemplates,
                    totalRevenue: creatorContext.totalRevenue,
                    averageConversionRate: 0.156,
                    averageRating: creatorContext.averageRating,
                    topPerformingCategory: 'Web Design',
                    portfolioDiversification: 0.67,
                    marketPenetration: 0.023
                },
                optimizationRecommendations: [
                    {
                        recommendationType: 'template_optimization',
                        title: 'Optimize Underperforming Templates',
                        description: 'Focus on improving conversion rates for templates with high views but low downloads',
                        expectedImpact: {
                            revenueIncrease: 2340,
                            conversionImprovement: 0.045,
                            userEngagementBoost: 0.23,
                            timeToImpact: 21,
                            confidenceLevel: 0.82
                        },
                        actionItems: [
                            {
                                action: 'Update template previews',
                                instructions: 'Create high-quality preview images showing template in use',
                                effort: 'medium',
                                timeline: 7,
                                tools: ['Design Software', 'Preview Generator'],
                                success_criteria: ['Preview click-through rate increases by 25%', 'Download rate improves by 15%']
                            },
                            {
                                action: 'Enhance template descriptions',
                                instructions: 'Rewrite descriptions focusing on benefits and use cases',
                                effort: 'low',
                                timeline: 3,
                                tools: ['Content Management System'],
                                success_criteria: ['Time spent on template page increases', 'Conversion rate improves']
                            }
                        ],
                        priority: 'high'
                    },
                    {
                        recommendationType: 'portfolio_expansion',
                        title: 'Expand into Growing Categories',
                        description: 'Mobile app design templates show high demand and growth potential',
                        expectedImpact: {
                            revenueIncrease: 4560,
                            conversionImprovement: 0.0,
                            userEngagementBoost: 0.15,
                            timeToImpact: 45,
                            confidenceLevel: 0.71
                        },
                        actionItems: [
                            {
                                action: 'Research mobile design trends',
                                instructions: 'Analyze top-performing mobile templates and identify opportunities',
                                effort: 'low',
                                timeline: 5,
                                tools: ['Analytics Dashboard', 'Market Research Tools'],
                                success_criteria: ['Identify 3-5 high-opportunity mobile template types']
                            },
                            {
                                action: 'Create mobile template prototypes',
                                instructions: 'Develop initial mobile app templates based on research',
                                effort: 'high',
                                timeline: 30,
                                tools: ['Design Software', 'Mobile Design Tools'],
                                success_criteria: ['Launch 3 mobile templates', 'Achieve 4+ star average rating']
                            }
                        ],
                        priority: 'medium'
                    }
                ],
                performanceTrends: [
                    {
                        metric: 'monthly_revenue',
                        currentValue: 3450,
                        trend: 'improving',
                        changePercentage: 12.3,
                        projectedValue: 3890,
                        factors: [
                            {
                                factor: 'seasonal_demand_increase',
                                impact: 0.15,
                                controllable: false,
                                recommendation: 'Capitalize on seasonal trends with themed templates'
                            },
                            {
                                factor: 'improved_template_quality',
                                impact: 0.08,
                                controllable: true,
                                recommendation: 'Continue focusing on high-quality designs'
                            }
                        ]
                    }
                ],
                growthOpportunities: [
                    {
                        opportunity: 'Premium Template Tier',
                        description: 'Launch premium templates with advanced features and customization',
                        marketSize: 45000,
                        competitionLevel: 'medium',
                        skillRequirements: ['Advanced Design Skills', 'Interactive Elements'],
                        investmentRequired: 2500,
                        expectedROI: 3.4
                    }
                ]
            }
        ];
    };
    // Generate marketplace metrics
    const generateMarketplaceMetrics = () => {
        return {
            totalConversions: 15678,
            totalRevenue: 892450,
            averageConversionRate: 0.167,
            topPerformingCategories: [
                {
                    category: 'Web Design',
                    conversionRate: 0.189,
                    revenue: 234560,
                    templateCount: 1234,
                    averageRating: 4.3,
                    growthRate: 0.156
                },
                {
                    category: 'Mobile Design',
                    conversionRate: 0.201,
                    revenue: 187390,
                    templateCount: 856,
                    averageRating: 4.5,
                    growthRate: 0.234
                }
            ],
            userAcquisitionMetrics: {
                newUsersLastPeriod: 3456,
                acquisitionCost: 23.45,
                acquisitionChannels: [
                    {
                        channel: 'Organic Search',
                        users: 1456,
                        cost: 0,
                        conversionRate: 0.23,
                        quality: 0.89
                    },
                    {
                        channel: 'Social Media',
                        users: 1123,
                        cost: 15678,
                        conversionRate: 0.18,
                        quality: 0.76
                    }
                ],
                conversionByChannel: [
                    {
                        channel: 'Organic Search',
                        conversionRate: 0.23,
                        averageValue: 67.89,
                        retentionRate: 0.78
                    }
                ]
            },
            retentionMetrics: {
                overallRetentionRate: 0.67,
                cohortRetention: [
                    {
                        cohort: 'Q1 2024',
                        retentionRate: 0.72,
                        averageLifetime: 456,
                        totalValue: 23450
                    }
                ],
                churnRate: 0.08,
                reactivationRate: 0.15
            },
            healthScore: {
                overallScore: 87,
                components: [
                    {
                        component: 'Conversion Performance',
                        score: 89,
                        weight: 0.3,
                        status: 'good'
                    },
                    {
                        component: 'User Satisfaction',
                        score: 91,
                        weight: 0.25,
                        status: 'excellent'
                    },
                    {
                        component: 'Revenue Growth',
                        score: 84,
                        weight: 0.25,
                        status: 'good'
                    },
                    {
                        component: 'Technical Performance',
                        score: 78,
                        weight: 0.2,
                        status: 'fair'
                    }
                ],
                trend: 'improving',
                criticalIssues: []
            }
        };
    };
    // Generate recommended actions
    const generateRecommendedActions = (role) => {
        return [
            {
                actionId: 'optimize-registration-flow',
                type: 'optimization',
                title: 'Optimize User Registration Flow',
                description: 'Registration has the highest drop-off rate and represents the biggest optimization opportunity',
                targetAudience: ['admin', 'manager'],
                priority: 'critical',
                expectedImpact: {
                    revenueImpact: 23450,
                    conversionImpact: 0.15,
                    userImpact: 1234,
                    timeToImpact: 14,
                    confidenceLevel: 0.89
                },
                implementation: {
                    steps: [
                        {
                            step: 'Analyze registration drop-off points',
                            description: 'Use heatmaps and user session recordings to identify friction points',
                            owner: 'UX Team',
                            duration: 3,
                            dependencies: []
                        },
                        {
                            step: 'Simplify registration form',
                            description: 'Reduce form fields and implement progressive registration',
                            owner: 'Development Team',
                            duration: 7,
                            dependencies: ['Analysis completion']
                        },
                        {
                            step: 'A/B test new registration flow',
                            description: 'Test optimized flow against current version',
                            owner: 'Product Team',
                            duration: 14,
                            dependencies: ['New flow implementation']
                        }
                    ],
                    resources: ['UX Designer', 'Frontend Developer', 'Product Analyst'],
                    timeline: 21,
                    cost: 8500,
                    riskLevel: 'low'
                },
                progress: {
                    status: 'pending',
                    completionPercentage: 0,
                    completedSteps: [],
                    blockers: []
                }
            },
            {
                actionId: 'template-preview-enhancement',
                type: 'optimization',
                title: 'Enhance Template Preview Experience',
                description: 'Improve template previews to increase download conversion rates',
                targetAudience: ['creator', 'admin'],
                priority: 'high',
                expectedImpact: {
                    revenueImpact: 15670,
                    conversionImpact: 0.08,
                    userImpact: 2340,
                    timeToImpact: 10,
                    confidenceLevel: 0.76
                },
                implementation: {
                    steps: [
                        {
                            step: 'Implement interactive previews',
                            description: 'Add ability to customize and interact with template previews',
                            owner: 'Frontend Team',
                            duration: 14,
                            dependencies: []
                        }
                    ],
                    resources: ['Frontend Developer', 'UI Designer'],
                    timeline: 14,
                    cost: 5600,
                    riskLevel: 'medium'
                },
                progress: {
                    status: 'pending',
                    completionPercentage: 0,
                    completedSteps: [],
                    blockers: []
                }
            }
        ];
    };
    // Generate performance alerts
    const generatePerformanceAlerts = () => {
        return [
            {
                alertId: 'conv-drop-001',
                type: 'conversion_drop',
                severity: 'high',
                title: 'Conversion Rate Drop Detected',
                description: 'Mobile template category showing 15% decrease in conversion rate over last 7 days',
                affectedEntities: [
                    {
                        entityType: 'category',
                        entityId: 'mobile-templates',
                        entityName: 'Mobile Templates',
                        impactLevel: 0.15
                    }
                ],
                detectedAt: Date.now() - 2 * 60 * 60 * 1000,
                resolution: {
                    status: 'investigating',
                    assignedTo: 'analytics-team',
                    resolutionSteps: [
                        {
                            step: 'Analyze traffic sources',
                            completedAt: Date.now() - 60 * 60 * 1000,
                            completedBy: 'analyst-1',
                            notes: 'No significant changes in traffic patterns'
                        },
                        {
                            step: 'Review recent template additions',
                            notes: 'In progress'
                        }
                    ]
                }
            }
        ];
    };
    // Generate integration health
    const generateIntegrationHealth = () => {
        return {
            connectionStatus: 'connected',
            lastSync: Date.now() - 5 * 60 * 1000,
            syncFrequency: 300000, // 5 minutes
            dataQuality: 0.96,
            errors: [],
            performance: {
                averageResponseTime: 145,
                throughput: 2340,
                errorRate: 0.003,
                availability: 0.999
            }
        };
    };
    // Handle refresh
    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        loadIntegrationData().finally(() => setRefreshing(false));
    }, [loadIntegrationData]);
    // Handle optimization action
    const handleOptimizationAction = useCallback((actionType, details) => {
        const action = {
            actionType: actionType,
            details,
            userId: marketplaceContext.creatorContext?.creatorId || marketplaceContext.adminContext?.adminId || 'anonymous',
            timestamp: Date.now()
        };
        if (onOptimizationAction) {
            onOptimizationAction(action);
        }
    }, [marketplaceContext, onOptimizationAction]);
    // Handle insight interaction
    const handleInsightInteraction = useCallback((interactionType, insightId, context = {}) => {
        const interaction = {
            interactionType: interactionType,
            insightId,
            userId: marketplaceContext.creatorContext?.creatorId || marketplaceContext.adminContext?.adminId || 'anonymous',
            timestamp: Date.now(),
            context
        };
        if (onInsightInteraction) {
            onInsightInteraction(interaction);
        }
    }, [marketplaceContext, onInsightInteraction]);
    // Setup auto-refresh
    useEffect(() => {
        if (widgetConfig.refreshInterval > 0) {
            intervalRef.current = setInterval(handleRefresh, widgetConfig.refreshInterval);
        }
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [widgetConfig.refreshInterval, handleRefresh]);
    // Initial data load
    useEffect(() => {
        loadIntegrationData();
    }, [loadIntegrationData]);
    // Handle export
    const handleExport = useCallback(() => {
        if (!integrationData || !onExport)
            return;
        const exportData = {
            funnelSummary: integrationData.funnelSummary,
            templateInsights: integrationData.templateInsights,
            creatorOptimizations: integrationData.creatorOptimizations,
            recommendedActions: integrationData.recommendedActions,
            performanceAlerts: integrationData.performanceAlerts,
            exportTimestamp: Date.now(),
            userContext: marketplaceContext
        };
        onExport(exportData);
    }, [integrationData, marketplaceContext, onExport]);
    if (loading) {
        return (_jsxs("div", { className: "marketplace-integration-loading", children: [_jsx("div", { className: "loading-spinner" }), _jsx("p", { children: "Loading marketplace integration..." })] }));
    }
    if (error) {
        return (_jsxs("div", { className: "marketplace-integration-error", children: [_jsx("h3", { children: "Integration Error" }), _jsx("p", { className: "error-message", children: error }), _jsx("button", { onClick: loadIntegrationData, className: "retry-button", children: "Retry" })] }));
    }
    if (!integrationData) {
        return _jsx("div", { className: "marketplace-integration-error", children: "No data available" });
    }
    // Render based on integration mode
    switch (integrationMode) {
        case 'embedded_widget':
            return (_jsxs("div", { className: "marketplace-funnel-integration embedded", children: [_jsxs("div", { className: "integration-header", children: [_jsx("h3", { children: "Funnel Analytics" }), _jsxs("div", { className: "header-controls", children: [_jsx("button", { onClick: handleRefresh, className: `refresh-button ${refreshing ? 'refreshing' : ''}`, disabled: refreshing, children: refreshing ? 'Refreshing...' : 'Refresh' }), _jsx("button", { onClick: handleExport, className: "export-button", children: "Export" })] })] }), _jsx("div", { className: "widget-selector", children: widgetConfig.widgets.map(widget => (_jsx("button", { className: `widget-tab ${activeWidget === widget ? 'active' : ''}`, onClick: () => setActiveWidget(widget), children: widget.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) }, widget))) }), _jsxs("div", { className: "widget-content", children: [activeWidget === 'conversion_summary' && (_jsx("div", { className: "conversion-summary-widget", children: _jsxs("div", { className: "summary-metrics", children: [_jsxs("div", { className: "metric-card", children: [_jsx("span", { className: "metric-label", children: "Conversion Rate" }), _jsxs("span", { className: "metric-value", children: [Math.round(integrationData.funnelSummary.overallConversionRate * 100), "%"] }), _jsx("span", { className: `metric-trend ${integrationData.funnelSummary.trendDirection}`, children: integrationData.funnelSummary.trendDirection })] }), _jsxs("div", { className: "metric-card", children: [_jsx("span", { className: "metric-label", children: "Total Revenue" }), _jsxs("span", { className: "metric-value", children: ["$", integrationData.funnelSummary.totalRevenue.toLocaleString()] })] }), _jsxs("div", { className: "metric-card", children: [_jsx("span", { className: "metric-label", children: "Conversions" }), _jsx("span", { className: "metric-value", children: integrationData.funnelSummary.totalConversions.toLocaleString() })] }), _jsxs("div", { className: "metric-card", children: [_jsx("span", { className: "metric-label", children: "Avg Order Value" }), _jsxs("span", { className: "metric-value", children: ["$", integrationData.funnelSummary.averageOrderValue.toFixed(2)] })] })] }) })), activeWidget === 'optimization_recommendations' && (_jsxs("div", { className: "recommendations-widget", children: [_jsx("h4", { children: "Recommended Actions" }), _jsx("div", { className: "recommendation-list", children: integrationData.recommendedActions.slice(0, 3).map(action => (_jsxs("div", { className: `recommendation-item ${action.priority}`, children: [_jsxs("div", { className: "recommendation-header", children: [_jsx("h5", { children: action.title }), _jsx("span", { className: `priority-badge ${action.priority}`, children: action.priority.toUpperCase() })] }), _jsx("p", { className: "recommendation-description", children: action.description }), _jsxs("div", { className: "recommendation-impact", children: [_jsxs("span", { children: ["Expected Revenue Impact: $", action.expectedImpact.revenueImpact.toLocaleString()] }), _jsxs("span", { children: ["Timeline: ", action.implementation.timeline, " days"] })] }), _jsxs("div", { className: "recommendation-actions", children: [_jsx("button", { onClick: () => handleOptimizationAction('implement_recommendation', { actionId: action.actionId }), className: "implement-button", children: "Implement" }), _jsx("button", { onClick: () => handleInsightInteraction('view', action.actionId), className: "details-button", children: "View Details" })] })] }, action.actionId))) })] }))] })] }));
        case 'full_dashboard':
            return (_jsxs("div", { className: "marketplace-funnel-integration full-dashboard", children: [_jsxs("div", { className: "dashboard-header", children: [_jsx("h2", { children: "Marketplace Funnel Analytics Dashboard" }), _jsxs("div", { className: "dashboard-controls", children: [_jsx("button", { onClick: handleRefresh, className: "refresh-button", children: "Refresh Data" }), _jsx("button", { onClick: handleExport, className: "export-button", children: "Export Report" })] })] }), _jsxs("div", { className: "dashboard-grid", children: [_jsx("div", { className: "dashboard-section", children: _jsx(FunnelChart, { funnelDefinition: funnelDefinition, analyticsInfrastructure: analyticsInfrastructure, timeRange: { start: Date.now() - 30 * 24 * 60 * 60 * 1000, end: Date.now() } }) }), _jsx("div", { className: "dashboard-section", children: _jsx(FunnelOptimizationEngine, { funnelDefinition: funnelDefinition, analyticsInfrastructure: analyticsInfrastructure, timeRange: { start: Date.now() - 30 * 24 * 60 * 60 * 1000, end: Date.now() }, currentPerformance: {
                                        overallConversionRate: integrationData.funnelSummary.overallConversionRate,
                                        stepPerformance: integrationData.funnelSummary.topPerformingSteps.map(step => ({
                                            stepId: step.stepId,
                                            stepName: step.stepName,
                                            conversionRate: step.conversionRate,
                                            dropOffRate: step.dropOffRate,
                                            averageTimeSpent: step.averageTimeSpent,
                                            errorRate: 0.02,
                                            userSatisfactionScore: 0.85,
                                            completionQuality: 0.92
                                        })),
                                        revenueMetrics: {
                                            revenuePerVisitor: integrationData.funnelSummary.totalRevenue / integrationData.funnelSummary.totalConversions,
                                            revenuePerConversion: integrationData.funnelSummary.averageOrderValue,
                                            lifetimeValue: 450,
                                            paybackPeriod: 90,
                                            marginPerConversion: 35
                                        },
                                        userExperienceMetrics: {
                                            overallSatisfactionScore: 0.87,
                                            easeOfUseScore: 0.82,
                                            clarityScore: 0.89,
                                            trustScore: 0.91,
                                            mobileExperienceScore: 0.78,
                                            accessibilityScore: 0.85
                                        },
                                        technicalMetrics: {
                                            averageLoadTime: 1.2,
                                            errorRate: 0.008,
                                            availabilityScore: 0.999,
                                            performanceScore: 0.94,
                                            securityScore: 0.96,
                                            compatibilityScore: 0.88
                                        },
                                        timestamp: Date.now()
                                    } }) })] })] }));
        default:
            return (_jsx("div", { className: "marketplace-funnel-integration", children: _jsxs("p", { children: ["Integration mode '", integrationMode, "' not implemented yet."] }) }));
    }
};
