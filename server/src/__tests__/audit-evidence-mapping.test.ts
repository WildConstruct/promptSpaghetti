/**
 * Audit Evidence Mapping Tests
 * 
 * Comprehensive test suite for audit evidence mapping functionality,
 * compliance framework management, and evidence collection tracking.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import AuditEvidenceMapper, {
  EvidenceType,
  ComplianceFramework,
  AuditRequirement,
  EvidenceMapping,
  EvidenceGap
 from '../services/AuditEvidenceMapper';

describe('AuditEvidenceMapper', () => {
  let evidenceMapper: AuditEvidenceMapper;

  beforeEach(() => {
    evidenceMapper = new AuditEvidenceMapper();
  });

  afterEach(() => {
    // Cleanup if needed
  });

  describe('Framework Management', () => {
    it('should load standard compliance frameworks', () => {
      const report = evidenceMapper.generateEvidenceMappingReport();
      
      expect(report.frameworks).toHaveLength(4);
      expect(report.frameworks.map(f => f.id)).toEqual(
        expect.arrayContaining(['gdpr-2018', 'soc2-2017', 'iso27001-2022', 'hipaa-1996'])
      );
    });

    it('should retrieve requirements for specific framework', () => {
      const gdprRequirements = evidenceMapper.getRequirementsForFramework('gdpr-2018');
      
      expect(gdprRequirements).toHaveLength(1);
      expect(gdprRequirements[0].id).toBe('gdpr_consent_tracking');
      expect(gdprRequirements[0].framework_id).toBe('gdpr-2018');
      expect(gdprRequirements[0].criticality).toBe('critical');
    });

    it('should return empty array for non-existent framework', () => {
      const requirements = evidenceMapper.getRequirementsForFramework('non-existent');
      expect(requirements).toHaveLength(0);
    });

    it('should validate framework contains required properties', () => {
      const report = evidenceMapper.generateEvidenceMappingReport('gdpr-2018');
      const gdprFramework = report.frameworks[0];
      
      expect(gdprFramework).toHaveProperty('id');
      expect(gdprFramework).toHaveProperty('name');
      expect(gdprFramework).toHaveProperty('version');
      expect(gdprFramework).toHaveProperty('authority');
      expect(gdprFramework).toHaveProperty('mandatory_evidence');
      expect(gdprFramework).toHaveProperty('reporting_requirements');
      expect(gdprFramework.mandatory_evidence).toContain('consent_records');
    });
  });

  describe('Evidence Type Management', () => {
    it('should load standard evidence types', () => {
      const report = evidenceMapper.generateEvidenceMappingReport();
      
      expect(report.evidence_types.length).toBeGreaterThan(0);
      expect(report.evidence_types.map(e => e.id)).toEqual(
        expect.arrayContaining(['access_logs', 'security_logs', 'consent_records'])
      );
    });

    it('should categorize evidence types correctly', () => {
      const report = evidenceMapper.generateEvidenceMappingReport();
      const categories = ['log', 'snapshot', 'transaction', 'configuration', 'policy', 'procedure', 'report'];
      
      report.evidence_types.forEach(evidenceType => {
        expect(categories).toContain(evidenceType.category);
      });
    });

    it('should assign sensitivity levels correctly', () => {
      const report = evidenceMapper.generateEvidenceMappingReport();
      const sensitivityLevels = ['public', 'internal', 'confidential', 'restricted'];
      
      report.evidence_types.forEach(evidenceType => {
        expect(sensitivityLevels).toContain(evidenceType.sensitivity);
      });
    });

    it('should define integrity requirements for sensitive evidence', () => {
      const report = evidenceMapper.generateEvidenceMappingReport();
      const securityLogs = report.evidence_types.find(e => e.id === 'security_logs');
      
      expect(securityLogs).toBeDefined();
      expect(securityLogs!.sensitivity).toBe('restricted');
      expect(securityLogs!.integrity_requirements.cryptographic_signing).toBe(true);
      expect(securityLogs!.integrity_requirements.tamper_evident_storage).toBe(true);
      expect(securityLogs!.integrity_requirements.chain_of_custody).toBe(true);
    });
  });

  describe('Evidence Mapping', () => {
    it('should map evidence types to audit requirements', () => {
      const mappings = evidenceMapper.getEvidenceMappingForRequirement('gdpr_consent_tracking');
      
      expect(mappings).toHaveLength(1);
      expect(mappings[0].evidence_type_id).toBe('consent_records');
      expect(mappings[0].mapping_type).toBe('direct');
      expect(mappings[0].coverage_level).toBe('full');
    });

    it('should retrieve evidence types for audit requirement', () => {
      const evidenceTypes = evidenceMapper.getEvidenceTypesForRequirement('soc2_access_control');
      
      expect(evidenceTypes.length).toBeGreaterThan(0);
      expect(evidenceTypes.map(e => e.id)).toContain('access_logs');
      expect(evidenceTypes.map(e => e.id)).toContain('configuration_snapshots');
    });

    it('should validate mapping completeness', () => {
      const validation = evidenceMapper.validateMappingCompleteness('gdpr-2018');
      
      expect(validation).toHaveProperty('is_complete');
      expect(validation).toHaveProperty('missing_mappings');
      expect(validation).toHaveProperty('validation_errors');
      expect(Array.isArray(validation.missing_mappings)).toBe(true);
      expect(Array.isArray(validation.validation_errors)).toBe(true);
    });

    it('should detect invalid framework in validation', () => {
      const validation = evidenceMapper.validateMappingCompleteness('invalid-framework');
      
      expect(validation.is_complete).toBe(false);
      expect(validation.validation_errors.length).toBeGreaterThan(0);
      expect(validation.validation_errors[0]).toContain('Framework invalid-framework not found');
    });
  });

  describe('Evidence Gap Analysis', () => {
    it('should identify evidence gaps for frameworks', () => {
      const gaps = evidenceMapper.identifyEvidenceGaps('gdpr-2018');
      
      expect(Array.isArray(gaps)).toBe(true);
      gaps.forEach(gap => {
        expect(gap).toHaveProperty('audit_requirement_id');
        expect(gap).toHaveProperty('missing_evidence_types');
        expect(gap).toHaveProperty('risk_level');
        expect(gap).toHaveProperty('remediation_suggestions');
        expect(['low', 'medium', 'high', 'critical']).toContain(gap.risk_level);
      });
    });

    it('should prioritize critical gaps correctly', () => {
      const gaps = evidenceMapper.identifyEvidenceGaps('gdpr-2018');
      const criticalGaps = gaps.filter(gap => gap.risk_level === 'critical');
      
      // GDPR consent tracking is critical, so any gaps should be critical
      if (criticalGaps.length > 0) {
        expect(criticalGaps[0].audit_requirement_id).toContain('gdpr');

    });

    it('should generate remediation suggestions', () => {
      const gaps = evidenceMapper.identifyEvidenceGaps('soc2-2017');
      
      gaps.forEach(gap => {
        expect(gap.remediation_suggestions.length).toBeGreaterThan(0);
        gap.remediation_suggestions.forEach(suggestion => {
          expect(typeof suggestion).toBe('string');
          expect(suggestion.length).toBeGreaterThan(0);
        });
      });
    });

    it('should calculate appropriate remediation deadlines', () => {
      const gaps = evidenceMapper.identifyEvidenceGaps('iso27001-2022');
      
      gaps.forEach(gap => {
        expect(gap.deadline).toMatch(/^\d{4}-\d{2}-\d{2}$/); // YYYY-MM-DD format
        const deadlineDate = new Date(gap.deadline);
        const now = new Date();
        expect(deadlineDate.getTime()).toBeGreaterThan(now.getTime());
      });
    });
  });

  describe('Audit Trail Management', () => {
    it('should record evidence collection', () => {
      const trailId = evidenceMapper.recordEvidenceCollection(
        'access_logs',
        'test-collector',
        '/var/log/access.log',
        'sha256:abcd1234',
        'signature123'
      );
      
      expect(trailId).toBeDefined();
      expect(typeof trailId).toBe('string');
      expect(trailId.startsWith('trail_')).toBe(true);
    });

    it('should generate unique trail IDs', () => {
      const trailId1 = evidenceMapper.recordEvidenceCollection(
        'access_logs',
        'collector1',
        '/path1',
        'hash1',
        'sig1'
      );
      
      const trailId2 = evidenceMapper.recordEvidenceCollection(
        'access_logs',
        'collector2',
        '/path2',
        'hash2',
        'sig2'
      );
      
      expect(trailId1).not.toBe(trailId2);
    });

    it('should handle evidence collection with minimal data', () => {
      const trailId = evidenceMapper.recordEvidenceCollection(
        'security_logs',
        'auto-collector',
        '/tmp/security.log',
        'sha256:xyz789',
        ''
      );
      
      expect(trailId).toBeDefined();
      expect(typeof trailId).toBe('string');
    });
  });

  describe('Comprehensive Reporting', () => {
    it('should generate complete evidence mapping report', () => {
      const report = evidenceMapper.generateEvidenceMappingReport();
      
      expect(report).toHaveProperty('frameworks');
      expect(report).toHaveProperty('evidence_types');
      expect(report).toHaveProperty('audit_requirements');
      expect(report).toHaveProperty('evidence_mappings');
      expect(report).toHaveProperty('evidence_gaps');
      expect(report).toHaveProperty('coverage_analysis');
      
      expect(Array.isArray(report.frameworks)).toBe(true);
      expect(Array.isArray(report.evidence_types)).toBe(true);
      expect(Array.isArray(report.audit_requirements)).toBe(true);
      expect(Array.isArray(report.evidence_mappings)).toBe(true);
      expect(Array.isArray(report.evidence_gaps)).toBe(true);
      expect(Array.isArray(report.coverage_analysis)).toBe(true);
    });

    it('should generate framework-specific report', () => {
      const report = evidenceMapper.generateEvidenceMappingReport('gdpr-2018');
      
      expect(report.frameworks).toHaveLength(1);
      expect(report.frameworks[0].id).toBe('gdpr-2018');
      
      // Audit requirements should be filtered to GDPR only
      report.audit_requirements.forEach(req => {
        expect(req.framework_id).toBe('gdpr-2018');
      });
    });

    it('should calculate coverage analysis correctly', () => {
      const report = evidenceMapper.generateEvidenceMappingReport();
      
      report.coverage_analysis.forEach(analysis => {
        expect(analysis).toHaveProperty('framework_id');
        expect(analysis).toHaveProperty('total_requirements');
        expect(analysis).toHaveProperty('mapped_requirements');
        expect(analysis).toHaveProperty('coverage_percentage');
        expect(analysis).toHaveProperty('critical_gaps');
        
        expect(typeof analysis.total_requirements).toBe('number');
        expect(typeof analysis.mapped_requirements).toBe('number');
        expect(typeof analysis.coverage_percentage).toBe('number');
        expect(typeof analysis.critical_gaps).toBe('number');
        
        expect(analysis.coverage_percentage).toBeGreaterThanOrEqual(0);
        expect(analysis.coverage_percentage).toBeLessThanOrEqual(100);
        expect(analysis.mapped_requirements).toBeLessThanOrEqual(analysis.total_requirements);
      });
    });

    it('should handle empty framework filter gracefully', () => {
      const report = evidenceMapper.generateEvidenceMappingReport('');
      
      // Should return all frameworks when empty string is provided
      expect(report.frameworks.length).toBeGreaterThan(1);
    });
  });

  describe('Integration and Edge Cases', () => {
    it('should handle non-existent evidence types in mappings', () => {
      const evidenceTypes = evidenceMapper.getEvidenceTypesForRequirement('non-existent-requirement');
      expect(evidenceTypes).toHaveLength(0);
    });

    it('should handle framework with no requirements', () => {
      const gaps = evidenceMapper.identifyEvidenceGaps('non-existent-framework');
      expect(gaps).toHaveLength(0);
    });

    it('should maintain data consistency across operations', () => {
      const report1 = evidenceMapper.generateEvidenceMappingReport();
      const report2 = evidenceMapper.generateEvidenceMappingReport();
      
      expect(report1.frameworks.length).toBe(report2.frameworks.length);
      expect(report1.evidence_types.length).toBe(report2.evidence_types.length);
      expect(report1.audit_requirements.length).toBe(report2.audit_requirements.length);
    });

    it('should validate evidence type integrity requirements', () => {
      const report = evidenceMapper.generateEvidenceMappingReport();
      
      report.evidence_types.forEach(evidenceType => {
        expect(evidenceType.integrity_requirements).toHaveProperty('cryptographic_signing');
        expect(evidenceType.integrity_requirements).toHaveProperty('tamper_evident_storage');
        expect(evidenceType.integrity_requirements).toHaveProperty('chain_of_custody');
        expect(evidenceType.integrity_requirements).toHaveProperty('version_control');
        
        expect(typeof evidenceType.integrity_requirements.cryptographic_signing).toBe('boolean');
        expect(typeof evidenceType.integrity_requirements.tamper_evident_storage).toBe('boolean');
        expect(typeof evidenceType.integrity_requirements.chain_of_custody).toBe('boolean');
        expect(typeof evidenceType.integrity_requirements.version_control).toBe('boolean');
      });
    });

    it('should handle multiple evidence collection records', () => {
      const trails = [];
      
      for (let i = 0; i < 5; i++) {
        const trailId = evidenceMapper.recordEvidenceCollection(
          'access_logs',
          `collector-${i}`,
          `/path/file-${i}.log`,
          `hash-${i}`,
          `signature-${i}`
        );
        trails.push(trailId);

      
      expect(trails).toHaveLength(5);
      const uniqueTrails = new Set(trails);
      expect(uniqueTrails.size).toBe(5); // All should be unique
    });

    it('should handle missing dependencies in evidence mappings', () => {
      const mappings = evidenceMapper.getEvidenceMappingForRequirement('soc2_access_control');
      
      mappings.forEach(mapping => {
        expect(Array.isArray(mapping.dependencies)).toBe(true);
        expect(Array.isArray(mapping.alternatives)).toBe(true);
        expect(Array.isArray(mapping.validation_rules)).toBe(true);
      });
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large-scale report generation efficiently', () => {
      const startTime = Date.now();
      const report = evidenceMapper.generateEvidenceMappingReport();
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
      expect(report.frameworks.length).toBeGreaterThan(0);
    });

    it('should handle multiple concurrent evidence recordings', () => {
      const promises = [];
      
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(
            evidenceMapper.recordEvidenceCollection(
              'security_logs',
              `concurrent-collector-${i}`,
              `/concurrent/path-${i}`,
              `concurrent-hash-${i}`,
              `concurrent-sig-${i}`


        );

      
      return Promise.all(promises).then(trailIds => {
        expect(trailIds).toHaveLength(10);
        const uniqueIds = new Set(trailIds);
        expect(uniqueIds.size).toBe(10);
      });
    });

    it('should efficiently filter large datasets', () => {
      const startTime = Date.now();
      
      // Test filtering across all frameworks
      const allGaps = evidenceMapper.generateEvidenceMappingReport().frameworks
        .flatMap(f => evidenceMapper.identifyEvidenceGaps(f.id));
      
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(500); // Should be fast even with multiple frameworks
      expect(Array.isArray(allGaps)).toBe(true);
    });
  });
});

// Mock data validation tests
describe('AuditEvidenceMapper Data Validation', () => {
  let evidenceMapper: AuditEvidenceMapper;

  beforeEach(() => {
    evidenceMapper = new AuditEvidenceMapper();
  });

  it('should validate compliance framework data structure', () => {
    const report = evidenceMapper.generateEvidenceMappingReport();
    
    report.frameworks.forEach(framework => {
      // Required fields
      expect(framework.id).toBeTruthy();
      expect(framework.name).toBeTruthy();
      expect(framework.version).toBeTruthy();
      expect(framework.authority).toBeTruthy();
      
      // Array fields
      expect(Array.isArray(framework.scope)).toBe(true);
      expect(Array.isArray(framework.mandatory_evidence)).toBe(true);
      expect(Array.isArray(framework.optional_evidence)).toBe(true);
      
      // Reporting requirements
      expect(framework.reporting_requirements).toHaveProperty('frequency');
      expect(framework.reporting_requirements).toHaveProperty('format');
      expect(framework.reporting_requirements).toHaveProperty('recipients');
      expect(framework.reporting_requirements).toHaveProperty('retention_period');
    });
  });

  it('should validate evidence type data consistency', () => {
    const report = evidenceMapper.generateEvidenceMappingReport();
    
    report.evidence_types.forEach(evidenceType => {
      // Required fields
      expect(evidenceType.id).toBeTruthy();
      expect(evidenceType.name).toBeTruthy();
      expect(evidenceType.category).toBeTruthy();
      expect(evidenceType.retention_period).toBeTruthy();
      
      // Enum validation
      expect(['automatic', 'manual', 'triggered']).toContain(evidenceType.collection_method);
      expect(['public', 'internal', 'confidential', 'restricted']).toContain(evidenceType.sensitivity);
      expect(['log', 'snapshot', 'transaction', 'configuration', 'policy', 'procedure', 'report'])
        .toContain(evidenceType.category);
      
      // Array validation
      expect(Array.isArray(evidenceType.format)).toBe(true);
      expect(evidenceType.format.length).toBeGreaterThan(0);
    });
  });

  it('should validate audit requirement criticality levels', () => {
    const report = evidenceMapper.generateEvidenceMappingReport();
    
    report.audit_requirements.forEach(requirement => {
      expect(['low', 'medium', 'high', 'critical']).toContain(requirement.criticality);
      expect(Array.isArray(requirement.evidence_types)).toBe(true);
      expect(Array.isArray(requirement.validation_criteria)).toBe(true);
      expect(typeof requirement.automated_collection).toBe('boolean');
      expect(typeof requirement.manual_verification_required).toBe('boolean');
    });
  });
});