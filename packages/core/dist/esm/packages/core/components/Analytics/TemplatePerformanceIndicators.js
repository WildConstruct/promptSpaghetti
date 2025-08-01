import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Template Performance Indicators - Story 30.2 Task 8
 *
 * Component that adds funnel performance indicators to template analytics,
 * providing visual insights into conversion performance directly within
 * template interfaces and analytics views.
 *
 * Features:
 * - Real-time funnel performance indicators
 * - Template-specific conversion metrics display
 * - Visual performance scoring and trends
 * - Comparative performance analysis
 * - Optimization opportunity highlighting
 * - Mobile-responsive indicator design
 * - Interactive drill-down capabilities
 * - Performance alerting and notifications
 */
import { useState, useCallback, useRef, useEffect } from 'react';
timeRange ?  : { start: number, end: number };
displayMode ?  : IndicatorDisplayMode;
comparisonEnabled ?  : boolean;
alertsEnabled ?  : boolean;
onIndicatorClick ?  : (indicator) => void ;
onOptimizationAction ?  : (action) => void ;
onExport ?  : (data) => void ;
confidenceInterval: {
    min: number;
    max: number;
}
;
timeRange: {
    start: number;
    end: number;
}
;
metrics: string;
export const [error, setError] = useState(null);
const [selectedIndicator, setSelectedIndicator] = useState(null);
const [showAlerts, setShowAlerts] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const intervalRef = useRef(null);
// Load template performance data
const loadPerformanceData = useCallback(async () => {
    try {
        setLoading(true);
        setError(null);
        const query = {
            funnelId: funnelDefinition.id,
            timeRange,
            segments: [],
            cohorts: [],
            metrics: ['template_performance', 'funnel_indicators', 'optimization_opportunities'],
            aggregation: 'template',
            filters: [
                { field: 'template_id', operator: 'eq', value: templateId }
            ]
        };
        const result = await analyticsInfrastructure.executeQuery(query);
        if (result.success && result.data) {
            const processedData = await processTemplatePerformanceData();
        }
    }
    finally { }
});
result.data,
    templateMetadata,
    funnelDefinition;
;
setPerformanceData(processedData);
{
    setError(result.error || 'Failed to load template performance data');
}
try { }
catch (err) {
    setError(err instanceof Error ? err.message : 'Unknown error occurred');
}
finally {
    setLoading(false);
}
[funnelDefinition, analyticsInfrastructure, timeRange, templateId, templateMetadata];
;
// Process template performance data
const processTemplatePerformanceData = async();
;
rawData: unknown,
    metadata;
TemplateMetadata,
    funnel;
ConversionFunnelDefinition;
Promise;
{
    // Simulate comprehensive template performance processing
    return {
        templateMetrics: generateTemplateMetrics(metadata),
        funnelPerformance: generateFunnelPerformance(funnel),
        performanceIndicators: generatePerformanceIndicators(metadata),
        competitivePosition: generateCompetitivePosition(metadata),
        optimizationOpportunities: generateOptimizationOpportunities(metadata),
        performanceAlerts: generatePerformanceAlerts(metadata),
        historicalTrends: generateHistoricalTrends(metadata),
        benchmarkComparison: generateBenchmarkComparison(metadata),
    };
}
;
// Generate template metrics
const generateTemplateMetrics = (metadata) => {
    return {
        views: {
            totalViews: 12540,
            uniqueViews: 8760,
            viewsGrowth: 0.156,
            viewsToday: 45,
            viewsThisWeek: 340,
            viewsThisMonth: 1560,
            averageViewDuration: 145,
            bounceRate: 0.34,
            viewSources: [
                { source: 'Organic Search', views: 4200, percentage: 33.5, conversionRate: 0.18 },
                { source: 'Direct', views: 3100, percentage: 24.7, conversionRate: 0.22 },
                { source: 'Social Media', views: 2800, percentage: 22.3, conversionRate: 0.15 }
            ]
        },
        engagement: {
            engagementScore: 0.78,
            engagementTrend: 0.12,
            averageTimeOnPage: 245,
            interactionRate: 0.45,
            shareCount: 156,
            favoriteCount: 234,
            commentCount: 45,
            previewRate: 0.67,
            downloadAttempts: 890,
        },
        conversion: {
            overallConversionRate: 0.143,
            conversionTrend: 0.089,
            conversionsByStep: [
                { stepId: 'view', stepName: 'Template View', stepOrder: 1, entries: 8760, conversions: 6540, conversionRate: 0.75, dropoffRate: 0.25, averageTime: 45, optimizationScore: 0.85 },
                { stepId: 'preview', stepName: 'Preview Details', stepOrder: 2, entries: 6540, conversions: 3270, conversionRate: 0.50, dropoffRate: 0.50, averageTime: 120, optimizationScore: 0.65 },
                { stepId: 'download', stepName: 'Download/Purchase', stepOrder: 3, entries: 3270, conversions: 1254, conversionRate: 0.38, dropoffRate: 0.62, averageTime: 180, optimizationScore: 0.70 }
            ],
            conversionsBySource: [
                { source: 'Organic Search', visits: 4200, conversions: 756, conversionRate: 0.18, quality: 0.89 },
                { source: 'Direct', visits: 3100, conversions: 682, conversionRate: 0.22, quality: 0.95 }
            ],
            conversionsByDevice: [
                { deviceType: 'desktop', visits: 5260, conversions: 945, conversionRate: 0.18, averageTime: 210 },
                { deviceType: 'mobile', visits: 2800, conversions: 252, conversionRate: 0.09, averageTime: 145 }
            ],
            conversionsByTime: [
                { timeSlot: '9-12', conversions: 345, conversionRate: 0.165, volume: 2090 },
                { timeSlot: '12-15', conversions: 456, conversionRate: 0.178, volume: 2560 }
            ],
            dropoffPoints: [
                {
                    stepId: 'preview',
                    stepName: 'Preview Details',
                    dropoffRate: 0.50,
                    dropoffCount: 3270,
                    reasons: [
                        { reason: 'Insufficient preview quality', frequency: 0.35, impact: 0.25, actionable: true },
                        { reason: 'Price concerns', frequency: 0.28, impact: 0.18, actionable: true }
                    ],
                    severity: 'high'
                }
            ]
        },
        revenue: {
            totalRevenue: 3780,
            revenueGrowth: 0.134,
            revenuePerView: 0.43,
            revenuePerConversion: 3.01,
            averageOrderValue: 3.01,
            lifetimeValue: 4.56,
            refundRate: 0.05,
            revenueBySource: [
                { source: 'Direct', revenue: 1512, percentage: 40.0, growth: 0.18 },
                { source: 'Organic Search', revenue: 1134, percentage: 30.0, growth: 0.12 }
            ],
            revenueTrend: Array.from({ length: 30 }, (_, i) => ({}), date, Date.now() - (29 - i) * 24 * 60 * 60 * 1000, revenue, 100 + Math.random() * 50, conversions, 30 + Math.random() * 20, averageValue, 3.0 + Math.random() * 1.0)
        }
    },
        quality;
    {
        qualityScore: 0.86,
            qualityTrend;
        0.05,
            averageRating;
        4.3,
            ratingCount;
        178,
            ratingDistribution;
        {
            fiveStars: 89,
                fourStars;
            54,
                threeStars;
            23,
                twoStars;
            8,
                oneStar;
            4,
            ;
        }
        reviewSentiment: {
            positive: 0.78,
                neutral;
            0.15,
                negative;
            0.07,
                sentimentScore;
            0.85,
                keyThemes;
            [
                { theme: 'Design Quality', sentiment: 'positive', frequency: 0.45, impact: 0.3 },
                { theme: 'Documentation', sentiment: 'positive', frequency: 0.32, impact: 0.2 }
            ];
        }
        qualityFactors: [
            { factor: 'Design Quality', score: 0.91, weight: 0.4, trend: 'stable' },
            { factor: 'Usability', score: 0.84, weight: 0.3, trend: 'improving' }
        ];
    }
    performance: {
        performanceScore: 0.82,
            performanceTrend;
        0.03,
            loadTime;
        1.2,
            errorRate;
        0.008,
            compatibility;
        0.95,
            accessibility;
        0.87,
            seoScore;
        0.79,
            mobileScore;
        0.74,
        ;
    }
    lastUpdated: Date.now();
};
;
// Generate funnel performance data
const generateFunnelPerformance = (funnel) => {
    return {
        funnelId: funnel.id,
        overallPerformance: {
            conversionRate: 0.143,
            conversionRateTrend: 0.089,
            totalConversions: 1254,
            averageTimeToConvert: 345,
            conversionValue: 3780,
            efficiencyScore: 0.76,
            bottleneckStep: 'preview',
            topPerformingStep: 'view',
        },
        stepPerformance: funnel.steps.map((step, index) => ({}), stepId, step.id, stepName, step.name, stepType, step.type, position, index + 1, entries, Math.floor(8760 * Math.pow(0.6, index)), exits, Math.floor(8760 * Math.pow(0.6, index) * 0.4), conversions, Math.floor(8760 * Math.pow(0.6, index + 1)), conversionRate, 0.6 + Math.random() * 0.3, dropoffRate, 0.3 + Math.random() * 0.2, averageTimeSpent, 60 + Math.random() * 120, errorCount, Math.floor(Math.random() * 10), satisfactionScore, 0.7 + Math.random() * 0.3, optimizationPotential, Math.random() * 0.4, performanceGrade, ['A', 'B', 'C', 'D', 'F'][Math.floor(Math.random() * 5)])
    };
    conversionPaths: [
        {
            pathId: 'path-1',
            steps: ['view', 'preview', 'download'],
            frequency: 890,
            conversionRate: 0.143,
            averageValue: 3.01,
            averageTime: 345,
            efficiency: 0.76
        }
    ],
        optimizationInsights;
    [
        {
            type: 'bottleneck_removal',
            title: 'Improve Preview Conversion',
            description: 'Preview step shows highest drop-off rate at 50%',
            impact: 'high',
            effort: 'medium',
            confidence: 0.85,
            expectedImprovement: 0.25,
            affectedSteps: ['preview'],
            actionItems: ['Enhance preview quality', 'Add interactive elements', 'Improve description']
        }
    ],
        performanceComparison;
    {
        categoryAverage: 0.125,
            creatorAverage;
        0.138,
            topPerformer;
        0.234,
            industryBenchmark;
        0.156,
            percentileRank;
        68,
            competitivePosition;
        'above_average',
        ;
    }
    ;
};
// Generate performance indicators
const generatePerformanceIndicators = (metadata) => {
    return [
        {
            indicatorId: 'conversion-rate',
            type: 'conversion_rate',
            name: 'Conversion Rate',
            value: 0.143,
            displayValue: '14.3%',
            trend: {},
            direction: 'up',
            percentage: 8.9,
            timeframe: 'last 30 days',
            confidence: 0.85,
        },
        severity, 'success',
        status, 'healthy',
        description, 'Template conversion rate is above category average',
        tooltip, 'Percentage of template views that result in downloads or purchases',
        actionable, true,
        actions, [
            {
                actionId: 'optimize-preview',
                title: 'Optimize Preview Experience',
                description: 'Enhance preview quality to further improve conversion',
                priority: 'medium',
                effort: 'medium',
                expectedImpact: 0.15,
                actionType: 'optimization'
            }
        ],
        visualization, {},
        type, 'gauge',
        config, {},
        showTrend, true,
        showComparison, true,
        timeframe, '30d',
        granularity, 'daily',
        format, 'percentage',
    ];
}, colorScheme, thresholds, lastUpdated;
();
{
    indicatorId: 'revenue-performance',
        type;
    'revenue_performance',
        name;
    'Revenue Performance',
        value;
    3780,
        displayValue;
    '$3,780',
        trend;
    {
        direction: 'up',
            percentage;
        13.4,
            timeframe;
        'last 30 days',
            confidence;
        0.92,
        ;
    }
    severity: 'success',
        status;
    'healthy',
        description;
    'Revenue is growing steadily above projections',
        tooltip;
    'Total revenue generated by this template over the selected period',
        actionable;
    true,
        actions;
    [
        {
            actionId: 'pricing-optimization',
            title: 'Consider Price Optimization',
            description: 'Analyze price elasticity for potential revenue increase',
            priority: 'low',
            effort: 'low',
            expectedImpact: 0.12,
            actionType: 'optimization'
        }
    ],
        visualization;
    {
        type: 'trend',
            config;
        {
            showTrend: true,
                showComparison;
            true,
                timeframe;
            '30d',
                granularity;
            'daily',
                format;
            'currency',
            ;
        }
        colorScheme: {
            primary: '#10b981',
                secondary;
            '#6ee7b7',
                success;
            '#10b981',
                warning;
            '#f59e0b',
                error;
            '#ef4444',
                neutral;
            '#6b7280',
            ;
        }
        thresholds: [
            { level: 'excellent', minValue: 5000, maxValue: Infinity, color: '#10b981', description: 'Exceptional revenue performance' },
            { level: 'good', minValue: 3000, maxValue: 5000, color: '#3b82f6', description: 'Strong revenue performance' },
            { level: 'fair', minValue: 1500, maxValue: 3000, color: '#f59e0b', description: 'Moderate revenue performance' },
            { level: 'poor', minValue: 500, maxValue: 1500, color: '#ef4444', description: 'Low revenue performance' },
            { level: 'critical', minValue: 0, maxValue: 500, color: '#dc2626', description: 'Critical revenue issues' }
        ],
            lastUpdated;
        Date.now();
    }
    {
        indicatorId: 'quality-rating',
            type;
        'quality_rating',
            name;
        'Quality Rating',
            value;
        4.3,
            displayValue;
        '4.3 ⭐',
            trend;
        {
            direction: 'up',
                percentage;
            2.4,
                timeframe;
            'last 30 days',
                confidence;
            0.78,
            ;
        }
        severity: 'success',
            status;
        'healthy',
            description;
        'Template maintains high quality rating with positive trend',
            tooltip;
        'Average user rating based on reviews and feedback',
            actionable;
        true,
            actions;
        [
            {
                actionId: 'quality-maintenance',
                title: 'Maintain Quality Standards',
                description: 'Continue current quality practices and monitor feedback',
                priority: 'low',
                effort: 'low',
                expectedImpact: 0.05,
                actionType: 'enhancement'
            }
        ],
            visualization;
        {
            type: 'gauge',
                config;
            {
                showTrend: true,
                    showComparison;
                false,
                    timeframe;
                '30d',
                    granularity;
                'weekly',
                    format;
                'score',
                ;
            }
            colorScheme: {
                primary: '#fbbf24',
                    secondary;
                '#fde68a',
                    success;
                '#10b981',
                    warning;
                '#f59e0b',
                    error;
                '#ef4444',
                    neutral;
                '#6b7280',
                ;
            }
            thresholds: [
                { level: 'excellent', minValue: 4.5, maxValue: 5.0, color: '#10b981', description: 'Exceptional quality' },
                { level: 'good', minValue: 4.0, maxValue: 4.5, color: '#3b82f6', description: 'High quality' },
                { level: 'fair', minValue: 3.5, maxValue: 4.0, color: '#f59e0b', description: 'Average quality' },
                { level: 'poor', minValue: 3.0, maxValue: 3.5, color: '#ef4444', description: 'Below average quality' },
                { level: 'critical', minValue: 0.0, maxValue: 3.0, color: '#dc2626', description: 'Poor quality' }
            ],
                lastUpdated;
            Date.now();
        }
        {
            indicatorId: 'engagement-score',
                type;
            'engagement_score',
                name;
            'Engagement Score',
                value;
            0.78,
                displayValue;
            '78%',
                trend;
            {
                direction: 'up',
                    percentage;
                12.0,
                    timeframe;
                'last 30 days',
                    confidence;
                0.89,
                ;
            }
            severity: 'success',
                status;
            'healthy',
                description;
            'User engagement is strong and improving',
                tooltip;
            'Composite score based on user interactions, time spent, and engagement activities',
                actionable;
            true,
                actions;
            [
                {
                    actionId: 'engagement-boost',
                    title: 'Boost Engagement Further',
                    description: 'Add interactive elements to increase engagement',
                    priority: 'medium',
                    effort: 'medium',
                    expectedImpact: 0.08,
                    actionType: 'enhancement'
                }
            ],
                visualization;
            {
                type: 'progress',
                    config;
                {
                    showTrend: true,
                        showComparison;
                    true,
                        timeframe;
                    '30d',
                        granularity;
                    'daily',
                        format;
                    'percentage',
                    ;
                }
                colorScheme: {
                    primary: '#8b5cf6',
                        secondary;
                    '#c4b5fd',
                        success;
                    '#10b981',
                        warning;
                    '#f59e0b',
                        error;
                    '#ef4444',
                        neutral;
                    '#6b7280',
                    ;
                }
                thresholds: [
                    { level: 'excellent', minValue: 0.80, maxValue: 1.0, color: '#10b981', description: 'Outstanding engagement' },
                    { level: 'good', minValue: 0.65, maxValue: 0.80, color: '#3b82f6', description: 'Good engagement' },
                    { level: 'fair', minValue: 0.50, maxValue: 0.65, color: '#f59e0b', description: 'Average engagement' },
                    { level: 'poor', minValue: 0.35, maxValue: 0.50, color: '#ef4444', description: 'Low engagement' },
                    { level: 'critical', minValue: 0.0, maxValue: 0.35, color: '#dc2626', description: 'Very low engagement' }
                ],
                    lastUpdated;
                Date.now();
                ;
            }
            ;
            // Generate competitive position
            const generateCompetitivePosition = (metadata) => {
                return {
                    categoryRank: 23,
                    totalInCategory: 156,
                    percentile: 85,
                    rankChange: -2,
                    competitiveScore: 0.82,
                    strengthAreas: [
                        { area: 'Design Quality', score: 0.91, description: 'Exceptional visual design and aesthetics', advantage: 'Unique design style stands out from competitors' },
                        { area: 'User Experience', score: 0.87, description: 'Intuitive and user-friendly interface', advantage: 'Lower learning curve for users' }
                    ],
                    weaknessAreas: [
                        { area: 'Marketing Reach', score: 0.65, description: 'Limited marketing and promotion', impact: 'Reduced visibility affects discovery', improvement: 'Increase social media presence and SEO optimization' }
                    ],
                    opportunities: [
                        { opportunity: 'Mobile Optimization', description: 'Improve mobile user experience', potential: 0.25, effort: 'medium', timeframe: 30 }
                    ],
                    threats: [
                        { threat: 'Increasing Competition', description: 'New competitors entering the market', severity: 'medium', probability: 0.7, mitigation: 'Focus on unique value proposition and continuous improvement' }
                    ]
                };
            };
            // Generate optimization opportunities
            const generateOptimizationOpportunities = (metadata) => {
                return [
                    {
                        opportunityId: 'preview-enhancement',
                        title: 'Enhance Preview Experience',
                        description: 'Improve template preview quality and interactivity to reduce drop-off at preview stage',
                        category: 'conversion_optimization',
                        impact: {},
                        revenueIncrease: 567,
                        conversionImprovement: 0.08,
                        trafficIncrease: 0.0,
                        ratingImprovement: 0.1,
                        confidenceLevel: 0.82,
                    },
                    effort, {},
                    estimatedHours, 12,
                    skillsRequired, ['UI/UX Design', 'Frontend Development'],
                    resourcesNeeded, ['Design tools', 'Development environment'],
                    complexity, 'moderate',
                ];
            }, priority, timeline;
            +7 * 24 * 60 * 60 * 1000, deliverables;
            ['Design mockups', 'User flow diagram'];
        }
        dependencies: ['Design approval', 'Development resources'],
            risks;
        [
            { risk: 'Design changes may not resonate with users', probability: 0.3, impact: 0.2, mitigation: 'A/B test new design before full rollout' }
        ];
    }
    requirements: [
        { requirement: 'UI/UX Design Skills', type: 'skill', description: 'Advanced design capabilities for preview enhancement', critical: true },
        { requirement: 'User Testing Platform', type: 'tool', description: 'Platform for testing new preview designs', critical: false }
    ],
        successMetrics;
    [
        { metric: 'Preview conversion rate', currentValue: 0.50, targetValue: 0.58, measurementMethod: 'A/B testing' },
        { metric: 'Time spent on preview', currentValue: 120, targetValue: 150, measurementMethod: 'Analytics tracking' }
    ],
        relatedIndicators;
    ['conversion-rate', 'engagement-score'];
    ;
}
;
// Generate performance alerts
const generatePerformanceAlerts = (metadata) => {
    return [
        {
            alertId: 'mobile-conversion-drop',
            type: 'conversion_decline',
            severity: 'warning',
            title: 'Mobile Conversion Rate Declining',
            message: 'Mobile conversion rate has dropped 15% over the last 7 days',
            indicators: ['conversion-rate', 'engagement-score'],
            triggeredAt: Date.now() - 2 * 60 * 60 * 1000,
            threshold: {},
            metric: 'mobile_conversion_rate',
            condition: 'below',
            value: 0.10,
            timeframe: 7,
        },
        status, 'active',
        actions, [
            {
                actionId: 'investigate-mobile',
                title: 'Investigate Mobile Experience',
                description: 'Analyze mobile user experience and identify issues',
                actionType: 'investigate',
                automated: false
            }
        ],
        escalation, {},
        escalationLevel, 0,
        escalationTime, 24,
        escalationTarget, 'template-owner',
        maxEscalations, 2
    ];
};
// Generate historical trends
const generateHistoricalTrends = (metadata) => {
    return [
        {
            metric: 'conversion_rate',
            timeframe: '30d',
            dataPoints: Array.from({ length: 30 }, (_, i) => ({}), timestamp, Date.now() - (29 - i) * 24 * 60 * 60 * 1000, value, 0.13 + Math.sin(i / 7) * 0.02 + Math.random() * 0.01, volume, 250 + Math.random() * 100, context, {})
        }, ,
        trendAnalysis, {},
        direction, 'increasing',
        strength, 0.78,
        significance, 0.85,
        acceleration, 0.12,
        inflectionPoints, [
            { timestamp: Date.now() - 15 * 24 * 60 * 60 * 1000, type: 'change', significance: 0.8, context: 'Preview optimization implemented' }
        ]
    ];
}, forecast;
+(i + 1) * 24 * 60 * 60 * 1000,
    predictedValue;
0.15 + Math.random() * 0.01,
    confidenceInterval;
{
    min: 0.14, max;
    0.16;
}
confidence: 0.82,
    assumptions;
['Current trend continues', 'No major market changes'],
    risks;
['Competitive pressure', 'Seasonal variations'];
seasonality: {
    detected: true,
        patterns;
    [
        { type: 'weekly', amplitude: 0.02, phase: 0, confidence: 0.85 }
    ],
        strength;
    0.67,
        reliability;
    0.78;
    ;
}
;
// Generate benchmark comparison
const generateBenchmarkComparison = (metadata) => {
    return {
        benchmarks: [
            {
                benchmarkType: 'category',
                name: metadata.category,
                metrics: [
                    { metric: 'conversion_rate', value: 0.125, percentile: 50, trend: 'stable' },
                    { metric: 'average_rating', value: 4.1, percentile: 50, trend: 'stable' }
                ],
                lastUpdated: Date.now()
            }
        ],
        position: {
            overallRank: 23,
            categoryRank: 23,
            percentile: 85,
            competitiveAdvantage: ['Higher conversion rate', 'Better user engagement'],
            improvementAreas: ['Marketing reach', 'Mobile experience'],
        },
        gaps: [
            {
                metric: 'mobile_conversion_rate',
                gap: -0.03,
                gapPercentage: -25,
                priority: 'high',
                actionItems: ['Optimize mobile interface', 'Improve mobile loading speed']
            }
        ],
        opportunities: [
            {
                opportunity: 'Mobile Optimization',
                description: 'Significant opportunity to improve mobile experience',
                potentialGain: 0.25,
                effort: 'medium',
                examples: [
                    { templateName: 'Mobile Pro Template', creatorName: 'MobileExpert', achievement: '40% mobile conversion rate', strategy: 'Mobile-first design approach' }
                ]
            }
        ]
    };
};
// Handle indicator click
const handleIndicatorClick = useCallback((indicator) => {
    setSelectedIndicator(indicator.indicatorId);
    if (onIndicatorClick) {
        onIndicatorClick(indicator);
    }
    [onIndicatorClick];
});
// Handle optimization action
const handleOptimizationAction = useCallback();
;
(actionType) => ;
targetId: string,
    details;
(Record) = {};
{
    const action = {
        actionType: actionType,
        targetId,
        details,
        timestamp: Date.now(), };
    if (onOptimizationAction) {
        onOptimizationAction(action);
    }
    [onOptimizationAction];
    ;
    // Handle refresh
    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        loadPerformanceData().finally(() => setRefreshing(false));
    }, [loadPerformanceData]);
    // Setup auto-refresh
    useEffect(() => {
        intervalRef.current = setInterval(handleRefresh, 5 * 60 * 1000); // 5 minutes
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            ;
        }, [handleRefresh];
    });
    // Initial data load
    useEffect(() => {
        loadPerformanceData();
    }, [loadPerformanceData]);
    // Handle export
    const handleExport = useCallback(() => {
        if (!performanceData || !onExport)
            return;
        const exportData = {
            templateMetadata,
            performanceData,
            indicators: performanceData.performanceIndicators,
            trends: performanceData.historicalTrends,
            exportTimestamp: Date.now(),
            exportConfig: {
                format: 'json',
                includeCharts: true,
                timeRange,
                metrics: ['all'],
            } }, [performanceData, templateMetadata, timeRange, onExport];
    });
    if (loading) {
        return;
        _jsxs("div", { className: "template-performance-loading", children: [_jsx("div", { className: "loading-spinner" }), _jsx("p", { children: "Loading performance indicators..." })] });
        ;
        if (error) {
            return;
            _jsxs("div", { className: "template-performance-error", children: [_jsx("h3", { children: "Performance Indicators Error" }), _jsx("p", { className: "error-message", children: error }), _jsx("button", { onClick: loadPerformanceData, className: "retry-button", children: "Retry" })] });
            ;
            if (!performanceData) {
                return _jsx("div", { className: "template-performance-error", children: "No performance data available" });
                // Render based on display mode
                const renderIndicators = () => {
                    switch (displayMode) {
                        case 'compact':
                            return;
                            _jsxs("div", { className: "performance-indicators compact", children: [_jsxs("div", { className: "indicators-grid compact", children: [performanceData.performanceIndicators.slice(0, 4).map(indicator => ()
                                                < div, key = { indicator, : .indicatorId }, className = {} `indicator-card compact ${indicator.severity}`), "onClick=", () => handleIndicatorClick(indicator), ">", _jsx("div", { className: "indicator-value", children: indicator.displayValue }), _jsx("div", { className: "indicator-name", children: indicator.name }), _jsxs("div", { className: `indicator-trend ${indicator.trend.direction}`, children: ["}", indicator.trend.direction === 'up' ? '↗' : indicator.trend.direction === 'down' ? '↘' : '→', " ", Math.abs(indicator.trend.percentage).toFixed(1), "%"] })] }), "))}"] });
                    }
                };
                div >
                ;
                ;
                'mobile';
                return;
                _jsxs("div", { className: "performance-indicators mobile", children: [_jsxs("div", { className: "mobile-header", children: [_jsx("h3", { children: "Performance" }), _jsx("button", { onClick: handleRefresh, className: `refresh-button ${refreshing ? 'refreshing' : ''}`, children: refreshing ? '⟳' : '↻' })] }), _jsxs("div", { className: "indicators-list mobile", children: [performanceData.performanceIndicators.map(indicator => ()
                                    < div, key = { indicator, : .indicatorId }, className = {} `indicator-item mobile ${indicator.severity}`), "onClick=", () => handleIndicatorClick(indicator), ">", _jsxs("div", { className: "indicator-header", children: [_jsx("span", { className: "indicator-name", children: indicator.name }), _jsx("span", { className: "indicator-value", children: indicator.displayValue })] }), _jsxs("div", { className: "indicator-footer", children: [_jsxs("span", { className: `trend ${indicator.trend.direction}`, children: ["}", indicator.trend.direction === 'up' ? '↗' : indicator.trend.direction === 'down' ? '↘' : '→', " ", Math.abs(indicator.trend.percentage).toFixed(1), "%"] }), _jsxs("span", { className: `status ${indicator.status}`, children: ["}", indicator.status.replace('_', ' ')] })] })] }), "))}"] });
                div >
                ;
                ;
                'overlay';
                return;
                _jsxs("div", { className: "performance-indicators overlay", children: [_jsx("div", { className: "overlay-toggle", children: _jsxs("button", { className: "toggle-button", onClick: () => setShowAlerts(!showAlerts), children: ["\uD83D\uDCCA Performance (", performanceData.performanceIndicators.filter(i => i.severity !== 'info').length, ")"] }) }), showAlerts && ()
                            < div, " className=\"overlay-content\">", performanceData.performanceIndicators
                            .filter(i => i.severity !== 'info')
                            .slice(0, 3)
                            .map(indicator => ()
                            < div, key = { indicator, : .indicatorId }, className = {} `overlay-indicator ${indicator.severity}`), "onClick=", () => handleIndicatorClick(indicator), ">", _jsxs("span", { className: "indicator-name", children: [indicator.name, ":"] }), _jsx("span", { className: "indicator-value", children: indicator.displayValue }), _jsxs("span", { className: `trend ${indicator.trend.direction}`, children: ["} (", indicator.trend.direction === 'up' ? '+' : indicator.trend.direction === 'down' ? '-' : '', Math.abs(indicator.trend.percentage).toFixed(1), "%)"] })] });
            }
            div >
            ;
        }
        div >
        ;
        ;
        return;
        _jsxs("div", { className: `performance-indicators ${displayMode}`, children: ["}", _jsxs("div", { className: "indicators-header", children: [_jsx("h3", { children: "Performance Indicators" }), _jsxs("div", { className: "header-controls", children: [_jsx("button", { onClick: handleRefresh, className: `refresh-button ${refreshing ? 'refreshing' : ''}`, disabled: refreshing, children: refreshing ? 'Refreshing...' : 'Refresh' }), onExport && ()
                                    < button, " onClick=", handleExport, " className=\"export-button\"> Export"] }), ")}"] })] });
        {
            alertsEnabled && performanceData.performanceAlerts.length > 0 && ()
                < div;
            className = "performance-alerts" >
                (_jsx("h4", { children: "Active Alerts" })
                    ,
                        _jsxs("div", { className: "alert-list", children: [performanceData.performanceAlerts.map(alert => ()
                                    < div, key = { alert, : .alertId }, className = {} `alert-item ${alert.severity}`), ">}", _jsxs("div", { className: "alert-header", children: [_jsx("span", { className: "alert-title", children: alert.title }), _jsxs("span", { className: `alert-severity ${alert.severity}`, children: ["}", alert.severity.toUpperCase()] })] }), _jsx("p", { className: "alert-message", children: alert.message }), _jsxs("div", { className: "alert-actions", children: [alert.actions.map(action => ()
                                            < button, key = { action, : .actionId }, onClick = {}()), " => handleOptimizationAction(action.actionType, alert.alertId, ", actionId, ": action.actionId })} className=", `alert-action-button ${action.actionType}`, ">", action.title] }), "))}"] }));
            div >
            ;
        }
        div >
        ;
        div >
        ;
    }
    _jsxs("div", { className: "indicators-grid", children: [performanceData.performanceIndicators.map(indicator => ()
                < div, key = { indicator, : .indicatorId }, className = {} `indicator-card ${indicator.severity} ${selectedIndicator === indicator.indicatorId ? 'selected' : ''}`), "onClick=", () => handleIndicatorClick(indicator), ">", _jsxs("div", { className: "indicator-header", children: [_jsx("h4", { children: indicator.name }), _jsxs("span", { className: `indicator-status ${indicator.status}`, children: ["}", indicator.status.replace('_', ' ')] })] }), _jsxs("div", { className: "indicator-value-section", children: [_jsx("div", { className: "indicator-main-value", children: indicator.displayValue }), _jsxs("div", { className: `indicator-trend ${indicator.trend.direction}`, children: ["}", _jsx("span", { className: "trend-icon", children: indicator.trend.direction === 'up' ? '↗' : indicator.trend.direction === 'down' ? '↘' : '→' }), _jsxs("span", { className: "trend-value", children: [Math.abs(indicator.trend.percentage).toFixed(1), "%"] }), _jsx("span", { className: "trend-timeframe", children: indicator.trend.timeframe })] })] }), indicator.visualization.type === 'gauge' && ()
                < div, " className=\"indicator-gauge\">", _jsxs("div", { className: "gauge-track", children: [_jsx("div", { className: "gauge-fill", style: {
                            width: `${Math.min(indicator.value * 100, 100)}%`
                        } }), ", backgroundColor: indicator.visualization.colorScheme.primary; }} >"] })] });
    div >
    ;
}
{
    indicator.visualization.type === 'progress' && ()
        < div;
    className = "indicator-progress" >
        _jsxs("div", { className: "progress-track", children: [_jsx("div", { className: "progress-fill", style: {
                        width: `${Math.min(indicator.value * 100, 100)}%`
                    } }), ", backgroundColor: indicator.visualization.colorScheme.primary; }} >"] });
    div >
    ;
    div >
    ;
}
_jsx("div", { className: "indicator-description", children: indicator.description });
{
    indicator.actionable && indicator.actions.length > 0 && ()
        < div;
    className = "indicator-actions" >
        { indicator, : .actions.slice(0, 2).map(action => ()
                < button, key = { action, : .actionId }, onClick = {}(e), {
                e, : .stopPropagation(),
                action, : .actionType,
                indicator, : .indicatorId,
            }, { actionId: action.actionId })
        };
}
className = {} `indicator-action-button ${action.priority}`;
    >
        { action, : .title };
button >
;
div >
;
div >
;
div >
    { comparisonEnabled } && ()
    < div;
className = "performance-comparison" >
    (_jsx("h4", { children: "Competitive Position" })
        ,
            _jsxs("div", { className: "comparison-metrics", children: [_jsxs("div", { className: "comparison-item", children: [_jsx("span", { className: "comparison-label", children: "Category Rank" }), _jsxs("span", { className: "comparison-value", children: ["#", performanceData.competitivePosition.categoryRank, " of ", performanceData.competitivePosition.totalInCategory] })] }), _jsxs("div", { className: "comparison-item", children: [_jsx("span", { className: "comparison-label", children: "Percentile" }), _jsxs("span", { className: "comparison-value", children: [performanceData.competitivePosition.percentile, "th"] })] }), _jsxs("div", { className: "comparison-item", children: [_jsx("span", { className: "comparison-label", children: "Competitive Score" }), _jsxs("span", { className: "comparison-value", children: [Math.round(performanceData.competitivePosition.competitiveScore * 100), "%"] })] })] }));
div >
;
{
    displayMode === 'detailed' && ()
        < div;
    className = "optimization-opportunities" >
        (_jsx("h4", { children: "Optimization Opportunities" })
            ,
                _jsxs("div", { className: "opportunity-list", children: [performanceData.optimizationOpportunities.slice(0, 3).map(opportunity => ()
                            < div, key = { opportunity, : .opportunityId }, className = {} `opportunity-card ${opportunity.priority}`), ">}", _jsxs("div", { className: "opportunity-header", children: [_jsx("h5", { children: opportunity.title }), _jsxs("span", { className: `priority-badge ${opportunity.priority}`, children: ["}", opportunity.priority.toUpperCase()] })] }), _jsx("p", { children: opportunity.description }), _jsxs("div", { className: "opportunity-impact", children: [_jsxs("span", { children: ["Revenue: +$", opportunity.impact.revenueIncrease] }), "}", _jsxs("span", { children: ["Conversion: +", Math.round(opportunity.impact.conversionImprovement * 100), "%"] })] }), _jsx("button", { onClick: () => handleOptimizationAction('start_optimization', opportunity.opportunityId), className: "start-optimization-button", children: "Start Optimization" })] }));
}
div >
;
div >
;
div >
;
;
;
return;
_jsx("div", { className: "template-performance-indicators-container", children: renderIndicators() });
;
;
