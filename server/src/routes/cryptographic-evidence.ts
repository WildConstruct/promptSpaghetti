/**
 * Cryptographic Evidence Signing API Routes - Epic 19.3
 * 
 * RESTful API endpoints for cryptographic evidence signing, verification,
 * and chain of custody management. Integrates with existing audit infrastructure.
 * 
 * Task: T-1752989143998-658 - Implement cryptographic signing of evidence
 * Part of Epic 19 - Data Protection & Privacy Controls
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  CryptographicEvidenceSigningService,
  EvidenceSigningRequest,
  SigningPurpose
} from '../services/CryptographicEvidenceSigningService';
import { KeyManagementService } from '../services/KeyManagementService';
import AuditEvidenceMapper from '../services/AuditEvidenceMapper';
import { AuditService } from '../auth/services/AuditService';
import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';

// Request/Response schemas
}
interface SignEvidenceRequest {
  Body: {
    evidence_id: string;
    evidence_type: string;
    evidence_data: any;
    collector_id: string;
    signing_purpose: string;
    compliance_frameworks?: string[];
    metadata?: Record<string, any>;
    timestamp?: string;
}
  };
}

}
interface SignBatchRequest {
  Body: {
    evidence_items: {
      evidence_id: string;
      evidence_type: string;
      evidence_data: any;
      collector_id: string;
      signing_purpose: string;
      compliance_frameworks?: string[];
      metadata?: Record<string, any>;
}
    }[];
  };
}

}
interface VerifySignatureRequest {
  Params: {
    signatureId: string;
}
  };
  Body?: {
    evidence_data?: any;
  };
}

}
interface CustodyTransferRequest {
  Params: {
    evidenceId: string;
}
  };
  Body: {
    from_custodian: string;
    to_custodian: string;
    reason: string;
    witness?: string;
  };
}

export async function cryptographicEvidenceRoutes(fastify: FastifyInstance) {
  // Initialize services
  const db = new DatabaseService();
  const redis = new RedisService();
  const auditService = new AuditService(db, redis);
  const keyManagementService = new KeyManagementService(db, redis, auditService);
  const evidenceMapper = new AuditEvidenceMapper();
  const signingService = new CryptographicEvidenceSigningService(
    keyManagementService,
    evidenceMapper,
    auditService
  );

  /**
   * POST /api/cryptographic-evidence/sign
   * Sign individual evidence item with cryptographic signature
   */
  fastify.post('/sign', async (
    request: FastifyRequest<SignEvidenceRequest>,
    reply: FastifyReply
  ) => {
    try {
      const {
        evidence_id,
        evidence_type,
        evidence_data,
        collector_id,
        signing_purpose,
        compliance_frameworks,
        metadata,
        timestamp
      } = request.body;

      // Validate required fields
      if (!evidence_id || !evidence_type || !evidence_data || !collector_id || !signing_purpose) {
        return reply.status(400).send({
          error: 'Missing required fields',
          required: ['evidence_id', 'evidence_type', 'evidence_data', 'collector_id', 'signing_purpose']
        });
      }

      // Validate signing purpose
      if (!Object.values(SigningPurpose).includes(signing_purpose as SigningPurpose)) {
        return reply.status(400).send({
          error: 'Invalid signing purpose',
          valid_purposes: Object.values(SigningPurpose)
        });
      }

      // Create signing request
      const signingRequest: EvidenceSigningRequest = {
        evidenceId: evidence_id,
        evidenceType: evidence_type,
        evidenceData: evidence_data,
        collectorId: collector_id,
        signingPurpose: signing_purpose as SigningPurpose,
        complianceFrameworks: compliance_frameworks,
        metadata,
        timestamp: timestamp ? new Date(timestamp) : undefined
      };

      // Sign evidence
      const signature = await signingService.signEvidence(signingRequest);

      return reply.status(201).send({
        success: true,
        data: {
          signature_id: signature.signatureId,
          evidence_id: signature.evidenceId,
          signature: signature.signature,
          algorithm: signature.algorithm,
          key_id: signature.keyId,
          timestamp: signature.timestamp.toISOString(),
          signer_identity: signature.signerIdentity,
          purpose: signature.purpose,
          hash_algorithm: signature.hashAlgorithm,
          data_hash: signature.dataHash,
          compliance_context: signature.complianceContext,
          verification_metadata: signature.verificationMetadata
        }
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Evidence signing failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * POST /api/cryptographic-evidence/sign-batch
   * Sign batch of evidence items with batch signature and Merkle tree
   */
  fastify.post('/sign-batch', async (
    request: FastifyRequest<SignBatchRequest>,
    reply: FastifyReply
  ) => {
    try {
      const { evidence_items } = request.body;

      if (!evidence_items || evidence_items.length === 0) {
        return reply.status(400).send({
          error: 'No evidence items provided for batch signing'
        });
      }

      // Convert to signing requests
      const signingRequests: EvidenceSigningRequest[] = evidence_items.map(item => ({
        evidenceId: item.evidence_id,
        evidenceType: item.evidence_type,
        evidenceData: item.evidence_data,
        collectorId: item.collector_id,
        signingPurpose: item.signing_purpose as SigningPurpose,
        complianceFrameworks: item.compliance_frameworks,
        metadata: item.metadata
      }));

      // Validate all signing requests
      for (const request of signingRequests) {
        if (!Object.values(SigningPurpose).includes(request.signingPurpose)) {
          return reply.status(400).send({
            error: 'Invalid signing purpose in batch',
            evidence_id: request.evidenceId,
            invalid_purpose: request.signingPurpose
          });
        }
      }

      // Sign batch
      const batch = await signingService.signEvidenceBatch(signingRequests);

      return reply.status(201).send({
        success: true,
        data: {
          batch_id: batch.batchId,
          evidence_count: batch.evidenceItems.length,
          batch_signature: batch.batchSignature,
          merkle_root: batch.merkleRoot,
          timestamp: batch.timestamp.toISOString()
        }
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Batch evidence signing failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * POST /api/cryptographic-evidence/verify/:signatureId
   * Verify evidence signature and integrity
   */
  fastify.post('/verify/:signatureId', async (
    request: FastifyRequest<VerifySignatureRequest>,
    reply: FastifyReply
  ) => {
    try {
      const { signatureId } = request.params;
      const evidenceData = request.body?.evidence_data;

      const verificationResult = await signingService.verifyEvidenceSignature(signatureId, evidenceData);

      return reply.send({
        success: true,
        data: {
          signature_id: verificationResult.signatureId,
          evidence_id: verificationResult.evidenceId,
          valid: verificationResult.valid,
          verification_time: verificationResult.verificationTime.toISOString(),
          signature_timestamp: verificationResult.signatureTimestamp.toISOString(),
          key_status: verificationResult.keyStatus,
          certificate_status: verificationResult.certificateStatus,
          integrity_check: verificationResult.integrityCheck,
          authenticity_check: verificationResult.authenticityCheck,
          non_repudiation_proof: verificationResult.nonRepudiationProof,
          compliance_validation: verificationResult.complianceValidation,
          warnings: verificationResult.warnings,
          errors: verificationResult.errors,
          metadata: verificationResult.metadata
        }
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Signature verification failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * GET /api/cryptographic-evidence/signatures/:evidenceId
   * Get all signatures for an evidence item
   */
  fastify.get('/signatures/:evidenceId', async (
    request: FastifyRequest<{ Params: { evidenceId: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const { evidenceId } = request.params;

      const signatures = signingService.getEvidenceSignatures(evidenceId);

      return reply.send({
        success: true,
        data: {
          evidence_id: evidenceId,
          signatures: signatures.map(sig => ({
            signature_id: sig.signatureId,
            signature: sig.signature,
            algorithm: sig.algorithm,
            key_id: sig.keyId,
            timestamp: sig.timestamp.toISOString(),
            signer_identity: sig.signerIdentity,
            purpose: sig.purpose,
            hash_algorithm: sig.hashAlgorithm,
            data_hash: sig.dataHash,
            compliance_context: sig.complianceContext
          })),
          total_signatures: signatures.length
        }
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Failed to retrieve evidence signatures',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * GET /api/cryptographic-evidence/custody/:evidenceId
   * Get chain of custody for evidence
   */
  fastify.get('/custody/:evidenceId', async (
    request: FastifyRequest<{ Params: { evidenceId: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const { evidenceId } = request.params;

      const custody = signingService.getChainOfCustody(evidenceId);

      if (!custody) {
        return reply.status(404).send({
          error: 'Chain of custody not found',
          evidence_id: evidenceId
        });
      }

      return reply.send({
        success: true,
        data: {
          evidence_id: custody.evidenceId,
          current_custodian: custody.currentCustodian,
          integrity_maintained: custody.integrityMaintained,
          custody_events: custody.custodyEvents.map(event => ({
            event_id: event.eventId,
            timestamp: event.timestamp.toISOString(),
            from_custodian: event.fromCustodian,
            to_custodian: event.toCustodian,
            action: event.action,
            signature: event.signature,
            witness: event.witness,
            reason: event.reason
          })),
          total_events: custody.custodyEvents.length
        }
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Failed to retrieve chain of custody',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * POST /api/cryptographic-evidence/custody/:evidenceId/transfer
   * Transfer custody of evidence
   */
  fastify.post('/custody/:evidenceId/transfer', async (
    request: FastifyRequest<CustodyTransferRequest>,
    reply: FastifyReply
  ) => {
    try {
      const { evidenceId } = request.params;
      const { from_custodian, to_custodian, reason, witness } = request.body;

      if (!from_custodian || !to_custodian || !reason) {
        return reply.status(400).send({
          error: 'Missing required fields',
          required: ['from_custodian', 'to_custodian', 'reason']
        });
      }

      await signingService.transferCustody(evidenceId, from_custodian, to_custodian, reason, witness);

      return reply.status(201).send({
        success: true,
        data: {
          evidence_id: evidenceId,
          from_custodian,
          to_custodian,
          reason,
          witness,
          transfer_time: new Date().toISOString()
        }
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Custody transfer failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * GET /api/cryptographic-evidence/health
   * Health check for cryptographic evidence signing service
   */
  fastify.get('/health', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    try {
      // Test key management service
      const keyManagerHealthy = await keyManagementService.healthCheck();
      
      // Test evidence mapper
      const evidenceMapperHealthy = evidenceMapper.generateEvidenceMappingReport().frameworks.length > 0;

      const health = {
        status: keyManagerHealthy && evidenceMapperHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        service: 'cryptographic-evidence-signing',
        version: '1.0.0',
        checks: {
          key_management: keyManagerHealthy,
          evidence_mapping: evidenceMapperHealthy,
          signing_service: true // Service initialized successfully if we reach this point
        }
      };

      const overallHealthy = Object.values(health.checks).every(check => check);

      return reply.status(overallHealthy ? 200 : 503).send({
        success: overallHealthy,
        data: health
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(503).send({
        success: false,
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  });

  /**
   * GET /api/cryptographic-evidence/purposes
   * Get available signing purposes and their descriptions
   */
  fastify.get('/purposes', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const purposes = {
      [SigningPurpose.COMPLIANCE_EVIDENCE]: 'General compliance evidence requiring digital signatures',
      [SigningPurpose.AUDIT_TRAIL]: 'Audit trail entries and activity logs',
      [SigningPurpose.REGULATORY_FILING]: 'Evidence for regulatory submissions and filings',
      [SigningPurpose.INCIDENT_RESPONSE]: 'Security incident response and forensic evidence',
      [SigningPurpose.FORENSIC_EVIDENCE]: 'Legal and forensic evidence with chain of custody',
      [SigningPurpose.QUALITY_ASSURANCE]: 'Quality assurance and testing evidence',
      [SigningPurpose.CERTIFICATION]: 'Certification and accreditation evidence'
    };

    return reply.send({
      success: true,
      data: {
        signing_purposes: Object.entries(purposes).map(([key, description]) => ({
          purpose: key,
          description
        })),
        total_purposes: Object.keys(purposes).length
      }
    });
  });

  /**
   * GET /api/cryptographic-evidence/stats
   * Get signing service statistics
   */
  fastify.get('/stats', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    try {
      // Get basic statistics from the signing service
      const allSignatures = Array.from((signingService as any).signatures.values());
      const allCustodyRecords = Array.from((signingService as any).chainOfCustody.values());

      const stats = {
        signatures: {
          total: allSignatures.length,
          by_purpose: allSignatures.reduce((acc, sig) => {
            acc[sig.purpose] = (acc[sig.purpose] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          by_algorithm: allSignatures.reduce((acc, sig) => {
            acc[sig.algorithm] = (acc[sig.algorithm] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          by_evidence_level: allSignatures.reduce((acc, sig) => {
            acc[sig.complianceContext.evidenceLevel] = (acc[sig.complianceContext.evidenceLevel] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
  }
        custody: {
          total_records: allCustodyRecords.length,
          total_events: allCustodyRecords.reduce((sum, record) => sum + record.custodyEvents.length, 0),
          integrity_maintained: allCustodyRecords.filter(r => r.integrityMaintained).length
  }
        compliance: {
          frameworks_covered: [...new Set(allSignatures.flatMap(s => s.complianceContext.frameworks))],
          average_retention_period: allSignatures.length > 0 
            ? Math.round(
              allSignatures.reduce((sum,
                s
              ) => sum + s.complianceContext.retentionPeriod, 0) / allSignatures.length)
            : 0
        }
      };

      return reply.send({
        success: true,
        data: stats,
        generated_at: new Date().toISOString()
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Failed to retrieve statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}

export default cryptographicEvidenceRoutes;