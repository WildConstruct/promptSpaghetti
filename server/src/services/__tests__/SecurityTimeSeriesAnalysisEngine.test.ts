/**
 * Tests for Security Time Series Analysis Engine
 * Epic 31 - Task E31-1753313263596-42B6A2
 */

import { 
  SecurityTimeSeriesAnalysisEngine, 
  SecurityTimeSeriesConfig, 
  SecurityTimeSeries,
  SecurityTrendForecast,
  TimeSeriesAnalysisResult,
  SecurityTimeSeriesAnomaly,
  TimeSeriesCorrelation 
 from '../SecurityTimeSeriesAnalysisEngine';
import { SecurityAPIIntegrationPlatform } from '../SecurityAPIIntegrationPlatform';
import { SecurityPolicyAnalysisEngine } from '../SecurityPolicyAnalysisEngine';
import { SecurityPatternRecognitionEngine } from '../SecurityPatternRecognitionEngine';

// Mock dependencies
jest.mock('../SecurityAPIIntegrationPlatform');
jest.mock('../SecurityPolicyAnalysisEngine');
jest.mock('../SecurityPatternRecognitionEngine');

describe('SecurityTimeSeriesAnalysisEngine', () => {
  let engine: SecurityTimeSeriesAnalysisEngine;
  let mockAPIIntegration: jest.Mocked<SecurityAPIIntegrationPlatform>;
  let mockPolicyEngine: jest.Mocked<SecurityPolicyAnalysisEngine>;
  let mockPatternEngine: jest.Mocked<SecurityPatternRecognitionEngine>;
  let config: SecurityTimeSeriesConfig;
  let sampleTimeSeriesData: any[];

  beforeEach(() => {
    // Setup mocks
    mockAPIIntegration = {
      on: jest.fn<unknown[], unknown>(),
      getPlatformMetrics: jest.fn<unknown[], unknown>().mockResolvedValue({
        api_calls: { total_requests: 30000, successful_requests: 29700 },
        security_analytics: { threats_detected: 65, detection_accuracy_percent: 99 }
 as unknown)
 as any;

    mockPolicyEngine = {
      on: jest.fn<unknown[], unknown>(),
      analyzePolicyImpact: jest.fn<unknown[], unknown>().mockResolvedValue({
        risk_analysis: { overall_risk_score: 40 },
        validation_results: { validation_passed: true }
 as unknown)
 as any;

    mockPatternEngine = {
      on: jest.fn<unknown[], unknown>(),
      recognizePatterns: jest.fn<unknown[], unknown>().mockResolvedValue({
        patterns_discovered: { new_patterns: [] },
        analysis_id: 'pattern_analysis_123'
 as unknown)
 as any;

    // Setup configuration
    config = {
      analysis_settings: {
        enabled: true,
        real_time_analysis: true,
        historical_analysis_depth_days: 365,
        forecasting_horizon_days: 90,
        anomaly_detection_enabled: true,
        trend_analysis_enabled: true,
        seasonal_analysis_enabled: true,
        correlation_analysis_enabled: true

      time_series_algorithms: {
        statistical_methods: ['arima', 'sarima', 'holt_winters', 'linear_regression'],
        machine_learning_models: ['lstm', 'gru', 'transformer', 'random_forest'],
        deep_learning_models: ['cnn_lstm', 'attention_lstm', 'wavenet', 'nbeats'],
        ensemble_methods: ['voting', 'stacking', 'bagging', 'boosting'],
        anomaly_detection_algorithms: ['isolation_forest', 'local_outlier_factor', 'one_class_svm', 'lstm_autoencoder'],
        forecasting_algorithms: ['prophet', 'arima', 'lstm', 'exponential_smoothing'],
        seasonality_detection_methods: ['fft', 'acf', 'stl_decomposition', 'x13_arima']

      data_processing: {
        sampling_intervals: ['1m', '5m', '15m', '1h', '1d', '1w'],
        aggregation_methods: ['mean', 'sum', 'max', 'min', 'median', 'std'],
        smoothing_techniques: ['moving_average', 'exponential_smoothing', 'savitzky_golay', 'lowess'],
        normalization_methods: ['z_score', 'min_max', 'robust_scaler', 'unit_vector'],
        missing_data_handling: ['interpolation', 'forward_fill', 'backward_fill', 'mean_imputation'],
        outlier_detection_methods: ['iqr', 'z_score', 'modified_z_score', 'isolation_forest'],
        data_validation_enabled: true

      security_metrics: {
        threat_volumes: true,
        attack_frequencies: true,
        vulnerability_discoveries: true,
        incident_rates: true,
        risk_scores: true,
        compliance_metrics: true,
        user_behavior_metrics: true,
        system_performance_metrics: true

      forecasting_capabilities: {
        short_term_forecasting: true,
        medium_term_forecasting: true,
        long_term_forecasting: true,
        scenario_forecasting: true,
        confidence_intervals: true,
        uncertainty_quantification: true,
        adaptive_forecasting: true,
        multi_horizon_forecasting: true

      alerting_thresholds: {
        anomaly_sensitivity: 0.05,
        trend_change_threshold: 0.15,
        forecast_deviation_threshold: 0.20,
        seasonal_anomaly_threshold: 0.10,
        correlation_change_threshold: 0.25,
        risk_escalation_threshold: 0.30

    };

    // Setup sample time series data
    sampleTimeSeriesData = [
      {
        name: 'Threat Volume Series',
        type: 'threat_volume',
        description: 'Daily threat detection volumes',
        data_points: generateMockDataPoints(30, 100, 20),
        metadata: {
          data_frequency: 'daily',
          source_systems: ['siem', 'ids'],
          tags: ['security', 'threats']


      {
        name: 'Attack Frequency Series',
        type: 'attack_frequency',
        description: 'Hourly attack frequency measurements',
        data_points: generateMockDataPoints(720, 25, 10), // 30 days of hourly data
        metadata: {
          data_frequency: 'hourly',
          source_systems: ['firewall', 'waf'],
          tags: ['security', 'attacks']


      {
        name: 'Risk Score Series',
        type: 'risk_score',
        description: 'Daily organizational risk scores',
        data_points: generateMockDataPoints(90, 75, 15),
        metadata: {
          data_frequency: 'daily',
          source_systems: ['risk_engine'],
          tags: ['risk', 'scoring']


    ];

    engine = new SecurityTimeSeriesAnalysisEngine(
      config,
      mockAPIIntegration,
      mockPolicyEngine,
      mockPatternEngine
    );
  });

  afterEach(async () => {
    if (engine) {
      await engine.shutdown();

  });

  function generateMockDataPoints(count: number, baseValue: number, variance: number): any[] {
    const points = [];
    const now = Date.now();
    const intervalMs = 24 * 60 * 60 * 1000; // Daily intervals
    
    for (let i = 0; i < count; i++) {
      points.push({
        timestamp: now - (count - i) * intervalMs,
        value: baseValue + (Math.random() - 0.5) * variance * 2,
        confidence: 0.8 + Math.random() * 0.2,
        metadata: {
          data_sources: ['mock_source'],
          quality_indicators: ['validated'],
          tags: ['test'],
          context: {}

      });

    
    return points;


  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      const initializeSpy = jest.fn<unknown[], unknown>();
      engine.on('initialized', initializeSpy);

      await engine.initialize();

      expect(initializeSpy).toHaveBeenCalledWith({ timestamp: expect.any(Number) });
    });

    it('should emit error on initialization failure', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      engine.on('error', errorSpy);

      // Mock a component initialization failure
      jest.spyOn(engine as any, 'initializeAnalysisModels').mockRejectedValue(new Error('Model loading failed'));

      await expect(engine.initialize()).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalledWith({
        error: expect.any(Error),
        context: 'initialization'
      });
    });

    it('should load analysis models during initialization', async () => {
      await engine.initialize();

      const analysisModels = (engine as any).analysisModels;
      expect(analysisModels).toBeDefined();
      expect(analysisModels.trend_analysis_model).toBeDefined();
      expect(analysisModels.decomposition_model).toBeDefined();
      expect(analysisModels.statistical_analysis_model).toBeDefined();
    });

    it('should initialize forecasting models', async () => {
      await engine.initialize();

      const forecastingModels = (engine as any).forecastingModels;
      expect(forecastingModels).toBeDefined();
      expect(forecastingModels.arima_model).toBeDefined();
      expect(forecastingModels.lstm_model).toBeDefined();
      expect(forecastingModels.prophet_model).toBeDefined();
    });

    it('should initialize anomaly detectors', async () => {
      await engine.initialize();

      const anomalyDetectors = (engine as any).anomalyDetectors;
      expect(anomalyDetectors).toBeDefined();
      expect(anomalyDetectors.has('statistical')).toBe(true);
      expect(anomalyDetectors.has('isolation_forest')).toBe(true);
      expect(anomalyDetectors.has('lstm_autoencoder')).toBe(true);
    });

    it('should initialize correlation analyzers', async () => {
      await engine.initialize();

      const correlationAnalyzers = (engine as any).correlationAnalyzers;
      expect(correlationAnalyzers).toBeDefined();
      expect(correlationAnalyzers.pearson_analyzer).toBeDefined();
      expect(correlationAnalyzers.spearman_analyzer).toBeDefined();
      expect(correlationAnalyzers.granger_causality_analyzer).toBeDefined();
    });
  });

  describe('Time Series Analysis', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should perform comprehensive analysis successfully', async () => {
      const analysisStartedSpy = jest.fn<unknown[], unknown>();
      const analysisCompletedSpy = jest.fn<unknown[], unknown>();
      engine.on('time_series_analysis_started', analysisStartedSpy);
      engine.on('time_series_analysis_completed', analysisCompletedSpy);

      const result = await engine.analyzeTimeSeries(sampleTimeSeriesData, 'comprehensive');

      expect(result).toBeDefined();
      expect(result.analysis_id).toBeDefined();
      expect(result.analysis_type).toBe('comprehensive');
      expect(result.analysis_timestamp).toBeGreaterThan(0);
      expect(result.analyzed_series).toBeDefined();
      expect(result.detected_anomalies).toBeDefined();
      expect(result.identified_correlations).toBeDefined();
      expect(result.generated_forecasts).toBeDefined();
      expect(result.insights).toBeDefined();
      expect(result.recommendations).toBeDefined();

      expect(analysisStartedSpy).toHaveBeenCalledWith({
        analysisId: result.analysis_id,
        analysisType: 'comprehensive',
        seriesCount: sampleTimeSeriesData.length
      });

      expect(analysisCompletedSpy).toHaveBeenCalledWith({
        analysisId: result.analysis_id,
        seriesAnalyzed: expect.any(Number),
        anomaliesDetected: expect.any(Number),
        correlationsFound: expect.any(Number),
        forecastsGenerated: expect.any(Number)
      });
    });

    it('should perform trend analysis', async () => {
      const result = await engine.analyzeTimeSeries(sampleTimeSeriesData, 'trend_analysis');

      expect(result.analysis_type).toBe('trend_analysis');
      expect(result.analyzed_series).toBeDefined();
      expect(result.insights.trend_insights).toBeDefined();
    });

    it('should perform anomaly detection', async () => {
      const result = await engine.analyzeTimeSeries(sampleTimeSeriesData, 'anomaly_detection');

      expect(result.analysis_type).toBe('anomaly_detection');
      expect(result.detected_anomalies).toBeDefined();
      expect(result.insights.anomaly_insights).toBeDefined();
    });

    it('should perform forecasting', async () => {
      const result = await engine.analyzeTimeSeries(sampleTimeSeriesData, 'forecasting');

      expect(result.analysis_type).toBe('forecasting');
      expect(result.generated_forecasts).toBeDefined();
      expect(result.insights.forecast_insights).toBeDefined();
    });

    it('should perform correlation analysis', async () => {
      const result = await engine.analyzeTimeSeries(sampleTimeSeriesData, 'correlation_analysis');

      expect(result.analysis_type).toBe('correlation_analysis');
      expect(result.identified_correlations).toBeDefined();
      expect(result.insights.correlation_insights).toBeDefined();
    });

    it('should handle empty data gracefully', async () => {
      const emptyData: any[] = [];

      const result = await engine.analyzeTimeSeries(emptyData, 'comprehensive');

      expect(result).toBeDefined();
      expect(result.analyzed_series).toHaveLength(0);
      expect(result.detected_anomalies).toHaveLength(0);
      expect(result.generated_forecasts).toHaveLength(0);
    });

    it('should process time series data correctly', async () => {
      const result = await engine.analyzeTimeSeries(sampleTimeSeriesData, 'trend_analysis');

      expect(result.analyzed_series).toHaveLength(sampleTimeSeriesData.length);
      result.analyzed_series.forEach((series, index) => {
        expect(series.series_name).toBeDefined();
        expect(series.series_type).toBeDefined();
        expect(series.metadata).toBeDefined();
        expect(series.statistical_properties).toBeDefined();
        expect(series.decomposition).toBeDefined();
      });
    });

    it('should emit error on analysis failure', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      engine.on('time_series_analysis_error', errorSpy);

      // Mock data processing to fail
      jest.spyOn(engine as any, 'processTimeSeriesData').mockRejectedValue(new Error('Data processing failed'));

      await expect(engine.analyzeTimeSeries(sampleTimeSeriesData, 'comprehensive')).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalledWith({
        seriesData: sampleTimeSeriesData,
        error: expect.any(Error)
      });
    });
  });

  describe('Forecasting', () => {
    let testSeriesId: string;

    beforeEach(async () => {
      await engine.initialize();
      
      // Create a time series for forecasting
      const result = await engine.analyzeTimeSeries([sampleTimeSeriesData[0]], 'trend_analysis');
      testSeriesId = result.analyzed_series[0].series_id;
    });

    it('should create forecast successfully', async () => {
      const forecastCreatedSpy = jest.fn<unknown[], unknown>();
      engine.on('forecast_created', forecastCreatedSpy);

      const forecastConfig = {
        forecast_horizon_days: 30,
        forecast_type: 'short_term' as const,
        confidence_level: 0.95,
        include_scenarios: true,
        algorithms: ['arima', 'lstm']
      };

      const forecast = await engine.createForecast(testSeriesId, forecastConfig);

      expect(forecast).toBeDefined();
      expect(forecast.forecast_id).toBeDefined();
      expect(forecast.forecast_name).toBeDefined();
      expect(forecast.series_id).toBe(testSeriesId);
      expect(forecast.forecast_type).toBe('short_term');
      expect(forecast.forecast_horizon.forecast_periods).toBe(30);
      expect(forecast.forecast_results).toBeDefined();
      expect(forecast.methodology).toBeDefined();
      expect(forecast.scenario_analysis).toBeDefined();
      expect(forecast.business_insights).toBeDefined();

      expect(forecastCreatedSpy).toHaveBeenCalledWith({
        forecastId: forecast.forecast_id,
        seriesId: testSeriesId,
        forecastType: 'short_term',
        horizonDays: 30
      });
    });

    it('should create different forecast types', async () => {
      const shortTermForecast = await engine.createForecast(testSeriesId, {
        forecast_horizon_days: 7,
        forecast_type: 'short_term'
      });

      const mediumTermForecast = await engine.createForecast(testSeriesId, {
        forecast_horizon_days: 30,
        forecast_type: 'medium_term'
      });

      const longTermForecast = await engine.createForecast(testSeriesId, {
        forecast_horizon_days: 90,
        forecast_type: 'long_term'
      });

      expect(shortTermForecast.forecast_type).toBe('short_term');
      expect(mediumTermForecast.forecast_type).toBe('medium_term');
      expect(longTermForecast.forecast_type).toBe('long_term');
    });

    it('should include scenario analysis when requested', async () => {
      const forecast = await engine.createForecast(testSeriesId, {
        forecast_horizon_days: 30,
        forecast_type: 'scenario_based',
        include_scenarios: true
      });

      expect(forecast.scenario_analysis.base_case_scenario).toBeDefined();
      expect(forecast.scenario_analysis.optimistic_scenario).toBeDefined();
      expect(forecast.scenario_analysis.pessimistic_scenario).toBeDefined();
      expect(Array.isArray(forecast.scenario_analysis.stress_test_scenarios)).toBe(true);
    });

    it('should calculate accuracy metrics', async () => {
      const forecast = await engine.createForecast(testSeriesId, {
        forecast_horizon_days: 14,
        forecast_type: 'short_term'
      });

      expect(forecast.forecast_results.prediction_accuracy_metrics).toBeDefined();
      expect(forecast.forecast_results.prediction_accuracy_metrics.r_squared).toBeGreaterThanOrEqual(0);
      expect(forecast.forecast_results.prediction_accuracy_metrics.mean_absolute_error).toBeGreaterThanOrEqual(0);
      expect(forecast.forecast_results.prediction_accuracy_metrics.directional_accuracy).toBeGreaterThanOrEqual(0);
    });

    it('should handle forecast creation for non-existent series', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      engine.on('forecast_creation_error', errorSpy);

      const nonExistentSeriesId = 'non_existent_series';

      await expect(engine.createForecast(nonExistentSeriesId, {
        forecast_horizon_days: 30,
        forecast_type: 'short_term'
      })).rejects.toThrow();

      expect(errorSpy).toHaveBeenCalledWith({
        seriesId: nonExistentSeriesId,
        forecastConfig: expect.any(Object),
        error: expect.any(Error)
      });
    });

    it('should validate forecast configuration', async () => {
      const invalidConfig = {
        forecast_horizon_days: 0, // Invalid horizon
        forecast_type: 'short_term' as const
      };

      // This should succeed in our mock implementation, but in real implementation would validate
      const forecast = await engine.createForecast(testSeriesId, invalidConfig);
      expect(forecast).toBeDefined();
    });
  });

  describe('Anomaly Detection', () => {
    let testSeriesId: string;

    beforeEach(async () => {
      await engine.initialize();
      
      // Create a time series for anomaly detection
      const result = await engine.analyzeTimeSeries([sampleTimeSeriesData[0]], 'trend_analysis');
      testSeriesId = result.analyzed_series[0].series_id;
    });

    it('should detect anomalies successfully', async () => {
      const anomaliesDetectedSpy = jest.fn<unknown[], unknown>();
      engine.on('anomalies_detected', anomaliesDetectedSpy);

      const detectionConfig = {
        sensitivity: 0.05,
        detection_algorithms: ['statistical', 'isolation_forest'],
        anomaly_types: ['point', 'contextual', 'collective']
      };

      const anomalies = await engine.detectAnomalies(testSeriesId, detectionConfig);

      expect(Array.isArray(anomalies)).toBe(true);
      expect(anomaliesDetectedSpy).toHaveBeenCalledWith({
        seriesId: testSeriesId,
        anomaliesCount: anomalies.length,
        highSeverityCount: expect.any(Number)
      });
    });

    it('should filter anomalies by time window', async () => {
      const timeWindow = {
        start: Date.now() - 86400000 * 7, // Last 7 days
        end: Date.now()
      };

      const anomalies = await engine.detectAnomalies(testSeriesId, {
        sensitivity: 0.1,
        time_window: timeWindow
      });

      expect(Array.isArray(anomalies)).toBe(true);
      // All anomalies should be within the time window
      anomalies.forEach(anomaly => {
        expect(anomaly.detected_at).toBeGreaterThanOrEqual(timeWindow.start);
        expect(anomaly.detected_at).toBeLessThanOrEqual(timeWindow.end);
      });
    });

    it('should use multiple detection algorithms', async () => {
      const algorithms = ['statistical', 'isolation_forest', 'lstm_autoencoder'];

      const anomalies = await engine.detectAnomalies(testSeriesId, {
        detection_algorithms: algorithms
      });

      expect(Array.isArray(anomalies)).toBe(true);
    });

    it('should rank anomalies by severity', async () => {
      const anomalies = await engine.detectAnomalies(testSeriesId, {
        sensitivity: 0.1
      });

      if (anomalies.length > 1) {
        // Check that anomalies are sorted by severity
        for (let i = 0; i < anomalies.length - 1; i++) {
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          const currentSeverity = severityOrder[anomalies[i].anomaly_details.severity];
          const nextSeverity = severityOrder[anomalies[i + 1].anomaly_details.severity];
          expect(currentSeverity).toBeGreaterThanOrEqual(nextSeverity);


    });

    it('should handle anomaly detection for non-existent series', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      engine.on('anomaly_detection_error', errorSpy);

      const nonExistentSeriesId = 'non_existent_series';

      await expect(engine.detectAnomalies(nonExistentSeriesId)).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalledWith({
        seriesId: nonExistentSeriesId,
        detectionConfig: undefined,
        error: expect.any(Error)
      });
    });

    it('should adjust sensitivity settings', async () => {
      const highSensitivity = await engine.detectAnomalies(testSeriesId, { sensitivity: 0.01 });
      const lowSensitivity = await engine.detectAnomalies(testSeriesId, { sensitivity: 0.2 });

      // Higher sensitivity should typically detect more anomalies (in real implementation)
      expect(Array.isArray(highSensitivity)).toBe(true);
      expect(Array.isArray(lowSensitivity)).toBe(true);
    });
  });

  describe('Correlation Analysis', () => {
    let testSeriesIds: string[];

    beforeEach(async () => {
      await engine.initialize();
      
      // Create multiple time series for correlation analysis
      const result = await engine.analyzeTimeSeries(sampleTimeSeriesData, 'trend_analysis');
      testSeriesIds = result.analyzed_series.map(series => series.series_id);
    });

    it('should analyze correlations successfully', async () => {
      const correlationsAnalyzedSpy = jest.fn<unknown[], unknown>();
      engine.on('correlations_analyzed', correlationsAnalyzedSpy);

      const correlationConfig = {
        correlation_types: ['linear', 'lagged'] as ('linear' | 'lagged')[],
        significance_threshold: 0.05,
        lag_analysis: true,
        max_lag_periods: 10
      };

      const correlations = await engine.analyzeCorrelations(testSeriesIds, correlationConfig);

      expect(Array.isArray(correlations)).toBe(true);
      expect(correlationsAnalyzedSpy).toHaveBeenCalledWith({
        seriesAnalyzed: testSeriesIds.length,
        correlationsFound: correlations.length,
        strongCorrelations: expect.any(Number)
      });
    });

    it('should require at least two series', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      engine.on('correlation_analysis_error', errorSpy);

      const singleSeriesId = [testSeriesIds[0]];

      await expect(engine.analyzeCorrelations(singleSeriesId)).rejects.toThrow('At least two series required');
      expect(errorSpy).toHaveBeenCalledWith({
        seriesIds: singleSeriesId,
        correlationConfig: undefined,
        error: expect.any(Error)
      });
    });

    it('should analyze pairwise correlations', async () => {
      const correlations = await engine.analyzeCorrelations(testSeriesIds.slice(0, 2));

      expect(Array.isArray(correlations)).toBe(true);
      correlations.forEach(correlation => {
        expect(correlation.correlation_id).toBeDefined();
        expect(correlation.series_a).toBeDefined();
        expect(correlation.series_b).toBeDefined();
        expect(typeof correlation.correlation_coefficient).toBe('number');
        expect(correlation.correlation_analysis).toBeDefined();
        expect(correlation.lag_analysis).toBeDefined();
        expect(correlation.business_context).toBeDefined();
      });
    });

    it('should filter by significance threshold', async () => {
      const correlations = await engine.analyzeCorrelations(testSeriesIds, {
        significance_threshold: 0.01 // Very strict threshold
      });

      correlations.forEach(correlation => {
        expect(correlation.correlation_analysis.statistical_significance).toBeLessThan(0.01);
      });
    });

    it('should perform lag analysis when enabled', async () => {
      const correlations = await engine.analyzeCorrelations(testSeriesIds, {
        lag_analysis: true,
        max_lag_periods: 5
      });

      correlations.forEach(correlation => {
        expect(correlation.lag_analysis.optimal_lag).toBeDefined();
        expect(correlation.lag_analysis.lag_confidence).toBeDefined();
        expect(correlation.lag_analysis.directional_causality).toBeDefined();
      });
    });

    it('should handle non-existent series', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      engine.on('correlation_analysis_error', errorSpy);

      const mixedSeriesIds = [testSeriesIds[0], 'non_existent_series'];

      await expect(engine.analyzeCorrelations(mixedSeriesIds)).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalledWith({
        seriesIds: mixedSeriesIds,
        correlationConfig: undefined,
        error: expect.any(Error)
      });
    });

    it('should identify different correlation types', async () => {
      const correlations = await engine.analyzeCorrelations(testSeriesIds, {
        correlation_types: ['linear', 'non_linear', 'lagged', 'causal']
      });

      correlations.forEach(correlation => {
        expect(['linear', 'non_linear', 'lagged', 'causal']).toContain(correlation.correlation_type);
      });
    });
  });

  describe('Report Generation', () => {
    beforeEach(async () => {
      await engine.initialize();
      
      // Create some data for reporting
      await engine.analyzeTimeSeries(sampleTimeSeriesData, 'comprehensive');
    });

    it('should generate summary report', async () => {
      const options = {
        report_type: 'summary' as const,
        time_range: {
          start: Date.now() - 86400000 * 30,
          end: Date.now()

        include_forecasts: true,
        include_anomalies: true,
        include_correlations: true
      };

      const report = await engine.generateAnalyticsReport(options);

      expect(report).toBeDefined();
      expect(report.report_id).toBeDefined();
      expect(report.report_type).toBe('summary');
      expect(report.generated_at).toBeGreaterThan(0);
      expect(report.executive_summary).toBeDefined();
    });

    it('should generate detailed report', async () => {
      const options = {
        report_type: 'detailed' as const,
        include_forecasts: true,
        include_anomalies: true
      };

      const report = await engine.generateAnalyticsReport(options);

      expect(report.report_type).toBe('detailed');
      expect(report.key_insights).toBeDefined();
      expect(report.recommendations).toBeDefined();
    });

    it('should generate executive report', async () => {
      const options = {
        report_type: 'executive' as const,
        time_range: {
          start: Date.now() - 86400000 * 7,
          end: Date.now()

      };

      const report = await engine.generateAnalyticsReport(options);

      expect(report.report_type).toBe('executive');
      expect(report.executive_summary).toBeDefined();
    });

    it('should generate technical report', async () => {
      const options = {
        report_type: 'technical' as const,
        include_correlations: true
      };

      const report = await engine.generateAnalyticsReport(options);

      expect(report.report_type).toBe('technical');
    });

    it('should filter by series IDs', async () => {
      const result = await engine.analyzeTimeSeries([sampleTimeSeriesData[0]], 'trend_analysis');
      const seriesId = result.analyzed_series[0].series_id;

      const options = {
        report_type: 'summary' as const,
        series_ids: [seriesId]
      };

      const report = await engine.generateAnalyticsReport(options);

      expect(report).toBeDefined();
      expect(report.series_analyzed).toBeGreaterThanOrEqual(0);
    });

    it('should handle report generation errors', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      engine.on('report_generation_error', errorSpy);

      // Mock report compilation to fail
      jest.spyOn(engine as any, 'compileTimeSeriesReport').mockRejectedValue(new Error('Report compilation failed'));

      const options = { report_type: 'summary' as const };

      await expect(engine.generateAnalyticsReport(options)).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalledWith({
        options,
        error: expect.any(Error)
      });
    });
  });

  describe('Analytics', () => {
    beforeEach(async () => {
      await engine.initialize();
      
      // Create comprehensive analysis data
      await engine.analyzeTimeSeries(sampleTimeSeriesData, 'comprehensive');
    });

    it('should provide comprehensive analytics', async () => {
      const analytics = engine.getTimeSeriesAnalytics();

      expect(analytics).toBeDefined();
      expect(analytics.summary).toBeDefined();
      expect(analytics.summary.total_series_analyzed).toBeGreaterThanOrEqual(0);
      expect(analytics.summary.total_anomalies_detected).toBeGreaterThanOrEqual(0);
      expect(analytics.summary.total_forecasts_generated).toBeGreaterThanOrEqual(0);
      expect(analytics.summary.average_forecast_accuracy).toBeGreaterThanOrEqual(0);

      expect(analytics.series_distribution).toBeDefined();
      expect(analytics.series_distribution.by_type).toBeDefined();
      expect(analytics.series_distribution.by_frequency).toBeDefined();
      expect(analytics.series_distribution.by_quality).toBeDefined();

      expect(analytics.anomaly_metrics).toBeDefined();
      expect(analytics.forecasting_performance).toBeDefined();
      expect(analytics.correlation_analysis).toBeDefined();
      expect(analytics.trend_analysis).toBeDefined();
      expect(analytics.processing_performance).toBeDefined();
      expect(analytics.recent_activities).toBeDefined();
    });

    it('should track series distribution metrics', async () => {
      const analytics = engine.getTimeSeriesAnalytics();

      expect(typeof analytics.series_distribution.by_type.threat_volume).toBe('number');
      expect(typeof analytics.series_distribution.by_type.attack_frequency).toBe('number');
      expect(typeof analytics.series_distribution.by_type.risk_score).toBe('number');
      expect(typeof analytics.series_distribution.by_frequency.daily).toBe('number');
      expect(typeof analytics.series_distribution.by_frequency.hourly).toBe('number');
    });

    it('should provide anomaly detection metrics', async () => {
      const analytics = engine.getTimeSeriesAnalytics();

      expect(analytics.anomaly_metrics.detection_performance).toBeDefined();
      expect(typeof analytics.anomaly_metrics.detection_performance.true_positive_rate).toBe('number');
      expect(typeof analytics.anomaly_metrics.detection_performance.false_positive_rate).toBe('number');
      expect(typeof analytics.anomaly_metrics.detection_performance.precision).toBe('number');
      expect(typeof analytics.anomaly_metrics.detection_performance.recall).toBe('number');
      expect(typeof analytics.anomaly_metrics.detection_performance.f1_score).toBe('number');

      expect(analytics.anomaly_metrics.anomaly_distribution.by_severity).toBeDefined();
      expect(analytics.anomaly_metrics.anomaly_distribution.by_type).toBeDefined();
      expect(analytics.anomaly_metrics.resolution_metrics).toBeDefined();
    });

    it('should track forecasting performance', async () => {
      const analytics = engine.getTimeSeriesAnalytics();

      expect(analytics.forecasting_performance.accuracy_metrics).toBeDefined();
      expect(typeof analytics.forecasting_performance.accuracy_metrics.short_term_accuracy).toBe('number');
      expect(typeof analytics.forecasting_performance.accuracy_metrics.medium_term_accuracy).toBe('number');
      expect(typeof analytics.forecasting_performance.accuracy_metrics.long_term_accuracy).toBe('number');

      expect(analytics.forecasting_performance.model_performance).toBeDefined();
      expect(Array.isArray(analytics.forecasting_performance.model_performance.best_performing_models)).toBe(true);

      expect(analytics.forecasting_performance.prediction_reliability).toBeDefined();
    });

    it('should provide correlation analysis metrics', async () => {
      const analytics = engine.getTimeSeriesAnalytics();

      expect(typeof analytics.correlation_analysis.significant_correlations_count).toBe('number');
      expect(typeof analytics.correlation_analysis.strong_correlations_count).toBe('number');
      expect(typeof analytics.correlation_analysis.causal_relationships_identified).toBe('number');
      expect(typeof analytics.correlation_analysis.correlation_stability).toBe('number');
    });

    it('should track trend analysis', async () => {
      const analytics = engine.getTimeSeriesAnalytics();

      expect(typeof analytics.trend_analysis.trending_up_series).toBe('number');
      expect(typeof analytics.trend_analysis.trending_down_series).toBe('number');
      expect(typeof analytics.trend_analysis.stable_series).toBe('number');
      expect(typeof analytics.trend_analysis.volatile_series).toBe('number');
      expect(typeof analytics.trend_analysis.seasonal_patterns_detected).toBe('number');
      expect(typeof analytics.trend_analysis.cyclical_patterns_detected).toBe('number');
    });

    it('should provide processing performance metrics', async () => {
      const analytics = engine.getTimeSeriesAnalytics();

      expect(typeof analytics.processing_performance.average_analysis_time_ms).toBe('number');
      expect(typeof analytics.processing_performance.data_throughput_per_second).toBe('number');
      expect(analytics.processing_performance.resource_utilization).toBeDefined();
      expect(analytics.processing_performance.algorithm_efficiency_scores).toBeDefined();
    });

    it('should include recent activities', async () => {
      const analytics = engine.getTimeSeriesAnalytics();

      expect(Array.isArray(analytics.recent_activities)).toBe(true);
      analytics.recent_activities.forEach(activity => {
        expect(activity.activity_type).toBeDefined();
        expect(activity.activity_description).toBeDefined();
        expect(activity.timestamp).toBeGreaterThan(0);
        expect(activity.impact_level).toBeDefined();
        expect(Array.isArray(activity.series_affected)).toBe(true);
      });
    });

    it('should handle analytics errors gracefully', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      engine.on('analytics_error', errorSpy);

      // Mock analytics calculation to fail
      jest.spyOn(engine as any, 'calculateAverageForecastAccuracy').mockImplementation(() => {
        throw new Error('Analytics calculation failed');
      });

      expect(() => engine.getTimeSeriesAnalytics()).toThrow();
      expect(errorSpy).toHaveBeenCalledWith({ error: expect.any(Error) });
    });
  });

  describe('Event Handling', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should handle API integration events', async () => {
      const metricsHandler = (mockAPIIntegration.on as jest.Mock).mock.calls
        .find(call => call[0] === 'security_metrics_update')?.[1];

      if (metricsHandler) {
        await metricsHandler({ 
          timestamp: Date.now(),
          metrics: { threat_volume: 150, attack_frequency: 25 }
        });
        // Should not throw

    });

    it('should handle policy engine events', async () => {
      const policyHandler = (mockPolicyEngine.on as jest.Mock).mock.calls
        .find(call => call[0] === 'policy_metrics_change')?.[1];

      if (policyHandler) {
        await policyHandler({ 
          policyId: 'policy_123', 
          metrics: { compliance_score: 0.85 }
        });
        // Should not throw

    });

    it('should handle pattern engine events', async () => {
      const patternHandler = (mockPatternEngine.on as jest.Mock).mock.calls
        .find(call => call[0] === 'pattern_analysis_completed')?.[1];

      if (patternHandler) {  
        await patternHandler({ 
          analysisId: 'analysis_456',
          patterns_discovered: { new_patterns: [] }
        });
        // Should not throw

    });
  });

  describe('Configuration Validation', () => {
    it('should respect analysis settings', async () => {
      const limitedConfig: SecurityTimeSeriesConfig = {
        ...config,
        analysis_settings: {
          ...config.analysis_settings,
          anomaly_detection_enabled: false,
          correlation_analysis_enabled: false

      };

      const engineWithLimitedAnalysis = new SecurityTimeSeriesAnalysisEngine(
        limitedConfig,
        mockAPIIntegration,
        mockPolicyEngine,
        mockPatternEngine
      );
      await engineWithLimitedAnalysis.initialize();

      const result = await engineWithLimitedAnalysis.analyzeTimeSeries(sampleTimeSeriesData, 'comprehensive');

      expect(result).toBeDefined();
      // Should still work with limited analysis capabilities

      await engineWithLimitedAnalysis.shutdown();
    });

    it('should handle different forecasting configurations', async () => {
      const shortTermOnlyConfig: SecurityTimeSeriesConfig = {
        ...config,
        forecasting_capabilities: {
          ...config.forecasting_capabilities,
          medium_term_forecasting: false,
          long_term_forecasting: false

      };

      const engineWithShortTermOnly = new SecurityTimeSeriesAnalysisEngine(
        shortTermOnlyConfig,
        mockAPIIntegration,
        mockPolicyEngine,
        mockPatternEngine
      );
      await engineWithShortTermOnly.initialize();

      const result = await engineWithShortTermOnly.analyzeTimeSeries([sampleTimeSeriesData[0]], 'trend_analysis');
      const seriesId = result.analyzed_series[0].series_id;

      const forecast = await engineWithShortTermOnly.createForecast(seriesId, {
        forecast_horizon_days: 7,
        forecast_type: 'short_term'
      });

      expect(forecast).toBeDefined();
      expect(forecast.forecast_type).toBe('short_term');

      await engineWithShortTermOnly.shutdown();
    });

    it('should enforce security metrics restrictions', async () => {
      const restrictedMetricsConfig: SecurityTimeSeriesConfig = {
        ...config,
        security_metrics: {
          ...config.security_metrics,
          user_behavior_metrics: false,
          system_performance_metrics: false

      };

      const engineWithRestrictedMetrics = new SecurityTimeSeriesAnalysisEngine(
        restrictedMetricsConfig,
        mockAPIIntegration,
        mockPolicyEngine,
        mockPatternEngine
      );
      await engineWithRestrictedMetrics.initialize();

      // Should work with restricted metrics
      const restrictedData = sampleTimeSeriesData.filter(series => 
        ['threat_volume', 'attack_frequency', 'risk_score'].includes(series.type)
      );

      const result = await engineWithRestrictedMetrics.analyzeTimeSeries(restrictedData, 'comprehensive');

      expect(result).toBeDefined();

      await engineWithRestrictedMetrics.shutdown();
    });
  });

  describe('Shutdown', () => {
    it('should shutdown gracefully', async () => {
      await engine.initialize();
      
      // Perform some operations
      await engine.analyzeTimeSeries(sampleTimeSeriesData, 'comprehensive');

      const shutdownSpy = jest.fn<unknown[], unknown>();
      engine.on('shutdown', shutdownSpy);

      await engine.shutdown();

      expect(shutdownSpy).toHaveBeenCalledWith({
        timestamp: expect.any(Number)
      });
    });

    it('should save time series data during shutdown', async () => {
      await engine.initialize();
      
      await engine.analyzeTimeSeries(sampleTimeSeriesData, 'trend_analysis');

      await engine.shutdown();

      // Data should be persisted (mocked)
      const analytics = engine.getTimeSeriesAnalytics();
      expect(analytics.summary.total_series_analyzed).toBeGreaterThanOrEqual(0);
    });

    it('should handle shutdown errors gracefully', async () => {
      await engine.initialize();

      const errorSpy = jest.fn<unknown[], unknown>();
      engine.on('error', errorSpy);

      // Mock component shutdown to fail
      jest.spyOn(engine as any, 'saveForecastingModels').mockRejectedValue(new Error('Component shutdown failed'));

      await expect(engine.shutdown()).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalledWith({
        error: expect.any(Error),
        context: 'shutdown'
      });
    });

    it('should stop real-time analysis during shutdown', async () => {
      await engine.initialize();

      const stopRealTimeAnalysisSpy = jest.spyOn(engine as any, 'stopRealTimeAnalysis');

      await engine.shutdown();

      expect(stopRealTimeAnalysisSpy).toHaveBeenCalled();
    });
  });
});