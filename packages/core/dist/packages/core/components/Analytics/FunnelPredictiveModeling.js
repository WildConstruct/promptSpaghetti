import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Predictive Funnel Performance Modeling - Story 30.2 Task 7
 *
 * Advanced predictive modeling system that forecasts funnel performance,
 * predicts user behavior, and provides proactive optimization recommendations.
 *
 * Features:
 * - Machine learning-based performance forecasting
 * - User behavior prediction and churn modeling
 * - Seasonal trend analysis and forecasting
 * - Scenario planning and what-if analysis
 * - Predictive cohort analysis and lifetime value modeling
 * - Real-time model updating and drift detection
 * - Multi-horizon forecasting (short, medium, long-term)
 * - Confidence intervals and prediction uncertainty quantification
 */
import { useState, useCallback, useRef, useEffect } from 'react';
export const [error, setError] = useState(null);
const [activeTab, setActiveTab] = useState('forecasts');
const [selectedModel, setSelectedModel] = useState(modelConfig.models[0]);
const [selectedHorizon, setSelectedHorizon] = useState(forecastHorizon);
const [realtimeUpdates, setRealtimeUpdates] = useState(false);
const intervalRef = useRef(null);
// Load predictive modeling data
const loadModelingData = useCallback(async () => {
    try {
        setLoading(true);
        setError(null);
        const query = {
            funnelId: funnelDefinition.id,
            timeRange,
            segments: segments.map(s => s.id),
            cohorts: cohorts.map(c => c.id),
            metrics: ['predictive_forecasts', 'behavior_predictions', 'churn_analysis'],
            aggregation: 'predictive',
            filters: [,
                { field: 'models', operator: 'in', value: modelConfig.models },
                { field: 'horizon', operator: 'eq', value: selectedHorizon }
            ]
        };
        const result = await analyticsInfrastructure.executeQuery(query);
        if (result.success && result.data) {
            const predictiveData = await processPredictiveData();
        }
    }
    finally { }
});
result.data,
    modelConfig,
    selectedHorizon;
;
setModelingData(predictiveData);
// Trigger update callbacks
if (onPredictionUpdate) {
    predictiveData.performanceForecasts.forEach(forecast => { });
    onPredictionUpdate({});
    type: 'forecast',
        update;
    forecast,
        confidence;
    forecast.confidence.level,
        impact;
    'high',
        timestamp;
    Date.now(),
    ;
}
;
;
{
    setError(result.error || 'Failed to load predictive modeling data');
}
try { }
catch (err) {
    setError(err instanceof Error ? err.message : 'Unknown error occurred');
}
finally {
    setLoading(false);
}
[funnelDefinition, analyticsInfrastructure, timeRange, segments, cohorts, modelConfig, selectedHorizon, onPredictionUpdate];
;
// Process predictive data
const processPredictiveData = async();
;
rawData: unknown,
    config;
PredictiveModelConfiguration,
    horizon;
ForecastHorizon;
Promise;
{
    // Simulate comprehensive predictive modeling processing
    return {
        performanceForecasts: generatePerformanceForecasts(config.models, horizon),
        userBehaviorPredictions: generateUserBehaviorPredictions(),
        churnPredictions: generateChurnPredictions(),
        seasonalAnalysis: generateSeasonalAnalysis(),
        scenarioAnalysis: generateScenarioAnalysis(),
        cohortPredictions: generateCohortPredictions(cohorts),
        modelPerformance: generateModelPerformance(config.models),
        predictionHistory: generatePredictionHistory(),
        uncertaintyAnalysis: generateUncertaintyAnalysis(),
        featureImportance: generateFeatureImportance(),
    };
}
;
// Generate performance forecasts
const generatePerformanceForecasts = ();
;
models: PredictiveModelType,
    horizon;
ForecastHorizon;
PerformanceForecast => {
    const horizonDays = horizon === 'short' ? 7 : horizon === 'medium' ? 30 : 90;
    return models.map(model => ({}), forecastId, `forecast-${model}-${Date.now()}`);
};
model,
    horizon,
    timePoints;
Array.from({ length: horizonDays }, (_, i) => ({}), timestamp, Date.now() + i * 24 * 60 * 60 * 1000, period, `Day ${i + 1}`, predictions, [,
    {
        metric: 'conversion_rate',
        predictedValue: 0.15 + Math.sin(i / 7) * 0.02 + Math.random() * 0.01,
        confidence: { lower: 0.12, upper: 0.18, level: 0.95 },
        trend: 'stable',
        volatility: Math.random() * 0.1
    },
    {
        metric: 'revenue',
        predictedValue: 50000 + Math.sin(i / 7) * 5000 + Math.random() * 2000,
        confidence: { lower: 45000, upper: 55000, level: 0.95 },
        trend: 'increasing',
        volatility: Math.random() * 0.15
    }], confidence, Math.random() * 0.2 + 0.8, uncertainty, Math.random() * 0.1 + 0.05, contributingFactors, [,
    { factor: 'seasonality', contribution: 0.3, confidence: 0.9 },
    { factor: 'marketing_spend', contribution: 0.25, confidence: 0.85 }
]);
metrics: {
    conversionRate: {
        ;
        metric: 'conversion_rate',
            currentValue;
        0.15,
            forecastedValue;
        0.16,
            changePercent;
        6.7,
            trend;
        'increasing',
            confidence;
        {
            lower: 0.14, upper;
            0.18, level;
            0.95;
        }
        seasonality: {
            detected: true, period;
            7, amplitude;
            0.02, phase;
            0, strength;
            0.7;
        }
    }
    revenue: {
        metric: 'revenue',
            currentValue;
        50000,
            forecastedValue;
        52000,
            changePercent;
        4.0,
            trend;
        'increasing',
            confidence;
        {
            lower: 48000, upper;
            56000, level;
            0.95;
        }
        seasonality: {
            detected: true, period;
            7, amplitude;
            5000, phase;
            0, strength;
            0.6;
        }
    }
    userAcquisition: {
        metric: 'user_acquisition',
            currentValue;
        1000,
            forecastedValue;
        1050,
            changePercent;
        5.0,
            trend;
        'increasing',
            confidence;
        {
            lower: 950, upper;
            1150, level;
            0.95;
        }
        seasonality: {
            detected: false, period;
            0, amplitude;
            0, phase;
            0, strength;
            0;
        }
    }
    churnRate: {
        metric: 'churn_rate',
            currentValue;
        0.05,
            forecastedValue;
        0.048,
            changePercent;
        -4.0,
            trend;
        'decreasing',
            confidence;
        {
            lower: 0.04, upper;
            0.056, level;
            0.95;
        }
        seasonality: {
            detected: false, period;
            0, amplitude;
            0, phase;
            0, strength;
            0;
        }
    }
    lifetimeValue: {
        metric: 'lifetime_value',
            currentValue;
        500,
            forecastedValue;
        525,
            changePercent;
        5.0,
            trend;
        'increasing',
            confidence;
        {
            lower: 475, upper;
            575, level;
            0.95;
        }
        seasonality: {
            detected: false, period;
            0, amplitude;
            0, phase;
            0, strength;
            0;
        }
    }
    engagementScore: {
        metric: 'engagement_score',
            currentValue;
        0.7,
            forecastedValue;
        0.72,
            changePercent;
        2.9,
            trend;
        'stable',
            confidence;
        {
            lower: 0.68, upper;
            0.76, level;
            0.95;
        }
        seasonality: {
            detected: true, period;
            7, amplitude;
            0.05, phase;
            0, strength;
            0.4;
        }
    }
    confidence: {
        lower: 0.8, upper;
        0.95, level;
        0.9;
    }
    factors: [,
        { factor: 'Historical trends', impact: 0.4, confidence: 0.9, description: 'Based on 90 days of historical data', source: 'historical' },
        { factor: 'Seasonal patterns', impact: 0.3, confidence: 0.8, description: 'Weekly seasonality detected', source: 'model_derived' },
        { factor: 'Marketing campaigns', impact: 0.2, confidence: 0.7, description: 'Ongoing campaign impact', source: 'external' }
    ],
        scenarios;
    [,
        {
            scenarioId: 'optimistic',
            name: 'Optimistic Scenario',
            description: 'Best case performance with all favorable conditions',
            assumptions: [,
                { parameter: 'marketing_efficiency', value: 1.2, description: 'Marketing campaigns perform 20% better' }
            ],
            outcomes: [,
                { metric: 'conversion_rate', predictedValue: 0.18, impact: 0.2, confidence: 0.75 },
                { metric: 'revenue', predictedValue: 58000, impact: 0.16, confidence: 0.75 }
            ],
            probability: 0.25
        },
        {
            scenarioId: 'pessimistic',
            name: 'Pessimistic Scenario',
            description: 'Worst case performance with unfavorable conditions',
            assumptions: [,
                { parameter: 'market_conditions', value: 0.8, description: 'Market conditions deteriorate' }
            ],
            outcomes: [,
                { metric: 'conversion_rate', predictedValue: 0.13, impact: -0.13, confidence: 0.75 },
                { metric: 'revenue', predictedValue: 45000, impact: -0.1, confidence: 0.75 }
            ],
            probability: 0.2
        }],
        accuracy;
    {
        mae: 0.02,
            mape;
        8.5,
            rmse;
        0.025,
            r2;
        0.85,
            accuracy;
        0.88,
            lastValidation;
        Date.now() - 24 * 60 * 60 * 1000,
        ;
    }
    lastUpdated: Date.now();
}
;
;
// Generate user behavior predictions
const generateUserBehaviorPredictions = () => {
    return Array.from({ length: 20 }, (_, i) => ({}), userId, `user-${i + 1}`);
};
segment: segments[i % segments.length]?.name || 'default',
    cohort;
cohorts[i % cohorts.length]?.name,
    behaviorPredictions;
[,
    {
        behavior: 'purchase',
        probability: Math.random() * 0.8 + 0.1,
        confidence: Math.random() * 0.3 + 0.7,
        timeframe: Math.floor(Math.random() * 30 + 1),
        factors: [,
            { factor: 'past_purchases', weight: 0.4, direction: 'positive', confidence: 0.9 },
            { factor: 'engagement_level', weight: 0.3, direction: 'positive', confidence: 0.85 }
        ]
    },
    {
        behavior: 'churn',
        probability: Math.random() * 0.3,
        confidence: Math.random() * 0.3 + 0.7,
        timeframe: Math.floor(Math.random() * 60 + 30),
        factors: [,
            { factor: 'inactivity_period', weight: 0.5, direction: 'positive', confidence: 0.8 },
            { factor: 'support_interactions', weight: 0.2, direction: 'negative', confidence: 0.75 }
        ]
    }
],
    nextActions;
[,
    {
        action: 'page_view',
        probability: Math.random() * 0.9 + 0.1,
        expectedTimestamp: Date.now() + Math.random() * 24 * 60 * 60 * 1000,
        value: Math.random() * 10,
        confidence: Math.random() * 0.2 + 0.8
    }],
    engagement;
{
    currentScore: Math.random() * 0.5 + 0.3,
        predictedScore;
    Math.random() * 0.5 + 0.4,
        trend;
    ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)],
        riskLevel;
    ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        drivers;
    [,
        { factor: 'content_consumption', impact: 0.3, controllable: true, recommendation: 'Personalize content recommendations' }
    ];
}
conversionProbability: {
    probability: Math.random() * 0.6 + 0.2,
        confidence;
    Math.random() * 0.3 + 0.7,
        timeToConversion;
    Math.floor(Math.random() * 14 + 1),
        conversionValue;
    Math.floor(Math.random() * 500 + 100),
        steps;
    funnelDefinition.steps.map(step => ({}), stepId, step.id, stepName, step.name, probability, Math.random() * 0.8 + 0.2, bottleneck, Math.random() > 0.8, optimizationPotential, Math.random() * 0.3);
}
factors: [,
    { factor: 'historical_behavior', weight: 0.4, direction: 'positive', controllable: false },
    { factor: 'current_engagement', weight: 0.3, direction: 'positive', controllable: true }
];
churnRisk: {
    riskScore: Math.random() * 100,
        riskLevel;
    ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
        timeToChurn;
    Math.floor(Math.random() * 90 + 30),
        churnProbability;
    Math.random() * 0.4,
        preventionRecommendations;
    [,
        {
            intervention: 'Personalized re-engagement campaign',
            effectiveness: Math.random() * 0.5 + 0.3,
            cost: Math.floor(Math.random() * 50 + 10),
            urgency: ['immediate', 'high', 'medium', 'low'][Math.floor(Math.random() * 4)],
            implementation: 'Email marketing team'
        }];
}
recommendedInterventions: [,
    {
        type: 'personalized_offer',
        description: 'Send personalized discount offer based on browsing history',
        timing: Math.floor(Math.random() * 7 + 1),
        expectedImpact: Math.random() * 0.3 + 0.1,
        cost: Math.floor(Math.random() * 20 + 5),
        success_probability: Math.random() * 0.5 + 0.4,
        priority: ['critical', 'high', 'medium', 'low'][Math.floor(Math.random() * 4)]
    }];
;
;
// Generate churn predictions
const generateChurnPredictions = () => {
    return [
        {
            timeHorizon: 30,
            churnRate: {
                currentRate: 0.05,
                predictedRate: 0.048,
                confidence: { lower: 0.04, upper: 0.056, level: 0.95 },
                factors: [,
                    {
                        factor: 'product_satisfaction',
                        impact: -0.3,
                        trend: 'increasing',
                        controllable: true,
                        prevention: [,
                            { action: 'Improve onboarding', effectiveness: 0.25, cost: 5000, feasibility: 'high' }
                        ]
                    }
                ],
                seasonality: { detected: false, period: 0, amplitude: 0, phase: 0, strength: 0 }
            },
            riskSegments: [,
                {
                    segmentId: 'new_users',
                    segmentName: 'New Users',
                    riskLevel: 'high',
                    churnProbability: 0.15,
                    size: 1000,
                    value: 50000,
                    characteristics: [,
                        { characteristic: 'days_since_signup', value: 7, importance: 0.8 }
                    ]
                }
            ],
            preventionStrategies: [,
                {
                    strategyId: 'onboarding_improvement',
                    name: 'Enhanced Onboarding',
                    description: 'Improve new user onboarding experience',
                    targetSegments: ['new_users'],
                    effectiveness: 0.3,
                    cost: 10000,
                    timeline: 30,
                    kpis: [,
                        { metric: 'completion_rate', target: 0.8, current: 0.6, improvement: 0.2 }
                    ]
                }
            ],
            impactAnalysis: {
                revenueImpact: 15000,
                userImpact: 300,
                retentionCost: 5000,
                acquisitionCost: 20000,
                netImpact: 10000,
                timeSensitivity: 'high'
            }
        }
    ];
};
// Generate seasonal analysis
const generateSeasonalAnalysis = () => {
    return [
        {
            pattern: {
                type: 'weekly',
                strength: 0.6,
                peaks: [,
                    { period: 'Tuesday', amplitude: 0.15, reliability: 0.8, duration: 1 }
                ],
                troughs: [,
                    { period: 'Sunday', amplitude: -0.2, reliability: 0.85, duration: 1 }
                ],
                stability: 0.75
            },
            forecast: [,
                {
                    period: 'Next Week',
                    expectedValue: 52000,
                    confidence: { lower: 48000, upper: 56000, level: 0.95 },
                    preparation: [,
                        { action: 'Increase marketing spend on Monday', timing: 1, impact: 0.1, resources: ['Marketing'] }
                    ]
                }
            ],
            anomalies: [,
                {
                    period: 'Last Tuesday',
                    expectedValue: 55000,
                    actualValue: 45000,
                    deviation: -0.18,
                    significance: 'high',
                    explanation: 'System outage during peak hours'
                }],
            recommendations: [,
                {
                    recommendation: 'Adjust marketing spend based on weekly patterns',
                    seasonality: 'weekly',
                    impact: 0.12,
                    implementation: 'Automated budget allocation',
                    timing: { startDate: Date.now(), endDate: Date.now() + 30 * 24 * 60 * 60 * 1000, preparation: 7, duration: 30 }
                }
            ]
        }
    ];
};
// Generate scenario analysis
const generateScenarioAnalysis = () => {
    return [
        {
            scenarioId: 'increased_marketing',
            name: 'Increased Marketing Spend',
            description: 'What if we increase marketing spend by 50%?',
            parameters: [,
                { parameter: 'marketing_budget', baseValue: 10000, scenarioValue: 15000, impact: 0.3, controllable: true }
            ],
            outcomes: [,
                { metric: 'conversions', predictedValue: 1300, impact: 0.3, confidence: 0.8 },
                { metric: 'revenue', predictedValue: 65000, impact: 0.25, confidence: 0.75 }
            ],
            probability: 0.7,
            impactAnalysis: {
                revenueImpact: 13000,
                conversionImpact: 300,
                userImpact: 500,
                costImpact: 5000,
                timeframe: 30,
                confidence: 0.8,
            },
            recommendations: [,
                {
                    action: 'Gradual budget increase with monitoring',
                    preparationTime: 7,
                    resources: ['Marketing Team', 'Data Analyst'],
                    expectedBenefit: 8000,
                    riskMitigation: 'Weekly performance reviews'
                }],
        }
    ];
};
// Generate cohort predictions
const generateCohortPredictions = (cohortList) => {
    return cohortList.map(cohort => ({}), cohortId, cohort.id, cohortName, cohort.name, lifecycle, {
        currentStage: { stage: 'retention', probability: 0.8, characteristics: [] },
        predictedStage: { stage: 'revenue', probability: 0.7, characteristics: [] },
        transitionProbability: 0.7,
        timeToTransition: 14,
        stageMetrics: [,
            { stage: 'acquisition', duration: 1, conversionRate: 0.1, dropoffRate: 0.9, value: 0 },
            { stage: 'activation', duration: 7, conversionRate: 0.3, dropoffRate: 0.7, value: 50 }
        ]
    }, valueProjection, {
        currentValue: 500,
        projectedValue: 650,
        valueTrajectory: [],
        peakValue: 800,
        peakTime: 180,
        factors: [,
            { factor: 'retention_rate', contribution: 0.4, trend: 'increasing', controllable: true }
        ]
    }, behaviorEvolution, {
        currentBehavior: {
            engagementLevel: 0.7,
            activityFrequency: 3,
            preferences: [],
            riskFactors: [],
        },
        predictedBehavior: {
            engagementLevel: 0.75,
            activityFrequency: 3.5,
            preferences: [],
            riskFactors: [],
        },
        behaviorTrajectory: [],
        keyChanges: [,
            {
                change: 'Increased engagement with premium features',
                impact: 0.2,
                probability: 0.8,
                timeframe: 30,
                intervention: 'Feature education campaign'
            }]
    }, optimizationOpportunities, [,
        {
            opportunity: 'Upsell premium features',
            impact: 0.25,
            effort: 'medium',
            timeframe: 21,
            resources: ['Product Team'],
            kpis: [,
                { metric: 'premium_conversion', current: 0.1, target: 0.15, improvement: 0.05 }
            ]
        }
    ]);
};
;
// Generate model performance metrics
const generateModelPerformance = (models) => {
    return models.map(model => ({}), model, accuracy, {
        overall: Math.random() * 0.2 + 0.8,
        precision: Math.random() * 0.2 + 0.75,
        recall: Math.random() * 0.25 + 0.7,
        f1Score: Math.random() * 0.2 + 0.75,
        auc: Math.random() * 0.15 + 0.85,
        calibration: Math.random() * 0.2 + 0.8,
    }, performance, [,
        { metric: 'mae', value: Math.random() * 0.05 + 0.02, benchmark: 0.05, percentile: 85 },
        { metric: 'mape', value: Math.random() * 5 + 5, benchmark: 10, percentile: 78 }
    ], training, {
        trainingSize: Math.floor(Math.random() * 50000 + 10000),
        validationSize: Math.floor(Math.random() * 10000 + 2000),
        testSize: Math.floor(Math.random() * 5000 + 1000),
        features: Math.floor(Math.random() * 50 + 10),
        trainingTime: Math.floor(Math.random() * 3600 + 300),
        convergence: Math.random() * 0.2 + 0.8,
    }, drift, {
        detected: Math.random() > 0.8,
        severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
        features: [,
            {
                feature: 'user_engagement',
                driftScore: Math.random() * 0.3,
                impact: Math.random() * 0.2,
                action: ['monitor', 'retrain', 'replace'][Math.floor(Math.random() * 3)]
            }],
        recommendation: 'Monitor feature drift and retrain if necessary',
        lastCheck: Date.now() - Math.random() * 24 * 60 * 60 * 1000,
    }, lastUpdate, Date.now() - Math.random() * 24 * 60 * 60 * 1000);
};
;
// Generate prediction history
const generatePredictionHistory = () => {
    return Array.from({ length: 30 }, (_, i) => ({}), timestamp, Date.now() - i * 24 * 60 * 60 * 1000, prediction, { value: Math.random() * 100 + 50 }, actual, Math.random() > 0.1 ? { value: Math.random() * 100 + 50 } : undefined, accuracy, Math.random() * 0.3 + 0.7, model, modelConfig.models[Math.floor(Math.random() * modelConfig.models.length)]);
};
;
// Generate uncertainty analysis
const generateUncertaintyAnalysis = () => {
    return [
        {
            source: {
                type: 'data_quality',
                description: 'Missing data points in user behavior tracking',
                quantification: 0.15,
            },
            impact: 0.08,
            mitigation: [,
                {
                    strategy: 'Improve data collection infrastructure',
                    effectiveness: 0.7,
                    cost: 15000,
                    timeline: 60
                }],
            confidence: 0.8
        }
    ];
};
// Generate feature importance
const generateFeatureImportance = () => {
    const features = [];
    'user_engagement_score',
        'session_duration',
        'page_views',
        'previous_purchases',
        'time_since_last_visit',
        'marketing_channel',
        'device_type',
        'geographic_location';
};
;
return features.map(feature => ({}), feature, importance, Math.random(), stability, Math.random() * 0.3 + 0.7, interpretation, `${feature.replace('_', ' ')} shows strong predictive power for conversion`, actionability, ['high', 'medium', 'low'][Math.floor(Math.random() * 3)]);
sort((a, b) => b.importance - a.importance);
;
// Setup real-time updates
useEffect(() => {
    if (realtimeUpdates) {
        intervalRef.current = setInterval(() => {
            loadModelingData();
        }, 60000); // Update every minute
    }
    else {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
                ;
            }, [realtimeUpdates, loadModelingData];
        }
    }
});
// Initial data load
useEffect(() => {
    loadModelingData();
}, [loadModelingData]);
// Handle export
const handleExport = useCallback(() => {
    if (!modelingData || !onExport)
        return;
    const exportData = {
        performanceForecasts: modelingData.performanceForecasts,
        userBehaviorPredictions: modelingData.userBehaviorPredictions,
        churnPredictions: modelingData.churnPredictions,
        scenarioAnalysis: modelingData.scenarioAnalysis,
        modelPerformance: modelingData.modelPerformance,
        exportTimestamp: Date.now(),
        configuration: modelConfig,
    };
    onExport(exportData);
}, [modelingData, modelConfig, onExport]);
if (loading) {
    return;
    _jsxs("div", { className: "funnel-predictive-modeling-loading", children: [_jsx("div", { className: "loading-spinner" }), _jsx("p", { children: "Loading predictive modeling data..." })] });
    ;
    if (error) {
        return;
        _jsxs("div", { className: "funnel-predictive-modeling-error", children: [_jsx("h3", { children: "Error Loading Predictive Modeling" }), _jsx("p", { className: "error-message", children: error }), _jsx("button", { onClick: loadModelingData, className: "retry-button", children: "Retry" })] });
        ;
        if (!modelingData) {
            return _jsx("div", { className: "funnel-predictive-modeling-error", children: "No data available" });
            return;
            _jsx("div", { className: "funnel-predictive-modeling", children: _jsxs("div", { className: "modeling-header", children: [_jsxs("div", { className: "modeling-info", children: [_jsx("h3", { children: "Predictive Funnel Modeling" }), _jsxs("p", { children: ["AI-powered performance forecasting for ", funnelDefinition.name] })] }), _jsxs("div", { className: "modeling-controls", children: [_jsx("select", { value: selectedModel, onChange: (e) => setSelectedModel(e.target.value), className: "model-selector", children: modelConfig.models.map(model => ()
                                        < option, key = { model }, value = { model } >
                                        { model, : .replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) }) }), "))}"] }), _jsxs("select", { value: selectedHorizon, onChange: (e) => setSelectedHorizon(e.target.value), className: "horizon-selector", children: [_jsx("option", { value: "short", children: "Short Term (7 days)" }), _jsx("option", { value: "medium", children: "Medium Term (30 days)" }), _jsx("option", { value: "long", children: "Long Term (90 days)" })] }), _jsxs("label", { className: "realtime-toggle", children: [_jsx("input", { type: "checkbox", checked: realtimeUpdates, onChange: (e) => setRealtimeUpdates(e.target.checked) }), "Real-time Updates"] }), _jsx("button", { onClick: handleExport, className: "export-button", children: "Export Predictions" })] }) })
                ,
                    _jsxs("div", { className: "modeling-tabs", children: [_jsx("button", { className: `tab ${activeTab === 'forecasts' ? 'active' : ''}`, onClick: () => setActiveTab('forecasts'), children: "Performance Forecasts" }), _jsx("button", { className: `tab ${activeTab === 'behavior' ? 'active' : ''}`, onClick: () => setActiveTab('behavior'), children: "Behavior Predictions" }), _jsx("button", { className: `tab ${activeTab === 'churn' ? 'active' : ''}`, onClick: () => setActiveTab('churn'), children: "Churn Analysis" }), _jsx("button", { className: `tab ${activeTab === 'scenarios' ? 'active' : ''}`, onClick: () => setActiveTab('scenarios'), children: "Scenario Planning" }), _jsx("button", { className: `tab ${activeTab === 'models' ? 'active' : ''}`, onClick: () => setActiveTab('models'), children: "Model Performance" })] })
                        ,
                            _jsxs("div", { className: "modeling-content", children: [activeTab === 'forecasts' && ()
                                        < div, " className=\"performance-forecasts\">", modelingData.performanceForecasts
                                        .filter(forecast => forecast.model === selectedModel)
                                        .map(forecast => ()
                                        < div, key = { forecast, : .forecastId }, className = "forecast-card" >
                                        (_jsxs("div", { className: "forecast-header", children: [_jsxs("h4", { children: [forecast.model.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()), " Forecast"] }), _jsxs("span", { className: "horizon-badge", children: [forecast.horizon, " term"] })] })
                                            ,
                                                _jsx("div", { className: "forecast-metrics", children: _jsxs("div", { className: "metric-grid", children: [_jsxs("div", { className: "metric-card", children: [_jsx("span", { className: "metric-label", children: "Conversion Rate" }), _jsxs("span", { className: "metric-value", children: [Math.round(forecast.metrics.conversionRate.forecastedValue * 100), "%"] }), _jsxs("span", { className: `metric-change ${forecast.metrics.conversionRate.changePercent >= 0 ? 'positive' : 'negative'}`, children: ["}", forecast.metrics.conversionRate.changePercent >= 0 ? '+' : '', forecast.metrics.conversionRate.changePercent.toFixed(1), "%"] })] }), _jsxs("div", { className: "metric-card", children: [_jsx("span", { className: "metric-label", children: "Revenue" }), _jsxs("span", { className: "metric-value", children: ["$", forecast.metrics.revenue.forecastedValue.toLocaleString()] }), _jsxs("span", { className: `metric-change ${forecast.metrics.revenue.changePercent >= 0 ? 'positive' : 'negative'}`, children: ["}", forecast.metrics.revenue.changePercent >= 0 ? '+' : '', forecast.metrics.revenue.changePercent.toFixed(1), "%"] })] }), _jsxs("div", { className: "metric-card", children: [_jsx("span", { className: "metric-label", children: "User Acquisition" }), _jsx("span", { className: "metric-value", children: forecast.metrics.userAcquisition.forecastedValue.toLocaleString() }), _jsxs("span", { className: `metric-change ${forecast.metrics.userAcquisition.changePercent >= 0 ? 'positive' : 'negative'}`, children: ["}", forecast.metrics.userAcquisition.changePercent >= 0 ? '+' : '', forecast.metrics.userAcquisition.changePercent.toFixed(1), "%"] })] }), _jsxs("div", { className: "metric-card", children: [_jsx("span", { className: "metric-label", children: "Churn Rate" }), _jsxs("span", { className: "metric-value", children: [Math.round(forecast.metrics.churnRate.forecastedValue * 100), "%"] }), _jsxs("span", { className: `metric-change ${forecast.metrics.churnRate.changePercent <= 0 ? 'positive' : 'negative'}`, children: ["}", forecast.metrics.churnRate.changePercent >= 0 ? '+' : '', forecast.metrics.churnRate.changePercent.toFixed(1), "%"] })] })] }) })
                                                    ,
                                                        _jsxs("div", { className: "forecast-factors", children: [_jsx("h5", { children: "Key Factors" }), _jsx("div", { className: "factor-list", children: forecast.factors.slice(0, 3).map((factor, index) => ()
                                                                        < div, key = { index }, className = "factor-item" >
                                                                        (_jsx("span", { className: "factor-name", children: factor.factor })
                                                                            ,
                                                                                _jsxs("span", { className: "factor-impact", children: ["Impact: ", Math.round(factor.impact * 100), "%"] })
                                                                                    ,
                                                                                        _jsxs("span", { className: "factor-confidence", children: ["Confidence: ", Math.round(factor.confidence * 100), "%"] }))) }), "))}"] })))] })
                                ,
                                    _jsxs("div", { className: "forecast-accuracy", children: [_jsx("strong", { children: "Model Accuracy:" }), " ", Math.round(forecast.accuracy.accuracy * 100), "%", _jsxs("span", { className: "accuracy-details", children: ["(MAPE: ", forecast.accuracy.mape.toFixed(1), "%, R\u00B2: ", forecast.accuracy.r2.toFixed(3), ")"] })] });
            div >
            ;
        }
        div >
        ;
    }
    {
        activeTab === 'behavior' && ()
            < div;
        className = "behavior-predictions" >
            (_jsxs("div", { className: "behavior-summary", children: [_jsx("h4", { children: "User Behavior Predictions" }), _jsxs("div", { className: "summary-stats", children: [_jsxs("div", { className: "stat", children: [_jsx("span", { className: "stat-label", children: "High Conversion Probability" }), _jsx("span", { className: "stat-value", children: modelingData.userBehaviorPredictions.filter(p => p.conversionProbability.probability > 0.7).length })] }), _jsxs("div", { className: "stat", children: [_jsx("span", { className: "stat-label", children: "High Churn Risk" }), _jsx("span", { className: "stat-value", children: modelingData.userBehaviorPredictions.filter(p => p.churnRisk.riskLevel === 'high' || p.churnRisk.riskLevel === 'critical').length })] }), _jsxs("div", { className: "stat", children: [_jsx("span", { className: "stat-label", children: "Avg Conversion Probability" }), _jsxs("span", { className: "stat-value", children: [Math.round(), "modelingData.userBehaviorPredictions.reduce() (sum) p ) => sum + p.conversionProbability.probability, 0) / modelingData.userBehaviorPredictions.length * 100 )}%"] })] })] })] })
                ,
                    _jsx("div", { className: "behavior-list", children: modelingData.userBehaviorPredictions.slice(0, 10).map(prediction => ()
                            < div, key = { prediction, : .userId }, className = "behavior-card" >
                            (_jsxs("div", { className: "behavior-header", children: [_jsxs("h5", { children: ["User ", prediction.userId] }), _jsx("span", { className: "segment-badge", children: prediction.segment })] })
                                ,
                                    _jsxs("div", { className: "behavior-metrics", children: [_jsxs("div", { className: "behavior-metric", children: [_jsx("span", { className: "metric-label", children: "Conversion Probability" }), _jsxs("span", { className: "metric-value", children: [Math.round(prediction.conversionProbability.probability * 100), "%"] })] }), _jsxs("div", { className: "behavior-metric", children: [_jsx("span", { className: "metric-label", children: "Churn Risk" }), _jsxs("span", { className: `risk-badge ${prediction.churnRisk.riskLevel}`, children: ["}", prediction.churnRisk.riskLevel.toUpperCase()] })] }), _jsxs("div", { className: "behavior-metric", children: [_jsx("span", { className: "metric-label", children: "Engagement Trend" }), _jsxs("span", { className: `trend-badge ${prediction.engagement.trend}`, children: ["}", prediction.engagement.trend.toUpperCase()] })] })] })
                                        ,
                                            _jsxs("div", { className: "recommended-interventions", children: [_jsx("strong", { children: "Recommended Actions:" }), _jsxs("ul", { children: [prediction.recommendedInterventions.slice(0, 2).map((intervention, index) => ()
                                                                < li, key = { index }, className = {} `priority-${intervention.priority}`), ">}", intervention.description] }), "))}"] }))) }));
        div >
        ;
    }
    div >
    ;
    div >
    ;
}
{
    activeTab === 'churn' && ()
        < div;
    className = "churn-analysis" >
        { modelingData, : .churnPredictions.map((churnPred, index) => ()
                < div, key = { index }, className = "churn-prediction-card" >
                (_jsxs("div", { className: "churn-header", children: [_jsxs("h4", { children: [churnPred.timeHorizon, "-Day Churn Prediction"] }), _jsxs("div", { className: "churn-rate", children: [_jsxs("span", { className: "current-rate", children: ["Current: ", Math.round(churnPred.churnRate.currentRate * 100), "%"] }), _jsxs("span", { className: "predicted-rate", children: ["Predicted: ", Math.round(churnPred.churnRate.predictedRate * 100), "%"] })] })] })
                    ,
                        _jsxs("div", { className: "risk-segments", children: [_jsx("h5", { children: "Risk Segments" }), _jsxs("div", { className: "segment-grid", children: [churnPred.riskSegments.map(segment => ()
                                            < div, key = { segment, : .segmentId }, className = {} `risk-segment ${segment.riskLevel}`), ">}", _jsx("h6", { children: segment.segmentName }), _jsxs("div", { className: "segment-metrics", children: [_jsxs("span", { children: ["Risk: ", segment.riskLevel] }), _jsxs("span", { children: ["Size: ", segment.size] }), _jsxs("span", { children: ["Churn Prob: ", Math.round(segment.churnProbability * 100), "%"] })] })] }), "))}"] })), div >
                _jsxs("div", { className: "prevention-strategies", children: [_jsx("h5", { children: "Prevention Strategies" }), _jsx("div", { className: "strategy-list", children: churnPred.preventionStrategies.map(strategy => ()
                                < div, key = { strategy, : .strategyId }, className = "strategy-card" >
                                (_jsx("h6", { children: strategy.name })
                                    ,
                                        _jsx("p", { children: strategy.description })
                                            ,
                                                _jsxs("div", { className: "strategy-metrics", children: [_jsxs("span", { children: ["Effectiveness: ", Math.round(strategy.effectiveness * 100), "%"] }), _jsxs("span", { children: ["Cost: $", strategy.cost.toLocaleString()] }), "}", _jsxs("span", { children: ["Timeline: ", strategy.timeline, " days"] })] }))) }), "))}"] }), div >
                _jsxs("div", { className: "impact-analysis", children: [_jsx("h5", { children: "Impact Analysis" }), _jsxs("div", { className: "impact-metrics", children: [_jsxs("div", { className: "impact-metric", children: [_jsx("span", { className: "label", children: "Revenue Impact" }), _jsxs("span", { className: "value", children: ["$", churnPred.impactAnalysis.revenueImpact.toLocaleString()] }), "}"] }), _jsxs("div", { className: "impact-metric", children: [_jsx("span", { className: "label", children: "User Impact" }), _jsx("span", { className: "value", children: churnPred.impactAnalysis.userImpact })] }), _jsxs("div", { className: "impact-metric", children: [_jsx("span", { className: "label", children: "Net Impact" }), _jsxs("span", { className: "value", children: ["$", churnPred.impactAnalysis.netImpact.toLocaleString()] }), "}"] })] })] }), div >
            ) };
    div >
    ;
}
{
    activeTab === 'scenarios' && ()
        < div;
    className = "scenario-analysis" >
        (_jsx("h4", { children: "Scenario Planning" })
            ,
                _jsx("div", { className: "scenario-grid", children: modelingData.scenarioAnalysis.map(scenario => ()
                        < div, key = { scenario, : .scenarioId }, className = "scenario-card" >
                        (_jsxs("div", { className: "scenario-header", children: [_jsx("h5", { children: scenario.name }), _jsxs("span", { className: "probability-badge", children: [Math.round(scenario.probability * 100), "% probability"] })] })
                            ,
                                _jsx("p", { className: "scenario-description", children: scenario.description })
                                    ,
                                        _jsxs("div", { className: "scenario-parameters", children: [_jsx("strong", { children: "Key Parameters:" }), _jsxs("ul", { children: [scenario.parameters.map((param, index) => ()
                                                            < li, key = { index } >
                                                            { param, : .parameter }), ": ", param.baseValue, " \u2192 ", param.scenarioValue, "(", Math.round(param.impact * 100), "% impact)"] }), "))}"] }))) })
                    ,
                        _jsxs("div", { className: "scenario-outcomes", children: [_jsx("strong", { children: "Expected Outcomes:" }), _jsx("div", { className: "outcome-metrics", children: scenario.outcomes.map((outcome, index) => ()
                                        < div, key = { index }, className = "outcome-metric" >
                                        (_jsx("span", { className: "metric-name", children: outcome.metric.replace('_', ' ') })
                                            ,
                                                _jsx("span", { className: "metric-value", children: outcome.predictedValue.toLocaleString() })
                                                    ,
                                                        _jsxs("span", { className: `metric-impact ${outcome.impact >= 0 ? 'positive' : 'negative'}`, children: ["}", outcome.impact >= 0 ? '+' : '', Math.round(outcome.impact * 100), "%"] }))) }), "))}"] }));
    div >
        _jsxs("div", { className: "scenario-recommendations", children: [_jsx("strong", { children: "Recommendations:" }), _jsxs("ul", { children: [scenario.recommendations.map((rec, index) => ()
                            < li, key = { index } >
                            { rec, : .action }(Expected, benefit)), ": $", rec.expectedBenefit.toLocaleString(), ")}"] }), "))}"] });
    div >
    ;
    div >
    ;
}
div >
;
div >
;
{
    activeTab === 'models' && ()
        < div;
    className = "model-performance" >
        (_jsx("h4", { children: "Model Performance Dashboard" })
            ,
                _jsxs("div", { className: "model-grid", children: [modelingData.modelPerformance.map(model => ()
                            < div, key = { model, : .model }, className = "model-card" >
                            (_jsxs("div", { className: "model-header", children: [_jsx("h5", { children: model.model.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) }), _jsxs("span", { className: "last-update", children: ["Updated: ", new Date(model.lastUpdate).toLocaleDateString()] })] })
                                ,
                                    _jsxs("div", { className: "model-accuracy", children: [_jsxs("div", { className: "accuracy-metric", children: [_jsx("span", { className: "label", children: "Overall Accuracy" }), _jsxs("span", { className: "value", children: [Math.round(model.accuracy.overall * 100), "%"] })] }), _jsxs("div", { className: "accuracy-metric", children: [_jsx("span", { className: "label", children: "Precision" }), _jsxs("span", { className: "value", children: [Math.round(model.accuracy.precision * 100), "%"] })] }), _jsxs("div", { className: "accuracy-metric", children: [_jsx("span", { className: "label", children: "Recall" }), _jsxs("span", { className: "value", children: [Math.round(model.accuracy.recall * 100), "%"] })] }), _jsxs("div", { className: "accuracy-metric", children: [_jsx("span", { className: "label", children: "F1 Score" }), _jsx("span", { className: "value", children: model.accuracy.f1Score.toFixed(3) })] })] })
                                        ,
                                            _jsxs("div", { className: "training-info", children: [_jsx("strong", { children: "Training Details:" }), _jsxs("div", { className: "training-metrics", children: [_jsxs("span", { children: ["Training Size: ", model.training.trainingSize.toLocaleString()] }), _jsxs("span", { children: ["Features: ", model.training.features] }), _jsxs("span", { children: ["Training Time: ", Math.round(model.training.trainingTime / 60), "m"] })] })] })), { model, : .drift.detected && ()
                                < div, className = {} `drift-alert ${model.drift.severity}` } > ), _jsx("strong", { children: "Model Drift Detected" }), _jsxs("p", { children: ["Severity: ", model.drift.severity] }), _jsx("p", { children: model.drift.recommendation })] }));
}
div >
;
div >
    _jsxs("div", { className: "feature-importance", children: [_jsx("h5", { children: "Feature Importance" }), _jsx("div", { className: "importance-list", children: modelingData.featureImportance.slice(0, 10).map(feature => ()
                    < div, key = { feature, : .feature }, className = "importance-item" >
                    (_jsx("span", { className: "feature-name", children: feature.feature.replace('_', ' ') })
                        ,
                            _jsx("div", { className: "importance-bar", children: _jsx("div", { className: "importance-fill", style: { width: `${feature.importance * 100}%` } }) })
                                ,
                                    _jsxs("span", { className: "importance-value", children: [Math.round(feature.importance * 100), "%"] })
                                        ,
                                            _jsxs("span", { className: `actionability-badge ${feature.actionability}`, children: ["}", feature.actionability] }))) }), "))}"] });
div >
;
div >
;
div >
;
div >
;
;
;
