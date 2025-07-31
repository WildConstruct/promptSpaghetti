/**
 * Security Pattern Recognition and Threat Clustering API Routes
 * Epic 31 - Task E31-1753313263598-E59652
 * 
 * RESTful API endpoints for security pattern recognition, threat clustering,
 * and behavioral analysis capabilities.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  SecurityPatternRecognitionEngine, 
  SecurityPatternRecognitionConfig, 
  SecurityPattern,
  ThreatCluster,
  PatternRecognitionResult 
} from '../services/SecurityPatternRecognitionEngine';
import { SecurityAPIIntegrationPlatform } from '../services/SecurityAPIIntegrationPlatform';
import { SecurityPolicyAnalysisEngine } from '../services/SecurityPolicyAnalysisEngine';
import { SecurityRiskScoringEngine } from '../services/SecurityRiskScoringEngine';

// Global pattern recognition engine instance
let patternRecognitionEngine: SecurityPatternRecognitionEngine | null = null;

}
}
interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: number;
}

}
}
interface RecognizePatternsRequest {
  data_sources: {
    security_logs?: any[];
    network_traffic?: any[];
    endpoint_telemetry?: any[];
    application_logs?: any[];
    threat_intelligence?: any[];
    user_behavior_data?: any[];
}
}
  };
  analysis_type: 'real_time' | 'batch' | 'historical' | 'targeted';
  analysis_options?: {
    pattern_types?: string[];
    confidence_threshold?: number;
    time_range?: {
      start_date: number;
      end_date: number;
    };
    focus_areas?: string[];
    ml_algorithms?: string[];
  };
  processing_preferences?: {
    real_time_feedback?: boolean;
    intermediate_results?: boolean;
    detailed_analysis?: boolean;
    include_recommendations?: boolean;
  };
}

}
}
interface CreateClusterRequest {
  cluster_name: string;
  cluster_type: 'attack_campaign' | 'threat_actor' | 'malware_family' | 'infrastructure' | 'behavioral' | 'temporal' | 'geographic';
  description: string;
  member_threats: string[];
  clustering_criteria?: {
    similarity_threshold?: number;
    clustering_algorithm?: string;
    validation_required?: boolean;
}
}
  };
  metadata?: {
    geographic_scope?: string[];
    temporal_span?: {
      start_date?: number;
      end_date?: number;
    };
    industry_targets?: string[];
  };
}

}
}
interface UpdateClusterRequest {
  cluster_updates: {
    cluster_name?: string;
    description?: string;
    member_threats_to_add?: string[];
    member_threats_to_remove?: string[];
    metadata_updates?: any;
}
}
  };
  reanalysis_required?: boolean;
  notification_preferences?: {
    notify_stakeholders?: boolean;
    update_dashboards?: boolean;
    trigger_alerts?: boolean;
  };
}

}
}
interface SearchPatternsRequest {
  search_criteria: {
    pattern_types?: string[];
    confidence_threshold?: number;
    severity_levels?: string[];
    date_range?: {
      start: number;
      end: number;
}
}
    };
    keywords?: string[];
    threat_associations?: string[];
    geographic_regions?: string[];
    industry_targets?: string[];
  };
  search_options?: {
    max_results?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    include_deprecated?: boolean;
    include_relationships?: boolean;
  };
}

}
}
interface GenerateReportRequest {
  report_type: 'summary' | 'detailed' | 'technical' | 'executive';
  scope: {
    pattern_ids?: string[];
    cluster_ids?: string[];
    time_range?: {
      start: number;
      end: number;
}
}
    };
    focus_areas?: string[];
  };
  report_options?: {
    include_predictions?: boolean;
    include_recommendations?: boolean;
    include_visualizations?: boolean;
    include_executive_summary?: boolean;
    export_format?: 'json' | 'pdf' | 'csv' | 'xlsx';
  };
  delivery_preferences?: {
    email_recipients?: string[];
    dashboard_publication?: boolean;
    api_webhook?: string;
  };
}

async function initializePatternRecognitionEngine(): Promise<void> {

  if (patternRecognitionEngine) {
    return;
  }

  const config: SecurityPatternRecognitionConfig = {
    pattern_recognition: {
      enabled: true,
      real_time_analysis: true,
      historical_analysis_enabled: true,
      ml_pattern_detection: true,
      statistical_analysis_enabled: true,
      behavioral_analysis_enabled: true,
      temporal_pattern_analysis: true,
      spatial_pattern_analysis: true
  }
    threat_clustering: {
      enabled: true,
      clustering_algorithms: ['dbscan', 'hierarchical', 'kmeans', 'graph_clustering'],
      similarity_thresholds: {
        high_similarity: 0.8,
        medium_similarity: 0.6,
        low_similarity: 0.4
  }
      auto_clustering_enabled: true,
      manual_clustering_allowed: true,
      cluster_validation_enabled: true,
      cross_reference_clustering: true
  }
    pattern_types: {
      attack_patterns: true,
      behavioral_patterns: true,
      communication_patterns: true,
      temporal_patterns: true,
      infrastructure_patterns: true,
      data_access_patterns: true,
      anomaly_patterns: true,
      compliance_patterns: true
  }
    analysis_algorithms: {
      machine_learning_enabled: true,
      deep_learning_models: true,
      statistical_analysis: true,
      graph_analysis: true,
      time_series_analysis: true,
      network_analysis: true,
      natural_language_processing: true,
      computer_vision_analysis: false
  }
    data_sources: {
      security_logs: true,
      network_traffic: true,
      endpoint_telemetry: true,
      application_logs: true,
      threat_intelligence_feeds: true,
      user_behavior_data: true,
      system_performance_metrics: true,
      compliance_audit_data: true
  }
    output_settings: {
      real_time_alerts: true,
      batch_reporting: true,
      dashboard_integration: true,
      api_notifications: true,
      email_alerts: true,
      siem_integration: true,
      incident_response_integration: true,
      threat_hunting_integration: true
    }
  };

  // Get required dependencies (mocked for now)
  const apiIntegration = new SecurityAPIIntegrationPlatform({} as any, {} as any);
  const policyEngine = new SecurityPolicyAnalysisEngine({} as any, {} as any);
  const riskScoringEngine = new SecurityRiskScoringEngine({} as any, {} as any, {} as any);

  patternRecognitionEngine = new SecurityPatternRecognitionEngine(
    config,
    apiIntegration,
    policyEngine,
    riskScoringEngine
  );

  await patternRecognitionEngine.initialize();
}

export default async function patternRecognitionRoutes(fastify: FastifyInstance) {
  // Initialize the pattern recognition engine
  await initializePatternRecognitionEngine();

  // Route 1: Recognize Patterns
  fastify.post<{ Body: RecognizePatternsRequest }>('/api/security-pattern-recognition/analyze', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Perform security pattern recognition analysis on provided data',
      tags: ['Security Pattern Recognition'],
      body: {
        type: 'object',
        required: ['data_sources', 'analysis_type'],
        properties: {
          data_sources: {
            type: 'object',
            properties: {
              security_logs: { type: 'array' },
              network_traffic: { type: 'array' },
              endpoint_telemetry: { type: 'array' },
              application_logs: { type: 'array' },
              threat_intelligence: { type: 'array' },
              user_behavior_data: { type: 'array' }
            }
  }
          analysis_type: {
            type: 'string',
            enum: ['real_time', 'batch', 'historical', 'targeted']
  }
          analysis_options: {
            type: 'object',
            properties: {
              pattern_types: { type: 'array', items: { type: 'string' } },
              confidence_threshold: { type: 'number', minimum: 0, maximum: 1 },
              time_range: {
                type: 'object',
                properties: {
                  start_date: { type: 'number' },
                  end_date: { type: 'number' }
                }
              }
            }
          }
        }
  }
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
                    patterns_discovered: { type: 'number' },
                    clusters_formed: { type: 'number' },
                    processing_time_ms: { type: 'number' }
                  }
  }
                pattern_discovery_results: { type: 'object' },
                clustering_results: { type: 'object' },
                insights_generated: { type: 'object' }
              }
  }
            timestamp: { type: 'number' }
          }
        }
      }
    }
  }, async (request, reply): Promise<APIResponse> => {
    try {
      const { data_sources, analysis_type, analysis_options } = request.body;

      if (!patternRecognitionEngine) {
        throw new Error('Pattern recognition engine not initialized');
      }

      // Combine all data sources
      const combinedData = {
        security_logs: data_sources.security_logs || [],
        network_traffic: data_sources.network_traffic || [],
        endpoint_telemetry: data_sources.endpoint_telemetry || [],
        application_logs: data_sources.application_logs || [],
        threat_intelligence: data_sources.threat_intelligence || [],
        user_behavior_data: data_sources.user_behavior_data || [],
        analysis_options
      };

      const startTime = Date.now();
      const analysisResult = await patternRecognitionEngine.recognizePatterns(combinedData, analysis_type);
      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          analysis_summary: {
            analysis_id: analysisResult.analysis_id,
            patterns_discovered: analysisResult.patterns_discovered.new_patterns.length,
            clusters_formed: analysisResult.clustering_results.new_clusters.length,
            processing_time_ms: processingTime
  }
          pattern_discovery_results: {
            new_patterns: analysisResult.patterns_discovered.new_patterns.length,
            updated_patterns: analysisResult.patterns_discovered.updated_patterns.length,
            confirmed_patterns: analysisResult.patterns_discovered.confirmed_patterns.length,
            pattern_relationships: analysisResult.patterns_discovered.pattern_relationships.length
  }
          clustering_results: {
            new_clusters: analysisResult.clustering_results.new_clusters.length,
            updated_clusters: analysisResult.clustering_results.updated_clusters.length,
            cluster_merges: analysisResult.clustering_results.merged_clusters.length,
            cluster_splits: analysisResult.clustering_results.split_clusters.length
  }
          insights_generated: {
            security_insights: analysisResult.insights_generated.security_insights.length,
            threat_trends: analysisResult.insights_generated.threat_trends.length,
            anomaly_detections: analysisResult.insights_generated.anomaly_detections.length,
            recommendations: analysisResult.insights_generated.recommendations.length
  }
          analysis_metadata: {
            analysis_type: analysisResult.analysis_type,
            analysis_timestamp: analysisResult.analysis_timestamp,
            data_volume_processed: analysisResult.analysis_metrics.data_volume_processed,
            processing_performance: analysisResult.analysis_metrics.processing_performance
          }
  }
        timestamp: Date.now()
      };

    } catch (error) {
      fastify.log.error('Pattern recognition analysis failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: Date.now()
      };
    }
  });

  // Route 2: Create Threat Cluster
  fastify.post<{ Body: CreateClusterRequest }>('/api/security-pattern-recognition/clusters/create', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Create a new threat cluster from specified member threats',
      tags: ['Threat Clustering'],
      body: {
        type: 'object',
        required: ['cluster_name', 'cluster_type', 'description', 'member_threats'],
        properties: {
          cluster_name: { type: 'string', minLength: 1 },
          cluster_type: {
            type: 'string',
            enum: ['attack_campaign', 'threat_actor', 'malware_family', 'infrastructure', 'behavioral', 'temporal', 'geographic']
  }
          description: { type: 'string', minLength: 1 },
          member_threats: {
            type: 'array',
            items: { type: 'string' },
            minItems: 2
  }
          clustering_criteria: {
            type: 'object',
            properties: {
              similarity_threshold: { type: 'number', minimum: 0, maximum: 1 },
              clustering_algorithm: { type: 'string' },
              validation_required: { type: 'boolean' }
            }
          }
        }
  }
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                cluster_summary: {
                  type: 'object',
                  properties: {
                    cluster_id: { type: 'string' },
                    cluster_name: { type: 'string' },
                    cluster_type: { type: 'string' },
                    member_count: { type: 'number' }
                  }
                }
              }
  }
            timestamp: { type: 'number' }
          }
        }
      }
    }
  }, async (request, reply): Promise<APIResponse> => {
    try {
      const { cluster_name, cluster_type, description, member_threats, clustering_criteria, metadata } = request.body;

      if (!patternRecognitionEngine) {
        throw new Error('Pattern recognition engine not initialized');
      }

      const clusterConfig = {
        cluster_name,
        cluster_type,
        description,
        ...metadata
      };

      const createdCluster = await patternRecognitionEngine.createThreatCluster(member_threats, clusterConfig);

      return {
        success: true,
        data: {
          cluster_summary: {
            cluster_id: createdCluster.cluster_id,
            cluster_name: createdCluster.cluster_name,
            cluster_type: createdCluster.cluster_type,
            member_count: createdCluster.cluster_metadata.cluster_size
  }
          cluster_details: {
            description: createdCluster.description,
            created_at: createdCluster.cluster_metadata.created_at,
            geographic_scope: createdCluster.cluster_metadata.geographic_scope,
            industry_targets: createdCluster.cluster_metadata.industry_targets,
            threat_level: createdCluster.impact_assessment.collective_threat_level
  }
          composition_analysis: {
            cluster_cohesion_score: createdCluster.cluster_composition.cluster_cohesion_score,
            shared_characteristics_count: createdCluster.cluster_composition.shared_characteristics.length,
            core_patterns_count: createdCluster.cluster_composition.core_patterns.length
  }
          intelligence_summary: {
            collective_indicators_count: createdCluster.threat_intelligence.collective_indicators.length,
            shared_infrastructure_count: createdCluster.threat_intelligence.shared_infrastructure.length,
            common_ttps_count: createdCluster.threat_intelligence.common_ttps.length,
            attribution_confidence: createdCluster.threat_intelligence.attribution_analysis.attribution_confidence
          }
  }
        timestamp: Date.now()
      };

    } catch (error) {
      fastify.log.error('Threat cluster creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: Date.now()
      };
    }
  });

  // Route 3: Update Threat Cluster
  fastify.put<{ Params: { clusterId: string }; Body: UpdateClusterRequest }>('/api/security-pattern-recognition/clusters/:clusterId', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Update an existing threat cluster',
      tags: ['Threat Clustering'],
      params: {
        type: 'object',
        required: ['clusterId'],
        properties: {
          clusterId: { type: 'string' }
        }
  }
      body: {
        type: 'object',
        required: ['cluster_updates'],
        properties: {
          cluster_updates: {
            type: 'object',
            properties: {
              cluster_name: { type: 'string' },
              description: { type: 'string' },
              member_threats_to_add: {
                type: 'array',
                items: { type: 'string' }
  }
              member_threats_to_remove: {
                type: 'array',
                items: { type: 'string' }
              }
            }
  }
          reanalysis_required: { type: 'boolean' },
          notification_preferences: {
            type: 'object',
            properties: {
              notify_stakeholders: { type: 'boolean' },
              update_dashboards: { type: 'boolean' },
              trigger_alerts: { type: 'boolean' }
            }
          }
        }
      }
    }
  }, async (request, reply): Promise<APIResponse> => {
    try {
      const { clusterId } = request.params;
      const { cluster_updates, reanalysis_required } = request.body;

      if (!patternRecognitionEngine) {
        throw new Error('Pattern recognition engine not initialized');
      }

      const updatedCluster = await patternRecognitionEngine.updateCluster(clusterId, cluster_updates);

      return {
        success: true,
        data: {
          cluster_update_summary: {
            cluster_id: updatedCluster.cluster_id,
            cluster_name: updatedCluster.cluster_name,
            last_updated: updatedCluster.cluster_metadata.last_updated,
            reanalysis_performed: reanalysis_required || false
  }
          updated_properties: Object.keys(cluster_updates),
          cluster_status: {
            member_count: updatedCluster.cluster_metadata.cluster_size,
            cluster_cohesion_score: updatedCluster.cluster_composition.cluster_cohesion_score,
            threat_level: updatedCluster.impact_assessment.collective_threat_level,
            stability_score: updatedCluster.cluster_analysis.stability_assessment.stability_score
          }
  }
        timestamp: Date.now()
      };

    } catch (error) {
      fastify.log.error('Threat cluster update failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: Date.now()
      };
    }
  });

  // Route 4: Search Patterns
  fastify.post<{ Body: SearchPatternsRequest }>('/api/security-pattern-recognition/patterns/search', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Search for security patterns based on specified criteria',
      tags: ['Pattern Search'],
      body: {
        type: 'object',
        required: ['search_criteria'],
        properties: {
          search_criteria: {
            type: 'object',
            properties: {
              pattern_types: {
                type: 'array',
                items: { type: 'string' }
  }
              confidence_threshold: { type: 'number', minimum: 0, maximum: 1 },
              severity_levels: {
                type: 'array',
                items: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] }
  }
              keywords: {
                type: 'array',
                items: { type: 'string' }
              }
            }
  }
          search_options: {
            type: 'object',
            properties: {
              max_results: { type: 'number', minimum: 1, maximum: 1000 },
              sort_by: { type: 'string' },
              sort_order: { type: 'string', enum: ['asc', 'desc'] }
            }
          }
        }
      }
    }
  }, async (request, reply): Promise<APIResponse> => {
    try {
      const { search_criteria, search_options } = request.body;

      if (!patternRecognitionEngine) {
        throw new Error('Pattern recognition engine not initialized');
      }

      const foundPatterns = await patternRecognitionEngine.searchPatterns(search_criteria);

      // Apply search options
      let results = foundPatterns;
      if (search_options?.max_results) {
        results = results.slice(0, search_options.max_results);
      }

      const patternSummaries = results.map(pattern => ({
        pattern_id: pattern.pattern_id,
        pattern_name: pattern.pattern_name,
        pattern_type: pattern.pattern_type,
        confidence_score: pattern.pattern_detection.confidence_score,
        severity_level: pattern.pattern_metadata.severity_assessment.base_severity >= 8 ? 'critical' :
                       pattern.pattern_metadata.severity_assessment.base_severity >= 6 ? 'high' :
                       pattern.pattern_metadata.severity_assessment.base_severity >= 4 ? 'medium' : 'low',
        discovered_at: pattern.pattern_metadata.discovered_at,
        last_seen: pattern.pattern_metadata.last_seen,
        occurrence_frequency: pattern.pattern_metadata.occurrence_frequency,
        threat_associations_count: pattern.threat_associations.associated_threats.length
      }));

      return {
        success: true,
        data: {
          search_summary: {
            total_patterns_found: foundPatterns.length,
            patterns_returned: results.length,
            search_criteria_applied: Object.keys(search_criteria).length,
            processing_time_ms: 150 // Mock processing time
  }
          pattern_results: patternSummaries,
          aggregated_insights: {
            pattern_type_distribution: this.calculatePatternTypeDistribution(results),
            confidence_distribution: this.calculateConfidenceDistribution(results),
            severity_distribution: this.calculateSeverityDistribution(results),
            temporal_distribution: this.calculateTemporalDistribution(results)
          }
  }
        timestamp: Date.now()
      };

    } catch (error) {
      fastify.log.error('Pattern search failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: Date.now()
      };
    }
  });

  // Route 5: Generate Pattern Report
  fastify.post<{ Body: GenerateReportRequest }>('/api/security-pattern-recognition/reports/generate', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Generate comprehensive pattern recognition and clustering report',
      tags: ['Reporting'],
      body: {
        type: 'object',
        required: ['report_type', 'scope'],
        properties: {
          report_type: {
            type: 'string',
            enum: ['summary', 'detailed', 'technical', 'executive']
  }
          scope: {
            type: 'object',
            properties: {
              pattern_ids: {
                type: 'array',
                items: { type: 'string' }
  }
              cluster_ids: {
                type: 'array',
                items: { type: 'string' }
  }
              time_range: {
                type: 'object',
                properties: {
                  start: { type: 'number' },
                  end: { type: 'number' }
                }
              }
            }
  }
          report_options: {
            type: 'object',
            properties: {
              include_predictions: { type: 'boolean' },
              include_recommendations: { type: 'boolean' },
              include_visualizations: { type: 'boolean' },
              export_format: {
                type: 'string',
                enum: ['json', 'pdf', 'csv', 'xlsx']
              }
            }
          }
        }
      }
    }
  }, async (request, reply): Promise<APIResponse> => {
    try {
      const { report_type, scope, report_options } = request.body;

      if (!patternRecognitionEngine) {
        throw new Error('Pattern recognition engine not initialized');
      }

      const report = await patternRecognitionEngine.generatePatternReport({
        report_type,
        pattern_ids: scope.pattern_ids,
        cluster_ids: scope.cluster_ids,
        time_range: scope.time_range,
        include_predictions: report_options?.include_predictions,
        include_recommendations: report_options?.include_recommendations
      });

      return {
        success: true,
        data: {
          report_summary: {
            report_id: report.report_id,
            report_type: report.report_type,
            generated_at: report.generated_at,
            patterns_analyzed: report.patterns_analyzed,
            clusters_analyzed: report.clusters_analyzed
  }
          report_content: {
            executive_summary: report.executive_summary,
            key_findings: report.key_findings,
            recommendations: report.recommendations,
            patterns_summary: {
              total_patterns: report.patterns_analyzed,
              critical_patterns: report.key_findings?.filter((f: any) => f.severity === 'critical').length || 0,
              emerging_patterns: report.key_findings?.filter((f: any) => f.type === 'emerging').length || 0
  }
            clusters_summary: {
              total_clusters: report.clusters_analyzed,
              active_campaigns: report.key_findings?.filter((f: any) => f.type === 'campaign').length || 0,
              threat_actors_identified: report.key_findings?.filter((f: any) => f.type === 'actor').length || 0
            }
  }
          report_metadata: {
            scope_summary: {
              time_range_days: scope.time_range ? 
                Math.ceil((scope.time_range.end - scope.time_range.start) / (24 * 60 * 60 * 1000)) : null,
              specific_patterns_requested: scope.pattern_ids?.length || 0,
              specific_clusters_requested: scope.cluster_ids?.length || 0
  }
            generation_info: {
              export_format: report_options?.export_format || 'json',
              includes_predictions: report_options?.include_predictions || false,
              includes_recommendations: report_options?.include_recommendations || false,
              includes_visualizations: report_options?.include_visualizations || false
            }
          }
  }
        timestamp: Date.now()
      };

    } catch (error) {
      fastify.log.error('Pattern report generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: Date.now()
      };
    }
  });

  // Route 6: Get Analytics Dashboard Data
  fastify.get('/api/security-pattern-recognition/analytics', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Get comprehensive pattern recognition analytics and metrics',
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
                pattern_metrics: { type: 'object' },
                clustering_metrics: { type: 'object' },
                performance_metrics: { type: 'object' }
              }
  }
            timestamp: { type: 'number' }
          }
        }
      }
    }
  }, async (request, reply): Promise<APIResponse> => {
    try {
      if (!patternRecognitionEngine) {
        throw new Error('Pattern recognition engine not initialized');
      }

      const analytics = patternRecognitionEngine.getPatternRecognitionAnalytics();

      return {
        success: true,
        data: {
          analytics_summary: {
            total_patterns: analytics.summary.total_patterns_recognized,
            active_patterns: analytics.summary.active_patterns,
            total_clusters: analytics.summary.total_clusters_formed,
            active_clusters: analytics.summary.active_clusters,
            overall_accuracy: analytics.summary.pattern_recognition_accuracy,
            clustering_effectiveness: analytics.summary.clustering_effectiveness
  }
          pattern_metrics: {
            distribution_by_type: analytics.pattern_distribution.by_type,
            distribution_by_severity: analytics.pattern_distribution.by_severity,
            distribution_by_confidence: analytics.pattern_distribution.by_confidence,
            detection_accuracy: analytics.detection_accuracy
  }
          clustering_metrics: {
            size_distribution: analytics.clustering_metrics.cluster_size_distribution,
            quality_scores: analytics.clustering_metrics.cluster_quality_scores,
            stability_metrics: analytics.clustering_metrics.cluster_stability_metrics,
            algorithm_performance: analytics.clustering_metrics.clustering_algorithm_performance
  }
          performance_metrics: {
            processing_performance: analytics.processing_performance,
            trend_analysis: analytics.trend_analysis,
            integration_status: analytics.integration_status
  }
          real_time_insights: {
            recent_activities: analytics.recent_activities.slice(0, 10),
            emerging_threats: analytics.trend_analysis.emerging_threat_indicators,
            system_health: {
              data_source_health: analytics.integration_status.data_source_health,
              alert_generation: analytics.integration_status.alert_generation_statistics,
              dashboard_status: analytics.integration_status.dashboard_update_frequency
            }
          }
  }
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

  // Helper methods (attached to fastify instance for access within routes)
  (fastify as any).calculatePatternTypeDistribution = function(patterns: SecurityPattern[]) {
    const distribution: Record<string, number> = {};
    patterns.forEach(pattern => {
      distribution[pattern.pattern_type] = (distribution[pattern.pattern_type] || 0) + 1;
    });
    return distribution;
  };

  (fastify as any).calculateConfidenceDistribution = function(patterns: SecurityPattern[]) {
    const distribution = { high: 0, medium: 0, low: 0 };
    patterns.forEach(pattern => {
      const confidence = pattern.pattern_detection.confidence_score;
      if (confidence >= 0.8) distribution.high++;
      else if (confidence >= 0.6) distribution.medium++;
      else distribution.low++;
    });
    return distribution;
  };

  (fastify as any).calculateSeverityDistribution = function(patterns: SecurityPattern[]) {
    const distribution = { critical: 0, high: 0, medium: 0, low: 0 };
    patterns.forEach(pattern => {
      const severity = pattern.pattern_metadata.severity_assessment.base_severity;
      if (severity >= 8) distribution.critical++;
      else if (severity >= 6) distribution.high++;
      else if (severity >= 4) distribution.medium++;
      else distribution.low++;
    });
    return distribution;
  };

  (fastify as any).calculateTemporalDistribution = function(patterns: SecurityPattern[]) {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const distribution = {
      last_24h: 0,
      last_7d: 0,
      last_30d: 0,
      older: 0
    };
    
    patterns.forEach(pattern => {
      const age = now - pattern.pattern_metadata.discovered_at;
      if (age <= day) distribution.last_24h++;
      else if (age <= 7 * day) distribution.last_7d++;
      else if (age <= 30 * day) distribution.last_30d++;
      else distribution.older++;
    });
    
    return distribution;
  };
}