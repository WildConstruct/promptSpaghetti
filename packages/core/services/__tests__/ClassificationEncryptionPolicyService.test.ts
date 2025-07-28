/**
 * Tests for Classification Encryption Policy Service
 * 
 * Comprehensive test suite covering encryption policies,
 * compliance validation, and algorithm management.
 */
import ClassificationEncryptionPolicyService, {
  EncryptionPolicy,
  EncryptionAlgorithm
} from '../ClassificationEncryptionPolicyService';
import { 
  DataClassificationLevel, 
  OperationContext
} from '../../types/DataClassification';
describe('ClassificationEncryptionPolicyService', () => {
  let service: ClassificationEncryptionPolicyService;
  let mockContext: OperationContext;
  beforeEach(() => {
    service = new ClassificationEncryptionPolicyService();
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
  describe('Default Encryption Policies', () => {
    it('should initialize encryption policies for all classification levels', () => {
      const publicPolicy = service.getEncryptionPolicy('PUBLIC');
      const internalPolicy = service.getEncryptionPolicy('INTERNAL');
      const confidentialPolicy = service.getEncryptionPolicy('CONFIDENTIAL');
      const restrictedPolicy = service.getEncryptionPolicy('RESTRICTED');
      expect(publicPolicy).toBeDefined();
      expect(internalPolicy).toBeDefined();
      expect(confidentialPolicy).toBeDefined();
      expect(restrictedPolicy).toBeDefined();
    });
    it('should have progressively stricter encryption requirements for higher classifications', () => {
      const publicPolicy = service.getEncryptionPolicy('PUBLIC');
      const restrictedPolicy = service.getEncryptionPolicy('RESTRICTED');
      // Encryption requirements
      expect(publicPolicy?.requirements.required).toBe(false);
      expect(restrictedPolicy?.requirements.required).toBe(true);
      // Key rotation
      expect(publicPolicy?.requirements.keyRotationDays).toBeGreaterThan()
        restrictedPolicy?.requirements.keyRotationDays || 0
      );
      // HSM requirements
      expect(publicPolicy?.requirements.hsmRequired).toBe(false);
      expect(restrictedPolicy?.requirements.hsmRequired).toBe(true);
    });
    it('should have appropriate encryption algorithms by classification', () => {
      const internalPolicy = service.getEncryptionPolicy('INTERNAL');
      const confidentialPolicy = service.getEncryptionPolicy('CONFIDENTIAL');
      const restrictedPolicy = service.getEncryptionPolicy('RESTRICTED');
      expect(internalPolicy?.requirements.algorithm).toBe('AES-256');
      expect(confidentialPolicy?.requirements.algorithm).toBe('AES-256-GCM');
      expect(restrictedPolicy?.requirements.algorithm).toBe('CRYSTALS-Kyber');
    });
    it('should have appropriate key management policies', () => {
      const publicPolicy = service.getEncryptionPolicy('PUBLIC');
      const restrictedPolicy = service.getEncryptionPolicy('RESTRICTED');
      expect(publicPolicy?.keyManagement.keyStorageLocation).toBe('SOFTWARE');
      expect(restrictedPolicy?.keyManagement.keyStorageLocation).toBe('AIR_GAPPED_HSM');
      expect(publicPolicy?.keyManagement.multiPartyControl).toBe(false);
      expect(restrictedPolicy?.keyManagement.multiPartyControl).toBe(true);
      expect(publicPolicy?.keyManagement.keyRecoveryProcedure).toBe('STANDARD');
      expect(restrictedPolicy?.keyManagement.keyRecoveryProcedure).toBe('TRIPLE_CONTROL');
    });
  });
  describe('Approved Algorithms', () => {
    it('should initialize with approved encryption algorithms', () => {
      const allAlgorithms = service.getApprovedAlgorithms();
      const publicAlgorithms = service.getApprovedAlgorithms('PUBLIC');
      const restrictedAlgorithms = service.getApprovedAlgorithms('RESTRICTED');
      expect(allAlgorithms.length).toBeGreaterThan(0);
      expect(publicAlgorithms.length).toBeGreaterThan(0);
      expect(restrictedAlgorithms.length).toBeGreaterThan(0);
      // Check that algorithms include basic ones
      expect(allAlgorithms.some(alg => alg.name === 'AES-256')).toBe(true);
      expect(allAlgorithms.some(alg => alg.name === 'AES-256-GCM')).toBe(true);
    });
    it('should provide appropriate algorithms for each classification level', () => {
      const publicAlgorithms = service.getApprovedAlgorithms('PUBLIC');
      const internalAlgorithms = service.getApprovedAlgorithms('INTERNAL');
      const confidentialAlgorithms = service.getApprovedAlgorithms('CONFIDENTIAL');
      const restrictedAlgorithms = service.getApprovedAlgorithms('RESTRICTED');
      // PUBLIC should have basic algorithms
      expect(publicAlgorithms.some(alg => alg.name === 'AES-128')).toBe(true);
      // INTERNAL and higher should have AES-256
      expect(internalAlgorithms.some(alg => alg.name === 'AES-256')).toBe(true);
      expect(confidentialAlgorithms.some(alg => alg.name === 'AES-256')).toBe(true);
      expect(restrictedAlgorithms.some(alg => alg.name === 'AES-256')).toBe(true);
      // CONFIDENTIAL and higher should have GCM mode
      expect(confidentialAlgorithms.some(alg => alg.name === 'AES-256-GCM')).toBe(true);
      expect(restrictedAlgorithms.some(alg => alg.name === 'AES-256-GCM')).toBe(true);
      // RESTRICTED should have quantum-resistant algorithms
      expect(restrictedAlgorithms.some(alg => alg.quantumResistant)).toBe(true);
    });
    it('should allow adding new approved algorithms', () => {
      const newAlgorithm: EncryptionAlgorithm = {
        name: 'NEW-ALGORITHM-512',
        keyLength: 512,
        approved: true,
        minClassification: 'CONFIDENTIAL',
        fipsCompliant: true,
        quantumResistant: true,
      };
      service.addApprovedAlgorithm(newAlgorithm);
      const confidentialAlgorithms = service.getApprovedAlgorithms('CONFIDENTIAL');
      expect(confidentialAlgorithms.some(alg => alg.name === 'NEW-ALGORITHM-512')).toBe(true);
    });
    it('should allow deprecating algorithms', () => {
      const deprecationDate = new Date();
      service.deprecateAlgorithm('AES-128', deprecationDate);
      const allAlgorithms = service.getAllAlgorithms();
      const aes128 = allAlgorithms.find(alg => alg.name === 'AES-128');
      expect(aes128?.approved).toBe(false);
      expect(aes128?.deprecatedDate).toEqual(deprecationDate);
    });
  });
  describe('Encryption Compliance Validation', () => {
    it('should validate compliant encryption for internal data', async () => {
      const result = await service.validateEncryptionCompliance(;)
        'data123',
        'INTERNAL',
        {
          encrypted: true,
          algorithm: 'AES-256',
          keyLength: 256,
          lastRotationDate: new Date()
        },
        mockContext
      );
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    it('should detect encryption requirement violations', async () => {
      const result = await service.validateEncryptionCompliance(;)
        'data123',
        'CONFIDENTIAL',
        {
          encrypted: false,
        },
        mockContext
      );
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Encryption is mandatory for CONFIDENTIAL data but data is not encrypted');
    });
    it('should validate algorithm compliance', async () => {
      // Test with inappropriate algorithm
      const result = await service.validateEncryptionCompliance(;)
        'data123',
        'CONFIDENTIAL',
        {
          encrypted: true,
          algorithm: 'AES-128', // Too weak for confidential
          keyLength: 128,
          lastRotationDate: new Date()
        },
        mockContext
      );
      expect(result.valid).toBe(false);
      expect(result.errors.some(error => )
        error.includes('not approved for CONFIDENTIAL')
      )).toBe(true);
    });
    it('should validate key length requirements', async () => {
      const result = await service.validateEncryptionCompliance(;)
        'data123',
        'INTERNAL',
        {
          encrypted: true,
          algorithm: 'AES-256',
          keyLength: 128, // Too short for AES-256
          lastRotationDate: new Date()
        },
        mockContext
      );
      expect(result.valid).toBe(false);
      expect(result.errors.some(error => )
        error.includes('Key length 128 is insufficient')
      )).toBe(true);
    });
    it('should validate key rotation compliance', async () => {
      const oldRotationDate = new Date();
      oldRotationDate.setDate(oldRotationDate.getDate() - 365); // 1 year ago
      const result = await service.validateEncryptionCompliance(;)
        'data123',
        'CONFIDENTIAL',
        {
          encrypted: true,
          algorithm: 'AES-256-GCM',
          keyLength: 256,
          lastRotationDate: oldRotationDate,
        },
        mockContext
      );
      expect(result.warnings.some(warning => )
        warning.includes('Key rotation is overdue')
      )).toBe(true);
    });
    it('should record compliance assessments', async () => {
      await service.validateEncryptionCompliance()
        'data123',
        'INTERNAL',
        {
          encrypted: true,
          algorithm: 'AES-256',
          keyLength: 256,
          lastRotationDate: new Date()
        },
        mockContext
      );
      const records = service.getComplianceRecords('INTERNAL');
      expect(records.length).toBeGreaterThan(0);
      const record = records.find(r => r.dataId === 'data123');
      expect(record).toBeDefined();
      expect(record?.classification).toBe('INTERNAL');
      expect(record?.encryptionStatus).toBe('ENCRYPTED');
    });
    it('should handle invalid classification levels gracefully', async () => {
      const result = await service.validateEncryptionCompliance(;)
        'data123',
        'INVALID' as DataClassificationLevel,
        {
          encrypted: true,
          algorithm: 'AES-256',
          keyLength: 256,
        },
        mockContext
      );
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('No encryption policy found for classification: INVALID');
    });
  });
  describe('Audit Event Recording', () => {
    it('should record audit events for compliance checks', async () => {
      await service.validateEncryptionCompliance()
        'data123',
        'CONFIDENTIAL',
        {
          encrypted: true,
          algorithm: 'AES-256-GCM',
          keyLength: 256,
          lastRotationDate: new Date()
        },
        mockContext
      );
      const auditEvents = service.getAuditEvents('CONFIDENTIAL', 'COMPLIANCE_CHECK');
      expect(auditEvents.length).toBeGreaterThan(0);
      const event = auditEvents[0];
      expect(event.eventType).toBe('COMPLIANCE_CHECK');
      expect(event.classification).toBe('CONFIDENTIAL');
      expect(event.userId).toBe('user123');
      expect(event.result).toBe('SUCCESS');
    });
    it('should record different audit event types', async () => {
      await service.validateEncryptionCompliance()
        'data1',
        'INTERNAL',
        { encrypted: true,
          algorithm: 'AES-256',
          keyLength: 256 },
        mockContext
      );
      await service.validateEncryptionCompliance('data2', 'CONFIDENTIAL', { encrypted: false }, mockContext);
      const allEvents = service.getAuditEvents();
      const successEvents = allEvents.filter(e => e.result === 'SUCCESS');
      const failureEvents = allEvents.filter(e => e.result === 'FAILURE');
      expect(successEvents.length).toBeGreaterThan(0);
      expect(failureEvents.length).toBeGreaterThan(0);
    });
    it('should filter audit events by classification and type', async () => {
      await service.validateEncryptionCompliance()
        'data1',
        'INTERNAL',
        { encrypted: true,
          algorithm: 'AES-256',
          keyLength: 256 },
        mockContext
      );
      await service.validateEncryptionCompliance()
        'data2',
        'CONFIDENTIAL',
        { encrypted: true,
          algorithm: 'AES-256-GCM',
          keyLength: 256 },
        mockContext
      );
      const internalEvents = service.getAuditEvents('INTERNAL');
      const confidentialEvents = service.getAuditEvents('CONFIDENTIAL');
      const complianceEvents = service.getAuditEvents(undefined, 'COMPLIANCE_CHECK');
      expect(internalEvents.length).toBeGreaterThan(0);
      expect(confidentialEvents.length).toBeGreaterThan(0);
      expect(complianceEvents.length).toBeGreaterThan(0);
      expect(internalEvents.every(e => e.classification === 'INTERNAL')).toBe(true);
      expect(confidentialEvents.every(e => e.classification === 'CONFIDENTIAL')).toBe(true);
      expect(complianceEvents.every(e => e.eventType === 'COMPLIANCE_CHECK')).toBe(true);
    });
  });
  describe('Policy Management', () => {
    it('should allow updating encryption policies', async () => {
      const updates: Partial<EncryptionPolicy> = {
        requirements: {,
          required: true,
          algorithm: 'AES-256-XTS',
          keyLength: 256,
          keyRotationDays: 60,
          hsmRequired: true,
          keyEscrow: true,
        }
      };
      await service.updateEncryptionPolicy('INTERNAL', updates);
      const updatedPolicy = service.getEncryptionPolicy('INTERNAL');
      expect(updatedPolicy?.requirements.algorithm).toBe('AES-256-XTS');
      expect(updatedPolicy?.requirements.keyRotationDays).toBe(60);
      expect(updatedPolicy?.requirements.hsmRequired).toBe(true);
    });
    it('should increment version when updating policies', async () => {
      const originalPolicy = service.getEncryptionPolicy('INTERNAL');
      const originalVersion = originalPolicy?.version;
      await service.updateEncryptionPolicy('INTERNAL', {)
        name: 'Updated Internal Encryption Policy'
      });
      const updatedPolicy = service.getEncryptionPolicy('INTERNAL');
      expect(updatedPolicy?.version).not.toBe(originalVersion);
      expect(updatedPolicy?.name).toBe('Updated Internal Encryption Policy');
    });
    it('should throw error when updating non-existent policy', async () => {
      await expect()
        service.updateEncryptionPolicy('INVALID' as DataClassificationLevel, {})
      ).rejects.toThrow('No encryption policy found for classification: INVALID');
    });
  });
  describe('Encryption Requirements', () => {
    it('should provide encryption requirements for each classification level', () => {
      const publicReqs = service.getEncryptionRequirements('PUBLIC');
      const internalReqs = service.getEncryptionRequirements('INTERNAL');
      const confidentialReqs = service.getEncryptionRequirements('CONFIDENTIAL');
      const restrictedReqs = service.getEncryptionRequirements('RESTRICTED');
      expect(publicReqs).toBeDefined();
      expect(internalReqs).toBeDefined();
      expect(confidentialReqs).toBeDefined();
      expect(restrictedReqs).toBeDefined();
      expect(publicReqs?.required).toBe(false);
      expect(internalReqs?.required).toBe(true);
      expect(confidentialReqs?.required).toBe(true);
      expect(restrictedReqs?.required).toBe(true);
    });
    it('should have appropriate key rotation requirements', () => {
      const internalReqs = service.getEncryptionRequirements('INTERNAL');
      const confidentialReqs = service.getEncryptionRequirements('CONFIDENTIAL');
      const restrictedReqs = service.getEncryptionRequirements('RESTRICTED');
      expect(internalReqs?.keyRotationDays).toBe(90);
      expect(confidentialReqs?.keyRotationDays).toBe(30);
      expect(restrictedReqs?.keyRotationDays).toBe(7);
    });
  });
  describe('Compliance Scoring', () => {
    it('should calculate compliance scores correctly', async () => {
      // Create some compliance records
      await service.validateEncryptionCompliance()
        'data1',
        'INTERNAL',
        { encrypted: true,
          algorithm: 'AES-256',
          keyLength: 256 },
        mockContext
      );
      await service.validateEncryptionCompliance('data2', 'INTERNAL', { encrypted: false }, mockContext);
      const score = service.getOverallComplianceScore('INTERNAL');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
    it('should return 100% compliance score when no records exist', () => {
      const score = service.getOverallComplianceScore('RESTRICTED');
      expect(score).toBe(100);
    });
    it('should calculate individual compliance scores', async () => {
      await service.validateEncryptionCompliance()
        'data1',
        'CONFIDENTIAL',
        { encrypted: true,
          algorithm: 'AES-256-GCM',
          keyLength: 256 },
        mockContext
      );
      const records = service.getComplianceRecords('CONFIDENTIAL');
      expect(records.length).toBeGreaterThan(0);
      const record = records[0];
      expect(record.complianceScore).toBeGreaterThanOrEqual(0);
      expect(record.complianceScore).toBeLessThanOrEqual(100);
    });
  });
  describe('Encryption Recommendations', () => {
    it('should provide appropriate recommendations for each classification level', () => {
      const publicRecs = service.getEncryptionRecommendations('PUBLIC');
      const internalRecs = service.getEncryptionRecommendations('INTERNAL');
      const confidentialRecs = service.getEncryptionRecommendations('CONFIDENTIAL');
      const restrictedRecs = service.getEncryptionRecommendations('RESTRICTED');
      expect(publicRecs.length).toBeGreaterThan(0);
      expect(internalRecs.length).toBeGreaterThan(0);
      expect(confidentialRecs.length).toBeGreaterThan(0);
      expect(restrictedRecs.length).toBeGreaterThan(0);
      // Check for specific recommendations
      expect(internalRecs.some(rec => rec.includes('AES-256'))).toBe(true);
      expect(confidentialRecs.some(rec => rec.includes('HSM'))).toBe(true);
      expect(restrictedRecs.some(rec => rec.includes('quantum-resistant'))).toBe(true);
    });
    it('should handle invalid classification levels gracefully', () => {
      const recs = service.getEncryptionRecommendations('INVALID' as DataClassificationLevel);
      expect(recs).toEqual([]);
    });
  });
  describe('Algorithm Compliance Logic', () => {
    it('should correctly identify FIPS compliant algorithms', () => {
      const algorithms = service.getApprovedAlgorithms();
      const fipsAlgorithms = algorithms.filter(alg => alg.fipsCompliant);
      const nonFipsAlgorithms = algorithms.filter(alg => !alg.fipsCompliant);
      expect(fipsAlgorithms.length).toBeGreaterThan(0);
      expect(nonFipsAlgorithms.length).toBeGreaterThan(0);
      // AES algorithms should be FIPS compliant
      expect(fipsAlgorithms.some(alg => alg.name.includes('AES'))).toBe(true);
    });
    it('should correctly identify quantum-resistant algorithms', () => {
      const algorithms = service.getApprovedAlgorithms();
      const quantumResistantAlgorithms = algorithms.filter(alg => alg.quantumResistant);
      expect(quantumResistantAlgorithms.length).toBeGreaterThan(0);
      expect(quantumResistantAlgorithms.some(alg => alg.name === 'CRYSTALS-Kyber')).toBe(true);
    });
    it('should enforce classification-based algorithm restrictions', () => {
      const publicAlgorithms = service.getApprovedAlgorithms('PUBLIC');
      const restrictedAlgorithms = service.getApprovedAlgorithms('RESTRICTED');
      // PUBLIC should have fewer approved algorithms than RESTRICTED
      expect(publicAlgorithms.length).toBeLessThanOrEqual(restrictedAlgorithms.length);
      // Check that higher-classification-only algorithms are not in PUBLIC
      const restrictedOnlyAlgorithms = restrictedAlgorithms.filter(alg => ;)
        alg.minClassification === 'RESTRICTED'
      );
      restrictedOnlyAlgorithms.forEach(alg => {)
        expect(publicAlgorithms.some(pubAlg => pubAlg.name === alg.name)).toBe(false);
      });
    });
  });
  describe('Error Handling and Edge Cases', () => {
    it('should handle empty encryption status gracefully', async () => {
      const result = await service.validateEncryptionCompliance(;)
        'data123',
        'INTERNAL',
        {
          encrypted: false,
        },
        mockContext
      );
      expect(result.valid).toBe(false);
      expect(result.errors.some(error => error.includes('mandatory'))).toBe(true);
    });
    it('should handle unknown algorithms gracefully', async () => {
      const result = await service.validateEncryptionCompliance(;)
        'data123',
        'INTERNAL',
        {
          encrypted: true,
          algorithm: 'UNKNOWN-ALGORITHM',
          keyLength: 256,
        },
        mockContext
      );
      expect(result.valid).toBe(false);
      expect(result.errors.some(error => )
        error.includes('not in the approved algorithms list')
      )).toBe(true);
    });
    it('should handle missing last rotation date appropriately', async () => {
      const result = await service.validateEncryptionCompliance(;)
        'data123',
        'INTERNAL',
        {
          encrypted: true,
          algorithm: 'AES-256',
          keyLength: 256,
          // lastRotationDate is missing
        },
        mockContext
      );
      // Should still validate basic encryption requirements
      expect(result.valid).toBe(true);
      const records = service.getComplianceRecords();
      const record = records.find(r => r.dataId === 'data123');
      expect(record?.keyRotationCompliant).toBe(false);
    });
  });
});