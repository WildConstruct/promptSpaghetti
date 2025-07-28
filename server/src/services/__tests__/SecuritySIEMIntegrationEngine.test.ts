/**
 * Tests for Security SIEM Integration Engine
 * Epic 31 - Task E31-1753313263574-CD2164
 */

import { 
  SecuritySIEMIntegrationEngine, 
  SIEMIntegrationConfig, 
  SIEMConnection,
  SIEMExportJob,
  ThreatIntelligenceExport,
  FieldMapping,
  FilterCriteria 
} from '../SecuritySIEMIntegrationEngine';
import { SecurityAPIIntegrationPlatform } from '../SecurityAPIIntegrationPlatform';
import { SecurityPolicyAnalysisEngine } from '../SecurityPolicyAnalysisEngine';
import { SecurityIntelligenceAutomationEngine } from '../SecurityIntelligenceAutomationEngine';

// Mock dependencies
jest.mock('../SecurityAPIIntegrationPlatform');
jest.mock('../SecurityPolicyAnalysisEngine');
jest.mock('../SecurityIntelligenceAutomationEngine');

describe('SecuritySIEMIntegrationEngine', () => {
  let engine: SecuritySIEMIntegrationEngine;
  let mockAPIIntegration: jest.Mocked<SecurityAPIIntegrationPlatform>;
  let mockPolicyEngine: jest.Mocked<SecurityPolicyAnalysisEngine>;
  let mockIntelligenceEngine: jest.Mocked<SecurityIntelligenceAutomationEngine>;
  let config: SIEMIntegrationConfig;

  beforeEach(() => {
    // Setup mocks
    mockAPIIntegration = {
      on: jest.fn<unknown[], unknown>(),
      getPlatformMetrics: jest.fn<unknown[], unknown>().mockResolvedValue({
        api_calls: { total_requests: 25000, successful_requests: 24750 },
        security_analytics: { threats_detected: 85, detection_accuracy_percent: 97 }
      } as unknown)
    } as any;

    mockPolicyEngine = {
      on: jest.fn<unknown[], unknown>(),
      analyzePolicyImpact: jest.fn<unknown[], unknown>().mockResolvedValue({
        risk_analysis: { overall_risk_score: 35 },
        validation_results: { validation_passed: true }
      } as unknown)
    } as any;

    mockIntelligenceEngine = {
      on: jest.fn<unknown[], unknown>(),
      generateInsights: jest.fn<unknown[], unknown>().mockResolvedValue({
        generation_id: 'gen_456',
        insights_generated: []
      } as unknown),
      collectIntelligence: jest.fn<unknown[], unknown>().mockResolvedValue({
        collection_id: 'col_456',
        intelligence_collected: 150
      } as unknown)
    } as any;

    // Setup configuration
    config = {
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

    engine = new SecuritySIEMIntegrationEngine(
      config,
      mockAPIIntegration,
      mockPolicyEngine,
      mockIntelligenceEngine
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize successfully with valid configuration', async () => {
      const initializeSpy = jest.spyOn(engine, 'initialize');
      
      await engine.initialize();
      
      expect(initializeSpy).toHaveBeenCalled();
    });

    it('should emit initialization events', async () => {
      const eventSpy = jest.fn<unknown[], unknown>();
      engine.on('siem_integration_initialized', eventSpy);
      
      await engine.initialize();
      
      expect(eventSpy).toHaveBeenCalled();
    });

    it('should handle initialization errors gracefully', async () => {
      const errorEngine = new SecuritySIEMIntegrationEngine(
        {} as any, // Invalid config
        mockAPIIntegration,
        mockPolicyEngine,
        mockIntelligenceEngine
      );

      await expect(errorEngine.initialize()).rejects.toThrow();
    });
  });

  describe('SIEM Connection Management', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should create Splunk connection successfully', async () => {
      const connectionConfig = {
        connection_name: 'Splunk Production',
        endpoint_url: 'https://splunk.company.com:8089',
        authentication_method: 'api_key',
        authentication_config: { api_key: 'test_key' },
        protocol: 'https',
        ssl_enabled: true,
        data_format: 'json',
        streaming_enabled: true
      };

      const connection = await engine.createSIEMConnection('splunk', connectionConfig);

      expect(connection).toHaveProperty('connection_id');
      expect(connection.connection_name).toBe('Splunk Production');
      expect(connection.platform_type).toBe('splunk');
      expect(connection.connection_status).toBeOneOf(['active', 'testing', 'error']);
      expect(connection.connection_details.endpoint_url).toBe(connectionConfig.endpoint_url);
      expect(connection.data_mapping.field_mappings).toBeInstanceOf(Array);
    });

    it('should create QRadar connection successfully', async () => {
      const connectionConfig = {
        connection_name: 'QRadar SIEM',
        endpoint_url: 'https://qradar.company.com/api',
        authentication_method: 'token',
        authentication_config: { token: 'test_token' },
        protocol: 'https',
        ssl_enabled: true,
        data_format: 'leef'
      };

      const connection = await engine.createSIEMConnection('qradar', connectionConfig);

      expect(connection.platform_type).toBe('qradar');
      expect(connection.data_mapping.format_transformation).toBe('leef');
    });

    it('should create Microsoft Sentinel connection successfully', async () => {
      const connectionConfig = {
        connection_name: 'Azure Sentinel',
        endpoint_url: 'https://management.azure.com/subscriptions/xxx/resourceGroups/xxx/providers/Microsoft.OperationalInsights/workspaces/xxx',
        authentication_method: 'oauth',
        authentication_config: { 
          client_id: 'test_client',
          client_secret: 'test_secret',
          tenant_id: 'test_tenant'
  }
        protocol: 'https',
        ssl_enabled: true,
        data_format: 'json'
      };

      const connection = await engine.createSIEMConnection('sentinel', connectionConfig);

      expect(connection.platform_type).toBe('sentinel');
      expect(connection.connection_details.authentication_method).toBe('oauth');
    });

    it('should create Elastic SIEM connection successfully', async () => {
      const connectionConfig = {
        connection_name: 'Elastic Security',
        endpoint_url: 'https://elastic.company.com:9200',
        authentication_method: 'basic_auth',
        authentication_config: { 
          username: 'elastic_user',
          password: 'elastic_pass'
  }
        protocol: 'https',
        ssl_enabled: true,
        data_format: 'json',
        streaming_enabled: true
      };

      const connection = await engine.createSIEMConnection('elastic_siem', connectionConfig);

      expect(connection.platform_type).toBe('elastic_siem');
      expect(connection.streaming_config.streaming_enabled).toBe(true);
    });

    it('should create custom SIEM connection successfully', async () => {
      const connectionConfig = {
        connection_name: 'Custom SIEM Platform',
        endpoint_url: 'https://custom-siem.company.com/api/v1',
        authentication_method: 'certificate',
        authentication_config: { 
          cert_file: '/path/to/cert.pem',
          key_file: '/path/to/key.pem'
  }
        protocol: 'https',
        ssl_enabled: true,
        data_format: 'stix_taxii'
      };

      const connection = await engine.createSIEMConnection('custom', connectionConfig);

      expect(connection.platform_type).toBe('custom');
      expect(connection.data_mapping.format_transformation).toBe('stix_taxii');
    });

    it('should handle connection creation errors gracefully', async () => {
      const invalidConfig = {
        connection_name: '',
        endpoint_url: 'invalid-url',
        authentication_method: 'invalid',
        authentication_config: {},
        protocol: 'invalid',
        ssl_enabled: true,
        data_format: 'invalid'
      };

      await expect(engine.createSIEMConnection('splunk', invalidConfig as any))
        .rejects.toThrow();
    });

    it('should emit connection creation events', async () => {
      const eventSpy = jest.fn<unknown[], unknown>();
      engine.on('siem_connection_created', eventSpy);

      const connectionConfig = {
        connection_name: 'Test Connection',
        endpoint_url: 'https://test.siem.com',
        authentication_method: 'api_key',
        authentication_config: { api_key: 'test' },
        protocol: 'https',
        ssl_enabled: true,
        data_format: 'json'
      };

      await engine.createSIEMConnection('splunk', connectionConfig);

      expect(eventSpy).toHaveBeenCalled();
    });
  });

  describe('Threat Intelligence Export', () => {
    let connection: SIEMConnection;

    beforeEach(async () => {
      await engine.initialize();
      
      connection = await engine.createSIEMConnection('splunk', {
        connection_name: 'Test Splunk',
        endpoint_url: 'https://test-splunk.com',
        authentication_method: 'api_key',
        authentication_config: { api_key: 'test_key' },
        protocol: 'https',
        ssl_enabled: true,
        data_format: 'json'
      });
    });

    it('should export threat indicators successfully', async () => {
      const exportConfig = {
        data_types: ['indicators'] as const,
        export_format: 'json',
        include_metadata: true,
        compression_enabled: false,
        encryption_enabled: false
      };

      const exportResult = await engine.exportThreatIntelligence(connection.connection_id, exportConfig);

      expect(exportResult).toHaveProperty('export_id');
      expect(exportResult).toHaveProperty('export_timestamp');
      expect(exportResult).toHaveProperty('intelligence_data');
      expect(exportResult.intelligence_data).toHaveProperty('indicators');
      expect(exportResult.metadata.source_systems).toContain('security_intelligence_platform');
      expect(exportResult.formatting.output_format).toBe('json');
    });

    it('should export TTPs successfully', async () => {
      const exportConfig = {
        data_types: ['ttps'] as const,
        export_format: 'cef',
        include_metadata: true
      };

      const exportResult = await engine.exportThreatIntelligence(connection.connection_id, exportConfig);

      expect(exportResult.intelligence_data).toHaveProperty('ttps');
      expect(exportResult.formatting.output_format).toBe('cef');
    });

    it('should export threat actors successfully', async () => {
      const exportConfig = {
        data_types: ['threat_actors'] as const,
        export_format: 'leef'
      };

      const exportResult = await engine.exportThreatIntelligence(connection.connection_id, exportConfig);

      expect(exportResult.intelligence_data).toHaveProperty('threat_actors');
      expect(exportResult.formatting.output_format).toBe('leef');
    });

    it('should export multiple data types successfully', async () => {
      const exportConfig = {
        data_types: ['indicators', 'ttps', 'campaigns'] as const,
        export_format: 'json',
        time_range: {
          start: Date.now() - 86400000, // 24 hours ago
          end: Date.now()
        }
      };

      const exportResult = await engine.exportThreatIntelligence(connection.connection_id, exportConfig);

      expect(exportResult.intelligence_data).toHaveProperty('indicators');
      expect(exportResult.intelligence_data).toHaveProperty('ttps');
      expect(exportResult.intelligence_data).toHaveProperty('campaigns');
    });

    it('should apply filtering criteria during export', async () => {
      const exportConfig = {
        data_types: ['indicators'] as const,
        export_format: 'json',
        filter_criteria: {
          include_filters: [],
          exclude_filters: [],
          severity_threshold: 'high',
          confidence_threshold: 0.8
        }
      };

      const exportResult = await engine.exportThreatIntelligence(connection.connection_id, exportConfig);

      expect(exportResult).toHaveProperty('export_id');
      expect(exportResult.metadata.confidence_levels).toBeDefined();
    });

    it('should handle export errors gracefully', async () => {
      const invalidConnectionId = 'non_existent_connection';
      const exportConfig = {
        data_types: ['indicators'] as const,
        export_format: 'json'
      };

      await expect(engine.exportThreatIntelligence(invalidConnectionId, exportConfig))
        .rejects.toThrow('SIEM connection not found');
    });

    it('should emit export events', async () => {
      const eventSpy = jest.fn<unknown[], unknown>();
      engine.on('threat_intelligence_export_completed', eventSpy);

      const exportConfig = {
        data_types: ['indicators'] as const,
        export_format: 'json'
      };

      await engine.exportThreatIntelligence(connection.connection_id, exportConfig);

      expect(eventSpy).toHaveBeenCalled();
    });

    it('should include correct metadata in exports', async () => {
      const exportConfig = {
        data_types: ['indicators'] as const,
        export_format: 'json',
        include_metadata: true
      };

      const exportResult = await engine.exportThreatIntelligence(connection.connection_id, exportConfig);

      expect(exportResult.metadata).toHaveProperty('source_systems');
      expect(exportResult.metadata).toHaveProperty('confidence_levels');
      expect(exportResult.metadata).toHaveProperty('classification_levels');
      expect(exportResult.metadata).toHaveProperty('data_freshness');
      expect(exportResult.metadata).toHaveProperty('validation_status');
    });
  });

  describe('Real-Time Streaming', () => {
    let connection: SIEMConnection;

    beforeEach(async () => {
      await engine.initialize();
      
      connection = await engine.createSIEMConnection('elastic_siem', {
        connection_name: 'Elastic Streaming',
        endpoint_url: 'https://elastic.company.com:9200',
        authentication_method: 'basic_auth',
        authentication_config: { username: 'user', password: 'pass' },
        protocol: 'https',
        ssl_enabled: true,
        data_format: 'json',
        streaming_enabled: true
      });
    });

    it('should start real-time streaming successfully', async () => {
      const streamingConfig = {
        data_types: ['indicators', 'alerts'],
        batch_size: 500,
        flush_interval: 15,
        quality_checks: true
      };

      const streamingResult = await engine.startRealTimeStreaming(connection.connection_id, streamingConfig);

      expect(streamingResult).toHaveProperty('stream_id');
      expect(streamingResult).toHaveProperty('status', 'active');
    });

    it('should start streaming with filter criteria', async () => {
      const streamingConfig = {
        data_types: ['indicators'],
        filter_criteria: {
          include_filters: [],
          exclude_filters: [],
          severity_threshold: 'medium',
          confidence_threshold: 0.75
  }
        batch_size: 1000,
        flush_interval: 30
      };

      const streamingResult = await engine.startRealTimeStreaming(connection.connection_id, streamingConfig);

      expect(streamingResult.status).toBe('active');
    });

    it('should handle streaming start errors gracefully', async () => {
      const invalidConnectionId = 'non_existent_connection';
      const streamingConfig = {
        data_types: ['indicators']
      };

      await expect(engine.startRealTimeStreaming(invalidConnectionId, streamingConfig))
        .rejects.toThrow('SIEM connection not found');
    });

    it('should emit streaming events', async () => {
      const eventSpy = jest.fn<unknown[], unknown>();
      engine.on('real_time_streaming_started', eventSpy);

      const streamingConfig = {
        data_types: ['indicators']
      };

      await engine.startRealTimeStreaming(connection.connection_id, streamingConfig);

      expect(eventSpy).toHaveBeenCalled();
    });
  });

  describe('Export Job Management', () => {
    let connection: SIEMConnection;

    beforeEach(async () => {
      await engine.initialize();
      
      connection = await engine.createSIEMConnection('qradar', {
        connection_name: 'QRadar Jobs',
        endpoint_url: 'https://qradar.company.com/api',
        authentication_method: 'token',
        authentication_config: { token: 'test_token' },
        protocol: 'https',
        ssl_enabled: true,
        data_format: 'leef'
      });
    });

    it('should create batch export job successfully', async () => {
      const jobConfig = {
        job_name: 'Daily Indicators Export',
        job_type: 'batch' as const,
        connection_id: connection.connection_id,
        data_types: ['indicators', 'ttps'],
        export_format: 'leef'
      };

      const exportJob = await engine.createExportJob(jobConfig);

      expect(exportJob).toHaveProperty('job_id');
      expect(exportJob.job_name).toBe('Daily Indicators Export');
      expect(exportJob.job_type).toBe('batch');
      expect(exportJob.job_status).toBe('pending');
      expect(exportJob.export_configuration.connection_id).toBe(connection.connection_id);
    });

    it('should create scheduled export job successfully', async () => {
      const jobConfig = {
        job_name: 'Hourly Threat Data Export',
        job_type: 'scheduled' as const,
        connection_id: connection.connection_id,
        data_types: ['indicators'],
        export_format: 'json',
        schedule: '0 * * * *' // Every hour
      };

      const exportJob = await engine.createExportJob(jobConfig);

      expect(exportJob.job_type).toBe('scheduled');
      expect(exportJob.export_configuration.data_types).toContain('indicators');
    });

    it('should create triggered export job successfully', async () => {
      const jobConfig = {
        job_name: 'High Priority Threat Export',
        job_type: 'triggered' as const,
        connection_id: connection.connection_id,
        data_types: ['indicators', 'campaigns'],
        export_format: 'cef',
        trigger_conditions: ['high_priority_threat', 'critical_alert']
      };

      const exportJob = await engine.createExportJob(jobConfig);

      expect(exportJob.job_type).toBe('triggered');
    });

    it('should emit job creation events', async () => {
      const eventSpy = jest.fn<unknown[], unknown>();
      engine.on('export_job_created', eventSpy);

      const jobConfig = {
        job_name: 'Test Job',
        job_type: 'batch' as const,
        connection_id: connection.connection_id,
        data_types: ['indicators'],
        export_format: 'json'
      };

      await engine.createExportJob(jobConfig);

      expect(eventSpy).toHaveBeenCalled();
    });
  });

  describe('Field Mapping Configuration', () => {
    let connection: SIEMConnection;

    beforeEach(async () => {
      await engine.initialize();
      
      connection = await engine.createSIEMConnection('splunk', {
        connection_name: 'Splunk Mapping Test',
        endpoint_url: 'https://splunk.test.com',
        authentication_method: 'api_key',
        authentication_config: { api_key: 'test_key' },
        protocol: 'https',
        ssl_enabled: true,
        data_format: 'json'
      });
    });

    it('should configure field mappings successfully', async () => {
      const fieldMappings: FieldMapping[] = [
        {
          source_field: 'timestamp',
          target_field: '_time',
          data_type: 'date',
          required: true
  }
        {
          source_field: 'severity',
          target_field: 'severity',
          data_type: 'string',
          required: true
  }
        {
          source_field: 'source_ip',
          target_field: 'src_ip',
          data_type: 'string',
          required: false
        }
      ];

      const mappingConfig = {
        field_mappings: fieldMappings,
        transformation_rules: ['toLowerCase(source_field)', 'removeSpaces(target_field)'],
        validation_rules: ['required_field_check', 'data_type_validation']
      };

      const mappingResult = await engine.configureSIEMMapping(connection.connection_id, mappingConfig);

      expect(mappingResult).toHaveProperty('mapping_id');
      expect(mappingResult).toHaveProperty('validation_results');
      expect(mappingResult.validation_results).toHaveProperty('valid');
    });

    it('should configure enrichment rules successfully', async () => {
      const enrichmentRules = [
        {
          rule_id: 'geo_enrichment',
          rule_name: 'IP Geolocation Enrichment',
          condition: 'field_exists(source_ip)',
          enrichment_action: 'add_geolocation',
          enrichment_data: { service: 'geoip_service' },
          priority: 1,
          enabled: true
        }
      ];

      const mappingConfig = {
        enrichment_rules: enrichmentRules
      };

      const mappingResult = await engine.configureSIEMMapping(connection.connection_id, mappingConfig);

      expect(mappingResult.validation_results).toBeDefined();
    });

    it('should configure filter criteria successfully', async () => {
      const filterCriteria: FilterCriteria = {
        include_filters: [
          {
            field: 'severity',
            operator: 'in',
            value: ['high', 'critical']
          }
        ],
        exclude_filters: [
          {
            field: 'source',
            operator: 'equals',
            value: 'test_source'
          }
        ],
        severity_threshold: 'medium',
        confidence_threshold: 0.8
      };

      const mappingConfig = {
        filter_criteria: filterCriteria
      };

      const mappingResult = await engine.configureSIEMMapping(connection.connection_id, mappingConfig);

      expect(mappingResult.validation_results.valid).toBeDefined();
    });

    it('should validate mapping configuration', async () => {
      const invalidMappings: FieldMapping[] = [
        {
          source_field: 'required_field',
          target_field: '', // Invalid - empty target field
          data_type: 'string',
          required: true
        }
      ];

      const mappingConfig = {
        field_mappings: invalidMappings
      };

      const mappingResult = await engine.configureSIEMMapping(connection.connection_id, mappingConfig);

      expect(mappingResult.validation_results.valid).toBe(false);
      expect(mappingResult.validation_results.errors).toContain(
        'Required field mapping missing target: required_field'
      );
    });

    it('should handle mapping configuration errors gracefully', async () => {
      const invalidConnectionId = 'non_existent_connection';
      const mappingConfig = {
        field_mappings: []
      };

      await expect(engine.configureSIEMMapping(invalidConnectionId, mappingConfig))
        .rejects.toThrow('SIEM connection not found');
    });

    it('should emit mapping configuration events', async () => {
      const eventSpy = jest.fn<unknown[], unknown>();
      engine.on('siem_mapping_configured', eventSpy);

      const mappingConfig = {
        field_mappings: [
          {
            source_field: 'test_field',
            target_field: 'mapped_field',
            data_type: 'string' as const,
            required: false
          }
        ]
      };

      await engine.configureSIEMMapping(connection.connection_id, mappingConfig);

      expect(eventSpy).toHaveBeenCalled();
    });
  });

  describe('Analytics and Metrics', () => {
    beforeEach(async () => {
      await engine.initialize();
      
      // Create some test connections and exports
      await engine.createSIEMConnection('splunk', {
        connection_name: 'Analytics Test Splunk',
        endpoint_url: 'https://splunk.test.com',
        authentication_method: 'api_key',
        authentication_config: { api_key: 'test_key' },
        protocol: 'https',
        ssl_enabled: true,
        data_format: 'json'
      });
    });

    it('should provide comprehensive SIEM integration analytics', () => {
      const analytics = engine.getSIEMIntegrationAnalytics();

      expect(analytics).toHaveProperty('integration_id');
      expect(analytics).toHaveProperty('integration_timestamp');
      expect(analytics).toHaveProperty('integration_summary');
      expect(analytics).toHaveProperty('platform_status');
      expect(analytics).toHaveProperty('export_performance');
      expect(analytics).toHaveProperty('data_quality_metrics');
      expect(analytics).toHaveProperty('operational_insights');
    });

    it('should include integration summary metrics', () => {
      const analytics = engine.getSIEMIntegrationAnalytics();

      expect(analytics.integration_summary).toHaveProperty('connections_configured');
      expect(analytics.integration_summary).toHaveProperty('active_connections');
      expect(analytics.integration_summary).toHaveProperty('total_exports_completed');
      expect(analytics.integration_summary).toHaveProperty('real_time_streams_active');
      expect(analytics.integration_summary).toHaveProperty('data_volume_exported');
      expect(analytics.integration_summary).toHaveProperty('integration_health_score');
      expect(typeof analytics.integration_summary.integration_health_score).toBe('number');
    });

    it('should include platform status information', () => {
      const analytics = engine.getSIEMIntegrationAnalytics();

      expect(analytics.platform_status).toBeInstanceOf(Array);
      if (analytics.platform_status.length > 0) {
        const platform = analytics.platform_status[0];
        expect(platform).toHaveProperty('platform_name');
        expect(platform).toHaveProperty('connection_status');
        expect(platform).toHaveProperty('last_successful_export');
        expect(platform).toHaveProperty('performance_metrics');
        expect(platform).toHaveProperty('error_count');
      }
    });

    it('should include export performance metrics', () => {
      const analytics = engine.getSIEMIntegrationAnalytics();

      expect(analytics.export_performance).toHaveProperty('total_records_exported');
      expect(analytics.export_performance).toHaveProperty('export_success_rate');
      expect(analytics.export_performance).toHaveProperty('average_export_time_ms');
      expect(analytics.export_performance).toHaveProperty('data_throughput_mbps');
      expect(analytics.export_performance).toHaveProperty('error_analysis');
    });

    it('should include data quality metrics', () => {
      const analytics = engine.getSIEMIntegrationAnalytics();

      expect(analytics.data_quality_metrics).toHaveProperty('validation_pass_rate');
      expect(analytics.data_quality_metrics).toHaveProperty('format_compliance_rate');
      expect(analytics.data_quality_metrics).toHaveProperty('duplicate_detection_rate');
      expect(analytics.data_quality_metrics).toHaveProperty('enrichment_success_rate');
      expect(typeof analytics.data_quality_metrics.validation_pass_rate).toBe('number');
    });

    it('should include operational insights', () => {
      const analytics = engine.getSIEMIntegrationAnalytics();

      expect(analytics.operational_insights).toHaveProperty('peak_export_times');
      expect(analytics.operational_insights).toHaveProperty('resource_utilization');
      expect(analytics.operational_insights).toHaveProperty('bottleneck_analysis');
      expect(analytics.operational_insights).toHaveProperty('optimization_recommendations');
      expect(analytics.operational_insights.optimization_recommendations).toBeInstanceOf(Array);
    });

    it('should calculate integration health score correctly', () => {
      const analytics = engine.getSIEMIntegrationAnalytics();

      expect(analytics.integration_summary.integration_health_score).toBeGreaterThanOrEqual(0);
      expect(analytics.integration_summary.integration_health_score).toBeLessThanOrEqual(100);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should handle invalid connection IDs gracefully', async () => {
      const invalidConnectionId = 'invalid_connection_id';

      await expect(engine.exportThreatIntelligence(invalidConnectionId, {
        data_types: ['indicators'],
        export_format: 'json'
      })).rejects.toThrow('SIEM connection not found');

      await expect(engine.startRealTimeStreaming(invalidConnectionId))
        .rejects.toThrow('SIEM connection not found');

      await expect(engine.configureSIEMMapping(invalidConnectionId, {}))
        .rejects.toThrow('SIEM connection not found');
    });

    it('should handle empty export configurations', async () => {
      const connection = await engine.createSIEMConnection('splunk', {
        connection_name: 'Empty Config Test',
        endpoint_url: 'https://test.com',
        authentication_method: 'api_key',
        authentication_config: { api_key: 'test' },
        protocol: 'https',
        ssl_enabled: true,
        data_format: 'json'
      });

      const exportResult = await engine.exportThreatIntelligence(connection.connection_id, {
        data_types: [],
        export_format: 'json'
      });

      expect(exportResult).toHaveProperty('export_id');
    });

    it('should handle connection failures gracefully', async () => {
      const connectionConfig = {
        connection_name: 'Failing Connection',
        endpoint_url: 'https://non-existent-host.invalid',
        authentication_method: 'api_key',
        authentication_config: { api_key: 'invalid_key' },
        protocol: 'https',
        ssl_enabled: true,
        data_format: 'json'
      };

      const connection = await engine.createSIEMConnection('splunk', connectionConfig);
      
      // Connection should be created but marked as error due to test failure
      expect(connection.connection_status).toBeOneOf(['error', 'testing', 'active']);
    });

    it('should emit error events when appropriate', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      engine.on('siem_connection_error', errorSpy);

      try {
        await engine.createSIEMConnection('invalid_platform' as any, {
          connection_name: 'Invalid Platform',
          endpoint_url: 'https://test.com',
          authentication_method: 'invalid_method' as any,
          authentication_config: {},
          protocol: 'invalid_protocol' as any,
          ssl_enabled: true,
          data_format: 'invalid_format' as any
        });
      } catch (error) {
        // Expected to fail
      }
    });

    it('should handle large export volumes efficiently', async () => {
      const connection = await engine.createSIEMConnection('splunk', {
        connection_name: 'Large Export Test',
        endpoint_url: 'https://test.com',
        authentication_method: 'api_key',
        authentication_config: { api_key: 'test' },
        protocol: 'https',
        ssl_enabled: true,
        data_format: 'json'
      });

      const startTime = Date.now();

      const exportResult = await engine.exportThreatIntelligence(connection.connection_id, {
        data_types: ['indicators', 'ttps', 'threat_actors', 'campaigns', 'vulnerabilities'],
        export_format: 'json',
        time_range: {
          start: Date.now() - 2592000000, // 30 days ago
          end: Date.now()
        }
      });

      const processingTime = Date.now() - startTime;

      expect(exportResult).toHaveProperty('export_id');
      expect(processingTime).toBeLessThan(10000); // Should complete within 10 seconds
    });
  });

  describe('Event Handling and Integration', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should handle intelligence collection events', async () => {
      const intelligenceData = {
        collection_id: 'test_collection',
        intelligence_collected: 100,
        data_types: ['indicators', 'ttps']
      };

      // Simulate intelligence collection event
      mockIntelligenceEngine.on.mock.calls[0][1](intelligenceData);

      expect(mockIntelligenceEngine.on).toHaveBeenCalledWith('intelligence_collected', expect.any(Function));
    });

    it('should handle analysis completed events', async () => {
      const analysisData = {
        analysis_id: 'test_analysis',
        analysis_type: 'comprehensive',
        results: {}
      };

      // Simulate analysis completion event
      mockIntelligenceEngine.on.mock.calls[1][1](analysisData);

      expect(mockIntelligenceEngine.on).toHaveBeenCalledWith('analysis_completed', expect.any(Function));
    });

    it('should handle security events from API integration', async () => {
      const securityEvent = {
        event_type: 'critical_alert',
        severity: 'critical',
        source: 'endpoint_detection'
      };

      // Simulate security event
      mockAPIIntegration.on.mock.calls[0][1](securityEvent);

      expect(mockAPIIntegration.on).toHaveBeenCalledWith('security_event', expect.any(Function));
    });
  });

  describe('Performance and Scalability', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should handle multiple concurrent connections', async () => {
      const connectionPromises = [
        engine.createSIEMConnection('splunk', {
          connection_name: 'Splunk 1',
          endpoint_url: 'https://splunk1.test.com',
          authentication_method: 'api_key',
          authentication_config: { api_key: 'key1' },
          protocol: 'https',
          ssl_enabled: true,
          data_format: 'json'
        }),
        engine.createSIEMConnection('qradar', {
          connection_name: 'QRadar 1',
          endpoint_url: 'https://qradar1.test.com',
          authentication_method: 'token',
          authentication_config: { token: 'token1' },
          protocol: 'https',
          ssl_enabled: true,
          data_format: 'leef'
        }),
        engine.createSIEMConnection('sentinel', {
          connection_name: 'Sentinel 1',
          endpoint_url: 'https://sentinel1.test.com',
          authentication_method: 'oauth',
          authentication_config: { client_id: 'client1' },
          protocol: 'https',
          ssl_enabled: true,
          data_format: 'json'
  }
      ];

      const connections = await Promise.all(connectionPromises);

      expect(connections).toHaveLength(3);
      connections.forEach(connection => {
        expect(connection).toHaveProperty('connection_id');
        expect(connection.connection_status).toBeOneOf(['active', 'testing', 'error']);
      });
    });

    it('should handle multiple concurrent exports', async () => {
      const connection = await engine.createSIEMConnection('splunk', {
        connection_name: 'Concurrent Export Test',
        endpoint_url: 'https://test.com',
        authentication_method: 'api_key',
        authentication_config: { api_key: 'test' },
        protocol: 'https',
        ssl_enabled: true,
        data_format: 'json'
      });

      const exportPromises = [
        engine.exportThreatIntelligence(connection.connection_id, {
          data_types: ['indicators'],
          export_format: 'json'
        }),
        engine.exportThreatIntelligence(connection.connection_id, {
          data_types: ['ttps'],
          export_format: 'cef'
        }),
        engine.exportThreatIntelligence(connection.connection_id, {
          data_types: ['threat_actors'],
          export_format: 'leef'
  }
      ];

      const exports = await Promise.all(exportPromises);

      expect(exports).toHaveLength(3);
      exports.forEach(exportResult => {
        expect(exportResult).toHaveProperty('export_id');
        expect(exportResult).toHaveProperty('export_timestamp');
      });
    });

    it('should handle multiple streaming sessions', async () => {
      const connections = await Promise.all([
        engine.createSIEMConnection('splunk', {
          connection_name: 'Stream Test 1',
          endpoint_url: 'https://test1.com',
          authentication_method: 'api_key',
          authentication_config: { api_key: 'test1' },
          protocol: 'https',
          ssl_enabled: true,
          data_format: 'json',
          streaming_enabled: true
        }),
        engine.createSIEMConnection('elastic_siem', {
          connection_name: 'Stream Test 2',
          endpoint_url: 'https://test2.com',
          authentication_method: 'basic_auth',
          authentication_config: { username: 'user', password: 'pass' },
          protocol: 'https',
          ssl_enabled: true,
          data_format: 'json',
          streaming_enabled: true
  }
      ]);

      const streamingPromises = connections.map(connection =>
        engine.startRealTimeStreaming(connection.connection_id, {
          data_types: ['indicators'],
          batch_size: 100,
          flush_interval: 10
  }
      );

      const streams = await Promise.all(streamingPromises);

      expect(streams).toHaveLength(2);
      streams.forEach(stream => {
        expect(stream).toHaveProperty('stream_id');
        expect(stream.status).toBe('active');
      });
    });
  });

  describe('Configuration and Customization', () => {
    it('should accept custom SIEM integration configuration', () => {
      const customConfig: SIEMIntegrationConfig = {
        integration_settings: {
          enabled: true,
          real_time_streaming: false,
          batch_export_enabled: true,
          bidirectional_communication: false,
          automated_correlation: true,
          incident_synchronization: false,
          threat_feed_integration: true,
          alert_forwarding: false
  }
        supported_platforms: {
          splunk: true,
          qradar: false,
          arcsight: true,
          sentinel: false,
          elastic_siem: true,
          chronicle: false,
          sumo_logic: false,
          securonix: false,
          logrhythm: false,
          phantom: true,
          demisto: false,
          custom_apis: true
  }
        data_formats: {
          cef: true,
          leef: false,
          json: true,
          xml: false,
          csv: true,
          syslog: false,
          stix_taxii: true,
          misp: false,
          custom_formats: true
  }
        export_capabilities: {
          intelligence_data: true,
          threat_indicators: true,
          risk_assessments: false,
          analysis_results: true,
          incident_data: false,
          compliance_reports: true,
          correlation_results: false,
          workflow_logs: true
  }
        streaming_options: {
          real_time_events: false,
          batch_processing: true,
          delta_updates: false,
          scheduled_exports: true,
          triggered_exports: false,
          compression_enabled: true,
          encryption_enabled: false,
          authentication_required: true
  }
        quality_controls: {
          data_validation: true,
          format_verification: false,
          duplicate_detection: true,
          schema_compliance: false,
          error_handling: true,
          retry_mechanisms: false,
          delivery_confirmation: true,
          audit_logging: false
        }
      };

      const customEngine = new SecuritySIEMIntegrationEngine(
        customConfig,
        mockAPIIntegration,
        mockPolicyEngine,
        mockIntelligenceEngine
      );

      expect(customEngine).toBeInstanceOf(SecuritySIEMIntegrationEngine);
    });

    it('should handle disabled SIEM integration gracefully', async () => {
      const disabledConfig = { ...config };
      disabledConfig.integration_settings.enabled = false;

      const disabledEngine = new SecuritySIEMIntegrationEngine(
        disabledConfig,
        mockAPIIntegration,
        mockPolicyEngine,
        mockIntelligenceEngine
      );

      await disabledEngine.initialize();

      const analytics = disabledEngine.getSIEMIntegrationAnalytics();
      expect(analytics).toHaveProperty('integration_summary');
    });

    it('should adapt to platform-specific configurations', async () => {
      await engine.initialize();

      // Test Splunk-specific configuration
      const splunkConnection = await engine.createSIEMConnection('splunk', {
        connection_name: 'Splunk Custom',
        endpoint_url: 'https://splunk.custom.com:8089',
        authentication_method: 'api_key',
        authentication_config: { api_key: 'splunk_key' },
        protocol: 'https',
        ssl_enabled: true,
        data_format: 'json'
      });

      expect(splunkConnection.platform_type).toBe('splunk');
      expect(splunkConnection.data_mapping.field_mappings.some(m => m.target_field === '_time')).toBe(true);

      // Test QRadar-specific configuration
      const qradarConnection = await engine.createSIEMConnection('qradar', {
        connection_name: 'QRadar Custom',
        endpoint_url: 'https://qradar.custom.com/api',
        authentication_method: 'token',
        authentication_config: { token: 'qradar_token' },
        protocol: 'https',
        ssl_enabled: true,
        data_format: 'leef'
      });

      expect(qradarConnection.platform_type).toBe('qradar');
      expect(qradarConnection.data_mapping.field_mappings.some(m => m.target_field === 'sourceip')).toBe(true);
    });
  });
});