import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Creator-Facing Conversion Optimization Dashboard - Story 30.2 Task 8
 *
 * Specialized dashboard for template creators that provides actionable conversion
 * optimization recommendations, performance insights, and growth opportunities.
 *
 * Features:
 * - Creator-specific funnel performance analytics
 * - Personalized optimization recommendations
 * - Template performance comparison and ranking
 * - Revenue optimization insights
 * - Competitive analysis and market positioning
 * - Creator growth trajectory tracking
 * - Automated improvement suggestions
 * - Success story integration and learning resources
 */
import { useState, useCallback, useEffect } from 'react';
export const [error, setError] = useState(null);
const [selectedTemplate, setSelectedTemplate] = useState(null);
const [activeMode, setActiveMode] = useState(dashboardMode);
// Load creator optimization data
const loadOptimizationData = useCallback(async () => {
    try {
        setLoading(true);
        setError(null);
        const query = {
            funnelId: funnelDefinition.id,
            timeRange,
            segments: [],
            cohorts: [],
            metrics: ['creator_optimization', 'template_performance', 'growth_opportunities'],
            aggregation: 'creator',
            filters: [
                { field: 'creator_id', operator: 'eq', value: creatorId }
            ]
        };
        const result = await analyticsInfrastructure.executeQuery(query);
        if (result.success && result.data) {
            const processedData = await processCreatorData(result.data, creatorProfile);
            setOptimizationData(processedData);
        }
        else {
            setError(result.error || 'Failed to load creator optimization data');
        }
    }
    catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
    finally {
        setLoading(false);
    }
}, [funnelDefinition, analyticsInfrastructure, timeRange, creatorId, creatorProfile]);
// Process creator data
const processCreatorData = async (rawData, profile) => {
    // Simulate comprehensive creator optimization processing
    return {
        overviewMetrics: generateCreatorOverviewMetrics(profile),
        templatePerformance: generateTemplatePerformance(profile),
        optimizationRecommendations: generateOptimizationRecommendations(profile),
        competitiveInsights: generateCompetitiveInsights(profile),
        growthOpportunities: generateGrowthOpportunities(profile),
        learningResources: generateLearningResources(profile),
        successStories: generateSuccessStories(profile),
        automatedSuggestions: generateAutomatedSuggestions(profile),
        goalProgress: generateGoalProgress(profile)
    };
};
// Generate creator overview metrics
const generateCreatorOverviewMetrics = (profile) => {
    return {
        totalRevenue: profile.totalRevenue,
        monthlyRevenue: Math.floor(profile.totalRevenue * 0.12),
        revenueGrowth: 0.156,
        totalTemplates: profile.totalTemplates,
        activeTemplates: Math.floor(profile.totalTemplates * 0.8),
        averageConversionRate: 0.143,
        conversionTrend: 0.089,
        totalDownloads: 45670,
        downloadGrowth: 0.234,
        averageRating: profile.averageRating,
        ratingTrend: 0.012,
        marketRank: 47,
        rankChange: -3,
        followerCount: profile.followerCount,
        followerGrowth: 0.167,
        lastUpdated: Date.now()
    };
};
// Generate template performance data
const generateTemplatePerformance = (profile) => {
    return Array.from({ length: Math.min(profile.totalTemplates, 10) }, (_, i) => ({
        templateId: `template-${i + 1}`,
        templateName: `Template ${i + 1}`,
        category: ['Web Design', 'Mobile UI', 'Branding', 'Illustrations'][i % 4],
        publishDate: Date.now() - (i + 1) * 30 * 24 * 60 * 60 * 1000,
        lastUpdated: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        metrics: {
            views: Math.floor(Math.random() * 5000 + 1000),
            downloads: Math.floor(Math.random() * 500 + 100),
            purchases: Math.floor(Math.random() * 50 + 10),
            revenue: Math.floor(Math.random() * 2000 + 500),
            conversionRate: Math.random() * 0.1 + 0.05,
            rating: Math.random() * 1.5 + 3.5,
            reviewCount: Math.floor(Math.random() * 50 + 5),
            favoriteCount: Math.floor(Math.random() * 100 + 20),
            shareCount: Math.floor(Math.random() * 30 + 5),
            bounceRate: Math.random() * 0.4 + 0.3,
            timeOnPage: Math.floor(Math.random() * 300 + 60)
        },
        conversionFunnel: {
            steps: [
                { stepName: 'View Template', visitors: 1000, conversions: 800, conversionRate: 0.8, dropoffRate: 0.2, averageTimeSpent: 45, optimizationScore: 0.85 },
                { stepName: 'Preview Details', visitors: 800, conversions: 400, conversionRate: 0.5, dropoffRate: 0.5, averageTimeSpent: 120, optimizationScore: 0.65 },
                { stepName: 'Download/Purchase', visitors: 400, conversions: 200, conversionRate: 0.5, dropoffRate: 0.5, averageTimeSpent: 180, optimizationScore: 0.70 }
            ],
            overallConversionRate: 0.2,
            biggestDropoff: 'Preview Details',
            biggestOpportunity: 'Download/Purchase',
            optimizationPotential: 0.35
        },
        optimization: {
            optimizationScore: Math.random() * 0.3 + 0.7,
            optimizationPotential: Math.random() * 0.4 + 0.1,
            keyStrengths: ['High visual appeal', 'Unique design style'],
            improvementAreas: ['Preview quality', 'Description optimization'],
            quickWins: [
                {
                    action: 'Update preview images',
                    description: 'Replace current preview with high-quality showcase images',
                    expectedImpact: 0.15,
                    effort: 'low',
                    timeToImplement: 2,
                    successProbability: 0.85
                }
            ],
            longTermOpportunities: [
                {
                    opportunity: 'Create template variations',
                    description: 'Develop color and style variations to appeal to broader audience',
                    expectedImpact: 0.35,
                    effort: 'high',
                    timeToImplement: 14,
                    investmentRequired: 500,
                    expectedROI: 2.8
                }
            ]
        },
        competitivePosition: {
            categoryRank: Math.floor(Math.random() * 50 + 10),
            totalInCategory: 200,
            percentile: Math.random() * 50 + 50,
            topCompetitors: [
                {
                    templateId: 'competitor-1',
                    templateName: 'Similar Template Pro',
                    creatorName: 'Top Creator',
                    metrics: {
                        estimatedRevenue: 3000,
                        estimatedDownloads: 800,
                        rating: 4.6,
                        reviewCount: 120,
                        pricePoint: 29
                    },
                    strengthsVsYours: ['Higher rating', 'More reviews'],
                    weaknessesVsYours: ['Higher price', 'Less unique style']
                }
            ],
            competitiveAdvantages: ['Unique style', 'Affordable pricing'],
            vulnerabilities: ['Fewer reviews', 'Lower brand recognition'],
            marketTrends: [
                {
                    trend: 'Minimalist design increasing',
                    direction: 'growing',
                    impact: 'high',
                    opportunity: 'Adapt templates to minimalist trend',
                    threat: 'Current detailed styles may become outdated'
                }
            ]
        },
        recommendations: [
            {
                type: 'content_improvement',
                title: 'Enhance Template Previews',
                description: 'Update preview images to showcase template in realistic use cases',
                priority: 'high',
                category: 'quick_win',
                expectedImpact: {
                    revenueIncrease: 340,
                    conversionImprovement: 0.08,
                    downloadIncrease: 150,
                    ratingImprovement: 0.1,
                    timeToImpact: 7,
                    confidence: 0.8
                },
                implementation: {
                    steps: ['Create mockup scenarios', 'Design preview images', 'Update template page'],
                    estimatedTime: 4,
                    requiredSkills: ['Design', 'Photography'],
                    tools: ['Photoshop', 'Figma'],
                    cost: 0,
                    difficulty: 'easy'
                },
                successMetrics: ['Preview click-through rate', 'Time spent on page', 'Download conversion rate']
            }
        ]
    }));
};
// Generate optimization recommendations
const generateOptimizationRecommendations = (profile) => {
    return [
        {
            recommendationId: 'portfolio-optimization-1',
            type: 'portfolio_optimization',
            title: 'Focus on High-Performing Categories',
            description: 'Your web design templates show 40% higher conversion rates than other categories. Consider expanding this portfolio.',
            priority: 'high',
            impact: {
                portfolioImpact: 0.25,
                revenueImpact: 4500,
                reachImpact: 0.15,
                brandImpact: 0.2,
                timeframe: 60,
                successProbability: 0.78
            },
            targetTemplates: ['template-1', 'template-3', 'template-5'],
            actionPlan: {
                phases: [
                    {
                        phaseName: 'Analysis Phase',
                        description: 'Analyze high-performing templates to identify success patterns',
                        duration: 7,
                        tasks: [
                            {
                                taskName: 'Performance analysis',
                                description: 'Review metrics and user feedback for top templates',
                                effort: 4,
                                skills: ['Analytics', 'Research'],
                                deliverables: ['Performance report', 'Pattern identification']
                            }
                        ],
                        dependencies: [],
                        successCriteria: ['Identify 3-5 key success factors', 'Document replicable patterns']
                    },
                    {
                        phaseName: 'Development Phase',
                        description: 'Create new templates based on successful patterns',
                        duration: 30,
                        tasks: [
                            {
                                taskName: 'Template creation',
                                description: 'Design and develop 3 new web design templates',
                                effort: 40,
                                skills: ['Web Design', 'UX/UI'],
                                deliverables: ['3 new templates', 'Preview materials']
                            }
                        ],
                        dependencies: ['Analysis Phase'],
                        successCriteria: ['Launch 3 new templates', 'Achieve 4+ star rating']
                    }
                ],
                totalTimeline: 45,
                milestones: [
                    {
                        milestoneName: 'Success Pattern Identified',
                        targetDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
                        metrics: [
                            { metric: 'patterns_identified', target: 5, current: 0, progress: 0 }
                        ],
                        reward: 'Portfolio insights unlocked'
                    }
                ],
                resources: [
                    {
                        resourceType: 'tool',
                        name: 'Design Analytics Platform',
                        description: 'Advanced analytics for template performance',
                        cost: 49,
                        link: 'https://analytics.example.com'
                    }
                ],
                riskMitigation: [
                    {
                        risk: 'New templates may not perform as expected',
                        probability: 0.3,
                        impact: 0.2,
                        mitigation: 'Start with variations of proven designs',
                        contingency: 'Pivot to different template types if needed'
                    }
                ]
            },
            relatedGoals: ['revenue-growth-2024']
        },
        {
            recommendationId: 'pricing-strategy-1',
            type: 'pricing_strategy',
            title: 'Optimize Template Pricing Strategy',
            description: 'Price sensitivity analysis suggests 15% higher prices could increase revenue without significantly impacting downloads.',
            priority: 'medium',
            impact: {
                portfolioImpact: 0.1,
                revenueImpact: 2800,
                reachImpact: -0.05,
                brandImpact: 0.05,
                timeframe: 14,
                successProbability: 0.85
            },
            targetTemplates: ['template-2', 'template-4', 'template-6'],
            actionPlan: {
                phases: [
                    {
                        phaseName: 'A/B Testing',
                        description: 'Test price increases on select templates',
                        duration: 14,
                        tasks: [
                            {
                                taskName: 'Price test setup',
                                description: 'Configure A/B test for pricing optimization',
                                effort: 2,
                                skills: ['Testing', 'Analytics'],
                                deliverables: ['Test configuration', 'Monitoring dashboard']
                            }
                        ],
                        dependencies: [],
                        successCriteria: ['Statistically significant results', 'Revenue optimization data']
                    }
                ],
                totalTimeline: 14,
                milestones: [
                    {
                        milestoneName: 'Price Test Complete',
                        targetDate: Date.now() + 14 * 24 * 60 * 60 * 1000,
                        metrics: [
                            { metric: 'revenue_increase', target: 15, current: 0, progress: 0 }
                        ],
                        reward: 'Pricing optimization insights'
                    }
                ],
                resources: [
                    {
                        resourceType: 'service',
                        name: 'A/B Testing Platform',
                        description: 'Professional testing and analytics service',
                        cost: 79,
                        link: 'https://testing.example.com'
                    }
                ],
                riskMitigation: [
                    {
                        risk: 'Higher prices may reduce conversions significantly',
                        probability: 0.25,
                        impact: 0.15,
                        mitigation: 'Start with small price increases and monitor closely',
                        contingency: 'Revert to original pricing if conversion drop exceeds 10%'
                    }
                ]
            },
            relatedGoals: ['revenue-growth-2024']
        }
    ];
};
// Generate competitive insights
const generateCompetitiveInsights = (profile) => {
    return {
        marketPosition: {
            overallRank: 47,
            categoryRanks: [
                { category: 'Web Design', rank: 23, totalCreators: 156, marketShare: 0.034, growth: 0.12 },
                { category: 'Mobile UI', rank: 67, totalCreators: 203, marketShare: 0.018, growth: 0.08 }
            ],
            marketShare: 0.026,
            brandStrength: 0.67,
            competitiveAdvantages: ['Unique design style', 'Consistent quality', 'Affordable pricing'],
            uniqueValueProposition: 'Modern, accessible design templates with comprehensive documentation'
        },
        competitorAnalysis: [
            {
                competitorId: 'competitor-premium',
                competitorName: 'Premium Design Co',
                competitorTier: 'platinum',
                strengths: ['Premium brand', 'High-end clients', 'Exclusive designs'],
                weaknesses: ['Higher prices', 'Limited accessibility', 'Slower release cycle'],
                strategy: 'Premium positioning with exclusive, high-value templates',
                recentMoves: ['Launched enterprise template collection', 'Partnered with major brands'],
                threat_level: 'medium'
            }
        ],
        marketOpportunities: [
            {
                opportunity: 'Mobile-First Design Templates',
                description: 'Growing demand for mobile-first responsive templates',
                marketSize: 45000,
                competition: 'medium',
                barrierToEntry: 'low',
                timeToMarket: 45,
                investmentRequired: 2500,
                expectedROI: 3.2
            }
        ],
        threatAnalysis: [
            {
                threat: 'AI-Generated Template Competition',
                description: 'Increasing competition from AI-generated design templates',
                probability: 0.7,
                impact: 0.25,
                timeframe: 180,
                mitigation: ['Focus on human creativity and customization', 'Integrate AI tools into workflow'],
                monitoring: ['Track AI template market growth', 'Monitor competitor AI adoption']
            }
        ],
        benchmarkData: {
            industryAverages: [
                { metric: 'conversion_rate', industryAverage: 0.12, yourValue: 0.143, percentile: 68, trend: 'above' },
                { metric: 'average_rating', industryAverage: 4.1, yourValue: profile.averageRating, percentile: 72, trend: 'above' }
            ],
            peerComparisons: [
                { metric: 'monthly_revenue', yourValue: 3450, peerAverage: 2890, topPerformer: 8900, bottomPerformer: 890, ranking: 34 }
            ],
            bestPractices: [
                {
                    practice: 'Comprehensive Template Documentation',
                    description: 'Provide detailed setup guides and customization instructions',
                    category: 'User Experience',
                    difficulty: 'moderate',
                    impact: 'high',
                    examples: [
                        {
                            creatorName: 'Documentation Master',
                            implementation: 'Created video tutorials and step-by-step guides for each template',
                            results: '40% increase in user satisfaction and 25% reduction in support requests',
                            keyTakeaways: ['Video tutorials are highly valued', 'Step-by-step guides reduce friction']
                        }
                    ]
                }
            ],
            performance_gaps: [
                {
                    area: 'Social Media Presence',
                    gap: 0.35,
                    priority: 'medium',
                    actionItems: ['Increase posting frequency', 'Engage more with community', 'Share behind-the-scenes content'],
                    timeToClose: 60
                }
            ]
        }
    };
};
// Generate growth opportunities
const generateGrowthOpportunities = (profile) => {
    return [
        {
            opportunityId: 'mobile-expansion',
            title: 'Mobile UI Template Expansion',
            description: 'Mobile UI design is a rapidly growing market with high demand and good profit margins',
            category: 'new_market',
            potential: {
                revenueUpside: 15000,
                marketSize: 78000,
                timeToValue: 90,
                scalability: 'high',
                sustainability: 'high',
                confidenceLevel: 0.82
            },
            requirements: [
                {
                    requirement: 'Mobile Design Skills',
                    type: 'skill',
                    description: 'Advanced mobile UI/UX design capabilities',
                    cost: 500,
                    timeToAcquire: 30,
                    alternatives: ['Online courses', 'Mentorship program', 'Workshop attendance']
                },
                {
                    requirement: 'Mobile Testing Devices',
                    type: 'resource',
                    description: 'Various mobile devices for testing and screenshots',
                    cost: 2000,
                    timeToAcquire: 7,
                    alternatives: ['Device rental service', 'Emulator tools', 'Partner with mobile developer']
                }
            ],
            roadmap: {
                phases: [
                    {
                        phaseName: 'Skill Development',
                        description: 'Acquire mobile design skills and knowledge',
                        duration: 30,
                        objectives: ['Master mobile design principles', 'Learn platform-specific guidelines'],
                        deliverables: ['Skill certification', 'Practice projects'],
                        success_criteria: ['Complete mobile design course', 'Create 3 practice mobile designs']
                    },
                    {
                        phaseName: 'Template Development',
                        description: 'Create initial mobile template collection',
                        duration: 45,
                        objectives: ['Design 5 mobile templates', 'Create comprehensive previews'],
                        deliverables: ['5 mobile templates', 'Marketing materials'],
                        success_criteria: ['Launch templates with 4+ star rating', 'Generate first mobile template sales']
                    }
                ],
                totalTimeline: 90,
                keyMilestones: [
                    {
                        milestoneName: 'First Mobile Template Live',
                        description: 'Successfully launch first mobile UI template',
                        targetDate: Date.now() + 60 * 24 * 60 * 60 * 1000,
                        metrics: [
                            { metric: 'templates_launched', target: 1, current: 0, progress: 0 }
                        ],
                        dependencies: ['Skill Development', 'Template Development']
                    }
                ],
                dependencies: [
                    {
                        dependency: 'Mobile Design Tool Access',
                        type: 'technology',
                        criticality: 'high',
                        mitigation: 'Subscribe to design platform with mobile capabilities'
                    }
                ]
            },
            risks: [
                {
                    risk: 'Mobile market more competitive than expected',
                    probability: 0.4,
                    impact: 0.3,
                    mitigation: 'Focus on unique design style and niche markets',
                    monitoring: 'Track competitor launches and market saturation'
                }
            ]
        }
    ];
};
// Generate learning resources
const generateLearningResources = (profile) => {
    return [
        {
            resourceId: 'mobile-design-course',
            title: 'Advanced Mobile UI Design Masterclass',
            description: 'Comprehensive course covering modern mobile design principles and best practices',
            type: 'course',
            category: 'Mobile Design',
            difficulty: 'intermediate',
            estimatedTime: 20,
            format: 'online',
            provider: 'Design Academy',
            cost: 299,
            rating: 4.8,
            relevanceScore: 0.95,
            relatedSkills: ['Mobile UI', 'User Experience', 'Responsive Design'],
            prerequisites: ['Basic design knowledge', 'Familiarity with design tools']
        },
        {
            resourceId: 'conversion-optimization',
            title: 'Template Conversion Optimization Guide',
            description: 'Learn proven strategies to improve template download and purchase rates',
            type: 'documentation',
            category: 'Marketing',
            difficulty: 'beginner',
            estimatedTime: 8,
            format: 'self_paced',
            provider: 'Marketplace Success',
            cost: 49,
            rating: 4.6,
            relevanceScore: 0.89,
            relatedSkills: ['Marketing', 'Analytics', 'User Psychology'],
            prerequisites: ['Basic marketplace knowledge']
        }
    ];
};
// Generate success stories
const generateSuccessStories = (profile) => {
    return [
        {
            storyId: 'mobile-success-story',
            title: 'From Web to Mobile: 300% Revenue Increase',
            creatorName: 'Sarah Chen',
            creatorTier: 'gold',
            challenge: 'Stagnating revenue from web design templates, needed new growth avenue',
            solution: 'Expanded into mobile UI templates, focused on modern app design trends',
            results: {
                revenueIncrease: 3.2,
                conversionImprovement: 0.45,
                downloadGrowth: 2.8,
                ratingImprovement: 0.3,
                marketShareGain: 0.15,
                timeToResults: 120
            },
            timeline: 120,
            keyTakeaways: [
                'Market research is crucial for identifying opportunities',
                'Starting with a small collection and iterating works better than big launches',
                'Cross-promoting between web and mobile templates increased both sales'
            ],
            applicableStrategies: ['market_expansion', 'cross_promotion', 'iterative_launch'],
            relevanceScore: 0.87
        }
    ];
};
// Generate automated suggestions
const generateAutomatedSuggestions = (profile) => {
    return [
        {
            suggestionId: 'price-optimization-alert',
            type: 'pricing_adjustment',
            title: 'Price Optimization Opportunity Detected',
            description: 'Template "Modern Dashboard UI" has high demand but conversion rate suggests price could be increased by 20%',
            confidence: 0.84,
            impact: {
                primary: 'Revenue increase',
                secondary: ['Higher profit margins', 'Premium positioning'],
                quantifiedImpact: 0.18,
                timeframe: 7,
                certainty: 0.78
            },
            automationLevel: 'semi_automated',
            triggerConditions: [
                {
                    condition: 'High view-to-download ratio',
                    threshold: 0.8,
                    timeframe: 14,
                    frequency: 'weekly'
                },
                {
                    condition: 'Low price sensitivity indicators',
                    threshold: 0.3,
                    timeframe: 30,
                    frequency: 'monthly'
                }
            ],
            implementation: {
                automatable: true,
                manualSteps: ['Review competitive pricing', 'Confirm price change'],
                toolsRequired: ['Pricing dashboard', 'A/B testing platform'],
                skillsRequired: ['Pricing strategy', 'Data analysis'],
                estimatedTime: 1
            }
        }
    ];
};
// Generate goal progress
const generateGoalProgress = (profile) => {
    return profile.goals.map(goal => ({
        goal,
        progressData: Array.from({ length: 30 }, (_, i) => ({
            date: Date.now() - (29 - i) * 24 * 60 * 60 * 1000,
            value: goal.target.currentValue + (Math.random() - 0.4) * goal.target.currentValue * 0.1,
            target: goal.target.currentValue + (goal.target.targetValue - goal.target.currentValue) * (i / 29),
            progress: (i / 29) * 100
        })),
        insights: [
            {
                insight: 'Goal progress is on track with current trajectory',
                type: 'positive',
                impact: 'medium',
                actionable: false
            }
        ],
        adjustmentRecommendations: [
            {
                recommendation: 'Consider increasing marketing efforts to accelerate progress',
                reason: 'Current growth rate could be improved with focused marketing',
                impact: 'Potential 25% faster goal achievement',
                effort: 'medium',
                urgency: 'planned'
            }
        ]
    }));
};
// Handle action taken
const handleActionTaken = useCallback((actionType, details) => {
    const action = {
        actionType: actionType,
        details,
        timestamp: Date.now()
    };
    if (onActionTaken) {
        onActionTaken(action);
    }
}, [onActionTaken]);
[onGoalSet];
;
// Initial data load
useEffect(() => {
    loadOptimizationData();
}, [loadOptimizationData]);
// Handle export
const handleExport = useCallback(() => {
    if (!optimizationData || !onExport)
        return;
    const exportData = {
        creatorProfile,
        overviewMetrics: optimizationData.overviewMetrics,
        templatePerformance: optimizationData.templatePerformance,
        optimizationRecommendations: optimizationData.optimizationRecommendations,
        goalProgress: optimizationData.goalProgress,
        exportTimestamp: Date.now()
    };
    onExport(exportData);
}, [optimizationData, creatorProfile, onExport]);
if (loading) {
    return (_jsxs("div", { className: "creator-optimization-loading", children: [_jsx("div", { className: "loading-spinner" }), _jsx("p", { children: "Loading your optimization dashboard..." })] }));
}
if (error) {
    return (_jsxs("div", { className: "creator-optimization-error", children: [_jsx("h3", { children: "Dashboard Error" }), _jsx("p", { className: "error-message", children: error }), _jsx("button", { onClick: loadOptimizationData, className: "retry-button", children: "Retry" })] }));
}
if (!optimizationData) {
    return _jsx("div", { className: "creator-optimization-error", children: "No data available" });
}
return (_jsxs("div", { className: "creator-optimization-dashboard", children: [_jsxs("div", { className: "dashboard-header", children: [_jsxs("div", { className: "creator-info", children: [_jsxs("h2", { children: ["Welcome back, ", creatorProfile.displayName, "!"] }), _jsxs("div", { className: "creator-badges", children: [_jsxs("span", { className: `tier-badge ${creatorProfile.tier}`, children: [creatorProfile.tier.toUpperCase(), " CREATOR"] }), creatorProfile.badgesEarned.slice(0, 3).map(badge => (_jsx("span", { className: `achievement-badge ${badge.rarity}`, children: badge.name }, badge.badgeId)))] })] }), _jsx("div", { className: "dashboard-controls", children: _jsx("button", { onClick: handleExport, className: "export-button", children: "Export Report" }) })] }), _jsx("div", { className: "dashboard-navigation", children: ['overview', 'performance', 'optimization', 'growth', 'learning'].map(mode => (_jsx("button", { className: `nav-tab ${activeMode === mode ? 'active' : ''}`, onClick: () => setActiveMode(mode), children: mode.charAt(0).toUpperCase() + mode.slice(1) }, mode))) }), _jsxs("div", { className: "dashboard-content", children: [activeMode === 'overview' && (_jsxs("div", { className: "overview-section", children: [_jsxs("div", { className: "metrics-grid", children: [_jsxs("div", { className: "metric-card revenue", children: [_jsx("h3", { children: "Monthly Revenue" }), _jsxs("div", { className: "metric-value", children: ["$", optimizationData.overviewMetrics.monthlyRevenue.toLocaleString()] }), _jsxs("div", { className: `metric-trend ${optimizationData.overviewMetrics.revenueGrowth >= 0 ? 'positive' : 'negative'}`, children: [optimizationData.overviewMetrics.revenueGrowth >= 0 ? '+' : '', Math.round(optimizationData.overviewMetrics.revenueGrowth * 100), "% this month"] })] }), _jsxs("div", { className: "metric-card conversion", children: [_jsx("h3", { children: "Avg Conversion Rate" }), _jsxs("div", { className: "metric-value", children: [Math.round(optimizationData.overviewMetrics.averageConversionRate * 100), "%"] }), _jsxs("div", { className: `metric-trend ${optimizationData.overviewMetrics.conversionTrend >= 0 ? 'positive' : 'negative'}`, children: [optimizationData.overviewMetrics.conversionTrend >= 0 ? '+' : '', Math.round(optimizationData.overviewMetrics.conversionTrend * 100), "% trend"] })] }), _jsxs("div", { className: "metric-card templates", children: [_jsx("h3", { children: "Active Templates" }), _jsx("div", { className: "metric-value", children: optimizationData.overviewMetrics.activeTemplates }), _jsxs("div", { className: "metric-detail", children: ["of ", optimizationData.overviewMetrics.totalTemplates, " total"] })] }), _jsxs("div", { className: "metric-card ranking", children: [_jsx("h3", { children: "Market Rank" }), _jsxs("div", { className: "metric-value", children: ["#", optimizationData.overviewMetrics.marketRank] }), _jsxs("div", { className: `metric-trend ${optimizationData.overviewMetrics.rankChange <= 0 ? 'positive' : 'negative'}`, children: [optimizationData.overviewMetrics.rankChange > 0 ? '+' : '', optimizationData.overviewMetrics.rankChange, " this month"] })] })] }), _jsxs("div", { className: "top-recommendations", children: [_jsx("h3", { children: "Top Recommendations for You" }), _jsx("div", { className: "recommendation-cards", children: optimizationData.optimizationRecommendations.slice(0, 3).map(rec => (_jsxs("div", { className: `recommendation-card ${rec.priority}`, children: [_jsxs("div", { className: "recommendation-header", children: [_jsx("h4", { children: rec.title }), _jsx("span", { className: `priority-indicator ${rec.priority}`, children: rec.priority.toUpperCase() })] }), _jsx("p", { children: rec.description }), _jsxs("div", { className: "recommendation-impact", children: [_jsxs("span", { children: ["Expected Revenue: +$", rec.impact.revenueImpact.toLocaleString()] }), _jsxs("span", { children: ["Timeline: ", rec.impact.timeframe, " days"] })] }), _jsx("button", { onClick: () => handleActionTaken('recommendation_accepted', { recommendationId: rec.recommendationId }), className: "accept-recommendation-button", children: "Start Implementation" })] }, rec.recommendationId))) })] })] })), activeMode === 'performance' && (_jsxs("div", { className: "performance-section", children: [_jsx("h3", { children: "Template Performance Analysis" }), _jsx("div", { className: "template-performance-grid", children: optimizationData.templatePerformance.slice(0, 6).map(template => (_jsxs("div", { className: "template-performance-card", children: [_jsxs("div", { className: "template-header", children: [_jsx("h4", { children: template.templateName }), _jsx("span", { className: "category-tag", children: template.category })] }), _jsxs("div", { className: "template-metrics", children: [_jsxs("div", { className: "metric", children: [_jsx("span", { className: "label", children: "Revenue" }), _jsxs("span", { className: "value", children: ["$", template.metrics.revenue] })] }), _jsxs("div", { className: "metric", children: [_jsx("span", { className: "label", children: "Downloads" }), _jsx("span", { className: "value", children: template.metrics.downloads })] }), _jsxs("div", { className: "metric", children: [_jsx("span", { className: "label", children: "Conversion" }), _jsxs("span", { className: "value", children: [Math.round(template.metrics.conversionRate * 100), "%"] })] }), _jsxs("div", { className: "metric", children: [_jsx("span", { className: "label", children: "Rating" }), _jsxs("span", { className: "value", children: [template.metrics.rating.toFixed(1), " \u2B50"] })] })] }), _jsxs("div", { className: "optimization-score", children: [_jsx("span", { className: "label", children: "Optimization Score" }), _jsx("div", { className: "score-bar", children: _jsx("div", { className: "score-fill", style: { width: `${template.optimization.optimizationScore * 100}%` } }) }), _jsxs("span", { className: "score-value", children: [Math.round(template.optimization.optimizationScore * 100), "%"] })] }), _jsx("button", { onClick: () => setSelectedTemplate(template.templateId), className: "view-details-button", children: "View Details" })] }, template.templateId))) })] })), activeMode === 'optimization' && (_jsxs("div", { className: "optimization-section", children: [_jsx("h3", { children: "Optimization Opportunities" }), _jsx("div", { className: "optimization-recommendations", children: optimizationData.optimizationRecommendations.map(rec => (_jsxs("div", { className: "optimization-recommendation-card", children: [_jsxs("div", { className: "recommendation-header", children: [_jsxs("div", { className: "recommendation-title", children: [_jsx("h4", { children: rec.title }), _jsx("span", { className: `recommendation-type ${rec.type}`, children: rec.type.replace('_', ' ').toUpperCase() })] }), _jsx("span", { className: `priority-badge ${rec.priority}`, children: rec.priority.toUpperCase() })] }), _jsx("p", { className: "recommendation-description", children: rec.description }), _jsxs("div", { className: "impact-metrics", children: [_jsxs("div", { className: "impact-metric", children: [_jsx("span", { className: "label", children: "Revenue Impact" }), _jsxs("span", { className: "value", children: ["+$", rec.impact.revenueImpact.toLocaleString()] })] }), _jsxs("div", { className: "impact-metric", children: [_jsx("span", { className: "label", children: "Timeline" }), _jsxs("span", { className: "value", children: [rec.impact.timeframe, " days"] })] }), _jsxs("div", { className: "impact-metric", children: [_jsx("span", { className: "label", children: "Success Probability" }), _jsxs("span", { className: "value", children: [Math.round(rec.impact.successProbability * 100), "%"] })] })] }), _jsxs("div", { className: "action-plan-summary", children: [_jsx("strong", { children: "Action Plan:" }), _jsx("ul", { children: rec.actionPlan.phases.slice(0, 2).map((phase, index) => (_jsx("li", { children: phase.description }, index))) })] }), _jsxs("div", { className: "recommendation-actions", children: [_jsx("button", { onClick: () => handleActionTaken('recommendation_accepted', { recommendationId: rec.recommendationId }), className: "primary-action-button", children: "Start Implementation" }), _jsx("button", { className: "secondary-action-button", children: "Learn More" })] })] }, rec.recommendationId))) })] })), activeMode === 'growth' && (_jsxs("div", { className: "growth-section", children: [_jsx("h3", { children: "Growth Opportunities" }), _jsx("div", { className: "growth-opportunities", children: optimizationData.growthOpportunities.map(opportunity => (_jsxs("div", { className: "growth-opportunity-card", children: [_jsxs("div", { className: "opportunity-header", children: [_jsx("h4", { children: opportunity.title }), _jsx("span", { className: `category-badge ${opportunity.category}`, children: opportunity.category.replace('_', ' ').toUpperCase() })] }), _jsx("p", { children: opportunity.description }), _jsxs("div", { className: "opportunity-potential", children: [_jsx("h5", { children: "Growth Potential" }), _jsxs("div", { className: "potential-metrics", children: [_jsxs("div", { className: "potential-metric", children: [_jsx("span", { className: "label", children: "Revenue Upside" }), _jsxs("span", { className: "value", children: ["$", opportunity.potential.revenueUpside.toLocaleString()] })] }), _jsxs("div", { className: "potential-metric", children: [_jsx("span", { className: "label", children: "Market Size" }), _jsxs("span", { className: "value", children: ["$", opportunity.potential.marketSize.toLocaleString()] })] }), _jsxs("div", { className: "potential-metric", children: [_jsx("span", { className: "label", children: "Time to Value" }), _jsxs("span", { className: "value", children: [opportunity.potential.timeToValue, " days"] })] }), _jsxs("div", { className: "potential-metric", children: [_jsx("span", { className: "label", children: "Confidence" }), _jsxs("span", { className: "value", children: [Math.round(opportunity.potential.confidenceLevel * 100), "%"] })] })] })] }), _jsxs("div", { className: "opportunity-requirements", children: [_jsx("h5", { children: "Requirements" }), _jsx("ul", { children: opportunity.requirements.slice(0, 3).map((req, index) => (_jsxs("li", { children: [_jsxs("strong", { children: [req.requirement, ":"] }), " ", req.description, req.cost > 0 && _jsxs("span", { className: "cost", children: [" ($", req.cost, ")"] })] }, index))) })] }), _jsx("button", { onClick: () => handleActionTaken('growth_opportunity_explored', { opportunityId: opportunity.opportunityId }), className: "explore-opportunity-button", children: "Explore Opportunity" })] }, opportunity.opportunityId))) })] })), activeMode === 'learning' && (_jsxs("div", { className: "learning-section", children: [_jsx("h3", { children: "Recommended Learning Resources" }), _jsx("div", { className: "learning-resources", children: optimizationData.learningResources.map(resource => (_jsxs("div", { className: "learning-resource-card", children: [_jsxs("div", { className: "resource-header", children: [_jsx("h4", { children: resource.title }), _jsxs("div", { className: "resource-meta", children: [_jsx("span", { className: `resource-type ${resource.type}`, children: resource.type.toUpperCase() }), _jsx("span", { className: `difficulty-badge ${resource.difficulty}`, children: resource.difficulty.toUpperCase() })] })] }), _jsx("p", { children: resource.description }), _jsxs("div", { className: "resource-details", children: [_jsxs("div", { className: "resource-detail", children: [_jsx("span", { className: "label", children: "Provider" }), _jsx("span", { className: "value", children: resource.provider })] }), _jsxs("div", { className: "resource-detail", children: [_jsx("span", { className: "label", children: "Time" }), _jsxs("span", { className: "value", children: [resource.estimatedTime, "h"] })] }), _jsxs("div", { className: "resource-detail", children: [_jsx("span", { className: "label", children: "Cost" }), _jsxs("span", { className: "value", children: ["$", resource.cost] })] }), _jsxs("div", { className: "resource-detail", children: [_jsx("span", { className: "label", children: "Rating" }), _jsxs("span", { className: "value", children: [resource.rating, " \u2B50"] })] })] }), _jsxs("div", { className: "related-skills", children: [_jsx("strong", { children: "Skills you'll learn:" }), _jsx("div", { className: "skill-tags", children: resource.relatedSkills.map(skill => (_jsx("span", { className: "skill-tag", children: skill }, skill))) })] }), _jsx("button", { onClick: () => handleActionTaken('learning_started', { resourceId: resource.resourceId }), className: "start-learning-button", children: "Start Learning" })] }, resource.resourceId))) }), _jsxs("div", { className: "success-stories", children: [_jsx("h3", { children: "Success Stories" }), optimizationData.successStories.map(story => (_jsxs("div", { className: "success-story-card", children: [_jsxs("div", { className: "story-header", children: [_jsx("h4", { children: story.title }), _jsxs("div", { className: "story-meta", children: [_jsx("span", { className: "creator-name", children: story.creatorName }), _jsx("span", { className: `tier-badge ${story.creatorTier}`, children: story.creatorTier.toUpperCase() })] })] }), _jsxs("div", { className: "story-content", children: [_jsxs("div", { className: "challenge", children: [_jsx("strong", { children: "Challenge:" }), " ", story.challenge] }), _jsxs("div", { className: "solution", children: [_jsx("strong", { children: "Solution:" }), " ", story.solution] })] }), _jsxs("div", { className: "story-results", children: [_jsx("strong", { children: "Results:" }), _jsxs("div", { className: "results-grid", children: [_jsxs("div", { className: "result", children: [_jsx("span", { className: "label", children: "Revenue Increase" }), _jsxs("span", { className: "value", children: [Math.round(story.results.revenueIncrease * 100), "%"] })] }), _jsxs("div", { className: "result", children: [_jsx("span", { className: "label", children: "Download Growth" }), _jsxs("span", { className: "value", children: [Math.round(story.results.downloadGrowth * 100), "%"] })] }), _jsxs("div", { className: "result", children: [_jsx("span", { className: "label", children: "Time to Results" }), _jsxs("span", { className: "value", children: [story.results.timeToResults, " days"] })] })] })] }), _jsxs("div", { className: "key-takeaways", children: [_jsx("strong", { children: "Key Takeaways:" }), _jsx("ul", { children: story.keyTakeaways.map((takeaway, index) => (_jsx("li", { children: takeaway }, index))) })] })] }, story.storyId)))] })] }))] })] }));
;
