/**
 * Audit Evidence Mapping Configuration
 * 
 * Centralized configuration for evidence mapping, compliance frameworks,
 * and audit requirements. Supports dynamic configuration updates and
 * framework-specific customization.
 */

}
}
export interface EvidenceMappingConfig {
  // Core mapping settings
  mapping: {
    auto_discovery_enabled: boolean;
    validation_strict_mode: boolean;
    evidence_collection_timeout: number;
    mapping_cache_ttl: number;
    evidence_integrity_verification: boolean;
}
}
  };

  // Compliance framework settings
  frameworks: {
    enabled_frameworks: string[];
    custom_frameworks_allowed: boolean;
    framework_update_frequency: string;
    framework_validation_rules: {
      require_evidence_mapping: boolean;
      require_audit_frequency: boolean;
      require_retention_policies: boolean;
    };
  };

  // Evidence collection settings
  evidence_collection: {
    automatic_collection_enabled: boolean;
    collection_schedule: {
      continuous_evidence: string;
      periodic_evidence: string;
      triggered_evidence: string;
    };
    collection_retry_attempts: number;
    collection_failure_threshold: number;
    evidence_storage_encryption: boolean;
  };

  // Audit trail settings
  audit_trail: {
    enabled: boolean;
    chain_of_custody_required: boolean;
    cryptographic_signing: boolean;
    tamper_detection: boolean;
    retention_enforcement: boolean;
    access_logging: boolean;
  };

  // Reporting settings
  reporting: {
    auto_generate_reports: boolean;
    report_formats: string[];
    report_distribution: {
      email_enabled: boolean;
      api_delivery_enabled: boolean;
      secure_download_enabled: boolean;
    };
    report_scheduling: {
      daily_summary: boolean;
      weekly_compliance: boolean;
      monthly_audit: boolean;
      quarterly_executive: boolean;
    };
  };

  // Security settings
  security: {
    evidence_access_controls: {
      role_based_access: boolean;
      evidence_compartmentalization: boolean;
      access_approval_required: boolean;
      privileged_access_monitoring: boolean;
    };
    data_classification: {
      auto_classification: boolean;
      sensitivity_inheritance: boolean;
      classification_overrides_allowed: boolean;
    };
    encryption: {
      evidence_at_rest: boolean;
      evidence_in_transit: boolean;
      key_rotation_frequency: string;
      algorithm: string;
    };
  };

  // Integration settings
  integration: {
    siem_integration: {
      enabled: boolean;
      endpoints: string[];
      event_forwarding: boolean;
      real_time_sync: boolean;
    };
    grc_platforms: {
      enabled: boolean;
      supported_platforms: string[];
      bidirectional_sync: boolean;
      mapping_synchronization: boolean;
    };
    external_auditors: {
      portal_access_enabled: boolean;
      evidence_sharing_enabled: boolean;
      collaborative_review: boolean;
      secure_workspace: boolean;
    };
  };

  // Performance settings
  performance: {
    caching: {
      mapping_cache_enabled: boolean;
      evidence_cache_enabled: boolean;
      cache_size_limit: string;
      cache_eviction_policy: string;
    };
    optimization: {
      batch_collection_enabled: boolean;
      parallel_processing: boolean;
      compression_enabled: boolean;
      deduplication_enabled: boolean;
    };
    monitoring: {
      performance_metrics: boolean;
      collection_analytics: boolean;
      mapping_effectiveness: boolean;
      compliance_coverage_tracking: boolean;
    };
  };

  // Notification settings
  notifications: {
    evidence_gaps: {
      enabled: boolean;
      severity_threshold: string;
      notification_channels: string[];
      escalation_enabled: boolean;
    };
    collection_failures: {
      enabled: boolean;
      retry_notifications: boolean;
      failure_threshold: number;
      notification_delay: string;
    };
    compliance_deadlines: {
      enabled: boolean;
      advance_warning_days: number[];
      reminder_frequency: string;
      escalation_levels: string[];
    };
    audit_events: {
      enabled: boolean;
      real_time_alerts: boolean;
      batch_summaries: boolean;
      critical_event_priority: boolean;
    };
  };
}

export const defaultEvidenceMappingConfig: EvidenceMappingConfig = {
  mapping: {
    auto_discovery_enabled: true,
    validation_strict_mode: true,
    evidence_collection_timeout: 300000, // 5 minutes
    mapping_cache_ttl: 3600000, // 1 hour
    evidence_integrity_verification: true
  }
  frameworks: {
    enabled_frameworks: ['gdpr-2018', 'soc2-2017', 'iso27001-2022', 'hipaa-1996'],
    custom_frameworks_allowed: true,
    framework_update_frequency: 'monthly',
    framework_validation_rules: {
      require_evidence_mapping: true,
      require_audit_frequency: true,
      require_retention_policies: true
    }
  }
  evidence_collection: {
    automatic_collection_enabled: true,
    collection_schedule: {
      continuous_evidence: '*/5 * * * *', // Every 5 minutes
      periodic_evidence: '0 0 * * *', // Daily at midnight
      triggered_evidence: 'on_demand'
  }
    collection_retry_attempts: 3,
    collection_failure_threshold: 5,
    evidence_storage_encryption: true
  }
  audit_trail: {
    enabled: true,
    chain_of_custody_required: true,
    cryptographic_signing: true,
    tamper_detection: true,
    retention_enforcement: true,
    access_logging: true
  }
  reporting: {
    auto_generate_reports: true,
    report_formats: ['pdf', 'json', 'csv', 'xml'],
    report_distribution: {
      email_enabled: true,
      api_delivery_enabled: true,
      secure_download_enabled: true
  }
    report_scheduling: {
      daily_summary: true,
      weekly_compliance: true,
      monthly_audit: true,
      quarterly_executive: true
    }
  }
  security: {
    evidence_access_controls: {
      role_based_access: true,
      evidence_compartmentalization: true,
      access_approval_required: false,
      privileged_access_monitoring: true
  }
    data_classification: {
      auto_classification: true,
      sensitivity_inheritance: true,
      classification_overrides_allowed: false
  }
    encryption: {
      evidence_at_rest: true,
      evidence_in_transit: true,
      key_rotation_frequency: 'quarterly',
      algorithm: 'AES-256-GCM'
    }
  }
  integration: {
    siem_integration: {
      enabled: false,
      endpoints: [],
      event_forwarding: true,
      real_time_sync: false
  }
    grc_platforms: {
      enabled: false,
      supported_platforms: ['ServiceNow', 'MetricStream', 'Resolver'],
      bidirectional_sync: false,
      mapping_synchronization: true
  }
    external_auditors: {
      portal_access_enabled: true,
      evidence_sharing_enabled: true,
      collaborative_review: true,
      secure_workspace: true
    }
  }
  performance: {
    caching: {
      mapping_cache_enabled: true,
      evidence_cache_enabled: true,
      cache_size_limit: '1GB',
      cache_eviction_policy: 'LRU'
  }
    optimization: {
      batch_collection_enabled: true,
      parallel_processing: true,
      compression_enabled: true,
      deduplication_enabled: true
  }
    monitoring: {
      performance_metrics: true,
      collection_analytics: true,
      mapping_effectiveness: true,
      compliance_coverage_tracking: true
    }
  }
  notifications: {
    evidence_gaps: {
      enabled: true,
      severity_threshold: 'medium',
      notification_channels: ['email', 'slack', 'dashboard'],
      escalation_enabled: true
  }
    collection_failures: {
      enabled: true,
      retry_notifications: false,
      failure_threshold: 3,
      notification_delay: '15m'
  }
    compliance_deadlines: {
      enabled: true,
      advance_warning_days: [30, 14, 7, 1],
      reminder_frequency: 'daily',
      escalation_levels: ['manager', 'director', 'ciso']
  }
    audit_events: {
      enabled: true,
      real_time_alerts: true,
      batch_summaries: true,
      critical_event_priority: true
    }
  }
};

/**
 * Framework-specific configuration overrides
 */
export const frameworkConfigs = {
  'gdpr-2018': {
    evidence_collection: {
      collection_schedule: {
        continuous_evidence: '*/1 * * * *' // More frequent for GDPR
      }
  }
    audit_trail: {
      chain_of_custody_required: true,
      retention_enforcement: true
  }
    notifications: {
      evidence_gaps: {
        severity_threshold: 'low' // More sensitive for GDPR
      }
    }
  }
  'soc2-2017': {
    evidence_collection: {
      automatic_collection_enabled: true,
      evidence_storage_encryption: true
  }
    security: {
      evidence_access_controls: {
        access_approval_required: true
      }
  }
    reporting: {
      report_scheduling: {
        quarterly_executive: true
      }
    }
  }
  'iso27001-2022': {
    audit_trail: {
      cryptographic_signing: true,
      tamper_detection: true
  }
    security: {
      encryption: {
        key_rotation_frequency: 'monthly'
      }
  }
    notifications: {
      audit_events: {
        real_time_alerts: true
      }
    }
  }
  'hipaa-1996': {
    evidence_collection: {
      evidence_storage_encryption: true
  }
    security: {
      evidence_access_controls: {
        role_based_access: true,
        evidence_compartmentalization: true,
        privileged_access_monitoring: true
  }
      encryption: {
        evidence_at_rest: true,
        evidence_in_transit: true
      }
  }
    audit_trail: {
      chain_of_custody_required: true,
      access_logging: true
    }
  }
};

/**
 * Get framework-specific configuration
 */
export function getFrameworkConfig(frameworkId: string): Partial<EvidenceMappingConfig> {
  return frameworkConfigs[frameworkId as keyof typeof frameworkConfigs] || {};
}

/**
 * Merge default config with framework-specific overrides
 */
export function getMergedConfig(frameworkId?: string): EvidenceMappingConfig {
  if (!frameworkId) {
    return defaultEvidenceMappingConfig;
  }

  const frameworkOverrides = getFrameworkConfig(frameworkId);
  return mergeConfigs(defaultEvidenceMappingConfig, frameworkOverrides);
}

/**
 * Deep merge configuration objects
 */
function mergeConfigs(
  base: EvidenceMappingConfig, 
  override: Partial<EvidenceMappingConfig>
): EvidenceMappingConfig {
  const result = JSON.parse(JSON.stringify(base));
  
  function deepMerge(target: any, source: any) {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        target[key] = target[key] || {};
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
  
  deepMerge(result, override);
  return result;
}

export default {
  defaultEvidenceMappingConfig,
  frameworkConfigs,
  getFrameworkConfig,
  getMergedConfig
};