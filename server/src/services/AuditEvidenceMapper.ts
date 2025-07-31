/**
 * Audit Evidence Mapping Service
 * 
 * Maps evidence types to audit requirements, compliance frameworks,
 * and regulatory standards. Provides comprehensive mapping between
 * collected evidence and audit/compliance obligations.
 */

}
}
export interface EvidenceType {
  id: string;
  name: string;
  category: 'log' | 'snapshot' | 'transaction' | 'configuration' | 'policy' | 'procedure' | 'report';
  description: string;
  format: string[];
  retention_period: string;
  collection_method: 'automatic' | 'manual' | 'triggered';
  sensitivity: 'public' | 'internal' | 'confidential' | 'restricted';
  integrity_requirements: {
    cryptographic_signing: boolean;
    tamper_evident_storage: boolean;
    chain_of_custody: boolean;
    version_control: boolean;
}
}
  };
}

}
}
export interface ComplianceFramework {
  id: string;
  name: string;
  version: string;
  authority: string;
  description: string;
  scope: string[];
  mandatory_evidence: string[];
  optional_evidence: string[];
  audit_frequency: string;
  reporting_requirements: {
    frequency: string;
    format: string[];
    recipients: string[];
    retention_period: string;
}
}
  };
}

}
}
export interface AuditRequirement {
  id: string;
  framework_id: string;
  control_id: string;
  title: string;
  description: string;
  evidence_types: string[];
  collection_frequency: string;
  validation_criteria: string[];
  criticality: 'low' | 'medium' | 'high' | 'critical';
  automated_collection: boolean;
  manual_verification_required: boolean;
}
}
}

}
}
export interface EvidenceMapping {
  evidence_type_id: string;
  audit_requirement_id: string;
  mapping_type: 'direct' | 'supporting' | 'corroborating';
  coverage_level: 'full' | 'partial' | 'supplemental';
  collection_priority: number;
  validation_rules: string[];
  dependencies: string[];
  alternatives: string[];
}
}
}

}
}
export interface EvidenceGap {
  audit_requirement_id: string;
  missing_evidence_types: string[];
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  remediation_suggestions: string[];
  deadline: string;
  responsible_party: string;
}
}
}

}
}
export interface AuditTrail {
  id: string;
  evidence_type_id: string;
  collection_timestamp: string;
  collection_method: string;
  collector_id: string;
  evidence_location: string;
  integrity_hash: string;
  signature: string;
  chain_of_custody: {
    timestamp: string;
    actor: string;
    action: string;
    reason: string;
}
}
  }[];
  validation_status: 'pending' | 'validated' | 'invalid' | 'expired';
  retention_expiry: string;
}

export class AuditEvidenceMapper {
  private evidenceTypes: Map<string, EvidenceType> = new Map();
  private complianceFrameworks: Map<string, ComplianceFramework> = new Map();
  private auditRequirements: Map<string, AuditRequirement> = new Map();
  private evidenceMappings: EvidenceMapping[] = [];
  private auditTrails: Map<string, AuditTrail> = new Map();

  constructor() {
    this.initializeStandardFrameworks();
    this.initializeEvidenceTypes();
    this.initializeAuditRequirements();
    this.initializeEvidenceMappings();
  }

  /**
   * Initialize standard compliance frameworks
   */
  private initializeStandardFrameworks(): void {
    const frameworks: ComplianceFramework[] = [
      {
        id: 'gdpr-2018',
        name: 'General Data Protection Regulation',
        version: '2018',
        authority: 'European Union',
        description: 'EU regulation on data protection and privacy',
        scope: ['data_processing', 'privacy_rights', 'consent_management'],
        mandatory_evidence: ['consent_records', 'data_processing_logs', 'privacy_policies'],
        optional_evidence: ['data_impact_assessments', 'breach_notifications'],
        audit_frequency: 'annual',
        reporting_requirements: {
          frequency: 'annual',
          format: ['pdf', 'xml'],
          recipients: ['data_protection_authority', 'executive_team'],
          retention_period: '7_years'
        }
  }
      {
        id: 'soc2-2017',
        name: 'Service Organization Control 2',
        version: '2017',
        authority: 'AICPA',
        description: 'Trust services criteria for service organizations',
        scope: ['security', 'availability', 'processing_integrity', 'confidentiality', 'privacy'],
        mandatory_evidence: ['security_logs', 'access_logs', 'change_management_records'],
        optional_evidence: ['penetration_test_reports', 'vulnerability_assessments'],
        audit_frequency: 'annual',
        reporting_requirements: {
          frequency: 'annual',
          format: ['pdf'],
          recipients: ['audit_committee', 'customers'],
          retention_period: '5_years'
        }
  }
      {
        id: 'iso27001-2022',
        name: 'ISO/IEC 27001',
        version: '2022',
        authority: 'ISO',
        description: 'Information security management systems',
        scope: ['information_security', 'risk_management', 'security_controls'],
        mandatory_evidence: ['risk_assessments', 'security_policies', 'incident_reports'],
        optional_evidence: ['security_training_records', 'vendor_assessments'],
        audit_frequency: 'annual',
        reporting_requirements: {
          frequency: 'annual',
          format: ['pdf', 'xml'],
          recipients: ['certification_body', 'management'],
          retention_period: '6_years'
        }
  }
      {
        id: 'hipaa-1996',
        name: 'Health Insurance Portability and Accountability Act',
        version: '1996',
        authority: 'US Department of Health and Human Services',
        description: 'Healthcare data protection and privacy',
        scope: ['healthcare_data', 'patient_privacy', 'data_security'],
        mandatory_evidence: ['access_logs', 'encryption_records', 'breach_assessments'],
        optional_evidence: ['training_records', 'business_associate_agreements'],
        audit_frequency: 'annual',
        reporting_requirements: {
          frequency: 'annual',
          format: ['pdf'],
          recipients: ['hhs', 'compliance_officer'],
          retention_period: '6_years'
        }
      }
    ];

    frameworks.forEach(framework => {
      this.complianceFrameworks.set(framework.id, framework);
    });
  }

  /**
   * Initialize standard evidence types
   */
  private initializeEvidenceTypes(): void {
    const evidenceTypes: EvidenceType[] = [
      {
        id: 'access_logs',
        name: 'Access Logs',
        category: 'log',
        description: 'System and application access logs',
        format: ['json', 'csv', 'syslog'],
        retention_period: '1_year',
        collection_method: 'automatic',
        sensitivity: 'confidential',
        integrity_requirements: {
          cryptographic_signing: true,
          tamper_evident_storage: true,
          chain_of_custody: true,
          version_control: false
        }
  }
      {
        id: 'security_logs',
        name: 'Security Event Logs',
        category: 'log',
        description: 'Security-related events and incidents',
        format: ['json', 'xml', 'siem'],
        retention_period: '2_years',
        collection_method: 'automatic',
        sensitivity: 'restricted',
        integrity_requirements: {
          cryptographic_signing: true,
          tamper_evident_storage: true,
          chain_of_custody: true,
          version_control: false
        }
  }
      {
        id: 'consent_records',
        name: 'Consent Records',
        category: 'transaction',
        description: 'User consent and preference records',
        format: ['json', 'xml'],
        retention_period: '7_years',
        collection_method: 'automatic',
        sensitivity: 'confidential',
        integrity_requirements: {
          cryptographic_signing: true,
          tamper_evident_storage: true,
          chain_of_custody: true,
          version_control: true
        }
  }
      {
        id: 'configuration_snapshots',
        name: 'System Configuration Snapshots',
        category: 'snapshot',
        description: 'Point-in-time system configuration records',
        format: ['json', 'yaml', 'xml'],
        retention_period: '3_years',
        collection_method: 'triggered',
        sensitivity: 'internal',
        integrity_requirements: {
          cryptographic_signing: true,
          tamper_evident_storage: true,
          chain_of_custody: false,
          version_control: true
        }
  }
      {
        id: 'policy_documents',
        name: 'Policy Documents',
        category: 'policy',
        description: 'Organizational policies and procedures',
        format: ['pdf', 'docx', 'html'],
        retention_period: '10_years',
        collection_method: 'manual',
        sensitivity: 'internal',
        integrity_requirements: {
          cryptographic_signing: true,
          tamper_evident_storage: true,
          chain_of_custody: true,
          version_control: true
        }
  }
      {
        id: 'risk_assessments',
        name: 'Risk Assessment Reports',
        category: 'report',
        description: 'Security and privacy risk assessments',
        format: ['pdf', 'docx'],
        retention_period: '5_years',
        collection_method: 'manual',
        sensitivity: 'confidential',
        integrity_requirements: {
          cryptographic_signing: true,
          tamper_evident_storage: true,
          chain_of_custody: true,
          version_control: true
        }
  }
      {
        id: 'incident_reports',
        name: 'Security Incident Reports',
        category: 'report',
        description: 'Security incident documentation and analysis',
        format: ['pdf', 'json'],
        retention_period: '7_years',
        collection_method: 'manual',
        sensitivity: 'restricted',
        integrity_requirements: {
          cryptographic_signing: true,
          tamper_evident_storage: true,
          chain_of_custody: true,
          version_control: true
        }
  }
      {
        id: 'training_records',
        name: 'Security Training Records',
        category: 'transaction',
        description: 'Employee security training completion records',
        format: ['json', 'csv'],
        retention_period: '3_years',
        collection_method: 'automatic',
        sensitivity: 'internal',
        integrity_requirements: {
          cryptographic_signing: false,
          tamper_evident_storage: true,
          chain_of_custody: false,
          version_control: false
        }
      }
    ];

    evidenceTypes.forEach(evidenceType => {
      this.evidenceTypes.set(evidenceType.id, evidenceType);
    });
  }

  /**
   * Initialize audit requirements for compliance frameworks
   */
  private initializeAuditRequirements(): void {
    const requirements: AuditRequirement[] = [
      {
        id: 'gdpr_consent_tracking',
        framework_id: 'gdpr-2018',
        control_id: 'Art.7',
        title: 'Consent Tracking and Management',
        description: 'Demonstrate lawful basis for processing personal data',
        evidence_types: ['consent_records', 'privacy_policies', 'data_processing_logs'],
        collection_frequency: 'continuous',
        validation_criteria: ['valid_consent_recorded', 'withdrawal_mechanism_available'],
        criticality: 'critical',
        automated_collection: true,
        manual_verification_required: true
  }
      {
        id: 'soc2_access_control',
        framework_id: 'soc2-2017',
        control_id: 'CC6.1',
        title: 'Logical and Physical Access Controls',
        description: 'Restrict access to system resources',
        evidence_types: ['access_logs', 'configuration_snapshots', 'policy_documents'],
        collection_frequency: 'continuous',
        validation_criteria: ['access_properly_restricted', 'periodic_access_review'],
        criticality: 'high',
        automated_collection: true,
        manual_verification_required: false
  }
      {
        id: 'iso27001_incident_management',
        framework_id: 'iso27001-2022',
        control_id: 'A.16.1',
        title: 'Information Security Incident Management',
        description: 'Manage information security incidents',
        evidence_types: ['incident_reports', 'security_logs', 'training_records'],
        collection_frequency: 'triggered',
        validation_criteria: ['incidents_properly_documented', 'response_procedures_followed'],
        criticality: 'high',
        automated_collection: false,
        manual_verification_required: true
  }
      {
        id: 'hipaa_audit_controls',
        framework_id: 'hipaa-1996',
        control_id: '164.312(b)',
        title: 'Audit Controls',
        description: 'Audit and monitor access to ePHI',
        evidence_types: ['access_logs', 'security_logs', 'configuration_snapshots'],
        collection_frequency: 'continuous',
        validation_criteria: ['all_access_logged', 'logs_regularly_reviewed'],
        criticality: 'critical',
        automated_collection: true,
        manual_verification_required: true
      }
    ];

    requirements.forEach(requirement => {
      this.auditRequirements.set(requirement.id, requirement);
    });
  }

  /**
   * Initialize evidence mappings
   */
  private initializeEvidenceMappings(): void {
    this.evidenceMappings = [
      {
        evidence_type_id: 'access_logs',
        audit_requirement_id: 'soc2_access_control',
        mapping_type: 'direct',
        coverage_level: 'full',
        collection_priority: 1,
        validation_rules: ['timestamp_present', 'user_identified', 'action_logged'],
        dependencies: ['configuration_snapshots'],
        alternatives: []
  }
      {
        evidence_type_id: 'consent_records',
        audit_requirement_id: 'gdpr_consent_tracking',
        mapping_type: 'direct',
        coverage_level: 'full',
        collection_priority: 1,
        validation_rules: ['consent_timestamp', 'purpose_specified', 'withdrawal_option'],
        dependencies: ['privacy_policies'],
        alternatives: []
  }
      {
        evidence_type_id: 'security_logs',
        audit_requirement_id: 'hipaa_audit_controls',
        mapping_type: 'direct',
        coverage_level: 'full',
        collection_priority: 1,
        validation_rules: ['phi_access_logged', 'security_events_captured'],
        dependencies: ['access_logs'],
        alternatives: []
  }
      {
        evidence_type_id: 'incident_reports',
        audit_requirement_id: 'iso27001_incident_management',
        mapping_type: 'direct',
        coverage_level: 'full',
        collection_priority: 1,
        validation_rules: ['incident_documented', 'response_actions_recorded'],
        dependencies: ['security_logs'],
        alternatives: []
      }
    ];
  }

  /**
   * Get evidence mapping for an audit requirement
   */
  public getEvidenceMappingForRequirement(requirementId: string): EvidenceMapping[] {
    return this.evidenceMappings.filter(mapping => 
      mapping.audit_requirement_id === requirementId
    );
  }

  /**
   * Get audit requirements for a compliance framework
   */
  public getRequirementsForFramework(frameworkId: string): AuditRequirement[] {
    return Array.from(this.auditRequirements.values()).filter(req => 
      req.framework_id === frameworkId
    );
  }

  /**
   * Get evidence types for an audit requirement
   */
  public getEvidenceTypesForRequirement(requirementId: string): EvidenceType[] {
    const requirement = this.auditRequirements.get(requirementId);
    if (!requirement) return [];

    return requirement.evidence_types
      .map(typeId => this.evidenceTypes.get(typeId))
      .filter(type => type !== undefined) as EvidenceType[];
  }

  /**
   * Identify evidence gaps for compliance frameworks
   */
  public identifyEvidenceGaps(frameworkId: string): EvidenceGap[] {
    const requirements = this.getRequirementsForFramework(frameworkId);
    const gaps: EvidenceGap[] = [];

    requirements.forEach(requirement => {
      const mappings = this.getEvidenceMappingForRequirement(requirement.id);
      const mappedEvidenceTypes = mappings.map(m => m.evidence_type_id);
      const requiredEvidenceTypes = requirement.evidence_types;
      
      const missingTypes = requiredEvidenceTypes.filter(type => 
        !mappedEvidenceTypes.includes(type)
      );

      if (missingTypes.length > 0) {
        gaps.push({
          audit_requirement_id: requirement.id,
          missing_evidence_types: missingTypes,
          risk_level: requirement.criticality === 'critical' ? 'critical' : 'high',
          remediation_suggestions: this.generateRemediationSuggestions(missingTypes),
          deadline: this.calculateRemediationDeadline(requirement.criticality),
          responsible_party: 'compliance_team'
        });
      }
    });

    return gaps;
  }

  /**
   * Generate remediation suggestions for missing evidence types
   */
  private generateRemediationSuggestions(missingTypes: string[]): string[] {
    const suggestions: string[] = [];
    
    missingTypes.forEach(typeId => {
      const evidenceType = this.evidenceTypes.get(typeId);
      if (evidenceType) {
        switch (evidenceType.collection_method) {
        case 'automatic':
          suggestions.push(`Configure automated collection for ${evidenceType.name}`);
          break;
        case 'manual':
          suggestions.push(`Establish manual collection process for ${evidenceType.name}`);
          break;
        case 'triggered':
          suggestions.push(`Set up triggered collection for ${evidenceType.name}`);
          break;
        }
      }
    });

    return suggestions;
  }

  /**
   * Calculate remediation deadline based on criticality
   */
  private calculateRemediationDeadline(criticality: string): string {
    const now = new Date();
    let daysToAdd = 30; // default

    switch (criticality) {
    case 'critical':
      daysToAdd = 7;
      break;
    case 'high':
      daysToAdd = 14;
      break;
    case 'medium':
      daysToAdd = 30;
      break;
    case 'low':
      daysToAdd = 60;
      break;
    }

    const deadline = new Date(now.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
    return deadline.toISOString().split('T')[0];
  }

  /**
   * Generate comprehensive evidence mapping report
   */
  public generateEvidenceMappingReport(frameworkId?: string): {
    frameworks: ComplianceFramework[];
    evidence_types: EvidenceType[];
    audit_requirements: AuditRequirement[];
    evidence_mappings: EvidenceMapping[];
    evidence_gaps: EvidenceGap[];
    coverage_analysis: {
      framework_id: string;
      total_requirements: number;
      mapped_requirements: number;
      coverage_percentage: number;
      critical_gaps: number;
    }[];
  } {
    const frameworks = frameworkId 
      ? [this.complianceFrameworks.get(frameworkId)].filter(f => f !== undefined) as ComplianceFramework[]
      : Array.from(this.complianceFrameworks.values());

    const evidenceTypes = Array.from(this.evidenceTypes.values());
    const auditRequirements = frameworkId
      ? this.getRequirementsForFramework(frameworkId)
      : Array.from(this.auditRequirements.values());

    const evidenceMappings = this.evidenceMappings;
    const evidenceGaps = frameworkId
      ? this.identifyEvidenceGaps(frameworkId)
      : frameworks.flatMap(f => this.identifyEvidenceGaps(f.id));

    const coverageAnalysis = frameworks.map(framework => {
      const requirements = this.getRequirementsForFramework(framework.id);
      const mappedRequirements = requirements.filter(req => 
        this.getEvidenceMappingForRequirement(req.id).length > 0
      );
      const gaps = this.identifyEvidenceGaps(framework.id);
      const criticalGaps = gaps.filter(gap => gap.risk_level === 'critical').length;

      return {
        framework_id: framework.id,
        total_requirements: requirements.length,
        mapped_requirements: mappedRequirements.length,
        coverage_percentage: requirements.length > 0 ? 
          Math.round((mappedRequirements.length / requirements.length) * 100) : 0,
        critical_gaps: criticalGaps
      };
    });

    return {
      frameworks,
      evidence_types: evidenceTypes,
      audit_requirements: auditRequirements,
      evidence_mappings: evidenceMappings,
      evidence_gaps: evidenceGaps,
      coverage_analysis: coverageAnalysis
    };
  }

  /**
   * Record evidence collection in audit trail
   */
  public recordEvidenceCollection(
    evidenceTypeId: string,
    collectorId: string,
    evidenceLocation: string,
    integrityHash: string,
    signature: string
  ): string {
    const trailId = `trail_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const trail: AuditTrail = {
      id: trailId,
      evidence_type_id: evidenceTypeId,
      collection_timestamp: new Date().toISOString(),
      collection_method: 'automated',
      collector_id: collectorId,
      evidence_location: evidenceLocation,
      integrity_hash: integrityHash,
      signature: signature,
      chain_of_custody: [{
        timestamp: new Date().toISOString(),
        actor: collectorId,
        action: 'evidence_collected',
        reason: 'automated_collection'
      }],
      validation_status: 'pending',
      retention_expiry: this.calculateRetentionExpiry(evidenceTypeId)
    };

    this.auditTrails.set(trailId, trail);
    return trailId;
  }

  /**
   * Calculate retention expiry for evidence type
   */
  private calculateRetentionExpiry(evidenceTypeId: string): string {
    const evidenceType = this.evidenceTypes.get(evidenceTypeId);
    if (!evidenceType) return new Date().toISOString();

    const now = new Date();
    let monthsToAdd = 12; // default 1 year

    switch (evidenceType.retention_period) {
    case '1_year':
      monthsToAdd = 12;
      break;
    case '2_years':
      monthsToAdd = 24;
      break;
    case '3_years':
      monthsToAdd = 36;
      break;
    case '5_years':
      monthsToAdd = 60;
      break;
    case '7_years':
      monthsToAdd = 84;
      break;
    case '10_years':
      monthsToAdd = 120;
      break;
    }

    const expiry = new Date(now.getFullYear(), now.getMonth() + monthsToAdd, now.getDate());
    return expiry.toISOString();
  }

  /**
   * Validate evidence mapping completeness
   */
  public validateMappingCompleteness(frameworkId: string): {
    is_complete: boolean;
    missing_mappings: string[];
    redundant_mappings: string[];
    validation_errors: string[];
  } {
    const requirements = this.getRequirementsForFramework(frameworkId);
    const framework = this.complianceFrameworks.get(frameworkId);
    
    if (!framework) {
      return {
        is_complete: false,
        missing_mappings: [],
        redundant_mappings: [],
        validation_errors: [`Framework ${frameworkId} not found`]
      };
    }

    const missingMappings: string[] = [];
    const validationErrors: string[] = [];

    // Check for missing mappings
    requirements.forEach(requirement => {
      const mappings = this.getEvidenceMappingForRequirement(requirement.id);
      if (mappings.length === 0) {
        missingMappings.push(requirement.id);
      }

      // Validate each mapping
      mappings.forEach(mapping => {
        if (!this.evidenceTypes.has(mapping.evidence_type_id)) {
          validationErrors.push(`Evidence type ${mapping.evidence_type_id} not found for requirement ${requirement.id}`);
        }
      });
    });

    // Check for redundant mappings (mappings to non-existent requirements)
    const redundantMappings = this.evidenceMappings
      .filter(mapping => mapping.audit_requirement_id.includes(frameworkId))
      .filter(mapping => !requirements.some(req => req.id === mapping.audit_requirement_id))
      .map(mapping => mapping.audit_requirement_id);

    return {
      is_complete: missingMappings.length === 0 && validationErrors.length === 0,
      missing_mappings: missingMappings,
      redundant_mappings: redundantMappings,
      validation_errors: validationErrors
    };
  }
}

export default AuditEvidenceMapper;