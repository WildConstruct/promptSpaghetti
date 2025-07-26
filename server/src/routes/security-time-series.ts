/**
 * Security Time Series Analysis and Trend Forecasting API Routes
 * Epic 31 - Task E31-1753313263596-42B6A2
 * 
 * RESTful API endpoints for time series analysis, trend forecasting,
 * and temporal security analytics capabilities.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  SecurityTimeSeriesAnalysisEngine, 
  SecurityTimeSeriesConfig, 
  SecurityTimeSeries,
  SecurityTrendForecast,
  TimeSeriesAnalysisResult,
  SecurityTimeSeriesAnomaly,
  TimeSeriesCorrelation 
} from '../services/SecurityTimeSeriesAnalysisEngine';
import { SecurityAPIIntegrationPlatform } from '../services/SecurityAPIIntegrationPlatform';
import { SecurityPolicyAnalysisEngine } from '../services/SecurityPolicyAnalysisEngine';
import { SecurityPatternRecognitionEngine } from '../services/SecurityPatternRecognitionEngine';

// Global time series analysis engine instance
let timeSeriesEngine: SecurityTimeSeriesAnalysisEngine | null = null;

interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: number;
}

interface AnalyzeTimeSeriesRequest {
  time_series_data: {
    series_name: string;
    series_type: 'threat_volume' | 'attack_frequency' | 'vulnerability_discovery' | 'incident_rate' | 'risk_score' | 'compliance_metric' | 'user_behavior' | 'system_performance';
    description: string;
    data_points: {
      timestamp: number;
      value: number;
      confidence?: number;
      metadata?: Record<string, unknown>;
    }[];
    metadata?: {
      data_frequency: string;
      source_systems: string[];
      tags?: string[];
    };
  }[];
  analysis_type: 'trend_analysis' | 'anomaly_detection' | 'forecasting' | 'correlation_analysis' | 'comprehensive';
  analysis_options?: {
    time_range?: {
      start_date: number;
      end_date: number;
    };
    sensitivity_settings?: {
      anomaly_sensitivity?: number;
      trend_sensitivity?: number;
      correlation_threshold?: number;
    };
    forecasting_options?: {
      horizon_days?: number;
      confidence_level?: number;
      include_scenarios?: boolean;
    };
    algorithms?: {
      preferred_algorithms?: string[];
      ensemble_methods?: boolean;
      ml_enabled?: boolean;
    };
  };
}

interface CreateForecastRequest {
  series_id: string;
  forecast_configuration: {
    forecast_horizon_days: number;
    forecast_type: 'short_term' | 'medium_term' | 'long_term' | 'scenario_based';
    confidence_level?: number;
    include_scenarios?: boolean;
    algorithms?: string[];
    custom_parameters?: {
      seasonal_adjustment?: boolean;
      trend_adjustment?: boolean;
      external_factors?: string[];
    };
  };
  business_context?: {
    business_objectives: string[];
    risk_tolerance: 'low' | 'medium' | 'high';
    decision_timeline: string;
    stakeholder_requirements: string[];
  };
}

interface DetectAnomaliesRequest {
  series_id: string;
  detection_configuration?: {
    sensitivity: number;
    detection_algorithms: string[];
    time_window?: {
      start: number;
      end: number;
    };
    anomaly_types: string[];
    context_window_hours?: number;
  };
  alert_preferences?: {
    severity_threshold: 'low' | 'medium' | 'high' | 'critical';
    notification_channels: string[];
    escalation_rules: {
      severity_level: string;
      escalation_delay_minutes: number;
      escalation_targets: string[];
    }[];
  };
}

interface AnalyzeCorrelationsRequest {
  series_ids: string[];
  correlation_configuration?: {
    correlation_types: ('linear' | 'non_linear' | 'lagged' | 'causal')[];
    significance_threshold: number;
    lag_analysis: boolean;
    max_lag_periods: number;
    min_correlation_strength: number;
  };
  analysis_scope?: {
    time_range?: {
      start: number;
      end: number;
    };
    focus_areas?: string[];
    business_relevance_filter?: boolean;
  };
}

interface GenerateReportRequest {
  report_type: 'summary' | 'detailed' | 'executive' | 'technical';
  report_scope: {
    time_range?: {
      start: number;
      end: number;
    };
    series_ids?: string[];
    include_forecasts?: boolean;
    include_anomalies?: boolean;
    include_correlations?: boolean;
    focus_metrics?: string[];
  };
  report_options?: {
    include_visualizations?: boolean;
    include_recommendations?: boolean;
    include_executive_summary?: boolean;
    export_format?: 'json' | 'pdf' | 'csv' | 'xlsx';
    detail_level?: 'high' | 'medium' | 'low';
  };
  delivery_preferences?: {
    email_recipients?: string[];
    dashboard_publication?: boolean;
    automated_scheduling?: {
      frequency: 'daily' | 'weekly' | 'monthly';
      delivery_time: string;
    };
  };
}

async function initializeTimeSeriesEngine(): Promise<void> {
  if (timeSeriesEngine) {
    return;
  }

  const config: SecurityTimeSeriesConfig = {
    analysis_settings: {
      enabled: true,
      real_time_analysis: true,
      historical_analysis_depth_days: 365,
      forecasting_horizon_days: 90,
      anomaly_detection_enabled: true,
      trend_analysis_enabled: true,
      seasonal_analysis_enabled: true,
      correlation_analysis_enabled: true
    },
    time_series_algorithms: {
      statistical_methods: ['arima', 'sarima', 'holt_winters', 'linear_regression'],
      machine_learning_models: ['lstm', 'gru', 'transformer', 'random_forest'],
      deep_learning_models: ['cnn_lstm', 'attention_lstm', 'wavenet', 'nbeats'],
      ensemble_methods: ['voting', 'stacking', 'bagging', 'boosting'],
      anomaly_detection_algorithms: ['isolation_forest', 'local_outlier_factor', 'one_class_svm', 'lstm_autoencoder'],
      forecasting_algorithms: ['prophet', 'arima', 'lstm', 'exponential_smoothing'],
      seasonality_detection_methods: ['fft', 'acf', 'stl_decomposition', 'x13_arima']
    },
    data_processing: {
      sampling_intervals: ['1m', '5m', '15m', '1h', '1d', '1w'],
      aggregation_methods: ['mean', 'sum', 'max', 'min', 'median', 'std'],
      smoothing_techniques: ['moving_average', 'exponential_smoothing', 'savitzky_golay', 'lowess'],
      normalization_methods: ['z_score', 'min_max', 'robust_scaler', 'unit_vector'],
      missing_data_handling: ['interpolation', 'forward_fill', 'backward_fill', 'mean_imputation'],
      outlier_detection_methods: ['iqr', 'z_score', 'modified_z_score', 'isolation_forest'],
      data_validation_enabled: true
    },
    security_metrics: {
      threat_volumes: true,
      attack_frequencies: true,
      vulnerability_discoveries: true,
      incident_rates: true,
      risk_scores: true,
      compliance_metrics: true,
      user_behavior_metrics: true,
      system_performance_metrics: true
    },
    forecasting_capabilities: {
      short_term_forecasting: true,
      medium_term_forecasting: true,
      long_term_forecasting: true,
      scenario_forecasting: true,
      confidence_intervals: true,
      uncertainty_quantification: true,
      adaptive_forecasting: true,
      multi_horizon_forecasting: true
    },
    alerting_thresholds: {
      anomaly_sensitivity: 0.05,
      trend_change_threshold: 0.15,
      forecast_deviation_threshold: 0.20,
      seasonal_anomaly_threshold: 0.10,
      correlation_change_threshold: 0.25,
      risk_escalation_threshold: 0.30
    }
  };

  // Get required dependencies (mocked for now)
  const apiIntegration = new SecurityAPIIntegrationPlatform({} as any, {} as any);
  const policyEngine = new SecurityPolicyAnalysisEngine({} as any, {} as any);
  const patternEngine = new SecurityPatternRecognitionEngine({} as any, {} as any, {} as any, {} as any);

  timeSeriesEngine = new SecurityTimeSeriesAnalysisEngine(
    config,
    apiIntegration,
    policyEngine,
    patternEngine
  );

  await timeSeriesEngine.initialize();
}

export default async function timeSeriesRoutes(fastify: FastifyInstance) {
  // Initialize the time series analysis engine
  await initializeTimeSeriesEngine();

  // Route 1: Analyze Time Series
  fastify.post<{ Body: AnalyzeTimeSeriesRequest }>('/api/security-time-series/analyze', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Perform comprehensive time series analysis on security metrics',
      tags: ['Time Series Analysis'],
      body: {
        type: 'object',
        required: ['time_series_data', 'analysis_type'],
        properties: {
          time_series_data: {
            type: 'array',
            items: {
              type: 'object',
              required: ['series_name', 'series_type', 'data_points'],
              properties: {
                series_name: { type: 'string', minLength: 1 },
                series_type: {
                  type: 'string',
                  enum: ['threat_volume', 'attack_frequency', 'vulnerability_discovery', 'incident_rate', 'risk_score', 'compliance_metric', 'user_behavior', 'system_performance']
                },
                description: { type: 'string' },
                data_points: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['timestamp', 'value'],
                    properties: {
                      timestamp: { type: 'number' },
                      value: { type: 'number' },
                      confidence: { type: 'number', minimum: 0, maximum: 1 }
                    }
                  }
                }
              }
            }
          },
          analysis_type: {
            type: 'string',
            enum: ['trend_analysis', 'anomaly_detection', 'forecasting', 'correlation_analysis', 'comprehensive']
          },
          analysis_options: {
            type: 'object',
            properties: {
              time_range: {
                type: 'object',
                properties: {
                  start_date: { type: 'number' },
                  end_date: { type: 'number' }
                }
              },
              forecasting_options: {
                type: 'object',
                properties: {
                  horizon_days: { type: 'number', minimum: 1, maximum: 365 },
                  confidence_level: { type: 'number', minimum: 0.5, maximum: 0.99 }
                }
              }
            }
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                analysis_summary: {
                  type: 'object',
                  properties: {
                    analysis_id: { type: 'string' },
                    series_analyzed: { type: 'number' },
                    anomalies_detected: { type: 'number' },
                    forecasts_generated: { type: 'number' },
                    correlations_found: { type: 'number' }
                  }
                }
              }
            },
            timestamp: { type: 'number' }
          }
        }
      }
    }
  }, async (request, reply): Promise<APIResponse> => {
    try {
      const { time_series_data, analysis_type, analysis_options } = request.body;

      if (!timeSeriesEngine) {
        throw new Error('Time series analysis engine not initialized');
      }

      const startTime = Date.now();
      const analysisResult = await timeSeriesEngine.analyzeTimeSeries(time_series_data, analysis_type);
      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          analysis_summary: {
            analysis_id: analysisResult.analysis_id,
            analysis_type: analysisResult.analysis_type,
            series_analyzed: analysisResult.analyzed_series.length,
            anomalies_detected: analysisResult.detected_anomalies.length,
            forecasts_generated: analysisResult.generated_forecasts.length,
            correlations_found: analysisResult.identified_correlations.length,
            processing_time_ms: processingTime
          },
          analysis_results: {
            trend_insights: analysisResult.insights.trend_insights.length,
            anomaly_insights: analysisResult.insights.anomaly_insights.length,
            correlation_insights: analysisResult.insights.correlation_insights.length,
            forecast_insights: analysisResult.insights.forecast_insights.length,
            key_findings: analysisResult.insights.key_findings.slice(0, 5)
          },
          recommendations: {
            immediate_actions_count: analysisResult.recommendations.immediate_actions.length,
            short_term_strategies_count: analysisResult.recommendations.short_term_strategies.length,
            long_term_initiatives_count: analysisResult.recommendations.long_term_initiatives.length,
            monitoring_enhancements_count: analysisResult.recommendations.monitoring_enhancements.length
          },
          data_quality_assessment: {
            overall_quality_score: analysisResult.analysis_metadata.data_quality_assessment.overall_quality_score,
            completeness_score: analysisResult.analysis_metadata.data_quality_assessment.completeness_score,
            accuracy_score: analysisResult.analysis_metadata.data_quality_assessment.accuracy_score
          },
          performance_metrics: {
            algorithm_accuracy: analysisResult.analysis_metadata.algorithm_performance.algorithm_accuracy,
            processing_efficiency: analysisResult.analysis_metadata.algorithm_performance.processing_efficiency,
            confidence_assessment: analysisResult.analysis_metadata.confidence_assessment.overall_confidence
          }
        },
        timestamp: Date.now()
      };

    } catch (error) {
      fastify.log.error('Time series analysis failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: Date.now()
      };
    }
  });

  // Route 2: Create Forecast
  fastify.post<{ Body: CreateForecastRequest }>('/api/security-time-series/forecasts/create', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Create detailed forecast for a specific time series',
      tags: ['Forecasting'],
      body: {
        type: 'object',
        required: ['series_id', 'forecast_configuration'],
        properties: {
          series_id: { type: 'string' },
          forecast_configuration: {
            type: 'object',
            required: ['forecast_horizon_days', 'forecast_type'],
            properties: {
              forecast_horizon_days: { type: 'number', minimum: 1, maximum: 365 },
              forecast_type: {
                type: 'string',
                enum: ['short_term', 'medium_term', 'long_term', 'scenario_based']
              },
              confidence_level: { type: 'number', minimum: 0.5, maximum: 0.99 },
              include_scenarios: { type: 'boolean' },
              algorithms: {
                type: 'array',
                items: { type: 'string' }
              }
            }
          },
          business_context: {
            type: 'object',
            properties: {
              business_objectives: {
                type: 'array',
                items: { type: 'string' }
              },
              risk_tolerance: {
                type: 'string',
                enum: ['low', 'medium', 'high']
              }
            }
          }
        }
      }
    }
  }, async (request, reply): Promise<APIResponse> => {
    try {
      const { series_id, forecast_configuration, business_context } = request.body;

      if (!timeSeriesEngine) {
        throw new Error('Time series analysis engine not initialized');
      }

      const forecast = await timeSeriesEngine.createForecast(series_id, forecast_configuration);

      return {
        success: true,
        data: {
          forecast_summary: {
            forecast_id: forecast.forecast_id,
            forecast_name: forecast.forecast_name,
            forecast_type: forecast.forecast_type,
            series_id: forecast.series_id,
            horizon_days: forecast.forecast_horizon.forecast_periods
          },
          forecast_details: {
            start_date: forecast.forecast_horizon.start_date,
            end_date: forecast.forecast_horizon.end_date,
            prediction_points: forecast.forecast_results.predicted_values.length,
            confidence_level: forecast.forecast_metadata.forecast_confidence,
            primary_algorithm: forecast.methodology.primary_algorithm
          },
          accuracy_metrics: {
            r_squared: forecast.forecast_results.prediction_accuracy_metrics.r_squared,
            mean_absolute_error: forecast.forecast_results.prediction_accuracy_metrics.mean_absolute_error,
            directional_accuracy: forecast.forecast_results.prediction_accuracy_metrics.directional_accuracy
          },
          scenario_analysis: {
            base_case_available: !!forecast.scenario_analysis.base_case_scenario,
            optimistic_scenario_available: !!forecast.scenario_analysis.optimistic_scenario,
            pessimistic_scenario_available: !!forecast.scenario_analysis.pessimistic_scenario,
            stress_test_scenarios_count: forecast.scenario_analysis.stress_test_scenarios.length
          },
          business_insights: {
            key_trends_count: forecast.business_insights.key_trends_identified.length,
            risk_indicators_count: forecast.business_insights.risk_indicators.length,
            opportunity_indicators_count: forecast.business_insights.opportunity_indicators.length,
            monitoring_points_count: forecast.business_insights.monitoring_points.length
          }
        },
        timestamp: Date.now()
      };

    } catch (error) {
      fastify.log.error('Forecast creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: Date.now()
      };
    }
  });

  // Route 3: Detect Anomalies
  fastify.post<{ Body: DetectAnomaliesRequest }>('/api/security-time-series/anomalies/detect', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Detect anomalies in time series data',
      tags: ['Anomaly Detection'],
      body: {
        type: 'object',
        required: ['series_id'],
        properties: {
          series_id: { type: 'string' },
          detection_configuration: {
            type: 'object',
            properties: {
              sensitivity: { type: 'number', minimum: 0.01, maximum: 1.0 },
              detection_algorithms: {
                type: 'array',
                items: { type: 'string' }
              },
              time_window: {
                type: 'object',
                properties: {
                  start: { type: 'number' },
                  end: { type: 'number' }
                }
              },
              anomaly_types: {
                type: 'array',
                items: { type: 'string' }
              }
            }
          },
          alert_preferences: {
            type: 'object',
            properties: {
              severity_threshold: {
                type: 'string',
                enum: ['low', 'medium', 'high', 'critical']
              },
              notification_channels: {
                type: 'array',
                items: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply): Promise<APIResponse> => {
    try {
      const { series_id, detection_configuration, alert_preferences } = request.body;

      if (!timeSeriesEngine) {
        throw new Error('Time series analysis engine not initialized');
      }

      const detectedAnomalies = await timeSeriesEngine.detectAnomalies(series_id, detection_configuration);

      // Filter by severity threshold if specified
      let filteredAnomalies = detectedAnomalies;
      if (alert_preferences?.severity_threshold) {
        const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
        const threshold = severityOrder[alert_preferences.severity_threshold];
        filteredAnomalies = detectedAnomalies.filter(anomaly => 
          severityOrder[anomaly.anomaly_details.severity] >= threshold
        );
      }

      const anomalySummaries = filteredAnomalies.map(anomaly => ({
        anomaly_id: anomaly.anomaly_id,
        anomaly_type: anomaly.anomaly_type,
        detected_at: anomaly.detected_at,
        severity: anomaly.anomaly_details.severity,
        confidence_score: anomaly.anomaly_details.confidence_score,
        time_range: anomaly.time_range,
        affected_metrics_count: anomaly.affected_metrics.length,
        business_impact: anomaly.impact_assessment.business_impact,
        investigation_priority: anomaly.investigation_leads.investigation_priority
      }));

      return {
        success: true,
        data: {
          detection_summary: {
            series_id,
            total_anomalies_detected: detectedAnomalies.length,
            filtered_anomalies_returned: filteredAnomalies.length,
            severity_distribution: {
              critical: filteredAnomalies.filter(a => a.anomaly_details.severity === 'critical').length,
              high: filteredAnomalies.filter(a => a.anomaly_details.severity === 'high').length,
              medium: filteredAnomalies.filter(a => a.anomaly_details.severity === 'medium').length,
              low: filteredAnomalies.filter(a => a.anomaly_details.severity === 'low').length
            },
            type_distribution: {
              point_anomalies: filteredAnomalies.filter(a => a.anomaly_type === 'point').length,
              contextual_anomalies: filteredAnomalies.filter(a => a.anomaly_type === 'contextual').length,
              collective_anomalies: filteredAnomalies.filter(a => a.anomaly_type === 'collective').length,
              seasonal_anomalies: filteredAnomalies.filter(a => a.anomaly_type === 'seasonal').length
            }
          },
          anomaly_results: anomalySummaries,
          investigation_priorities: {
            critical_priority_count: filteredAnomalies.filter(a => a.investigation_leads.investigation_priority === 'critical').length,
            high_priority_count: filteredAnomalies.filter(a => a.investigation_leads.investigation_priority === 'high').length,
            immediate_attention_required: filteredAnomalies.filter(a => 
              a.anomaly_details.severity === 'critical' || 
              a.investigation_leads.investigation_priority === 'critical'
            ).length
          }
        },
        timestamp: Date.now()
      };

    } catch (error) {
      fastify.log.error('Anomaly detection failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: Date.now()
      };
    }
  });

  // Route 4: Analyze Correlations
  fastify.post<{ Body: AnalyzeCorrelationsRequest }>('/api/security-time-series/correlations/analyze', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Analyze correlations between multiple time series',
      tags: ['Correlation Analysis'],
      body: {
        type: 'object',
        required: ['series_ids'],
        properties: {
          series_ids: {
            type: 'array',
            items: { type: 'string' },
            minItems: 2
          },
          correlation_configuration: {
            type: 'object',
            properties: {
              correlation_types: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['linear', 'non_linear', 'lagged', 'causal']
                }
              },
              significance_threshold: { type: 'number', minimum: 0.001, maximum: 0.1 },
              lag_analysis: { type: 'boolean' },
              max_lag_periods: { type: 'number', minimum: 1, maximum: 100 }
            }
          },
          analysis_scope: {
            type: 'object',
            properties: {
              time_range: {
                type: 'object',
                properties: {
                  start: { type: 'number' },
                  end: { type: 'number' }
                }
              },
              focus_areas: {
                type: 'array',
                items: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply): Promise<APIResponse> => {
    try {
      const { series_ids, correlation_configuration, analysis_scope } = request.body;

      if (!timeSeriesEngine) {
        throw new Error('Time series analysis engine not initialized');
      }

      const correlations = await timeSeriesEngine.analyzeCorrelations(series_ids, correlation_configuration);

      const correlationSummaries = correlations.map(correlation => ({
        correlation_id: correlation.correlation_id,
        series_a: correlation.series_a,
        series_b: correlation.series_b,
        correlation_coefficient: correlation.correlation_coefficient,
        correlation_type: correlation.correlation_type,
        correlation_strength: correlation.correlation_analysis.correlation_strength,
        statistical_significance: correlation.correlation_analysis.statistical_significance,
        p_value: correlation.correlation_analysis.p_value,
        business_relevance: correlation.business_context.business_relevance,
        directional_causality: correlation.lag_analysis.directional_causality,
        optimal_lag: correlation.lag_analysis.optimal_lag
      }));

      return {
        success: true,
        data: {
          correlation_summary: {
            series_analyzed: series_ids.length,
            correlations_found: correlations.length,
            significant_correlations: correlations.filter(c => c.correlation_analysis.statistical_significance < 0.05).length,
            strong_correlations: correlations.filter(c => Math.abs(c.correlation_coefficient) > 0.7).length,
            causal_relationships: correlations.filter(c => c.lag_analysis.directional_causality !== 'no_causality').length
          },
          correlation_results: correlationSummaries,
          strength_distribution: {
            very_strong: correlations.filter(c => c.correlation_analysis.correlation_strength === 'very_strong').length,
            strong: correlations.filter(c => c.correlation_analysis.correlation_strength === 'strong').length,
            moderate: correlations.filter(c => c.correlation_analysis.correlation_strength === 'moderate').length,
            weak: correlations.filter(c => c.correlation_analysis.correlation_strength === 'weak').length
          },
          business_insights: {
            high_business_relevance: correlations.filter(c => c.business_context.business_relevance === 'high').length,
            actionable_insights_count: correlations.reduce(
              (sum,
              c
            ) => sum + c.business_context.actionable_insights.length, 0),
            monitoring_recommendations_count: correlations.reduce(
              (sum,
              c
            ) => sum + c.business_context.monitoring_recommendations.length, 0)
          },
          causality_analysis: {
            unidirectional_a_to_b: correlations.filter(c => c.lag_analysis.directional_causality === 'a_causes_b').length,
            unidirectional_b_to_a: correlations.filter(c => c.lag_analysis.directional_causality === 'b_causes_a').length,
            bidirectional: correlations.filter(c => c.lag_analysis.directional_causality === 'bidirectional').length,
            no_causality: correlations.filter(c => c.lag_analysis.directional_causality === 'no_causality').length
          }
        },
        timestamp: Date.now()
      };

    } catch (error) {
      fastify.log.error('Correlation analysis failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: Date.now()
      };
    }
  });

  // Route 5: Generate Analytics Report
  fastify.post<{ Body: GenerateReportRequest }>('/api/security-time-series/reports/generate', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Generate comprehensive time series analytics report',
      tags: ['Reporting'],
      body: {
        type: 'object',
        required: ['report_type', 'report_scope'],
        properties: {
          report_type: {
            type: 'string',
            enum: ['summary', 'detailed', 'executive', 'technical']
          },
          report_scope: {
            type: 'object',
            properties: {
              time_range: {
                type: 'object',
                properties: {
                  start: { type: 'number' },
                  end: { type: 'number' }
                }
              },
              series_ids: {
                type: 'array',
                items: { type: 'string' }
              },
              include_forecasts: { type: 'boolean' },
              include_anomalies: { type: 'boolean' },
              include_correlations: { type: 'boolean' }
            }
          },
          report_options: {
            type: 'object',
            properties: {
              include_visualizations: { type: 'boolean' },
              include_recommendations: { type: 'boolean' },
              export_format: {
                type: 'string',
                enum: ['json', 'pdf', 'csv', 'xlsx']
              },
              detail_level: {
                type: 'string',
                enum: ['high', 'medium', 'low']
              }
            }
          }
        }
      }
    }
  }, async (request, reply): Promise<APIResponse> => {
    try {
      const { report_type, report_scope, report_options, delivery_preferences } = request.body;

      if (!timeSeriesEngine) {
        throw new Error('Time series analysis engine not initialized');
      }

      const report = await timeSeriesEngine.generateAnalyticsReport({
        report_type,
        time_range: report_scope.time_range,
        series_ids: report_scope.series_ids,
        include_forecasts: report_scope.include_forecasts,
        include_anomalies: report_scope.include_anomalies,
        include_correlations: report_scope.include_correlations
      });

      return {
        success: true,
        data: {
          report_summary: {
            report_id: report.report_id,
            report_type: report.report_type,
            generated_at: report.generated_at,
            series_analyzed: report.series_analyzed,
            anomalies_included: report.anomalies_detected || 0,
            forecasts_included: report.forecasts_generated || 0,
            correlations_included: report.correlations_identified || 0
          },
          report_content: {
            executive_summary: report.executive_summary,
            key_insights: report.key_insights?.slice(0, 10) || [],
            recommendations: report.recommendations?.slice(0, 5) || [],
            data_coverage: {
              time_range_analyzed: report_scope.time_range ? {
                start_date: new Date(report_scope.time_range.start).toISOString(),
                end_date: new Date(report_scope.time_range.end).toISOString(),
                duration_days: Math.ceil((report_scope.time_range.end - report_scope.time_range.start) / (24 * 60 * 60 * 1000))
              } : null,
              series_coverage: report_scope.series_ids?.length || 0,
              analysis_completeness: 'high'
            }
          },
          report_metadata: {
            export_format: report_options?.export_format || 'json',
            detail_level: report_options?.detail_level || 'medium',
            includes_visualizations: report_options?.include_visualizations || false,
            includes_recommendations: report_options?.include_recommendations || false,
            delivery_scheduled: !!delivery_preferences?.automated_scheduling
          }
        },
        timestamp: Date.now()
      };

    } catch (error) {
      fastify.log.error('Report generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: Date.now()
      };
    }
  });

  // Route 6: Get Analytics Dashboard Data
  fastify.get('/api/security-time-series/analytics', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Get comprehensive time series analytics and metrics',
      tags: ['Analytics'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                analytics_summary: { type: 'object' },
                series_metrics: { type: 'object' },
                anomaly_metrics: { type: 'object' },
                forecasting_performance: { type: 'object' },
                correlation_insights: { type: 'object' }
              }
            },
            timestamp: { type: 'number' }
          }
        }
      }
    }
  }, async (request, reply): Promise<APIResponse> => {
    try {
      if (!timeSeriesEngine) {
        throw new Error('Time series analysis engine not initialized');
      }

      const analytics = timeSeriesEngine.getTimeSeriesAnalytics();

      return {
        success: true,
        data: {
          analytics_summary: {
            total_series: analytics.summary.total_series_analyzed,
            active_series: analytics.summary.active_series,
            total_anomalies: analytics.summary.total_anomalies_detected,
            active_anomalies: analytics.summary.active_anomalies,
            total_forecasts: analytics.summary.total_forecasts_generated,
            active_forecasts: analytics.summary.active_forecasts,
            average_forecast_accuracy: analytics.summary.average_forecast_accuracy,
            detection_rate: analytics.summary.average_anomaly_detection_rate
          },
          series_metrics: {
            distribution_by_type: analytics.series_distribution.by_type,
            distribution_by_frequency: analytics.series_distribution.by_frequency,
            distribution_by_quality: analytics.series_distribution.by_quality
          },
          anomaly_metrics: {
            detection_performance: analytics.anomaly_metrics.detection_performance,
            severity_distribution: analytics.anomaly_metrics.anomaly_distribution.by_severity,
            type_distribution: analytics.anomaly_metrics.anomaly_distribution.by_type,
            resolution_metrics: analytics.anomaly_metrics.resolution_metrics
          },
          forecasting_performance: {
            accuracy_by_horizon: analytics.forecasting_performance.accuracy_metrics,
            model_performance: analytics.forecasting_performance.model_performance,
            prediction_reliability: analytics.forecasting_performance.prediction_reliability
          },
          correlation_insights: {
            significant_correlations: analytics.correlation_analysis.significant_correlations_count,
            strong_correlations: analytics.correlation_analysis.strong_correlations_count,
            causal_relationships: analytics.correlation_analysis.causal_relationships_identified,
            correlation_stability: analytics.correlation_analysis.correlation_stability
          },
          trend_analysis: {
            trending_up: analytics.trend_analysis.trending_up_series,
            trending_down: analytics.trend_analysis.trending_down_series,
            stable_series: analytics.trend_analysis.stable_series,
            volatile_series: analytics.trend_analysis.volatile_series,
            seasonal_patterns: analytics.trend_analysis.seasonal_patterns_detected,
            cyclical_patterns: analytics.trend_analysis.cyclical_patterns_detected
          },
          performance_metrics: {
            processing_performance: analytics.processing_performance,
            recent_activities: analytics.recent_activities.slice(0, 10)
          }
        },
        timestamp: Date.now()
      };

    } catch (error) {
      fastify.log.error('Analytics retrieval failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: Date.now()
      };
    }
  });
}