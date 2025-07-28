/**
 * Cryptographic Evidence Signing Service Tests - Epic 19.3
 * 
 * Unit tests for cryptographic evidence signing, verification,
 * and chain of custody management.
 */

import { describe, expect, beforeEach, test } from '@jest/globals';
import { 
  CryptographicEvidenceSigningService, 
  EvidenceSigningRequest, 
  SigningPurpose,
  SignatureAlgorithm,
  EvidenceLevel,
  DataClassification
} from '../CryptographicEvidenceSigningService';
import { KeyManagementService } from '../KeyManagementService';
import AuditEvidenceMapper from '../AuditEvidenceMapper';
import { AuditService } from '../../auth/services/AuditService';

// Mock dependencies
class MockKeyManagementService {
  async listKeys() {
    return [{
      keyId: 'test-key-123',
      algorithm: 'RSA',
      keyLength: 2048,
      isActive: true,
      isPrimary: true
    }];
  }

  async generateMasterKey() {
    return {
      keyId: 'test-key-123',
      algorithm: 'RSA',
      keyLength: 2048,
      isActive: true,
      isPrimary: true
    };
  }

  async getKeyMaterial() {
    return `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC7VJTUt9Us8cKB
wYfVDdNjYdNP5YQYSE4jlUEJW+pcVpEZV4fE5hBaatQzFm8NrXqx4f0tpL3LgXOe
KqQAWBgWfIQW8X9hHrHaHtTfDHh6tPFJtIq+Ue5Wp5pRt5oHBKsK5s/HG7H+2c6P
4b+nEi9w5MhCnk8RQW7a7zGo4D1r7/vr3F7H+aK5C1vG/K1ZF5YVbPW8wQ1K+qRQ
W+kPTbX9zGsZ3F7x3c2Q7a5z9g4Z2Pk4p+vU5cHn9J7s4N6O8K7E8h3xZ6N5g2z7
TEST_KEY_FOR_TESTING_ONLY
-----END PRIVATE KEY-----`;
  }

  async getKeyInfo() {
    return {
      keyId: 'test-key-123',
      isActive: true,
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
    };
  }

  async healthCheck() {
    return true;
  }
}

class MockAuditEvidenceMapper {
  recordEvidenceCollection() {
    return 'test-trail-123';
  }

  generateEvidenceMappingReport() {
    return {
      frameworks: [{ id: 'ISO27001', name: 'ISO 27001:2022' }]
    };
  }
}

class MockAuditService {
  async logEvent() {
    return true;
  }
}

describe('CryptographicEvidenceSigningService', () => {
  let signingService: CryptographicEvidenceSigningService;
  let mockKeyManagement: MockKeyManagementService;
  let mockEvidenceMapper: MockAuditEvidenceMapper;
  let mockAuditService: MockAuditService;

  beforeEach(() => {
    mockKeyManagement = new MockKeyManagementService();
    mockEvidenceMapper = new MockAuditEvidenceMapper();
    mockAuditService = new MockAuditService();
    
    signingService = new CryptographicEvidenceSigningService(
      mockKeyManagement as any,
      mockEvidenceMapper as any,
      mockAuditService as any
    );
  });

  describe('Evidence Signing', () => {
    test('should sign evidence successfully', async () => {
      const signingRequest: EvidenceSigningRequest = {
        evidenceId: 'evidence-123',
        evidenceType: 'compliance_document',
        evidenceData: { document: 'test evidence data', version: '1.0' },
        collectorId: 'user-456',
        signingPurpose: SigningPurpose.COMPLIANCE_EVIDENCE,
        complianceFrameworks: ['ISO27001', 'SOC2'],
        metadata: { source: 'automated_collection' }
      };

      const signature = await signingService.signEvidence(signingRequest);

      expect(signature).toBeDefined();
      expect(signature.signatureId).toBeDefined();
      expect(signature.evidenceId).toBe('evidence-123');
      expect(signature.signerIdentity).toBe('user-456');
      expect(signature.purpose).toBe(SigningPurpose.COMPLIANCE_EVIDENCE);
      expect(signature.complianceContext.frameworks).toContain('ISO27001');
      expect(signature.complianceContext.frameworks).toContain('SOC2');
      expect(signature.verificationMetadata.nonRepudiation).toBe(true);
      expect(signature.verificationMetadata.integrity).toBe(true);
      expect(signature.verificationMetadata.authenticity).toBe(true);
    });

    test('should determine correct evidence level for forensic evidence', async () => {
      const signingRequest: EvidenceSigningRequest = {
        evidenceId: 'forensic-123',
        evidenceType: 'forensic_data',
        evidenceData: { investigation: 'security incident data' },
        collectorId: 'forensic-analyst',
        signingPurpose: SigningPurpose.FORENSIC_EVIDENCE
      };

      const signature = await signingService.signEvidence(signingRequest);

      expect(signature.complianceContext.evidenceLevel).toBe(EvidenceLevel.MAXIMUM);
      expect(signature.complianceContext.classification).toBe(DataClassification.RESTRICTED);
    });

    test('should generate consistent hash for same data', async () => {
      const evidenceData = { document: 'consistent test data', id: 123 };
      
      const request1: EvidenceSigningRequest = {
        evidenceId: 'test-1',
        evidenceType: 'test',
        evidenceData,
        collectorId: 'user-1',
        signingPurpose: SigningPurpose.COMPLIANCE_EVIDENCE
      };

      const request2: EvidenceSigningRequest = {
        evidenceId: 'test-2',
        evidenceType: 'test',
        evidenceData,
        collectorId: 'user-2',
        signingPurpose: SigningPurpose.COMPLIANCE_EVIDENCE
      };

      const signature1 = await signingService.signEvidence(request1);
      const signature2 = await signingService.signEvidence(request2);

      expect(signature1.dataHash).toBe(signature2.dataHash);
    });

    test('should reject invalid signing request', async () => {
      const invalidRequest: unknown = {
        evidenceId: '',
        evidenceType: 'test',
        evidenceData: null,
        collectorId: 'user-123',
        signingPurpose: 'INVALID_PURPOSE'
      };

      await expect(signingService.signEvidence(invalidRequest))
        .rejects
        .toThrow(/Missing required fields|Invalid signing purpose/);
    });
  });

  describe('Batch Signing', () => {
    test('should sign batch of evidence items', async () => {
      const evidenceItems: EvidenceSigningRequest[] = [
        {
          evidenceId: 'batch-item-1',
          evidenceType: 'document',
          evidenceData: { content: 'document 1' },
          collectorId: 'batch-collector',
          signingPurpose: SigningPurpose.COMPLIANCE_EVIDENCE
  }
        {
          evidenceId: 'batch-item-2',
          evidenceType: 'log',
          evidenceData: { content: 'log entry 2' },
          collectorId: 'batch-collector',
          signingPurpose: SigningPurpose.AUDIT_TRAIL
        }
      ];

      const batch = await signingService.signEvidenceBatch(evidenceItems);

      expect(batch).toBeDefined();
      expect(batch.batchId).toBeDefined();
      expect(batch.evidenceItems).toHaveLength(2);
      expect(batch.batchSignature).toBeDefined();
      expect(batch.merkleRoot).toBeDefined();
      expect(batch.timestamp).toBeDefined();
    });
  });

  describe('Signature Verification', () => {
    test('should verify signature successfully', async () => {
      // First sign some evidence
      const signingRequest: EvidenceSigningRequest = {
        evidenceId: 'verify-test-123',
        evidenceType: 'verification_test',
        evidenceData: { test: 'verification data' },
        collectorId: 'test-user',
        signingPurpose: SigningPurpose.COMPLIANCE_EVIDENCE
      };

      const signature = await signingService.signEvidence(signingRequest);

      // Then verify it
      const verificationResult = await signingService.verifyEvidenceSignature(
        signature.signatureId,
        signingRequest.evidenceData
      );

      expect(verificationResult).toBeDefined();
      expect(verificationResult.valid).toBe(true);
      expect(verificationResult.signatureId).toBe(signature.signatureId);
      expect(verificationResult.evidenceId).toBe('verify-test-123');
      expect(verificationResult.integrityCheck).toBe(true);
      expect(verificationResult.authenticityCheck).toBe(true);
      expect(verificationResult.nonRepudiationProof).toBe(true);
    });

    test('should fail verification for non-existent signature', async () => {
      const verificationResult = await signingService.verifyEvidenceSignature('non-existent-signature');

      expect(verificationResult.valid).toBe(false);
      expect(verificationResult.errors).toContain('Signature record not found');
    });

    test('should detect data tampering', async () => {
      // Sign original data
      const originalData = { important: 'original data', value: 123 };
      const signingRequest: EvidenceSigningRequest = {
        evidenceId: 'tamper-test',
        evidenceType: 'tamper_detection',
        evidenceData: originalData,
        collectorId: 'test-user',
        signingPurpose: SigningPurpose.FORENSIC_EVIDENCE
      };

      const signature = await signingService.signEvidence(signingRequest);

      // Attempt verification with tampered data
      const tamperedData = { important: 'tampered data', value: 456 };
      const verificationResult = await signingService.verifyEvidenceSignature(
        signature.signatureId,
        tamperedData
      );

      expect(verificationResult.valid).toBe(false);
      expect(verificationResult.integrityCheck).toBe(false);
      expect(verificationResult.errors).toContain('Data integrity check failed - evidence may have been tampered with');
    });
  });

  describe('Chain of Custody', () => {
    test('should initialize chain of custody when signing evidence', async () => {
      const signingRequest: EvidenceSigningRequest = {
        evidenceId: 'custody-test-123',
        evidenceType: 'custody_document',
        evidenceData: { document: 'custody test' },
        collectorId: 'initial-custodian',
        signingPurpose: SigningPurpose.FORENSIC_EVIDENCE
      };

      await signingService.signEvidence(signingRequest);

      const custody = signingService.getChainOfCustody('custody-test-123');

      expect(custody).toBeDefined();
      expect(custody!.evidenceId).toBe('custody-test-123');
      expect(custody!.currentCustodian).toBe('initial-custodian');
      expect(custody!.integrityMaintained).toBe(true);
      expect(custody!.custodyEvents).toHaveLength(1);
      expect(custody!.custodyEvents[0].fromCustodian).toBe('system');
      expect(custody!.custodyEvents[0].toCustodian).toBe('initial-custodian');
    });

    test('should transfer custody successfully', async () => {
      // Initialize evidence with custody
      const signingRequest: EvidenceSigningRequest = {
        evidenceId: 'transfer-test-123',
        evidenceType: 'transfer_document',
        evidenceData: { document: 'transfer test' },
        collectorId: 'original-custodian',
        signingPurpose: SigningPurpose.FORENSIC_EVIDENCE
      };

      await signingService.signEvidence(signingRequest);

      // Transfer custody
      await signingService.transferCustody(
        'transfer-test-123',
        'original-custodian',
        'new-custodian',
        'Evidence review required',
        'witness-user'
      );

      const custody = signingService.getChainOfCustody('transfer-test-123');

      expect(custody!.currentCustodian).toBe('new-custodian');
      expect(custody!.custodyEvents).toHaveLength(2); // Initial creation + transfer
      
      const transferEvent = custody!.custodyEvents[1];
      expect(transferEvent.fromCustodian).toBe('original-custodian');
      expect(transferEvent.toCustodian).toBe('new-custodian');
      expect(transferEvent.reason).toBe('Evidence review required');
      expect(transferEvent.witness).toBe('witness-user');
    });
  });

  describe('Evidence Retrieval', () => {
    test('should retrieve all signatures for evidence', async () => {
      const evidenceId = 'multi-signature-test';
      
      // Sign same evidence with different purposes
      const requests = [
        {
          evidenceId,
          evidenceType: 'multi_sign_doc',
          evidenceData: { document: 'shared evidence' },
          collectorId: 'user-1',
          signingPurpose: SigningPurpose.COMPLIANCE_EVIDENCE
  }
        {
          evidenceId,
          evidenceType: 'multi_sign_doc',
          evidenceData: { document: 'shared evidence' },
          collectorId: 'user-2',
          signingPurpose: SigningPurpose.AUDIT_TRAIL
        }
      ];

      for (const request of requests) {
        await signingService.signEvidence(request);
      }

      const signatures = signingService.getEvidenceSignatures(evidenceId);

      expect(signatures).toHaveLength(2);
      expect(signatures[0].evidenceId).toBe(evidenceId);
      expect(signatures[1].evidenceId).toBe(evidenceId);
      expect(signatures.map(s => s.purpose)).toContain(SigningPurpose.COMPLIANCE_EVIDENCE);
      expect(signatures.map(s => s.purpose)).toContain(SigningPurpose.AUDIT_TRAIL);
    });
  });

  describe('Data Normalization', () => {
    test('should normalize objects consistently', async () => {
      // Test that object key order doesn't affect hash
      const data1 = { b: 2, a: 1, c: { z: 26, y: 25 } };
      const data2 = { a: 1, b: 2, c: { y: 25, z: 26 } };

      const request1: EvidenceSigningRequest = {
        evidenceId: 'norm-1',
        evidenceType: 'normalization_test',
        evidenceData: data1,
        collectorId: 'test-user',
        signingPurpose: SigningPurpose.COMPLIANCE_EVIDENCE
      };

      const request2: EvidenceSigningRequest = {
        evidenceId: 'norm-2',
        evidenceType: 'normalization_test',
        evidenceData: data2,
        collectorId: 'test-user',
        signingPurpose: SigningPurpose.COMPLIANCE_EVIDENCE
      };

      const signature1 = await signingService.signEvidence(request1);
      const signature2 = await signingService.signEvidence(request2);

      expect(signature1.dataHash).toBe(signature2.dataHash);
    });
  });
});