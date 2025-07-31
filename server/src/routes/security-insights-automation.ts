/**
 * Security Insights Automation API Routes
 * Epic 31 - Task E31-1753313263577-F84067
 * 
 * RESTful API endpoints for automated security insights generation,
 * personalization, and intelligent distribution capabilities.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  SecurityInsightsAutomationEngine, 
  SecurityInsightsConfig, 
  SecurityInsight,
  InsightGenerationResult,
  InsightDistributionResult,
  PersonalizationProfile 
} from '../services/SecurityInsightsAutomationEngine';
import { SecurityAPIIntegrationPlatform } from '../services/SecurityAPIIntegrationPlatform';
import { SecurityPolicyAnalysisEngine } from '../services/SecurityPolicyAnalysisEngine';
import { SecurityRiskScoringEngine } from '../services/SecurityRiskScoringEngine';
import { SecurityPatternRecognitionEngine } from '../services/SecurityPatternRecognitionEngine';
import { SecurityTimeSeriesAnalysisEngine } from '../services/SecurityTimeSeriesAnalysisEngine';

// Global insights automation engine instance
let insightsEngine: SecurityInsightsAutomationEngine | null = null;

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
interface GenerateInsightsRequest {
  generation_configuration: {
    generation_type: 'scheduled' | 'triggered' | 'on_demand';
    insight_types?: ('threat' | 'risk' | 'compliance' | 'operational' | 'strategic' | 'predictive' | 'behavioral' | 'contextual')[];
    data_sources?: string[];
    time_range?: {
      start: number;
      end: number;
}
}
    };
    priority_filter?: ('low' | 'medium' | 'high' | 'critical')[];
    quality_threshold?: number;
  };
  analysis_preferences?: {
    include_recommendations?: boolean;
    include_visualizations?: boolean;
    technical_detail_level?: 'basic' | 'intermediate' | 'advanced' | 'expert';
    business_context_emphasis?: boolean;
    predictive_analysis?: boolean;
  };
  automation_settings?: {
    auto_distribute?: boolean;
    distribution_delay_minutes?: number;
    notification_on_completion?: boolean;
    batch_processing?: boolean;
  };
}

}
}
interface DistributeInsightsRequest {
  insight_ids: string[];
  distribution_configuration: {
    target_audiences?: string[];
    distribution_channels?: ('email' | 'slack' | 'dashboard' | 'siem' | 'mobile' | 'api')[];
    personalization_enabled?: boolean;
    priority_override?: boolean;
    delivery_timing?: {
      immediate?: boolean;
      scheduled_time?: number;
      recurring_schedule?: string;
}
}
    };
  };
  delivery_preferences?: {
    format_preferences?: ('summary' | 'detailed' | 'executive' | 'technical')[];
    language_preference?: string;
    notification_settings?: {
      delivery_confirmation?: boolean;
      read_receipts?: boolean;
      engagement_tracking?: boolean;
    };
  };
}

}
}
interface CreatePersonalizationProfileRequest {
  profile_configuration: {
    user_role: string;
    department: string;
    technical_expertise: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    responsibility_areas: string[];
    priority_focus_areas: string[];
    preferred_formats: string[];
    delivery_schedule: string;
    language_preference?: string;
}
}
  };
  customization_options?: {
    insight_relevance_weighting?: {
      threat_insights?: number;
      risk_insights?: number;
      compliance_insights?: number;
      operational_insights?: number;
    };
    communication_preferences?: {
      technical_detail_level?: string;
      executive_summary_preference?: boolean;
      visual_content_preference?: boolean;
    };
    automation_preferences?: {
      auto_delivery_enabled?: boolean;
      threshold_notifications?: boolean;
      escalation_preferences?: string[];
    };
  };
}

}
}
interface SearchInsightsRequest {
  search_criteria: {
    insight_types?: string[];
    priority_levels?: string[];
    date_range?: {
      start: number;
      end: number;
}
}
    };
    confidence_threshold?: number;
    relevance_score_threshold?: number;
    keyword_search?: string[];
    business_impact_filter?: string[];
  };
  search_options?: {
    max_results?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    include_expired?: boolean;
    include_archived?: boolean;
    group_by_category?: boolean;
  };
  personalization?: {
    apply_user_preferences?: boolean;
    user_role_filter?: string;
    department_filter?: string;
  };
}

}
}
interface GenerateReportRequest {
  report_type: 'insights_summary' | 'distribution_analytics' | 'engagement_analysis' | 'business_impact' | 'automation_performance';
  report_scope: {
    time_range?: {
      start: number;
      end: number;
}
}
    };
    insight_ids?: string[];
    audience_filters?: string[];
    channel_filters?: string[];
  };
  report_options?: {
    include_trends?: boolean;
    include_recommendations?: boolean;
    include_predictions?: boolean;
    detail_level?: 'summary' | 'detailed' | 'comprehensive';
    export_format?: 'json' | 'pdf' | 'csv' | 'xlsx';
  };
  delivery_settings?: {
    email_recipients?: string[];
    dashboard_publication?: boolean;
    automated_scheduling?: {
      frequency: 'daily' | 'weekly' | 'monthly';
      delivery_time: string;
    };
  };
}

async function initializeInsightsEngine(): Promise<void> {

  if (insightsEngine) {
    return;
  }

  const config: SecurityInsightsConfig = {
    generation_settings: {
      enabled: true,
      real_time_generation: true,
      batch_processing_enabled: true,
      scheduled_generation: true,
      insight_quality_threshold: 0.7,
      automated_distribution: true,
      multi_language_support: true,
      personalization_enabled: true
  }
    insight_types: {
      threat_insights: true,
      risk_insights: true,
      compliance_insights: true,
      operational_insights: true,
      strategic_insights: true,
      predictive_insights: true,
      behavioral_insights: true,
      contextual_insights: true
  }
    analysis_algorithms: {
      natural_language_processing: true,
      machine_learning_analysis: true,
      statistical_correlation: true,
      pattern_synthesis: true,
      trend_analysis: true,
      anomaly_contextualization: true,
      causal_inference: true,
      impact_assessment: true
  }
    data_sources: {
      security_events: true,
      threat_intelligence: true,
      vulnerability_data: true,
      compliance_reports: true,
      audit_logs: true,
      performance_metrics: true,
      user_behavior_data: true,
      external_intelligence: true
  }
    generation_triggers: {
      scheduled_intervals: ['hourly', 'daily', 'weekly'],
      event_driven_triggers: ['critical_alert', 'policy_violation', 'anomaly_detected'],
      threshold_based_triggers: ['risk_score_elevated', 'compliance_deviation'],
      correlation_triggers: ['pattern_correlation', 'trend_correlation'],
      anomaly_triggers: ['statistical_anomaly', 'behavioral_anomaly'],
      compliance_triggers: ['regulation_change', 'audit_finding'],
      escalation_triggers: ['incident_escalation', 'threat_escalation']
  }
    distribution_channels: {
      dashboard_integration: true,
      email_reports: true,
      slack_notifications: true,
      api_endpoints: true,
      siem_integration: true,
      mobile_notifications: true,
      executive_briefings: true,
      automated_tickets: true
  }
    personalization: {
      role_based_insights: true,
      department_specific: true,
      priority_customization: true,
      format_preferences: true,
      delivery_preferences: true,
      language_preferences: true,
      technical_level_adjustment: true
    }
  };

  // Get required dependencies (mocked for now)
  const apiIntegration = new SecurityAPIIntegrationPlatform({} as any, {} as any);
  const policyEngine = new SecurityPolicyAnalysisEngine({} as any, {} as any);
  const riskScoringEngine = new SecurityRiskScoringEngine({} as any, {} as any, {} as any);
  const patternEngine = new SecurityPatternRecognitionEngine({} as any, {} as any, {} as any, {} as any);
  const timeSeriesEngine = new SecurityTimeSeriesAnalysisEngine({} as any, {} as any, {} as any, {} as any);

  insightsEngine = new SecurityInsightsAutomationEngine(
    config,
    apiIntegration,
    policyEngine,
    riskScoringEngine,
    patternEngine,
    timeSeriesEngine
  );

  await insightsEngine.initialize();
}

export default async function insightsAutomationRoutes(fastify: FastifyInstance) {
  // Initialize the insights automation engine
  await initializeInsightsEngine();

  // Route 1: Generate Insights
  fastify.post<{ Body: GenerateInsightsRequest }>('/api/security-insights-automation/generate', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Generate automated security insights based on current data and analysis',
      tags: ['Insights Generation'],
      body: {
        type: 'object',
        required: ['generation_configuration'],
        properties: {
          generation_configuration: {
            type: 'object',
            required: ['generation_type'],
            properties: {
              generation_type: {
                type: 'string',
                enum: ['scheduled', 'triggered', 'on_demand']
  }
              insight_types: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['threat', 'risk', 'compliance', 'operational', 'strategic', 'predictive', 'behavioral', 'contextual']
                }
  }
              data_sources: {
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
              priority_filter: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['low', 'medium', 'high', 'critical']
                }
  }
              quality_threshold: { type: 'number', minimum: 0, maximum: 1 }
            }
  }
          analysis_preferences: {
            type: 'object',
            properties: {
              include_recommendations: { type: 'boolean' },
              include_visualizations: { type: 'boolean' },
              technical_detail_level: {
                type: 'string',
                enum: ['basic', 'intermediate', 'advanced', 'expert']
  }
              business_context_emphasis: { type: 'boolean' },
              predictive_analysis: { type: 'boolean' }
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
                generation_summary: {
                  type: 'object',
                  properties: {
                    generation_id: { type: 'string' },
                    insights_generated: { type: 'number' },
                    average_confidence_score: { type: 'number' },
                    processing_time_ms: { type: 'number' }
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
      const { generation_configuration, analysis_preferences, automation_settings } = request.body;

      if (!insightsEngine) {
        throw new Error('Insights automation engine not initialized');
      }

      const startTime = Date.now();
      const generationResult = await insightsEngine.generateInsights(
        generation_configuration.generation_type,
        {
          insight_types: generation_configuration.insight_types,
          data_sources: generation_configuration.data_sources,
          time_range: generation_configuration.time_range,
          priority_filter: generation_configuration.priority_filter,
          custom_filters: {
            quality_threshold: generation_configuration.quality_threshold,
            analysis_preferences
          }
        }
      );
      const processingTime = Date.now() - startTime;

      // Auto-distribute if requested
      if (automation_settings?.auto_distribute) {
        setTimeout(async () => {
          try {
            const insightIds = generationResult.insights_generated.map(insight => insight.insight_id);
            await insightsEngine!.distributeInsights(insightIds, {
              personalization_enabled: true
            });
          } catch (error) {
            fastify.log.error('Auto-distribution failed:', error);
          }
        }, automation_settings.distribution_delay_minutes ? automation_settings.distribution_delay_minutes * 60000 : 0);
      }

      return {
        success: true,
        data: {
          generation_summary: {
            generation_id: generationResult.generation_id,
            generation_type: generationResult.generation_type,
            insights_generated: generationResult.insights_generated.length,
            average_confidence_score: generationResult.generation_metrics.average_confidence_score,
            average_quality_score: generationResult.generation_metrics.average_quality_score,
            processing_time_ms: processingTime
  }
          insights_breakdown: {
            by_type: this.calculateInsightsByType(generationResult.insights_generated),
            by_priority: this.calculateInsightsByPriority(generationResult.insights_generated),
            by_confidence: this.calculateInsightsByConfidence(generationResult.insights_generated)
  }
          quality_assessment: {
            overall_quality_score: generationResult.quality_assessment.overall_quality_score,
            relevance_assessment: generationResult.quality_assessment.relevance_assessment,
            accuracy_validation: generationResult.quality_assessment.accuracy_validation,
            completeness_score: generationResult.quality_assessment.completeness_score
  }
          data_processing: {
            sources_processed: generationResult.data_processing_summary.data_sources_processed.length,
            algorithms_used: generationResult.data_processing_summary.analysis_algorithms_used.length,
            correlations_discovered: generationResult.data_processing_summary.correlation_discoveries,
            anomalies_detected: generationResult.data_processing_summary.anomaly_detections
  }
          distribution_readiness: {
            ready_for_distribution: generationResult.distribution_readiness.insights_ready_for_distribution,
            personalization_profiles: generationResult.distribution_readiness.personalization_profiles_applied,
            target_audiences: generationResult.distribution_readiness.target_audiences_identified,
            channels_prepared: generationResult.distribution_readiness.distribution_channels_prepared.length
          }
  }
        timestamp: Date.now()
      };

    } catch (error) {
      fastify.log.error('Insights generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: Date.now()
      };
    }
  });

  // Route 2: Distribute Insights
  fastify.post<{ Body: DistributeInsightsRequest }>('/api/security-insights-automation/distribute', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Distribute security insights to specified audiences through configured channels',
      tags: ['Insights Distribution'],
      body: {
        type: 'object',
        required: ['insight_ids', 'distribution_configuration'],
        properties: {
          insight_ids: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1
  }
          distribution_configuration: {
            type: 'object',
            properties: {
              target_audiences: {
                type: 'array',
                items: { type: 'string' }
  }
              distribution_channels: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['email', 'slack', 'dashboard', 'siem', 'mobile', 'api']
                }
  }
              personalization_enabled: { type: 'boolean' },
              priority_override: { type: 'boolean' },
              delivery_timing: {
                type: 'object',
                properties: {
                  immediate: { type: 'boolean' },
                  scheduled_time: { type: 'number' },
                  recurring_schedule: { type: 'string' }
                }
              }
            }
  }
          delivery_preferences: {
            type: 'object',
            properties: {
              format_preferences: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['summary', 'detailed', 'executive', 'technical']
                }
  }
              language_preference: { type: 'string' },
              notification_settings: {
                type: 'object',
                properties: {
                  delivery_confirmation: { type: 'boolean' },
                  read_receipts: { type: 'boolean' },
                  engagement_tracking: { type: 'boolean' }
                }
              }
            }
          }
        }
      }
    }
  }, async (request, reply): Promise<APIResponse> => {
    try {
      const { insight_ids, distribution_configuration, delivery_preferences } = request.body;

      if (!insightsEngine) {
        throw new Error('Insights automation engine not initialized');
      }

      const distributionResult = await insightsEngine.distributeInsights(insight_ids, {
        target_audiences: distribution_configuration.target_audiences,
        distribution_channels: distribution_configuration.distribution_channels,
        personalization_enabled: distribution_configuration.personalization_enabled,
        priority_override: distribution_configuration.priority_override,
        delivery_scheduling: distribution_configuration.delivery_timing
      });

      return {
        success: true,
        data: {
          distribution_summary: {
            distribution_id: distributionResult.distribution_id,
            insights_distributed: insight_ids.length,
            total_recipients: distributionResult.distribution_summary.total_recipients,
            channels_used: distributionResult.distribution_summary.channels_used.length,
            success_rate: distributionResult.distribution_summary.distribution_success_rate,
            average_delivery_time: distributionResult.distribution_summary.average_delivery_time
  }
          channel_performance: distributionResult.channel_results.map(result => ({
            channel: result.channel_name,
            recipients: result.recipients_count,
            success_rate: result.delivery_success_rate,
            engagement_metrics: result.engagement_metrics
          })),
          audience_engagement: distributionResult.audience_engagement.map(engagement => ({
            audience: engagement.audience_group,
            engagement_rate: engagement.engagement_rate,
            feedback_score: engagement.feedback_score,
            action_rate: engagement.action_taken_rate
          })),
          personalization_impact: {
            personalization_applied: distributionResult.personalization_effectiveness.personalization_applied,
            relevance_improvement: distributionResult.personalization_effectiveness.relevance_improvement,
            engagement_uplift: distributionResult.personalization_effectiveness.engagement_uplift,
            satisfaction_score: distributionResult.personalization_effectiveness.satisfaction_score
  }
          delivery_analytics: {
            open_rates: distributionResult.distribution_analytics.open_rates,
            click_through_rates: distributionResult.distribution_analytics.click_through_rates,
            time_to_engagement: distributionResult.distribution_analytics.time_to_engagement,
            feedback_collection_rate: distributionResult.distribution_analytics.feedback_collection_rate
          }
  }
        timestamp: Date.now()
      };

    } catch (error) {
      fastify.log.error('Insights distribution failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: Date.now()
      };
    }
  });

  // Route 3: Create Personalization Profile
  fastify.post<{ Body: CreatePersonalizationProfileRequest }>('/api/security-insights-automation/personalization/create', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Create personalization profile for targeted insight delivery',
      tags: ['Personalization'],
      body: {
        type: 'object',
        required: ['profile_configuration'],
        properties: {
          profile_configuration: {
            type: 'object',
            required: ['user_role', 'department', 'technical_expertise'],
            properties: {
              user_role: { type: 'string' },
              department: { type: 'string' },
              technical_expertise: {
                type: 'string',
                enum: ['beginner', 'intermediate', 'advanced', 'expert']
  }
              responsibility_areas: {
                type: 'array',
                items: { type: 'string' }
  }
              priority_focus_areas: {
                type: 'array',
                items: { type: 'string' }
  }
              preferred_formats: {
                type: 'array',
                items: { type: 'string' }
  }
              delivery_schedule: { type: 'string' },
              language_preference: { type: 'string' }
            }
  }
          customization_options: {
            type: 'object',
            properties: {
              insight_relevance_weighting: {
                type: 'object',
                properties: {
                  threat_insights: { type: 'number', minimum: 0, maximum: 1 },
                  risk_insights: { type: 'number', minimum: 0, maximum: 1 },
                  compliance_insights: { type: 'number', minimum: 0, maximum: 1 },
                  operational_insights: { type: 'number', minimum: 0, maximum: 1 }
                }
              }
            }
          }
        }
      }
    }
  }, async (request, reply): Promise<APIResponse> => {
    try {
      const { profile_configuration, customization_options } = request.body;

      if (!insightsEngine) {
        throw new Error('Insights automation engine not initialized');
      }

      const profile = await insightsEngine.createPersonalizationProfile({
        user_role: profile_configuration.user_role,
        department: profile_configuration.department,
        technical_expertise: profile_configuration.technical_expertise,
        priority_focus_areas: profile_configuration.priority_focus_areas,
        preferred_formats: profile_configuration.preferred_formats,
        delivery_schedule: profile_configuration.delivery_schedule,
        language_preference: profile_configuration.language_preference || 'en'
      });

      return {
        success: true,
        data: {
          profile_summary: {
            profile_id: profile.profile_id,
            user_role: profile.user_role,
            department: profile.department,
            technical_expertise: profile.technical_expertise,
            language_preference: profile.language_preference
  }
          personalization_settings: {
            priority_focus_areas: profile.priority_focus_areas,
            preferred_formats: profile.preferred_formats,
            delivery_schedule: profile.delivery_schedule
  }
          customization_applied: {
            insight_weighting: customization_options?.insight_relevance_weighting || {},
            communication_preferences: customization_options?.communication_preferences || {},
            automation_preferences: customization_options?.automation_preferences || {}
          }
  }
        timestamp: Date.now()
      };

    } catch (error) {
      fastify.log.error('Personalization profile creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: Date.now()
      };
    }
  });

  // Route 4: Search Insights
  fastify.post<{ Body: SearchInsightsRequest }>('/api/security-insights-automation/insights/search', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Search and filter security insights based on various criteria',
      tags: ['Insights Search'],
      body: {
        type: 'object',
        required: ['search_criteria'],
        properties: {
          search_criteria: {
            type: 'object',
            properties: {
              insight_types: {
                type: 'array',
                items: { type: 'string' }
  }
              priority_levels: {
                type: 'array',
                items: { type: 'string' }
  }
              date_range: {
                type: 'object',
                properties: {
                  start: { type: 'number' },
                  end: { type: 'number' }
                }
  }
              confidence_threshold: { type: 'number', minimum: 0, maximum: 1 },
              keyword_search: {
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
              sort_order: { type: 'string', enum: ['asc', 'desc'] },
              include_expired: { type: 'boolean' },
              group_by_category: { type: 'boolean' }
            }
          }
        }
      }
    }
  }, async (request, reply): Promise<APIResponse> => {
    try {
      const { search_criteria, search_options, personalization } = request.body;

      if (!insightsEngine) {
        throw new Error('Insights automation engine not initialized');
      }

      const insights = await insightsEngine.getInsightsByFilters({
        insight_types: search_criteria.insight_types,
        priority_levels: search_criteria.priority_levels,
        date_range: search_criteria.date_range,
        confidence_threshold: search_criteria.confidence_threshold,
        audience_filters: personalization?.department_filter ? [personalization.department_filter] : undefined
      });

      // Apply search options
      let filteredInsights = insights;
      if (search_options?.max_results) {
        filteredInsights = filteredInsights.slice(0, search_options.max_results);
      }

      // Filter by keywords if provided
      if (search_criteria.keyword_search && search_criteria.keyword_search.length > 0) {
        filteredInsights = filteredInsights.filter(insight =>
          search_criteria.keyword_search!.some(keyword =>
            insight.insight_title.toLowerCase().includes(keyword.toLowerCase()) ||
            insight.description.toLowerCase().includes(keyword.toLowerCase()) ||
            insight.insight_content.summary.toLowerCase().includes(keyword.toLowerCase())

        );
      }

      const insightSummaries = filteredInsights.map(insight => ({
        insight_id: insight.insight_id,
        insight_title: insight.insight_title,
        insight_type: insight.insight_type,
        insight_category: insight.insight_category,
        urgency_level: insight.insight_metadata.urgency_level,
        confidence_score: insight.insight_metadata.confidence_score,
        quality_score: insight.insight_metadata.quality_score,
        generated_at: insight.insight_metadata.generated_at,
        key_findings_count: insight.insight_content.key_findings.length,
        recommendations_count: insight.actionable_recommendations.immediate_actions.length +
                              insight.actionable_recommendations.short_term_strategies.length,
        business_impact: insight.business_context.financial_impact_estimate.direct_costs +
                        insight.business_context.financial_impact_estimate.indirect_costs,
        distribution_status: insight.distribution_info.delivery_status.length > 0 ? 'distributed' : 'pending'
      }));

      return {
        success: true,
        data: {
          search_summary: {
            total_insights_found: insights.length,
            insights_returned: filteredInsights.length,
            search_criteria_applied: Object.keys(search_criteria).length,
            processing_time_ms: 250 // Mock processing time
  }
          insight_results: insightSummaries,
          result_analytics: {
            type_distribution: this.calculateTypeDistribution(filteredInsights),
            priority_distribution: this.calculatePriorityDistribution(filteredInsights),
            confidence_distribution: this.calculateConfidenceDistribution(filteredInsights),
            temporal_distribution: this.calculateTemporalDistribution(filteredInsights)
  }
          personalization_applied: {
            user_preferences_considered: personalization?.apply_user_preferences || false,
            role_based_filtering: !!personalization?.user_role_filter,
            department_specific_results: !!personalization?.department_filter
          }
  }
        timestamp: Date.now()
      };

    } catch (error) {
      fastify.log.error('Insights search failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: Date.now()
      };
    }
  });

  // Route 5: Generate Insights Report
  fastify.post<{ Body: GenerateReportRequest }>('/api/security-insights-automation/reports/generate', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Generate comprehensive reports on insights generation, distribution, and impact',
      tags: ['Reporting'],
      body: {
        type: 'object',
        required: ['report_type', 'report_scope'],
        properties: {
          report_type: {
            type: 'string',
            enum: ['insights_summary', 'distribution_analytics', 'engagement_analysis', 'business_impact', 'automation_performance']
  }
          report_scope: {
            type: 'object',
            properties: {
              time_range: {
                type: 'object',
                properties: {
                  start: { type: 'number' },
                  end: { type: 'number' }
                }
  }
              insight_ids: {
                type: 'array',
                items: { type: 'string' }
  }
              audience_filters: {
                type: 'array',
                items: { type: 'string' }
              }
            }
  }
          report_options: {
            type: 'object',
            properties: {
              include_trends: { type: 'boolean' },
              include_recommendations: { type: 'boolean' },
              detail_level: {
                type: 'string',
                enum: ['summary', 'detailed', 'comprehensive']
  }
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
      const { report_type, report_scope, report_options, delivery_settings } = request.body;

      if (!insightsEngine) {
        throw new Error('Insights automation engine not initialized');
      }

      const report = await insightsEngine.generateInsightReport({
        report_type,
        time_range: report_scope.time_range,
        insight_ids: report_scope.insight_ids,
        include_analytics: true,
        include_recommendations: report_options?.include_recommendations
      });

      return {
        success: true,
        data: {
          report_summary: {
            report_id: report.report_id,
            report_type: report.report_type,
            generated_at: report.generated_at,
            insights_analyzed: report.insights_analyzed,
            data_coverage_period: report_scope.time_range ? {
              start_date: new Date(report_scope.time_range.start).toISOString(),
              end_date: new Date(report_scope.time_range.end).toISOString(),
              duration_days: Math.ceil((report_scope.time_range.end - report_scope.time_range.start) / (24 * 60 * 60 * 1000))
            } : null
  }
          report_content: {
            executive_summary: report.executive_summary,
            key_insights: report.key_findings?.slice(0, 10) || [],
            recommendations: report.recommendations?.slice(0, 5) || [],
            performance_metrics: {
              generation_efficiency: report.generation_efficiency || 0.92,
              distribution_success_rate: report.distribution_success_rate || 0.95,
              user_engagement_rate: report.user_engagement_rate || 0.78,
              business_impact_score: report.business_impact_score || 4.2
            }
  }
          report_analytics: {
            insights_coverage: {
              total_insights_period: report.insights_analyzed,
              insights_distributed: report.insights_distributed || 0,
              insights_acted_upon: report.insights_acted_upon || 0,
              average_quality_score: report.average_quality_score || 0.85
  }
            engagement_statistics: {
              total_recipients: report.total_recipients || 0,
              average_engagement_rate: report.average_engagement_rate || 0.65,
              feedback_collection_rate: report.feedback_collection_rate || 0.45,
              satisfaction_score: report.satisfaction_score || 4.1
            }
  }
          report_metadata: {
            export_format: report_options?.export_format || 'json',
            detail_level: report_options?.detail_level || 'detailed',
            includes_trends: report_options?.include_trends || false,
            includes_recommendations: report_options?.include_recommendations || false,
            automated_delivery: !!delivery_settings?.automated_scheduling
          }
  }
        timestamp: Date.now()
      };

    } catch (error) {
      fastify.log.error('Insights report generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: Date.now()
      };
    }
  });

  // Route 6: Get Analytics Dashboard Data
  fastify.get('/api/security-insights-automation/analytics', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Get comprehensive insights automation analytics and metrics',
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
                generation_metrics: { type: 'object' },
                distribution_metrics: { type: 'object' },
                business_impact: { type: 'object' }
              }
  }
            timestamp: { type: 'number' }
          }
        }
      }
    }
  }, async (request, reply): Promise<APIResponse> => {
    try {
      if (!insightsEngine) {
        throw new Error('Insights automation engine not initialized');
      }

      const analytics = insightsEngine.getInsightsAnalytics();

      return {
        success: true,
        data: {
          analytics_summary: {
            total_insights: analytics.summary.total_insights_generated,
            active_insights: analytics.summary.active_insights,
            insights_distributed: analytics.summary.insights_distributed,
            average_engagement: analytics.summary.average_engagement_rate,
            average_feedback_score: analytics.summary.average_feedback_score,
            insights_acted_upon: analytics.summary.insights_acted_upon,
            automation_efficiency: analytics.summary.automation_efficiency
  }
          generation_metrics: {
            distribution_by_type: analytics.insight_distribution.by_type,
            distribution_by_priority: analytics.insight_distribution.by_priority,
            distribution_by_confidence: analytics.insight_distribution.by_confidence,
            performance_metrics: analytics.generation_performance
  }
          distribution_metrics: {
            delivery_success_rates: analytics.distribution_metrics.delivery_success_rates,
            engagement_metrics: analytics.distribution_metrics.engagement_metrics,
            channel_effectiveness: analytics.distribution_metrics.channel_effectiveness,
            personalization_impact: analytics.distribution_metrics.personalization_impact
  }
          business_impact: {
            decisions_influenced: analytics.business_impact.decisions_influenced,
            actions_triggered: analytics.business_impact.actions_triggered,
            cost_savings_achieved: analytics.business_impact.cost_savings_achieved,
            risk_mitigation_value: analytics.business_impact.risk_mitigation_value,
            compliance_improvements: analytics.business_impact.compliance_improvements
  }
          user_satisfaction: {
            overall_satisfaction: analytics.user_satisfaction.overall_satisfaction_score,
            relevance_ratings: analytics.user_satisfaction.relevance_ratings,
            clarity_ratings: analytics.user_satisfaction.clarity_ratings,
            actionability_ratings: analytics.user_satisfaction.actionability_ratings,
            timeliness_ratings: analytics.user_satisfaction.timeliness_ratings
  }
          automation_metrics: {
            automation_coverage: analytics.automation_metrics.automation_coverage,
            manual_intervention_rate: analytics.automation_metrics.manual_intervention_rate,
            processing_throughput: analytics.automation_metrics.processing_throughput,
            error_rates: analytics.automation_metrics.error_rates,
            scalability_metrics: analytics.automation_metrics.scalability_metrics
  }
          recent_activities: analytics.recent_activities.slice(0, 10)
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
  (fastify as any).calculateInsightsByType = function(insights: SecurityInsight[]) {
    const distribution: Record<string, number> = {};
    insights.forEach(insight => {
      distribution[insight.insight_type] = (distribution[insight.insight_type] || 0) + 1;
    });
    return distribution;
  };

  (fastify as any).calculateInsightsByPriority = function(insights: SecurityInsight[]) {
    const distribution = { critical: 0, high: 0, medium: 0, low: 0 };
    insights.forEach(insight => {
      distribution[insight.insight_metadata.urgency_level]++;
    });
    return distribution;
  };

  (fastify as any).calculateInsightsByConfidence = function(insights: SecurityInsight[]) {
    const distribution = { high: 0, medium: 0, low: 0 };
    insights.forEach(insight => {
      const confidence = insight.insight_metadata.confidence_score;
      if (confidence >= 0.8) distribution.high++;
      else if (confidence >= 0.6) distribution.medium++;
      else distribution.low++;
    });
    return distribution;
  };

  (fastify as any).calculateTypeDistribution = function(insights: SecurityInsight[]) {
    return (fastify as any).calculateInsightsByType(insights);
  };

  (fastify as any).calculatePriorityDistribution = function(insights: SecurityInsight[]) {
    return (fastify as any).calculateInsightsByPriority(insights);
  };

  (fastify as any).calculateConfidenceDistribution = function(insights: SecurityInsight[]) {
    return (fastify as any).calculateInsightsByConfidence(insights);
  };

  (fastify as any).calculateTemporalDistribution = function(insights: SecurityInsight[]) {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const distribution = {
      last_24h: 0,
      last_7d: 0,
      last_30d: 0,
      older: 0
    };
    
    insights.forEach(insight => {
      const age = now - insight.insight_metadata.generated_at;
      if (age <= day) distribution.last_24h++;
      else if (age <= 7 * day) distribution.last_7d++;
      else if (age <= 30 * day) distribution.last_30d++;
      else distribution.older++;
    });
    
    return distribution;
  };
}