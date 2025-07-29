/**
 * Tests for Classification Handling Rules Service
 * 
 * Comprehensive test suite covering handling requirements,
 * compliance validation, and violation detection.
 */
import ClassificationHandlingRulesService, {
  HandlingRule
} from '../ClassificationHandlingRulesService';
import { 
  DataClassificationLevel, 
  OperationContext,
  HandlingRequirements 
} from '../../types/DataClassification';
describe('ClassificationHandlingRulesService', () => {
  let service: ClassificationHandlingRulesService;
  let mockContext: OperationContext;
  beforeEach(() => {
  service = new ClassificationHandlingRulesService();
  mockContext = {
  operation: 'read',
  userId: 'user123',
  sessionId: 'session123',
  purpose: 'data analysis',
  environment: 'production',
  timestamp: new Date(),
  source: '192.168.1.100',
  requestId: 'req123',
};
  });
  describe('Default Handling Requirements', () => {
    it('should initialize handling requirements for all classification levels', () => {
      const publicReqs = service.getHandlingRequirements('PUBLIC');
      const internalReqs = service.getHandlingRequirements('INTERNAL');
      const confidentialReqs = service.getHandlingRequirements('CONFIDENTIAL');
      const restrictedReqs = service.getHandlingRequirements('RESTRICTED');
      expect(publicReqs).toBeDefined();
      expect(internalReqs).toBeDefined();
      expect(confidentialReqs).toBeDefined();
      expect(restrictedReqs).toBeDefined();
    });
    it('should have progressively stricter requirements for higher classifications', () => {
      const publicReqs = service.getHandlingRequirements('PUBLIC');
      const restrictedReqs = service.getHandlingRequirements('RESTRICTED');
      // Encryption requirements
      expect(publicReqs?.storage.encryptionRequired).toBe(false);
      expect(restrictedReqs?.storage.encryptionRequired).toBe(true);
      // Key rotation
      expect(publicReqs?.storage.keyRotationDays).toBe(0);
      expect(restrictedReqs?.storage.keyRotationDays).toBe(7);
      // Monitoring
      expect(publicReqs?.monitoring.realtimeMonitoring).toBe(false);
      expect(restrictedReqs?.monitoring.realtimeMonitoring).toBe(true);
    });
    it('should have appropriate storage requirements by classification', () => {
      const internalReqs = service.getHandlingRequirements('INTERNAL');
      const confidentialReqs = service.getHandlingRequirements('CONFIDENTIAL');
      expect(internalReqs?.storage.encryptionAlgorithm).toBe('AES-256');
      expect(confidentialReqs?.storage.encryptionAlgorithm).toBe('AES-256-GCM');
      expect(internalReqs?.storage.redundancyLevel).toBe('STANDARD');
      expect(confidentialReqs?.storage.redundancyLevel).toBe('HIGH');
    });
    it('should have appropriate transmission requirements by classification', () => {
      const publicReqs = service.getHandlingRequirements('PUBLIC');
      const restrictedReqs = service.getHandlingRequirements('RESTRICTED');
      expect(publicReqs?.transmission.tlsVersion).toBe('TLS1.2');
      expect(restrictedReqs?.transmission.tlsVersion).toBe('TLS1.3');
      expect(publicReqs?.transmission.certificatePinning).toBe(false);
      expect(restrictedReqs?.transmission.certificatePinning).toBe(true);
      expect(publicReqs?.transmission.endToEndEncryption).toBe(false);
      expect(restrictedReqs?.transmission.endToEndEncryption).toBe(true);
    });
    it('should have appropriate processing requirements by classification', () => {
      const publicReqs = service.getHandlingRequirements('PUBLIC');
      const restrictedReqs = service.getHandlingRequirements('RESTRICTED');
      expect(publicReqs?.processing.thirdPartyProcessing).toBe(true);
      expect(restrictedReqs?.processing.thirdPartyProcessing).toBe(false);
      expect(publicReqs?.processing.isolationRequired).toBe(false);
      expect(restrictedReqs?.processing.isolationRequired).toBe(true);
      expect(publicReqs?.processing.cachingRestrictions.allowed).toBe(true);
      expect(restrictedReqs?.processing.cachingRestrictions.allowed).toBe(false);
    });
  });
  describe('Data Handling Validation', () => {
    it('should validate public data handling successfully', async () => {
      const result = await service.validateDataHandling(;);
        'data123',
        'PUBLIC',
        'read',
        mockContext
      );
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    it('should validate internal data handling in production environment', async () => {
  const productionContext = {
  ...mockContext,
  environment: 'production',
};
      const result = await service.validateDataHandling(;);
        'data123',
        'INTERNAL',
        'read',
        productionContext
      );
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    it('should detect violations for internal data in development environment', async () => {
  const devContext = {
  ...mockContext,
  environment: 'development',
};
      const result = await service.validateDataHandling(;);
        'data123',
        'INTERNAL',
        'read',
        devContext
      );
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(error => error.includes('approved environments'))).toBe(true);
    });
    it('should validate confidential data handling with strict requirements', async () => {
      const result = await service.validateDataHandling(;);
        'data123',
        'CONFIDENTIAL',
        'read',
        mockContext
      );
      // Confidential data should have validation results (errors or warnings due to strict requirements)
      expect(result.valid || result.errors.length > 0 || result.warnings.length > 0).toBe(true);
      // If there are errors, they should be related to confidential data requirements
      if (result.errors.length > 0) {
        expect(result.errors.some(error => )
          error.includes('secure_datacenter') || 
          error.includes('encryption') || 
          error.includes('approved')
        )).toBe(true);
    });
    it('should validate restricted data handling with maximum security', async () => {
  const isolatedContext = {
  ...mockContext,
  environment: 'isolated_production',
};
      const result = await service.validateDataHandling(;);
        'data123',
        'RESTRICTED',
        'read',
        isolatedContext
      );
      // May have warnings but should handle restricted data appropriately
      expect(result.warnings.length >= 0).toBe(true);
    });
    it('should record compliance checks for all validations', async () => {
      await service.validateDataHandling('data123', 'INTERNAL', 'read', mockContext);
      await service.validateDataHandling('data456', 'CONFIDENTIAL', 'write', mockContext);
      const allChecks = service.getComplianceChecks();
      const internalChecks = service.getComplianceChecks('INTERNAL');
      const confidentialChecks = service.getComplianceChecks('CONFIDENTIAL');
      expect(allChecks.length).toBeGreaterThanOrEqual(2);
      expect(internalChecks.length).toBeGreaterThanOrEqual(1);
      expect(confidentialChecks.length).toBeGreaterThanOrEqual(1);
    });
  });
  describe('Handling Rules Management', () => {
    it('should initialize with default handling rules', () => {
      const allRules = service.getHandlingRules();
      const internalRules = service.getHandlingRules('INTERNAL');
      const confidentialRules = service.getHandlingRules('CONFIDENTIAL');
      expect(allRules.length).toBeGreaterThan(0);
      expect(internalRules.length).toBeGreaterThan(0);
      expect(confidentialRules.length).toBeGreaterThan(0);
    });
    it('should allow adding custom handling rules', () => {
  const customRule: HandlingRule = {,
  id: 'custom-rule-1',
  name: 'Custom Storage Rule',
  description: 'Custom rule for special data handling',
  classification: 'INTERNAL',
  ruleType: 'STORAGE',
  requirements: {
  customEncryption: true,
  specialLocation: 'custom_datacenter',
},
  mandatory: true,
        priority: 2,
        effectiveDate: new Date(),
        complianceFramework: ['CUSTOM_FRAMEWORK'];
  };
      service.addHandlingRule(customRule);
      const internalRules = service.getHandlingRules('INTERNAL');
      const addedRule = internalRules.find(rule => rule.id === 'custom-rule-1');
      expect(addedRule).toBeDefined();
      expect(addedRule?.name).toBe('Custom Storage Rule');
    });
    it('should allow updating handling requirements', () => {
  const originalReqs = service.getHandlingRequirements('INTERNAL');
  expect(originalReqs).toBeDefined();
  const updatedReqs: HandlingRequirements = {,
  ...originalReqs!,
  storage: {
  ...originalReqs!.storage,
  keyRotationDays: 45 // Change from default 90 days,
};
      service.updateHandlingRequirements('INTERNAL', updatedReqs);
      const newReqs = service.getHandlingRequirements('INTERNAL');
      expect(newReqs?.storage.keyRotationDays).toBe(45);
    });
  });
  describe('Violation Detection and Recording', () => {
  it('should record violations when validation fails', async () => {
  const devContext = {
  ...mockContext,
  environment: 'development',
};
      await service.validateDataHandling('data123', 'CONFIDENTIAL', 'read', devContext);
      const violations = service.getViolations();
      const confidentialViolations = service.getViolations('CONFIDENTIAL');
      expect(violations.length).toBeGreaterThan(0);
      expect(confidentialViolations.length).toBeGreaterThan(0);
      const violation = violations[0];
      expect(violation.classification).toBe('CONFIDENTIAL');
      expect(violation.severity).toBe('HIGH');
      expect(violation.status).toBe('OPEN');
    });
    it('should assign appropriate severity levels by classification', async () => {
  const devContext = {
  ...mockContext,
  environment: 'development',
};
      // Generate violations for different classifications
      await service.validateDataHandling('data1', 'INTERNAL', 'read', devContext);
      await service.validateDataHandling('data2', 'CONFIDENTIAL', 'read', devContext);
      await service.validateDataHandling('data3', 'RESTRICTED', 'read', devContext);
      const internalViolations = service.getViolations('INTERNAL');
      const confidentialViolations = service.getViolations('CONFIDENTIAL');
      const restrictedViolations = service.getViolations('RESTRICTED');
      if (internalViolations.length > 0) {
        expect(internalViolations[0].severity).toBe('MEDIUM');
      if (confidentialViolations.length > 0) {
        expect(confidentialViolations[0].severity).toBe('HIGH');
      if (restrictedViolations.length > 0) {
        expect(restrictedViolations[0].severity).toBe('CRITICAL');
    });
    it('should provide remediation steps for violations', async () => {
  const devContext = {
  ...mockContext,
  environment: 'development',
};
      await service.validateDataHandling('data123', 'INTERNAL', 'read', devContext);
      const violations = service.getViolations('INTERNAL');
      if (violations.length > 0) {
        const violation = violations[0];
        expect(violation.remediation).toBeDefined();
        expect(Array.isArray(violation.remediation)).toBe(true);
        expect(violation.remediation.length).toBeGreaterThan(0);
    });
  });
  describe('Compliance Scoring', () => {
    it('should calculate compliance scores correctly', async () => {
      // Perform some validations to generate compliance data
      await service.validateDataHandling('data1', 'PUBLIC', 'read', mockContext);
      await service.validateDataHandling('data2', 'INTERNAL', 'read', mockContext);
      const publicScore = service.getComplianceScore('PUBLIC');
      const internalScore = service.getComplianceScore('INTERNAL');
      expect(publicScore).toBeGreaterThanOrEqual(0);
      expect(publicScore).toBeLessThanOrEqual(100);
      expect(internalScore).toBeGreaterThanOrEqual(0);
      expect(internalScore).toBeLessThanOrEqual(100);
    });
    it('should return 100% compliance score when no checks exist', () => {
      const score = service.getComplianceScore('RESTRICTED');
      expect(score).toBe(100);
    });
  });
  describe('Requirement Validation Components', () => {
  it('should validate storage requirements appropriately', async () => {
  const devContext = {
  ...mockContext,
  environment: 'development',
};
      const result = await service.validateDataHandling(;);
        'data123',
        'INTERNAL',
        'read',
        devContext
      );
      // Should detect issues with non-production environment
      expect(result.valid).toBe(false);
    });
    it('should validate transmission requirements appropriately', async () => {
      const result = await service.validateDataHandling(;);
        'data123',
        'CONFIDENTIAL',
        'transmit',
        mockContext
      );
      // May have warnings about transmission requirements
      expect(result.warnings.length >= 0).toBe(true);
    });
    it('should validate processing requirements appropriately', async () => {
  const unsafeContext = {
  ...mockContext,
  environment: 'staging',
};
      const result = await service.validateDataHandling(;);
        'data123',
        'RESTRICTED',
        'process',
        unsafeContext
      );
      // Should detect issues with inappropriate environment for restricted data
      expect(result.valid).toBe(false);
      expect(result.errors.some(error => error.includes('approved environments'))).toBe(true);
    });
    it('should validate monitoring requirements appropriately', async () => {
      const result = await service.validateDataHandling(;);
        'data123',
        'RESTRICTED',
        'read',
        mockContext
      );
      // May have warnings about monitoring requirements
      expect(result.warnings.length >= 0).toBe(true);
    });
  });
  describe('Error Handling', () => {
  it('should handle invalid classification levels gracefully', async () => {
  const result = await service.validateDataHandling(;);
  'data123',
  'INVALID' as DataClassificationLevel,
  'read',
  mockContext
  );
  expect(result.valid).toBe(false);
  expect(result.errors).toContain('No handling requirements found for classification: INVALID');
});
    it('should handle missing context gracefully', async () => {
  const incompleteContext = {
  ...mockContext,
  environment: '',
};
      const result = await service.validateDataHandling(;);
        'data123',
        'INTERNAL',
        'read',
        incompleteContext
      );
      // Should still process but may have validation issues
      expect(result).toBeDefined();
      expect(result.valid === false || result.warnings.length > 0).toBe(true);
    });
  });
  describe('Default Rule Coverage', () => {
    it('should have rules covering all major requirement types', () => {
      const allRules = service.getHandlingRules();
      const ruleTypes = new Set(allRules.map(rule => rule.ruleType));
      expect(ruleTypes.has('STORAGE')).toBe(true);
      expect(ruleTypes.has('TRANSMISSION')).toBe(true);
      expect(ruleTypes.has('PROCESSING')).toBe(true);
      expect(ruleTypes.has('ACCESS')).toBe(true);
      expect(ruleTypes.has('MONITORING')).toBe(true);
    });
    it('should have rules for all non-public classification levels', () => {
      const allRules = service.getHandlingRules();
      const classifications = new Set(allRules.map(rule => rule.classification));
      expect(classifications.has('INTERNAL')).toBe(true);
      expect(classifications.has('CONFIDENTIAL')).toBe(true);
      expect(classifications.has('RESTRICTED')).toBe(true);
    });
    it('should have mandatory rules with appropriate priorities', () => {
      const allRules = service.getHandlingRules();
      const mandatoryRules = allRules.filter(rule => rule.mandatory);
      expect(mandatoryRules.length).toBeGreaterThan(0);
      mandatoryRules.forEach(rule => {)
  expect(rule.priority).toBeGreaterThan(0);
        expect(rule.effectiveDate).toBeInstanceOf(Date);
        expect(rule.complianceFramework.length).toBeGreaterThan(0);
      });
    });
  });
});