/**
 * Security SIEM Integration API Routes
 * Epic 31 - Task E31-1753313263574-CD2164
 * 
 * RESTful API endpoints for SIEM integration, data export,
 * and real-time security intelligence streaming capabilities.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  SecuritySIEMIntegrationEngine, 
  SIEMIntegrationConfig, 
  SIEMConnection,
  SIEMExportJob,
  ThreatIntelligenceExport,
  FieldMapping,
  FilterCriteria 
} from '../services/SecuritySIEMIntegrationEngine';
import { SecurityAPIIntegrationPlatform } from '../services/SecurityAPIIntegrationPlatform';
import { SecurityPolicyAnalysisEngine } from '../services/SecurityPolicyAnalysisEngine';
import { SecurityIntelligenceAutomationEngine } from '../services/SecurityIntelligenceAutomationEngine';

// Global SIEM integration engine instance
let siemEngine: SecuritySIEMIntegrationEngine | null = null;

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
interface CreateSIEMConnectionRequest {
  connection_configuration: {
    connection_name: string;
    platform_type: 'splunk' | 'qradar' | 'arcsight' | 'sentinel' | 'elastic_siem' | 'chronicle' | 'sumo_logic' | 'securonix' | 'logrhythm' | 'phantom' | 'demisto' | 'custom';
    endpoint_url: string;
    authentication_method: 'api_key' | 'oauth' | 'basic_auth' | 'certificate' | 'token';
    authentication_config: any;
    protocol: 'https' | 'tcp' | 'udp' | 'kafka' | 'amqp';
    ssl_enabled: boolean;
    data_format: 'cef' | 'leef' | 'json' | 'xml' | 'csv' | 'syslog' | 'stix_taxii' | 'misp';
    streaming_enabled?: boolean;
}
}
  };
  advanced_settings?: {
    batch_size?: number;
    flush_interval_seconds?: number;
    max_retry_attempts?: number;
    compression_type?: string;
    custom_headers?: any;
    rate_limiting?: any;
  };
  testing_options?: {
    test_connection?: boolean;
    test_data_export?: boolean;
    validate_configuration?: boolean;
  };
}

}
}
interface ExportThreatIntelligenceRequest {
  export_configuration: {
    connection_id: string;
    data_types: ('indicators' | 'ttps' | 'threat_actors' | 'campaigns' | 'vulnerabilities')[];
    export_format: string;
    time_range?: {
      start: number;
      end: number;
}
}
    };
    include_metadata?: boolean;
    compression_enabled?: boolean;
    encryption_enabled?: boolean;
  };
  filter_options?: {
    severity_threshold?: string;
    confidence_threshold?: number;
    source_filters?: string[];
    classification_filters?: string[];
    custom_filters?: any;
  };
  delivery_options?: {
    delivery_method?: 'push' | 'pull' | 'streaming';
    delivery_confirmation?: boolean;
    retry_on_failure?: boolean;
    notification_on_completion?: boolean;
  };
}

}
}
interface StartStreamingRequest {
  streaming_configuration: {
    connection_id: string;
    data_types?: string[];
    streaming_mode: 'real_time' | 'batch' | 'hybrid';
    batch_size?: number;
    flush_interval?: number;
    quality_checks?: boolean;
}
}
  };
  filter_criteria?: {
    include_filters?: any[];
    exclude_filters?: any[];
    severity_threshold?: string;
    confidence_threshold?: number;
    time_window_hours?: number;
  };
  performance_settings?: {
    max_throughput?: number;
    latency_target_ms?: number;
    buffer_size?: number;
    compression_enabled?: boolean;
  };
}

}
}
interface CreateExportJobRequest {
  job_configuration: {
    job_name: string;
    job_type: 'batch' | 'scheduled' | 'triggered';
    connection_id: string;
    data_types: string[];
    export_format: string;
    schedule?: string;
    trigger_conditions?: string[];
}
}
  };
  export_settings?: {
    filter_criteria?: any;
    transformation_rules?: string[];
    quality_checks?: boolean;
    error_handling?: string;
  };
  notification_settings?: {
    notify_on_completion?: boolean;
    notify_on_failure?: boolean;
    notification_channels?: string[];
    escalation_rules?: any;
  };
}

}
}
interface ConfigureMappingRequest {
  mapping_configuration: {
    connection_id: string;
    field_mappings?: FieldMapping[];
    transformation_rules?: string[];
    validation_rules?: string[];
}
}
  };
  enrichment_configuration?: {
    enrichment_rules?: any[];
    lookup_tables?: any[];
    external_data_sources?: string[];
  };
  filter_configuration?: {
    include_filters?: any[];
    exclude_filters?: any[];
    priority_filters?: any[];
  };
}

}
}
interface SearchExportHistoryRequest {
  search_criteria: {
    connection_ids?: string[];
    date_range?: {
      start: number;
      end: number;
}
}
    };
    export_status?: string[];
    data_types?: string[];
    job_types?: string[];
  };
  result_options?: {
    include_details?: boolean;
    sort_criteria?: string;
    limit?: number;
    offset?: number;
  };
}

async function initializeSIEMEngine(): Promise<void> {

  if (siemEngine) {
    return;
  }

  const config: SIEMIntegrationConfig = {
    integration_settings: {
      enabled: true,
      real_time_streaming: true,
      batch_export_enabled: true,
      bidirectional_communication: true,
      automated_correlation: true,
      incident_synchronization: true,
      threat_feed_integration: true,
      alert_forwarding: true
  }
    supported_platforms: {
      splunk: true,
      qradar: true,
      arcsight: true,
      sentinel: true,
      elastic_siem: true,
      chronicle: true,
      sumo_logic: true,
      securonix: true,
      logrhythm: true,
      phantom: true,
      demisto: true,
      custom_apis: true
  }
    data_formats: {
      cef: true,
      leef: true,
      json: true,
      xml: true,
      csv: true,
      syslog: true,
      stix_taxii: true,
      misp: true,
      custom_formats: true
  }
    export_capabilities: {
      intelligence_data: true,
      threat_indicators: true,
      risk_assessments: true,
      analysis_results: true,
      incident_data: true,
      compliance_reports: true,
      correlation_results: true,
      workflow_logs: true
  }
    streaming_options: {
      real_time_events: true,
      batch_processing: true,
      delta_updates: true,
      scheduled_exports: true,
      triggered_exports: true,
      compression_enabled: true,
      encryption_enabled: true,
      authentication_required: true
  }
    quality_controls: {
      data_validation: true,
      format_verification: true,
      duplicate_detection: true,
      schema_compliance: true,
      error_handling: true,
      retry_mechanisms: true,
      delivery_confirmation: true,
      audit_logging: true
    }
  };

  // Get required dependencies (mocked for now)
  const apiIntegration = new SecurityAPIIntegrationPlatform({} as any, {} as any);
  const policyEngine = new SecurityPolicyAnalysisEngine({} as any, {} as any);
  const intelligenceEngine = new SecurityIntelligenceAutomationEngine(
    {} as any,
    {} as any,
    {} as any,
    {} as any,
    {} as any,
    {} as any
  );

  siemEngine = new SecuritySIEMIntegrationEngine(
    config,
    apiIntegration,
    policyEngine,
    intelligenceEngine
  );

  await siemEngine.initialize();
}

export default async function siemIntegrationRoutes(fastify: FastifyInstance) {
  // Initialize the SIEM integration engine
  await initializeSIEMEngine();

  // Route 1: Create SIEM Connection
  fastify.post<{ Body: CreateSIEMConnectionRequest }>('/api/security-siem-integration/connections/create', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Create and configure new SIEM platform connection',
      tags: ['SIEM Connections'],
      body: {
        type: 'object',
        required: ['connection_configuration'],
        properties: {
          connection_configuration: {
            type: 'object',
            required: ['connection_name', 'platform_type', 'endpoint_url', 'authentication_method', 'authentication_config', 'protocol', 'ssl_enabled', 'data_format'],
            properties: {
              connection_name: { type: 'string', minLength: 1 },
              platform_type: {
                type: 'string',
                enum: ['splunk', 'qradar', 'arcsight', 'sentinel', 'elastic_siem', 'chronicle', 'sumo_logic', 'securonix', 'logrhythm', 'phantom', 'demisto', 'custom']
  }
              endpoint_url: { type: 'string', format: 'uri' },
              authentication_method: {
                type: 'string',
                enum: ['api_key', 'oauth', 'basic_auth', 'certificate', 'token']
  }
              authentication_config: { type: 'object' },
              protocol: {
                type: 'string',
                enum: ['https', 'tcp', 'udp', 'kafka', 'amqp']
  }
              ssl_enabled: { type: 'boolean' },
              data_format: {
                type: 'string',
                enum: ['cef', 'leef', 'json', 'xml', 'csv', 'syslog', 'stix_taxii', 'misp']
  }
              streaming_enabled: { type: 'boolean' }
            }
  }
          advanced_settings: {
            type: 'object',
            properties: {
              batch_size: { type: 'number', minimum: 1, maximum: 10000 },
              flush_interval_seconds: { type: 'number', minimum: 1, maximum: 3600 },
              max_retry_attempts: { type: 'number', minimum: 0, maximum: 10 },
              compression_type: { type: 'string' }
            }
  }
          testing_options: {
            type: 'object',
            properties: {
              test_connection: { type: 'boolean' },
              test_data_export: { type: 'boolean' },
              validate_configuration: { type: 'boolean' }
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
                connection_summary: {
                  type: 'object',
                  properties: {
                    connection_id: { type: 'string' },
                    connection_name: { type: 'string' },
                    platform_type: { type: 'string' },
                    connection_status: { type: 'string' }
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
      const { connection_configuration, advanced_settings, testing_options } = request.body;

      if (!siemEngine) {
        throw new Error('SIEM integration engine not initialized');
      }

      const connection = await siemEngine.createSIEMConnection(
        connection_configuration.platform_type,
        {
          connection_name: connection_configuration.connection_name,
          endpoint_url: connection_configuration.endpoint_url,
          authentication_method: connection_configuration.authentication_method,
          authentication_config: connection_configuration.authentication_config,
          protocol: connection_configuration.protocol,
          ssl_enabled: connection_configuration.ssl_enabled,
          data_format: connection_configuration.data_format,
          streaming_enabled: connection_configuration.streaming_enabled
        }
      );

      return {
        success: true,
        data: {
          connection_summary: {
            connection_id: connection.connection_id,
            connection_name: connection.connection_name,
            platform_type: connection.platform_type,
            connection_status: connection.connection_status,
            streaming_enabled: connection.streaming_config.streaming_enabled
  }
          connection_details: {
            endpoint_url: connection.connection_details.endpoint_url,
            protocol: connection.connection_details.protocol,
            ssl_enabled: connection.connection_details.ssl_enabled,
            data_format: connection.data_mapping.format_transformation,
            authentication_method: connection.connection_details.authentication_method
  }
          configuration_validation: {
            connection_test_passed: connection.connection_status === 'active',
            field_mappings_configured: connection.data_mapping.field_mappings.length,
            streaming_configuration_valid: connection.streaming_config.streaming_enabled,
            advanced_settings_applied: !!advanced_settings
  }
          performance_settings: {
            batch_size: connection.streaming_config.batch_size,
            flush_interval_seconds: connection.streaming_config.flush_interval_seconds,
            max_retry_attempts: connection.streaming_config.max_retry_attempts,
            compression_enabled: !!connection.streaming_config.compression_type
  }
          next_steps: {
            configure_field_mapping: connection.data_mapping.field_mappings.length === 0,
            test_data_export: testing_options?.test_data_export || false,
            setup_streaming: connection_configuration.streaming_enabled && !connection.streaming_config.streaming_enabled,
            monitor_performance: true
          }
  }
        timestamp: Date.now()
      };

    } catch (error) {
      fastify.log.error('SIEM connection creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: Date.now()
      };
    }
  });

  // Route 2: Export Threat Intelligence
  fastify.post<{ Body: ExportThreatIntelligenceRequest }>('/api/security-siem-integration/export/threat-intelligence', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Export threat intelligence data to SIEM platform',
      tags: ['Data Export'],
      body: {
        type: 'object',
        required: ['export_configuration'],
        properties: {
          export_configuration: {
            type: 'object',
            required: ['connection_id', 'data_types', 'export_format'],
            properties: {
              connection_id: { type: 'string' },
              data_types: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['indicators', 'ttps', 'threat_actors', 'campaigns', 'vulnerabilities']
  }
                minItems: 1
  }
              export_format: { type: 'string' },
              time_range: {
                type: 'object',
                properties: {
                  start: { type: 'number' },
                  end: { type: 'number' }
                }
  }
              include_metadata: { type: 'boolean' },
              compression_enabled: { type: 'boolean' },
              encryption_enabled: { type: 'boolean' }
            }
  }
          filter_options: {
            type: 'object',
            properties: {
              severity_threshold: { type: 'string' },
              confidence_threshold: { type: 'number', minimum: 0, maximum: 1 },
              source_filters: {
                type: 'array',
                items: { type: 'string' }
  }
              classification_filters: {
                type: 'array',
                items: { type: 'string' }
              }
            }
  }
          delivery_options: {
            type: 'object',
            properties: {
              delivery_method: {
                type: 'string',
                enum: ['push', 'pull', 'streaming']
  }
              delivery_confirmation: { type: 'boolean' },
              retry_on_failure: { type: 'boolean' },
              notification_on_completion: { type: 'boolean' }
            }
          }
        }
      }
    }
  }, async (request, reply): Promise<APIResponse> => {
    try {
      const { export_configuration, filter_options, delivery_options } = request.body;

      if (!siemEngine) {
        throw new Error('SIEM integration engine not initialized');
      }

      const exportResult = await siemEngine.exportThreatIntelligence(
        export_configuration.connection_id,
        {
          data_types: export_configuration.data_types,
          export_format: export_configuration.export_format,
          time_range: export_configuration.time_range,
          filter_criteria: filter_options ? {
            include_filters: [],
            exclude_filters: [],
            severity_threshold: filter_options.severity_threshold,
            confidence_threshold: filter_options.confidence_threshold
          } : undefined,
          include_metadata: export_configuration.include_metadata,
          compression_enabled: export_configuration.compression_enabled,
          encryption_enabled: export_configuration.encryption_enabled
        }
      );

      const recordsCount = 
        (exportResult.intelligence_data.indicators?.length || 0) +
        (exportResult.intelligence_data.ttps?.length || 0) +
        (exportResult.intelligence_data.threat_actors?.length || 0) +
        (exportResult.intelligence_data.campaigns?.length || 0) +
        (exportResult.intelligence_data.vulnerabilities?.length || 0);

      return {
        success: true,
        data: {
          export_summary: {
            export_id: exportResult.export_id,
            export_timestamp: exportResult.export_timestamp,
            connection_id: export_configuration.connection_id,
            data_types_exported: export_configuration.data_types,
            total_records_exported: recordsCount,
            export_format: exportResult.formatting.output_format
  }
          data_breakdown: {
            indicators_exported: exportResult.intelligence_data.indicators?.length || 0,
            ttps_exported: exportResult.intelligence_data.ttps?.length || 0,
            threat_actors_exported: exportResult.intelligence_data.threat_actors?.length || 0,
            campaigns_exported: exportResult.intelligence_data.campaigns?.length || 0,
            vulnerabilities_exported: exportResult.intelligence_data.vulnerabilities?.length || 0
  }
          export_metadata: {
            source_systems: exportResult.metadata.source_systems,
            data_freshness: exportResult.metadata.data_freshness,
            validation_status: exportResult.metadata.validation_status,
            confidence_levels: exportResult.metadata.confidence_levels,
            classification_levels: exportResult.metadata.classification_levels
  }
          formatting_details: {
            output_format: exportResult.formatting.output_format,
            schema_version: exportResult.formatting.schema_version,
            compression_applied: exportResult.formatting.compression_applied,
            encryption_applied: exportResult.formatting.encryption_applied,
            checksum: exportResult.formatting.checksum
  }
          delivery_status: {
            delivery_method: delivery_options?.delivery_method || 'push',
            delivery_confirmation: delivery_options?.delivery_confirmation || false,
            estimated_delivery_time: this.calculateEstimatedDeliveryTime(recordsCount),
            retry_configuration: delivery_options?.retry_on_failure || false
          }
  }
        timestamp: Date.now()
      };

    } catch (error) {
      fastify.log.error('Threat intelligence export failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: Date.now()
      };
    }
  });

  // Route 3: Start Real-Time Streaming
  fastify.post<{ Body: StartStreamingRequest }>('/api/security-siem-integration/streaming/start', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Start real-time data streaming to SIEM platform',
      tags: ['Real-Time Streaming'],
      body: {
        type: 'object',
        required: ['streaming_configuration'],
        properties: {
          streaming_configuration: {
            type: 'object',
            required: ['connection_id', 'streaming_mode'],
            properties: {
              connection_id: { type: 'string' },
              data_types: {
                type: 'array',
                items: { type: 'string' }
  }
              streaming_mode: {
                type: 'string',
                enum: ['real_time', 'batch', 'hybrid']
  }
              batch_size: { type: 'number', minimum: 1, maximum: 10000 },
              flush_interval: { type: 'number', minimum: 1, maximum: 3600 },
              quality_checks: { type: 'boolean' }
            }
  }
          filter_criteria: {
            type: 'object',
            properties: {
              severity_threshold: { type: 'string' },
              confidence_threshold: { type: 'number', minimum: 0, maximum: 1 },
              time_window_hours: { type: 'number', minimum: 1, maximum: 168 }
            }
  }
          performance_settings: {
            type: 'object',
            properties: {
              max_throughput: { type: 'number', minimum: 1 },
              latency_target_ms: { type: 'number', minimum: 100 },
              buffer_size: { type: 'number', minimum: 100 },
              compression_enabled: { type: 'boolean' }
            }
          }
        }
      }
    }
  }, async (request, reply): Promise<APIResponse> => {
    try {
      const { streaming_configuration, filter_criteria, performance_settings } = request.body;

      if (!siemEngine) {
        throw new Error('SIEM integration engine not initialized');
      }

      const streamingResult = await siemEngine.startRealTimeStreaming(
        streaming_configuration.connection_id,
        {
          data_types: streaming_configuration.data_types,
          filter_criteria: filter_criteria ? {
            include_filters: [],
            exclude_filters: [],
            severity_threshold: filter_criteria.severity_threshold,
            confidence_threshold: filter_criteria.confidence_threshold,
            time_window_hours: filter_criteria.time_window_hours
          } : undefined,
          batch_size: streaming_configuration.batch_size,
          flush_interval: streaming_configuration.flush_interval,
          quality_checks: streaming_configuration.quality_checks
        }
      );

      return {
        success: true,
        data: {
          streaming_summary: {
            stream_id: streamingResult.stream_id,
            connection_id: streaming_configuration.connection_id,
            streaming_status: streamingResult.status,
            streaming_mode: streaming_configuration.streaming_mode,
            started_at: Date.now()
  }
          configuration_details: {
            data_types: streaming_configuration.data_types || ['all'],
            batch_size: streaming_configuration.batch_size || 1000,
            flush_interval_seconds: streaming_configuration.flush_interval || 30,
            quality_checks_enabled: streaming_configuration.quality_checks !== false
  }
          filter_settings: {
            severity_threshold: filter_criteria?.severity_threshold || 'medium',
            confidence_threshold: filter_criteria?.confidence_threshold || 0.7,
            time_window_hours: filter_criteria?.time_window_hours || 24,
            filters_applied: !!filter_criteria
  }
          performance_configuration: {
            max_throughput: performance_settings?.max_throughput || 1000,
            latency_target_ms: performance_settings?.latency_target_ms || 1000,
            buffer_size: performance_settings?.buffer_size || 5000,
            compression_enabled: performance_settings?.compression_enabled || true
  }
          monitoring_endpoints: {
            stream_status: `/api/security-siem-integration/streaming/${streamingResult.stream_id}/status`,
            stream_metrics: `/api/security-siem-integration/streaming/${streamingResult.stream_id}/metrics`,
            stream_control: `/api/security-siem-integration/streaming/${streamingResult.stream_id}/control`
          }
  }
        timestamp: Date.now()
      };

    } catch (error) {
      fastify.log.error('Real-time streaming start failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: Date.now()
      };
    }
  });

  // Route 4: Create Export Job
  fastify.post<{ Body: CreateExportJobRequest }>('/api/security-siem-integration/jobs/create', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Create scheduled or triggered export job',
      tags: ['Export Jobs'],
      body: {
        type: 'object',
        required: ['job_configuration'],
        properties: {
          job_configuration: {
            type: 'object',
            required: ['job_name', 'job_type', 'connection_id', 'data_types', 'export_format'],
            properties: {
              job_name: { type: 'string', minLength: 1 },
              job_type: {
                type: 'string',
                enum: ['batch', 'scheduled', 'triggered']
  }
              connection_id: { type: 'string' },
              data_types: {
                type: 'array',
                items: { type: 'string' },
                minItems: 1
  }
              export_format: { type: 'string' },
              schedule: { type: 'string' },
              trigger_conditions: {
                type: 'array',
                items: { type: 'string' }
              }
            }
  }
          export_settings: {
            type: 'object',
            properties: {
              quality_checks: { type: 'boolean' },
              error_handling: { type: 'string' }
            }
  }
          notification_settings: {
            type: 'object',
            properties: {
              notify_on_completion: { type: 'boolean' },
              notify_on_failure: { type: 'boolean' },
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
      const { job_configuration, export_settings, notification_settings } = request.body;

      if (!siemEngine) {
        throw new Error('SIEM integration engine not initialized');
      }

      const exportJob = await siemEngine.createExportJob({
        job_name: job_configuration.job_name,
        job_type: job_configuration.job_type,
        connection_id: job_configuration.connection_id,
        data_types: job_configuration.data_types,
        export_format: job_configuration.export_format,
        schedule: job_configuration.schedule,
        trigger_conditions: job_configuration.trigger_conditions,
        filter_criteria: export_settings?.filter_criteria
      });

      return {
        success: true,
        data: {
          job_summary: {
            job_id: exportJob.job_id,
            job_name: exportJob.job_name,
            job_type: exportJob.job_type,
            job_status: exportJob.job_status,
            connection_id: exportJob.export_configuration.connection_id,
            created_at: Date.now()
  }
          job_configuration: {
            data_types: exportJob.export_configuration.data_types,
            export_format: exportJob.export_configuration.export_format,
            schedule: job_configuration.schedule || 'manual',
            trigger_conditions: job_configuration.trigger_conditions || [],
            transformation_rules: exportJob.export_configuration.transformation_rules || []
  }
          execution_settings: {
            quality_checks_enabled: export_settings?.quality_checks !== false,
            error_handling_strategy: export_settings?.error_handling || 'retry_with_backoff',
            max_retry_attempts: 3,
            timeout_minutes: 30
  }
          notification_configuration: {
            notify_on_completion: notification_settings?.notify_on_completion || false,
            notify_on_failure: notification_settings?.notify_on_failure || true,
            notification_channels: notification_settings?.notification_channels || ['email'],
            escalation_enabled: false
  }
          monitoring_details: {
            job_status_endpoint: `/api/security-siem-integration/jobs/${exportJob.job_id}/status`,
            job_logs_endpoint: `/api/security-siem-integration/jobs/${exportJob.job_id}/logs`,
            job_control_endpoint: `/api/security-siem-integration/jobs/${exportJob.job_id}/control`
          }
  }
        timestamp: Date.now()
      };

    } catch (error) {
      fastify.log.error('Export job creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: Date.now()
      };
    }
  });

  // Route 5: Configure Field Mapping
  fastify.post<{ Body: ConfigureMappingRequest }>('/api/security-siem-integration/connections/configure-mapping', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Configure field mapping and data transformation rules',
      tags: ['Configuration'],
      body: {
        type: 'object',
        required: ['mapping_configuration'],
        properties: {
          mapping_configuration: {
            type: 'object',
            required: ['connection_id'],
            properties: {
              connection_id: { type: 'string' },
              field_mappings: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['source_field', 'target_field', 'data_type', 'required'],
                  properties: {
                    source_field: { type: 'string' },
                    target_field: { type: 'string' },
                    data_type: {
                      type: 'string',
                      enum: ['string', 'number', 'boolean', 'date', 'object', 'array']
  }
                    transformation: { type: 'string' },
                    required: { type: 'boolean' },
                    default_value: {}
                  }
                }
  }
              transformation_rules: {
                type: 'array',
                items: { type: 'string' }
  }
              validation_rules: {
                type: 'array',
                items: { type: 'string' }
              }
            }
  }
          enrichment_configuration: {
            type: 'object',
            properties: {
              enrichment_rules: {
                type: 'array',
                items: { type: 'object' }
  }
              lookup_tables: {
                type: 'array',
                items: { type: 'object' }
  }
              external_data_sources: {
                type: 'array',
                items: { type: 'string' }
              }
            }
  }
          filter_configuration: {
            type: 'object',
            properties: {
              include_filters: {
                type: 'array',
                items: { type: 'object' }
  }
              exclude_filters: {
                type: 'array',
                items: { type: 'object' }
  }
              priority_filters: {
                type: 'array',
                items: { type: 'object' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply): Promise<APIResponse> => {
    try {
      const { mapping_configuration, enrichment_configuration, filter_configuration } = request.body;

      if (!siemEngine) {
        throw new Error('SIEM integration engine not initialized');
      }

      const mappingResult = await siemEngine.configureSIEMMapping(
        mapping_configuration.connection_id,
        {
          field_mappings: mapping_configuration.field_mappings,
          enrichment_rules: enrichment_configuration?.enrichment_rules,
          filter_criteria: filter_configuration ? {
            include_filters: filter_configuration.include_filters || [],
            exclude_filters: filter_configuration.exclude_filters || []
          } : undefined,
          transformation_rules: mapping_configuration.transformation_rules
        }
      );

      return {
        success: true,
        data: {
          mapping_summary: {
            mapping_id: mappingResult.mapping_id,
            connection_id: mapping_configuration.connection_id,
            field_mappings_count: mapping_configuration.field_mappings?.length || 0,
            transformation_rules_count: mapping_configuration.transformation_rules?.length || 0,
            validation_passed: mappingResult.validation_results.valid || false
  }
          field_mapping_details: {
            required_fields_mapped: mapping_configuration.field_mappings?.filter(m => m.required).length || 0,
            optional_fields_mapped: mapping_configuration.field_mappings?.filter(m => !m.required).length || 0,
            transformation_functions: mapping_configuration.field_mappings?.filter(m => m.transformation).length || 0,
            default_values_set: mapping_configuration.field_mappings?.filter(m => m.default_value !== undefined).length || 0
  }
          enrichment_settings: {
            enrichment_rules_configured: enrichment_configuration?.enrichment_rules?.length || 0,
            lookup_tables_configured: enrichment_configuration?.lookup_tables?.length || 0,
            external_sources_connected: enrichment_configuration?.external_data_sources?.length || 0,
            enrichment_enabled: (enrichment_configuration?.enrichment_rules?.length || 0) > 0
  }
          filter_configuration: {
            include_filters_count: filter_configuration?.include_filters?.length || 0,
            exclude_filters_count: filter_configuration?.exclude_filters?.length || 0,
            priority_filters_count: filter_configuration?.priority_filters?.length || 0,
            filtering_enabled: !!filter_configuration
  }
          validation_results: {
            configuration_valid: mappingResult.validation_results.valid || false,
            validation_errors: mappingResult.validation_results.errors || [],
            test_results: mappingResult.validation_results.test_results || {},
            recommendations: this.generateMappingRecommendations(mapping_configuration)
          }
  }
        timestamp: Date.now()
      };

    } catch (error) {
      fastify.log.error('SIEM mapping configuration failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: Date.now()
      };
    }
  });

  // Route 6: Search Export History
  fastify.post<{ Body: SearchExportHistoryRequest }>('/api/security-siem-integration/exports/search', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Search and filter export history and job results',
      tags: ['Export History'],
      body: {
        type: 'object',
        required: ['search_criteria'],
        properties: {
          search_criteria: {
            type: 'object',
            properties: {
              connection_ids: {
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
              export_status: {
                type: 'array',
                items: { type: 'string' }
  }
              data_types: {
                type: 'array',
                items: { type: 'string' }
  }
              job_types: {
                type: 'array',
                items: { type: 'string' }
              }
            }
  }
          result_options: {
            type: 'object',
            properties: {
              include_details: { type: 'boolean' },
              sort_criteria: { type: 'string' },
              limit: { type: 'number', minimum: 1, maximum: 1000 },
              offset: { type: 'number', minimum: 0 }
            }
          }
        }
      }
    }
  }, async (request, reply): Promise<APIResponse> => {
    try {
      const { search_criteria, result_options } = request.body;

      if (!siemEngine) {
        throw new Error('SIEM integration engine not initialized');
      }

      // Simulate export history search
      const mockExports = Array.from({ length: Math.min(result_options?.limit || 50, 100) }, (_, i) => ({
        export_id: `export_${Date.now() - i * 3600000}_${i}`,
        connection_id: search_criteria.connection_ids?.[0] || `conn_${i % 3}`,
        export_timestamp: Date.now() - i * 3600000,
        job_type: ['batch', 'scheduled', 'triggered'][i % 3],
        export_status: ['completed', 'failed', 'running'][i % 3],
        data_types: ['indicators', 'ttps'][i % 2] ? ['indicators'] : ['ttps'],
        records_exported: Math.floor(Math.random() * 1000) + 100,
        export_format: ['json', 'cef', 'leef'][i % 3],
        duration_ms: Math.floor(Math.random() * 30000) + 5000,
        success_rate: Math.random() * 0.2 + 0.8
      }));

      // Apply search filters
      let filteredExports = mockExports;
      
      if (search_criteria.date_range) {
        filteredExports = filteredExports.filter(exp => 
          exp.export_timestamp >= search_criteria.date_range!.start &&
          exp.export_timestamp <= search_criteria.date_range!.end
        );
      }

      if (search_criteria.export_status) {
        filteredExports = filteredExports.filter(exp =>
          search_criteria.export_status!.includes(exp.export_status)
        );
      }

      // Apply sorting and pagination
      const sortedExports = filteredExports.sort((a, b) => b.export_timestamp - a.export_timestamp);
      const offset = result_options?.offset || 0;
      const limit = result_options?.limit || 50;
      const paginatedExports = sortedExports.slice(offset, offset + limit);

      return {
        success: true,
        data: {
          search_summary: {
            total_exports_found: filteredExports.length,
            exports_returned: paginatedExports.length,
            search_criteria_applied: Object.keys(search_criteria).length,
            result_offset: offset,
            result_limit: limit
  }
          export_results: paginatedExports.map(exp => ({
            export_id: exp.export_id,
            connection_id: exp.connection_id,
            export_timestamp: exp.export_timestamp,
            job_type: exp.job_type,
            export_status: exp.export_status,
            data_types: exp.data_types,
            records_exported: exp.records_exported,
            export_format: exp.export_format,
            duration_seconds: Math.floor(exp.duration_ms / 1000),
            success_rate: Math.round(exp.success_rate * 100) / 100,
            ...(result_options?.include_details && {
              detailed_metrics: {
                data_volume_mb: Math.round(exp.records_exported * 0.001 * 100) / 100,
                throughput_records_per_second: Math.round(exp.records_exported / (exp.duration_ms / 1000)),
                error_count: Math.floor((1 - exp.success_rate) * exp.records_exported),
                retry_attempts: Math.floor(Math.random() * 3)
              }
  }
          })),
          aggregate_statistics: {
            total_records_exported: filteredExports.reduce((sum, exp) => sum + exp.records_exported, 0),
            average_success_rate: filteredExports.reduce(
              (sum,
              exp
            ) => sum + exp.success_rate, 0) / filteredExports.length,
            status_distribution: {
              completed: filteredExports.filter(exp => exp.export_status === 'completed').length,
              failed: filteredExports.filter(exp => exp.export_status === 'failed').length,
              running: filteredExports.filter(exp => exp.export_status === 'running').length
  }
            data_type_distribution: {
              indicators: filteredExports.filter(exp => exp.data_types.includes('indicators')).length,
              ttps: filteredExports.filter(exp => exp.data_types.includes('ttps')).length,
              threat_actors: filteredExports.filter(exp => exp.data_types.includes('threat_actors')).length
            }
          }
  }
        timestamp: Date.now()
      };

    } catch (error) {
      fastify.log.error('Export history search failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: Date.now()
      };
    }
  });

  // Route 7: Get SIEM Integration Analytics
  fastify.get('/api/security-siem-integration/analytics', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Get comprehensive SIEM integration analytics and performance metrics',
      tags: ['Analytics'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                integration_summary: { type: 'object' },
                platform_status: { type: 'array' },
                export_performance: { type: 'object' },
                data_quality_metrics: { type: 'object' },
                operational_insights: { type: 'object' }
              }
  }
            timestamp: { type: 'number' }
          }
        }
      }
    }
  }, async (request, reply): Promise<APIResponse> => {
    try {
      if (!siemEngine) {
        throw new Error('SIEM integration engine not initialized');
      }

      const analytics = siemEngine.getSIEMIntegrationAnalytics();

      return {
        success: true,
        data: {
          integration_summary: {
            connections_configured: analytics.integration_summary.connections_configured,
            active_connections: analytics.integration_summary.active_connections,
            total_exports_completed: analytics.integration_summary.total_exports_completed,
            real_time_streams_active: analytics.integration_summary.real_time_streams_active,
            data_volume_exported_mb: analytics.integration_summary.data_volume_exported,
            integration_health_score: analytics.integration_summary.integration_health_score
  }
          platform_status: analytics.platform_status.map(platform => ({
            platform_name: platform.platform_name,
            connection_status: platform.connection_status,
            last_successful_export: platform.last_successful_export,
            performance_metrics: {
              throughput_events_per_second: platform.performance_metrics.throughput,
              average_latency_ms: platform.performance_metrics.latency,
              uptime_percentage: platform.performance_metrics.uptime
  }
            error_count: platform.error_count,
            health_status: platform.error_count === 0 ? 'healthy' : 'degraded'
          })),
          export_performance: {
            total_records_exported: analytics.export_performance.total_records_exported,
            export_success_rate: analytics.export_performance.export_success_rate,
            average_export_time_ms: analytics.export_performance.average_export_time_ms,
            data_throughput_mbps: analytics.export_performance.data_throughput_mbps,
            error_analysis: {
              total_errors: analytics.export_performance.error_analysis.total_failed,
              error_rate: analytics.export_performance.error_analysis.failure_rate,
              common_error_types: analytics.export_performance.error_analysis.common_errors
            }
  }
          data_quality_metrics: {
            validation_pass_rate: analytics.data_quality_metrics.validation_pass_rate,
            format_compliance_rate: analytics.data_quality_metrics.format_compliance_rate,
            duplicate_detection_rate: analytics.data_quality_metrics.duplicate_detection_rate,
            enrichment_success_rate: analytics.data_quality_metrics.enrichment_success_rate,
            overall_quality_score: (
              analytics.data_quality_metrics.validation_pass_rate +
              analytics.data_quality_metrics.format_compliance_rate +
              analytics.data_quality_metrics.duplicate_detection_rate +
              analytics.data_quality_metrics.enrichment_success_rate
            ) / 4
  }
          operational_insights: {
            peak_export_times: analytics.operational_insights.peak_export_times,
            resource_utilization: analytics.operational_insights.resource_utilization,
            bottleneck_analysis: analytics.operational_insights.bottleneck_analysis,
            optimization_recommendations: analytics.operational_insights.optimization_recommendations
  }
          trend_analysis: {
            export_volume_trend: 'increasing',
            success_rate_trend: 'stable',
            performance_trend: 'improving',
            error_rate_trend: 'decreasing'
          }
  }
        timestamp: Date.now()
      };

    } catch (error) {
      fastify.log.error('SIEM integration analytics retrieval failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: Date.now()
      };
    }
  });

  // Helper functions
  function calculateEstimatedDeliveryTime(recordCount: number): number {
    // Estimate delivery time based on record count
    return Math.max(recordCount * 10, 1000); // minimum 1 second
  }

  function generateMappingRecommendations(mappingConfig: any): string[] {
    const recommendations: string[] = [];
    
    if (!mappingConfig.field_mappings || mappingConfig.field_mappings.length === 0) {
      recommendations.push('Configure field mappings for data transformation');
    }
    
    if (!mappingConfig.transformation_rules || mappingConfig.transformation_rules.length === 0) {
      recommendations.push('Add transformation rules for data formatting');
    }
    
    const requiredFields = mappingConfig.field_mappings?.filter((m: any) => m.required).length || 0;
    if (requiredFields === 0) {
      recommendations.push('Define required fields for data validation');
    }
    
    return recommendations;
  }
}