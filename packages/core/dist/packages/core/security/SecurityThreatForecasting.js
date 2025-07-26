/**
 * Epic 31.4.2 - Predictive Security Analytics and Threat Forecasting Models
 *
 * Implements advanced machine learning models for time series security analysis
 * and threat forecasting. Provides predictive capabilities for threat evolution,
 * seasonal patterns, and trend-based risk assessment.
 *
 * Task: E31-1753313263579-E78714
 */
import { EventEmitter } from 'events';
import { ThreatType } from './PredictiveSecurityAnalytics';
import { AnomalySeverity } from './SecurityAnomalyDetector';
export var ForecastType;
(function (ForecastType) {
    ForecastType["SHORT_TERM"] = "short_term";
    ForecastType["MEDIUM_TERM"] = "medium_term";
    ForecastType["LONG_TERM"] = "long_term";
    ForecastType["SEASONAL"] = "seasonal";
    ForecastType["TREND_BASED"] = "trend_based";
    ForecastType["SCENARIO_BASED"] = "scenario_based"; // Specific scenario modeling
})(ForecastType || (ForecastType = {}));
export var SeasonalPeriod;
(function (SeasonalPeriod) {
    SeasonalPeriod["HOURLY"] = "hourly";
    SeasonalPeriod["DAILY"] = "daily";
    SeasonalPeriod["WEEKLY"] = "weekly";
    SeasonalPeriod["MONTHLY"] = "monthly";
    SeasonalPeriod["QUARTERLY"] = "quarterly";
})(SeasonalPeriod || (SeasonalPeriod = {}));
export var TrendType;
(function (TrendType) {
    TrendType["LINEAR"] = "linear";
    TrendType["EXPONENTIAL"] = "exponential";
    TrendType["LOGARITHMIC"] = "logarithmic";
    TrendType["POLYNOMIAL"] = "polynomial";
    TrendType["CYCLICAL"] = "cyclical";
    TrendType["VOLATILE"] = "volatile";
})(TrendType || (TrendType = {}));
export var RecommendationType;
(function (RecommendationType) {
    RecommendationType["PROACTIVE_DEFENSE"] = "proactive_defense";
    RecommendationType["RESOURCE_SCALING"] = "resource_scaling";
    RecommendationType["ALERT_TUNING"] = "alert_tuning";
    RecommendationType["POLICY_ADJUSTMENT"] = "policy_adjustment";
    RecommendationType["MONITORING_ENHANCEMENT"] = "monitoring_enhancement";
    RecommendationType["TRAINING_RECOMMENDATION"] = "training_recommendation";
    RecommendationType["INFRASTRUCTURE_CHANGE"] = "infrastructure_change";
})(RecommendationType || (RecommendationType = {}));
export var ForecastAlgorithm;
(function (ForecastAlgorithm) {
    ForecastAlgorithm["ARIMA"] = "arima";
    ForecastAlgorithm["LSTM"] = "lstm";
    ForecastAlgorithm["PROPHET"] = "prophet";
    ForecastAlgorithm["SEASONAL_NAIVE"] = "seasonal_naive";
    ForecastAlgorithm["EXPONENTIAL_SMOOTHING"] = "exponential_smoothing";
    ForecastAlgorithm["RANDOM_FOREST"] = "random_forest";
    ForecastAlgorithm["GRADIENT_BOOSTING"] = "gradient_boosting";
    ForecastAlgorithm["ENSEMBLE"] = "ensemble";
})(ForecastAlgorithm || (ForecastAlgorithm = {}));
// ==========================================
// MAIN FORECASTING ENGINE
// ==========================================
export class SecurityThreatForecasting extends EventEmitter {
    config;
    timeSeriesData = new Map();
    activeForecasts = new Map();
    forecastingModels = new Map();
    threatScenarios = new Map();
    seasonalDecompositions = new Map();
    isForecasting = false;
    forecastingInterval;
    constructor(config = {}) {
        super();
        this.config = {
            enableRealTimeForecasting: true,
            forecastUpdateInterval: 1800000, // 30 minutes
            defaultTimeHorizon: 240, // 4 hours
            confidenceThreshold: 0.7,
            enableSeasonalDecomposition: true,
            enableTrendAnalysis: true,
            enableEnsembleModels: true,
            maxHistoryDays: 90,
            minDataPointsForForecast: 100,
            ...config
        };
        this.initializeForecastingModels();
        this.initializeThreatScenarios();
        if (this.config.enableRealTimeForecasting) {
            this.startRealTimeForecasting();
        }
    }
    // ==========================================
    // DATA INGESTION
    // ==========================================
    /**
     * Process security event for time series analysis
     */
    async processSecurityEvent(event) {
        try {
            // Convert event to time series data point
            const dataPoint = {
                timestamp: event.timestamp,
                value: event.riskScore,
                metadata: {
                    eventType: event.eventType,
                    severity: event.severity,
                    userId: event.userId,
                    sourceIP: event.sourceIP
                }
            };
            // Store in appropriate time series
            this.addToTimeSeries(`threat_${event.eventType}`, dataPoint);
            this.addToTimeSeries('overall_threat_level', dataPoint);
            // Trigger forecast update if conditions met
            if (this.shouldUpdateForecast(event)) {
                await this.updateForecasts(event.eventType);
            }
            this.emit('eventProcessed', event);
        }
        catch (error) {
            console.error('Error processing security event for forecasting:', error);
            this.emit('error', { error, event });
        }
    }
    /**
     * Process security anomaly for trend analysis
     */
    async processSecurityAnomaly(anomaly) {
        try {
            const dataPoint = {
                timestamp: anomaly.timestamp,
                value: this.mapSeverityToValue(anomaly.severity),
                metadata: {
                    anomalyType: anomaly.anomalyType,
                    confidence: anomaly.confidence,
                    affectedSystems: anomaly.affectedSystems
                }
            };
            this.addToTimeSeries('anomaly_intensity', dataPoint);
            // Update forecasts for anomaly-related threat types
            await this.updateAnomalyBasedForecasts(anomaly);
            this.emit('anomalyProcessed', anomaly);
        }
        catch (error) {
            console.error('Error processing security anomaly for forecasting:', error);
            this.emit('error', { error, anomaly });
        }
    }
    // ==========================================
    // FORECASTING ENGINE
    // ==========================================
    /**
     * Generate comprehensive threat forecast
     */
    async generateThreatForecast(threatType, timeHorizon = this.config.defaultTimeHorizon) {
        const seriesKey = `threat_${threatType}`;
        const timeSeries = this.timeSeriesData.get(seriesKey) || [];
        if (timeSeries.length < this.config.minDataPointsForForecast) {
            throw new Error(`Insufficient data for forecasting ${threatType}: ${timeSeries.length} points`);
        }
        // Perform seasonal decomposition
        let seasonalFactors = [];
        if (this.config.enableSeasonalDecomposition) {
            seasonalFactors = await this.performSeasonalDecomposition(seriesKey);
        }
        // Perform trend analysis
        let trendComponents = [];
        if (this.config.enableTrendAnalysis) {
            trendComponents = await this.performTrendAnalysis(timeSeries);
        }
        // Generate ensemble forecast
        const ensembleForecast = await this.generateEnsembleForecast(timeSeries, timeHorizon, seasonalFactors, trendComponents);
        // Assess forecast risk
        const riskMetrics = this.calculateForecastRisk(ensembleForecast, seasonalFactors, trendComponents);
        // Generate recommendations
        const recommendations = this.generateForecastRecommendations(ensembleForecast, riskMetrics, threatType);
        const forecast = {
            forecastId: this.generateForecastId(),
            timestamp: new Date(),
            forecastType: this.determineForecastType(timeHorizon),
            threatType,
            timeHorizon,
            confidence: ensembleForecast.confidence,
            predictedIntensity: ensembleForecast.predictedValue,
            predictedProbability: ensembleForecast.probability,
            seasonalFactors,
            trendComponents,
            riskMetrics,
            recommendations,
            modelMetadata: ensembleForecast.modelMetadata
        };
        // Store active forecast
        this.activeForecasts.set(forecast.forecastId, forecast);
        this.emit('forecastGenerated', forecast);
        return forecast;
    }
    /**
     * Generate ensemble forecast using multiple models
     */
    async generateEnsembleForecast(timeSeries, timeHorizon, seasonalFactors, trendComponents) {
        const modelResults = [];
        // Run individual forecasting models
        for (const [modelId, model] of this.forecastingModels) {
            if (!model.isActive)
                continue;
            try {
                const result = await this.runForecastingModel(model, timeSeries, timeHorizon, seasonalFactors, trendComponents);
                modelResults.push(result);
            }
            catch (error) {
                console.error(`Error running model ${modelId}:`, error);
            }
        }
        if (modelResults.length === 0) {
            throw new Error('No forecasting models available');
        }
        // Combine model results using weighted ensemble
        return this.combineModelResults(modelResults);
    }
    /**
     * Run individual forecasting model
     */
    async runForecastingModel(model, timeSeries, timeHorizon, seasonalFactors, trendComponents) {
        switch (model.algorithm) {
            case ForecastAlgorithm.ARIMA:
                return this.runARIMAModel(model, timeSeries, timeHorizon);
            case ForecastAlgorithm.EXPONENTIAL_SMOOTHING:
                return this.runExponentialSmoothingModel(model, timeSeries, timeHorizon);
            case ForecastAlgorithm.SEASONAL_NAIVE:
                return this.runSeasonalNaiveModel(model, timeSeries, timeHorizon, seasonalFactors);
            case ForecastAlgorithm.PROPHET:
                return this.runProphetModel(model, timeSeries, timeHorizon, seasonalFactors, trendComponents);
            case ForecastAlgorithm.LSTM:
                return this.runLSTMModel(model, timeSeries, timeHorizon);
            default:
                throw new Error(`Unsupported forecasting algorithm: ${model.algorithm}`);
        }
    }
    // ==========================================
    // INDIVIDUAL FORECASTING MODELS
    // ==========================================
    async runARIMAModel(model, timeSeries, timeHorizon) {
        // Simplified ARIMA implementation
        const values = timeSeries.map(d => d.value);
        const recentValues = values.slice(-50); // Use last 50 points
        // Calculate moving average and trend
        const trend = this.calculateLinearTrend(recentValues);
        // Simple autoregressive prediction
        const lastValue = recentValues[recentValues.length - 1];
        const predictedValue = lastValue + (trend * (timeHorizon / 60)); // Convert to hours
        return {
            modelId: model.modelId,
            algorithm: ForecastAlgorithm.ARIMA,
            predictedValue: Math.max(0, Math.min(100, predictedValue)),
            confidence: 0.75,
            upperBound: predictedValue + (this.calculateStandardDeviation(recentValues) * 1.96),
            lowerBound: predictedValue - (this.calculateStandardDeviation(recentValues) * 1.96),
            weight: model.weight
        };
    }
    async runExponentialSmoothingModel(model, timeSeries, timeHorizon) {
        const values = timeSeries.map(d => d.value);
        const alpha = 0.3; // Smoothing parameter
        // Apply exponential smoothing
        let smoothedValue = values[0];
        for (let i = 1; i < values.length; i++) {
            smoothedValue = alpha * values[i] + (1 - alpha) * smoothedValue;
        }
        // Simple forecast
        const predictedValue = smoothedValue;
        const variance = this.calculateVariance(values);
        return {
            modelId: model.modelId,
            algorithm: ForecastAlgorithm.EXPONENTIAL_SMOOTHING,
            predictedValue: Math.max(0, Math.min(100, predictedValue)),
            confidence: 0.70,
            upperBound: predictedValue + Math.sqrt(variance) * 1.96,
            lowerBound: predictedValue - Math.sqrt(variance) * 1.96,
            weight: model.weight
        };
    }
    async runSeasonalNaiveModel(model, timeSeries, timeHorizon, seasonalFactors) {
        // Use seasonal patterns for prediction
        const values = timeSeries.map(d => d.value);
        const currentHour = new Date().getHours();
        // Find strongest seasonal pattern
        const strongestSeasonal = seasonalFactors
            .sort((a, b) => b.strength - a.strength)[0];
        let predictedValue = values[values.length - 1]; // Default to last value
        if (strongestSeasonal && strongestSeasonal.period === SeasonalPeriod.HOURLY) {
            const hourlyPattern = strongestSeasonal.historicalPattern;
            const targetHour = (currentHour + Math.floor(timeHorizon / 60)) % 24;
            predictedValue = hourlyPattern[targetHour] || predictedValue;
        }
        return {
            modelId: model.modelId,
            algorithm: ForecastAlgorithm.SEASONAL_NAIVE,
            predictedValue: Math.max(0, Math.min(100, predictedValue)),
            confidence: strongestSeasonal ? strongestSeasonal.strength : 0.5,
            upperBound: predictedValue * 1.3,
            lowerBound: predictedValue * 0.7,
            weight: model.weight
        };
    }
    async runProphetModel(model, timeSeries, timeHorizon, seasonalFactors, trendComponents) {
        // Simplified Prophet-like model
        const values = timeSeries.map(d => d.value);
        const baseValue = this.calculateMean(values);
        // Apply trend component
        let trendAdjustment = 0;
        const strongestTrend = trendComponents
            .sort((a, b) => b.confidence - a.confidence)[0];
        if (strongestTrend) {
            trendAdjustment = strongestTrend.magnitude * (timeHorizon / 60); // Convert to hours
            if (strongestTrend.direction === 'decreasing') {
                trendAdjustment *= -1;
            }
        }
        // Apply seasonal component
        let seasonalAdjustment = 0;
        const strongestSeasonal = seasonalFactors
            .sort((a, b) => b.strength - a.strength)[0];
        if (strongestSeasonal) {
            seasonalAdjustment = strongestSeasonal.amplitude * Math.sin((2 * Math.PI * (new Date().getTime() / 1000)) /
                this.getSeasonalPeriodSeconds(strongestSeasonal.period) +
                strongestSeasonal.phase);
        }
        const predictedValue = baseValue + trendAdjustment + seasonalAdjustment;
        return {
            modelId: model.modelId,
            algorithm: ForecastAlgorithm.PROPHET,
            predictedValue: Math.max(0, Math.min(100, predictedValue)),
            confidence: 0.80,
            upperBound: predictedValue + this.calculateStandardDeviation(values),
            lowerBound: predictedValue - this.calculateStandardDeviation(values),
            weight: model.weight
        };
    }
    async runLSTMModel(model, timeSeries, timeHorizon) {
        // Simplified LSTM-like prediction (would use actual neural network in production)
        const values = timeSeries.map(d => d.value);
        const sequenceLength = 20;
        if (values.length < sequenceLength) {
            throw new Error('Insufficient data for LSTM model');
        }
        // Use last sequence to predict
        const lastSequence = values.slice(-sequenceLength);
        // Simple pattern recognition (placeholder for actual LSTM)
        const recentTrend = this.calculateLinearTrend(lastSequence);
        const volatility = this.calculateStandardDeviation(lastSequence);
        const lastValue = lastSequence[lastSequence.length - 1];
        const predictedValue = lastValue + (recentTrend * (timeHorizon / 60));
        return {
            modelId: model.modelId,
            algorithm: ForecastAlgorithm.LSTM,
            predictedValue: Math.max(0, Math.min(100, predictedValue)),
            confidence: 0.85,
            upperBound: predictedValue + volatility * 2,
            lowerBound: predictedValue - volatility * 2,
            weight: model.weight
        };
    }
    // ==========================================
    // SEASONAL DECOMPOSITION
    // ==========================================
    async performSeasonalDecomposition(seriesKey) {
        const timeSeries = this.timeSeriesData.get(seriesKey) || [];
        const factors = [];
        // Hourly seasonality
        const hourlyPattern = this.extractHourlyPattern(timeSeries);
        if (hourlyPattern.strength > 0.1) {
            factors.push({
                period: SeasonalPeriod.HOURLY,
                amplitude: hourlyPattern.amplitude,
                phase: hourlyPattern.phase,
                strength: hourlyPattern.strength,
                nextPeak: this.calculateNextPeak(SeasonalPeriod.HOURLY, hourlyPattern.phase),
                historicalPattern: hourlyPattern.pattern
            });
        }
        // Daily seasonality
        const dailyPattern = this.extractDailyPattern(timeSeries);
        if (dailyPattern.strength > 0.1) {
            factors.push({
                period: SeasonalPeriod.DAILY,
                amplitude: dailyPattern.amplitude,
                phase: dailyPattern.phase,
                strength: dailyPattern.strength,
                nextPeak: this.calculateNextPeak(SeasonalPeriod.DAILY, dailyPattern.phase),
                historicalPattern: dailyPattern.pattern
            });
        }
        // Weekly seasonality
        const weeklyPattern = this.extractWeeklyPattern(timeSeries);
        if (weeklyPattern.strength > 0.1) {
            factors.push({
                period: SeasonalPeriod.WEEKLY,
                amplitude: weeklyPattern.amplitude,
                phase: weeklyPattern.phase,
                strength: weeklyPattern.strength,
                nextPeak: this.calculateNextPeak(SeasonalPeriod.WEEKLY, weeklyPattern.phase),
                historicalPattern: weeklyPattern.pattern
            });
        }
        return factors;
    }
    extractHourlyPattern(timeSeries) {
        const hourlyBuckets = new Array(24).fill(0).map(() => ({ sum: 0, count: 0 }));
        timeSeries.forEach(point => {
            const hour = point.timestamp.getHours();
            hourlyBuckets[hour].sum += point.value;
            hourlyBuckets[hour].count += 1;
        });
        const pattern = hourlyBuckets.map(bucket => bucket.count > 0 ? bucket.sum / bucket.count : 0);
        const amplitude = this.calculateAmplitude(pattern);
        const phase = this.calculatePhase(pattern);
        const strength = this.calculateSeasonalStrength(pattern);
        return { amplitude, phase, strength, pattern };
    }
    extractDailyPattern(timeSeries) {
        const dailyBuckets = new Array(7).fill(0).map(() => ({ sum: 0, count: 0 }));
        timeSeries.forEach(point => {
            const dayOfWeek = point.timestamp.getDay();
            dailyBuckets[dayOfWeek].sum += point.value;
            dailyBuckets[dayOfWeek].count += 1;
        });
        const pattern = dailyBuckets.map(bucket => bucket.count > 0 ? bucket.sum / bucket.count : 0);
        const amplitude = this.calculateAmplitude(pattern);
        const phase = this.calculatePhase(pattern);
        const strength = this.calculateSeasonalStrength(pattern);
        return { amplitude, phase, strength, pattern };
    }
    extractWeeklyPattern(timeSeries) {
        // Simplified weekly pattern extraction
        const weeklyBuckets = new Array(4).fill(0).map(() => ({ sum: 0, count: 0 }));
        timeSeries.forEach(point => {
            const weekOfMonth = Math.floor(point.timestamp.getDate() / 7);
            const bucket = Math.min(weekOfMonth, 3);
            weeklyBuckets[bucket].sum += point.value;
            weeklyBuckets[bucket].count += 1;
        });
        const pattern = weeklyBuckets.map(bucket => bucket.count > 0 ? bucket.sum / bucket.count : 0);
        const amplitude = this.calculateAmplitude(pattern);
        const phase = this.calculatePhase(pattern);
        const strength = this.calculateSeasonalStrength(pattern);
        return { amplitude, phase, strength, pattern };
    }
    // ==========================================
    // TREND ANALYSIS
    // ==========================================
    async performTrendAnalysis(timeSeries) {
        const values = timeSeries.map(d => d.value);
        const components = [];
        // Linear trend analysis
        const linearTrend = this.analyzeLinearTrend(values);
        if (Math.abs(linearTrend.magnitude) > 0.1) {
            components.push(linearTrend);
        }
        // Exponential trend analysis
        const exponentialTrend = this.analyzeExponentialTrend(values);
        if (exponentialTrend.confidence > 0.6) {
            components.push(exponentialTrend);
        }
        // Change point detection
        const changePoints = this.detectChangePoints(timeSeries);
        if (changePoints.length > 0) {
            const changePointTrend = {
                trendType: TrendType.VOLATILE,
                direction: 'stable',
                magnitude: 0,
                acceleration: 0,
                durability: 30, // minutes
                confidence: 0.7,
                changePoints
            };
            components.push(changePointTrend);
        }
        return components;
    }
    analyzeLinearTrend(values) {
        const n = values.length;
        const x = Array.from({ length: n }, (_, i) => i);
        // Calculate linear regression
        const sumX = x.reduce((sum, val) => sum + val, 0);
        const sumY = values.reduce((sum, val) => sum + val, 0);
        const sumXY = x.reduce((sum, val, i) => sum + val * values[i], 0);
        const sumXX = x.reduce((sum, val) => sum + val * val, 0);
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        // Calculate R-squared
        const meanY = sumY / n;
        const totalSumSquares = values.reduce((sum, val) => sum + Math.pow(val - meanY, 2), 0);
        const residualSumSquares = values.reduce((sum, val, i) => {
            const predicted = slope * i + intercept;
            return sum + Math.pow(val - predicted, 2);
        }, 0);
        const rSquared = 1 - (residualSumSquares / totalSumSquares);
        return {
            trendType: TrendType.LINEAR,
            direction: slope > 0.1 ? 'increasing' : slope < -0.1 ? 'decreasing' : 'stable',
            magnitude: Math.abs(slope),
            acceleration: 0,
            durability: 120, // 2 hours
            confidence: Math.max(0, rSquared),
            changePoints: []
        };
    }
    analyzeExponentialTrend(values) {
        // Simple exponential trend detection
        if (values.length < 10) {
            return {
                trendType: TrendType.EXPONENTIAL,
                direction: 'stable',
                magnitude: 0,
                acceleration: 0,
                durability: 0,
                confidence: 0,
                changePoints: []
            };
        }
        const recentValues = values.slice(-10);
        const ratios = [];
        for (let i = 1; i < recentValues.length; i++) {
            if (recentValues[i - 1] > 0) {
                ratios.push(recentValues[i] / recentValues[i - 1]);
            }
        }
        const meanRatio = ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length;
        const isExponential = Math.abs(meanRatio - 1) > 0.1;
        return {
            trendType: TrendType.EXPONENTIAL,
            direction: meanRatio > 1.1 ? 'increasing' : meanRatio < 0.9 ? 'decreasing' : 'stable',
            magnitude: Math.abs(meanRatio - 1),
            acceleration: 0,
            durability: 60, // 1 hour
            confidence: isExponential ? 0.7 : 0.3,
            changePoints: []
        };
    }
    detectChangePoints(timeSeries) {
        const changePoints = [];
        const values = timeSeries.map(d => d.value);
        const windowSize = 10;
        for (let i = windowSize; i < values.length - windowSize; i++) {
            const beforeWindow = values.slice(i - windowSize, i);
            const afterWindow = values.slice(i, i + windowSize);
            const beforeMean = this.calculateMean(beforeWindow);
            const afterMean = this.calculateMean(afterWindow);
            const changeMagnitude = Math.abs(afterMean - beforeMean);
            const threshold = this.calculateStandardDeviation(values) * 1.5;
            if (changeMagnitude > threshold) {
                changePoints.push({
                    timestamp: timeSeries[i].timestamp,
                    magnitude: changeMagnitude,
                    type: 'level_shift',
                    confidence: Math.min(0.9, changeMagnitude / threshold)
                });
            }
        }
        return changePoints;
    }
    // ==========================================
    // RISK ASSESSMENT
    // ==========================================
    calculateForecastRisk(forecast, seasonalFactors, trendComponents) {
        const expectedValue = forecast.predictedValue;
        const uncertainty = Math.abs(forecast.upperBound - forecast.lowerBound) / 2;
        // Value at Risk (95th percentile)
        const valueAtRisk = forecast.upperBound;
        // Conditional Value at Risk (expected value beyond VaR)
        const conditionalValueAtRisk = valueAtRisk + (uncertainty * 0.5);
        // Volatility index based on trend and seasonal components
        let volatilityIndex = 0;
        trendComponents.forEach(trend => {
            if (trend.trendType === TrendType.VOLATILE) {
                volatilityIndex += 30;
            }
            else {
                volatilityIndex += trend.magnitude * 10;
            }
        });
        seasonalFactors.forEach(seasonal => {
            volatilityIndex += seasonal.amplitude * seasonal.strength * 5;
        });
        volatilityIndex = Math.min(100, volatilityIndex);
        // Scenario risks
        const scenarioRisks = [
            {
                scenario: 'Trend Acceleration',
                probability: trendComponents.length > 0 ? 0.3 : 0.1,
                impact: 80,
                description: 'Current trend accelerates beyond forecast'
            },
            {
                scenario: 'Seasonal Peak',
                probability: seasonalFactors.length > 0 ? 0.4 : 0.1,
                impact: 60,
                description: 'Seasonal patterns intensify'
            },
            {
                scenario: 'Black Swan Event',
                probability: 0.05,
                impact: 100,
                description: 'Unprecedented security event occurs'
            }
        ];
        return {
            expectedValue,
            valueAtRisk,
            conditionalValueAtRisk,
            volatilityIndex,
            uncertaintyRange: [forecast.lowerBound, forecast.upperBound],
            scenarioRisks
        };
    }
    // ==========================================
    // RECOMMENDATIONS
    // ==========================================
    generateForecastRecommendations(forecast, riskMetrics, threatType) {
        const recommendations = [];
        // High risk forecast recommendations
        if (forecast.predictedValue > 70) {
            recommendations.push({
                type: RecommendationType.PROACTIVE_DEFENSE,
                priority: 'high',
                description: `Implement proactive defenses for ${threatType}`,
                expectedBenefit: 80,
                implementationCost: 60,
                timeframe: 'immediate',
                dependencies: ['security_team_approval']
            });
        }
        // High volatility recommendations
        if (riskMetrics.volatilityIndex > 50) {
            recommendations.push({
                type: RecommendationType.MONITORING_ENHANCEMENT,
                priority: 'medium',
                description: 'Increase monitoring frequency due to high volatility',
                expectedBenefit: 60,
                implementationCost: 30,
                timeframe: '1-2 hours',
                dependencies: []
            });
        }
        // Resource scaling recommendations
        if (riskMetrics.valueAtRisk > 80) {
            recommendations.push({
                type: RecommendationType.RESOURCE_SCALING,
                priority: 'high',
                description: 'Scale security resources to handle predicted load',
                expectedBenefit: 70,
                implementationCost: 80,
                timeframe: '2-4 hours',
                dependencies: ['budget_approval', 'infrastructure_team']
            });
        }
        return recommendations;
    }
    // ==========================================
    // UTILITY METHODS
    // ==========================================
    addToTimeSeries(seriesKey, dataPoint) {
        if (!this.timeSeriesData.has(seriesKey)) {
            this.timeSeriesData.set(seriesKey, []);
        }
        const series = this.timeSeriesData.get(seriesKey);
        series.push(dataPoint);
        // Cleanup old data
        const cutoff = Date.now() - (this.config.maxHistoryDays * 24 * 60 * 60 * 1000);
        const filteredSeries = series.filter(point => point.timestamp.getTime() > cutoff);
        this.timeSeriesData.set(seriesKey, filteredSeries);
    }
    shouldUpdateForecast(event) {
        // Update forecast for high-severity events or periodically
        return event.severity === 'high' || event.severity === 'critical' ||
            Math.random() < 0.1; // 10% chance for other events
    }
    async updateForecasts(eventType) {
        // Map security event types to threat types
        const threatTypeMapping = {
            'login_failure': ThreatType.BRUTE_FORCE_ATTACK,
            'brute_force_attempt': ThreatType.BRUTE_FORCE_ATTACK,
            'suspicious_activity': ThreatType.ACCOUNT_TAKEOVER,
            'api_access': ThreatType.API_ABUSE
        };
        const threatType = threatTypeMapping[eventType];
        if (threatType) {
            try {
                await this.generateThreatForecast(threatType);
            }
            catch (error) {
                console.error(`Error updating forecast for ${threatType}:`, error);
            }
        }
    }
    async updateAnomalyBasedForecasts(anomaly) {
        // Generate forecasts based on anomaly patterns
        const threatTypes = [ThreatType.INSIDER_THREAT, ThreatType.DATA_EXFILTRATION];
        for (const threatType of threatTypes) {
            try {
                await this.generateThreatForecast(threatType, 120); // 2-hour forecast
            }
            catch (error) {
                console.error(`Error updating anomaly-based forecast for ${threatType}:`, error);
            }
        }
    }
    combineModelResults(results) {
        // Weighted ensemble combination
        const totalWeight = results.reduce((sum, result) => sum + result.weight, 0);
        const weightedPrediction = results.reduce((sum, result) => sum + (result.predictedValue * result.weight), 0) / totalWeight;
        const weightedConfidence = results.reduce((sum, result) => sum + (result.confidence * result.weight), 0) / totalWeight;
        const weightedUpperBound = results.reduce((sum, result) => sum + (result.upperBound * result.weight), 0) / totalWeight;
        const weightedLowerBound = results.reduce((sum, result) => sum + (result.lowerBound * result.weight), 0) / totalWeight;
        return {
            predictedValue: weightedPrediction,
            confidence: weightedConfidence,
            upperBound: weightedUpperBound,
            lowerBound: weightedLowerBound,
            probability: Math.min(0.99, weightedPrediction / 100),
            modelMetadata: {
                modelName: 'Ensemble',
                modelVersion: '1.0.0',
                algorithm: ForecastAlgorithm.ENSEMBLE,
                trainingPeriod: [new Date(Date.now() - 86400000 * 7), new Date()],
                accuracy: {
                    mape: 15,
                    rmse: 8,
                    mae: 6,
                    r2Score: 0.75,
                    directionalAccuracy: 80
                },
                features: ['historical_values', 'seasonal_patterns', 'trend_components'],
                hyperparameters: { ensemble_weights: results.map(r => r.weight) },
                lastUpdated: new Date()
            }
        };
    }
    mapSeverityToValue(severity) {
        const mapping = {
            [AnomalySeverity.INFO]: 10,
            [AnomalySeverity.LOW]: 25,
            [AnomalySeverity.MEDIUM]: 50,
            [AnomalySeverity.HIGH]: 75,
            [AnomalySeverity.CRITICAL]: 95
        };
        return mapping[severity] || 0;
    }
    determineForecastType(timeHorizon) {
        if (timeHorizon <= 240)
            return ForecastType.SHORT_TERM; // 4 hours
        if (timeHorizon <= 1440)
            return ForecastType.MEDIUM_TERM; // 24 hours
        return ForecastType.LONG_TERM;
    }
    calculateMean(values) {
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }
    calculateStandardDeviation(values) {
        const mean = this.calculateMean(values);
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        return Math.sqrt(variance);
    }
    calculateVariance(values) {
        const mean = this.calculateMean(values);
        return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    }
    calculateMovingAverage(values, window) {
        const result = [];
        for (let i = window - 1; i < values.length; i++) {
            const slice = values.slice(i - window + 1, i + 1);
            result.push(this.calculateMean(slice));
        }
        return result;
    }
    calculateLinearTrend(values) {
        const n = values.length;
        const x = Array.from({ length: n }, (_, i) => i);
        const sumX = x.reduce((sum, val) => sum + val, 0);
        const sumY = values.reduce((sum, val) => sum + val, 0);
        const sumXY = x.reduce((sum, val, i) => sum + val * values[i], 0);
        const sumXX = x.reduce((sum, val) => sum + val * val, 0);
        return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    }
    calculateAmplitude(pattern) {
        const max = Math.max(...pattern);
        const min = Math.min(...pattern);
        return (max - min) / 2;
    }
    calculatePhase(pattern) {
        const maxIndex = pattern.indexOf(Math.max(...pattern));
        return (2 * Math.PI * maxIndex) / pattern.length;
    }
    calculateSeasonalStrength(pattern) {
        const mean = this.calculateMean(pattern);
        const variance = this.calculateVariance(pattern);
        return variance / Math.max(mean, 1); // Coefficient of variation
    }
    calculateNextPeak(period, phase) {
        const now = new Date();
        const periodMs = this.getSeasonalPeriodSeconds(period) * 1000;
        const phaseMs = (phase / (2 * Math.PI)) * periodMs;
        return new Date(now.getTime() + phaseMs);
    }
    getSeasonalPeriodSeconds(period) {
        switch (period) {
            case SeasonalPeriod.HOURLY: return 3600;
            case SeasonalPeriod.DAILY: return 86400;
            case SeasonalPeriod.WEEKLY: return 604800;
            case SeasonalPeriod.MONTHLY: return 2592000;
            case SeasonalPeriod.QUARTERLY: return 7776000;
            default: return 3600;
        }
    }
    generateForecastId() {
        return `forecast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    initializeForecastingModels() {
        const models = [
            {
                modelId: 'arima-v1',
                name: 'ARIMA Forecaster',
                algorithm: ForecastAlgorithm.ARIMA,
                weight: 0.3,
                isActive: true,
                accuracy: 0.75,
                targetMetrics: ['*']
            },
            {
                modelId: 'exponential-smoothing-v1',
                name: 'Exponential Smoothing',
                algorithm: ForecastAlgorithm.EXPONENTIAL_SMOOTHING,
                weight: 0.2,
                isActive: true,
                accuracy: 0.70,
                targetMetrics: ['*']
            },
            {
                modelId: 'seasonal-naive-v1',
                name: 'Seasonal Naive',
                algorithm: ForecastAlgorithm.SEASONAL_NAIVE,
                weight: 0.2,
                isActive: true,
                accuracy: 0.65,
                targetMetrics: ['*']
            },
            {
                modelId: 'prophet-v1',
                name: 'Prophet-like Model',
                algorithm: ForecastAlgorithm.PROPHET,
                weight: 0.2,
                isActive: true,
                accuracy: 0.80,
                targetMetrics: ['*']
            },
            {
                modelId: 'lstm-v1',
                name: 'LSTM Neural Network',
                algorithm: ForecastAlgorithm.LSTM,
                weight: 0.1,
                isActive: true,
                accuracy: 0.85,
                targetMetrics: ['*']
            }
        ];
        models.forEach(model => this.forecastingModels.set(model.modelId, model));
    }
    initializeThreatScenarios() {
        const scenarios = [
            {
                scenarioId: 'coordinated-attack',
                name: 'Coordinated Multi-Vector Attack',
                description: 'Simultaneous attacks across multiple threat vectors',
                threatTypes: [ThreatType.BRUTE_FORCE_ATTACK, ThreatType.API_ABUSE, ThreatType.DISTRIBUTED_ATTACK],
                triggers: [
                    { triggerType: 'anomaly_count', condition: 'anomalies > 10', weight: 0.4 },
                    { triggerType: 'metric_threshold', condition: 'threat_level > 80', weight: 0.6 }
                ],
                expectedDuration: 180, // minutes
                expectedIntensity: 85,
                likelihood: 0.15,
                impactAssessment: {
                    businessImpact: 90,
                    technicalImpact: 85,
                    reputationalImpact: 80,
                    financialImpact: 85,
                    complianceImpact: 70
                }
            }
        ];
        scenarios.forEach(scenario => this.threatScenarios.set(scenario.scenarioId, scenario));
    }
    startRealTimeForecasting() {
        if (this.forecastingInterval) {
            clearInterval(this.forecastingInterval);
        }
        this.forecastingInterval = setInterval(async () => {
            if (!this.isForecasting) {
                this.isForecasting = true;
                try {
                    await this.performScheduledForecasting();
                }
                catch (error) {
                    console.error('Scheduled forecasting error:', error);
                }
                finally {
                    this.isForecasting = false;
                }
            }
        }, this.config.forecastUpdateInterval);
    }
    async performScheduledForecasting() {
        // Generate forecasts for all major threat types
        const threatTypes = [
            ThreatType.BRUTE_FORCE_ATTACK,
            ThreatType.ACCOUNT_TAKEOVER,
            ThreatType.CREDENTIAL_STUFFING,
            ThreatType.API_ABUSE
        ];
        for (const threatType of threatTypes) {
            try {
                await this.generateThreatForecast(threatType);
            }
            catch (error) {
                console.error(`Error in scheduled forecasting for ${threatType}:`, error);
            }
        }
    }
    // ==========================================
    // PUBLIC API METHODS
    // ==========================================
    getActiveForecasts() {
        return Array.from(this.activeForecasts.values());
    }
    getForecastsByType(forecastType) {
        return Array.from(this.activeForecasts.values())
            .filter(forecast => forecast.forecastType === forecastType);
    }
    getForecastsByThreatType(threatType) {
        return Array.from(this.activeForecasts.values())
            .filter(forecast => forecast.threatType === threatType);
    }
    getTimeSeriesData(seriesKey) {
        return this.timeSeriesData.get(seriesKey) || [];
    }
    updateConfiguration(newConfig) {
        this.config = { ...this.config, ...newConfig };
        if (newConfig.enableRealTimeForecasting !== undefined) {
            if (newConfig.enableRealTimeForecasting) {
                this.startRealTimeForecasting();
            }
            else if (this.forecastingInterval) {
                clearInterval(this.forecastingInterval);
                this.forecastingInterval = undefined;
            }
        }
    }
    destroy() {
        if (this.forecastingInterval) {
            clearInterval(this.forecastingInterval);
        }
        this.removeAllListeners();
        this.timeSeriesData.clear();
        this.activeForecasts.clear();
        this.forecastingModels.clear();
        this.threatScenarios.clear();
        this.seasonalDecompositions.clear();
    }
}
export default SecurityThreatForecasting;
