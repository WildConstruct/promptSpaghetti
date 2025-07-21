/**
 * Tests for AuditFindingTrackingService
 * Epic 19 - Security & Compliance Framework
 */

import {
  AuditFindingTrackingService,
  FindingTrackingStatus,
  SLAStatus,
  AuditFindingTracker,
  BusinessImpactAssessment,
  EscalationTrigger
} from '../AuditFindingTrackingService';
import { AuditWorkflowService, WorkflowFinding } from '../AuditWorkflowService';
import { ComplianceReportingService } from '../ComplianceReportingService';
import { AuditTeamCollaborationService } from '../AuditTeamCollaborationService';
import { DataProtectionEventLogger } from '../../../packages/core/security/DataProtectionEventLogger';

// Mock the dependencies
jest.mock('../AuditWorkflowService');
jest.mock('../ComplianceReportingService');
jest.mock('../AuditTeamCollaborationService');
jest.mock('../../../packages/core/security/DataProtectionEventLogger');

describe('AuditFindingTrackingService', () => {
  let service: AuditFindingTrackingService;
  let mockWorkflowService: jest.Mocked<AuditWorkflowService>;
  let mockComplianceService: jest.Mocked<ComplianceReportingService>;
  let mockCollaborationService: jest.Mocked<AuditTeamCollaborationService>;
  let mockEventLogger: jest.Mocked<DataProtectionEventLogger>;

  const mockWorkflowFinding: WorkflowFinding = {
    id: 'finding-123',
    title: 'Test Security Finding',
    description: 'Sample security finding for testing',
    severity: 'high',
    status: 'open',
    category: 'security',
    identifiedBy: 'auditor-1',
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
    assignee: 'security-team',
    dueDate: new Date('2024-01-08T10:00:00Z'),
    evidence: [],
    remediation: {
      steps: ['Step 1', 'Step 2'],
      estimatedEffort: 10,
      resources: [],
      approvalRequired: false
    },
    riskScore: 75,
    businessImpact: 'high',
    regulatoryImplications: [],
    falsePositive: false,
    validatedAt: null,
    validatedBy: null,
    resolution: null,
    closedAt: null,
    closedBy: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockWorkflowService = new AuditWorkflowService() as jest.Mocked<AuditWorkflowService>;
    mockComplianceService = new ComplianceReportingService() as jest.Mocked<ComplianceReportingService>;
    mockCollaborationService = new AuditTeamCollaborationService() as jest.Mocked<AuditTeamCollaborationService>;
    mockEventLogger = new DataProtectionEventLogger() as jest.Mocked<DataProtectionEventLogger>;

    mockEventLogger.logDataProtectionEvent = jest.fn().mockResolvedValue(undefined);

    service = new AuditFindingTrackingService(
      mockWorkflowService,
      mockComplianceService,
      mockCollaborationService,
      mockEventLogger
    );
  });

  describe('trackNewFinding', () => {
    it('should create a new tracked finding with complete metadata', async () => {
      const result = await service.trackNewFinding(mockWorkflowFinding, 'audit-123');

      expect(result).toEqual(expect.objectContaining({
        ...mockWorkflowFinding,
        findingId: expect.stringMatching(/^AFT_\d+_/),
        parentAuditId: 'audit-123',
        trackingStatus: FindingTrackingStatus.NEW,
        lastStatusUpdate: expect.any(Date),
        nextReviewDate: expect.any(Date),
        autoEscalationEnabled: true
      }));

      expect(result.businessImpact).toEqual(expect.objectContaining({
        riskLevel: 'high',
        businessUnit: expect.any(String),
        lastAssessment: expect.any(Date),
        assessor: 'system'
      }));

      expect(result.slaDetails).toEqual(expect.objectContaining({
        acknowledgmentSLA: expect.any(Number),
        resolutionSLA: expect.any(Number),
        acknowledgmentDeadline: expect.any(Date),
        resolutionDeadline: expect.any(Date),
        acknowledgmentStatus: SLAStatus.ON_TIME,
        resolutionStatus: SLAStatus.ON_TIME
      }));

      expect(result.escalationHistory).toHaveLength(0);
      expect(result.stakeholderUpdates).toHaveLength(0);
      expect(result.complianceImplications).toHaveLength(1);
    });

    it('should set appropriate SLA deadlines based on severity', async () => {
      const criticalFinding = { ...mockWorkflowFinding, severity: 'critical' };
      const result = await service.trackNewFinding(criticalFinding, 'audit-123');

      // Critical findings should have short SLA
      expect(result.slaDetails.acknowledgmentSLA).toBe(1); // 1 hour
      expect(result.slaDetails.resolutionSLA).toBe(4); // 4 hours
    });

    it('should set longer SLA deadlines for low severity findings', async () => {
      const lowFinding = { ...mockWorkflowFinding, severity: 'low' };
      const result = await service.trackNewFinding(lowFinding, 'audit-123');

      expect(result.slaDetails.acknowledgmentSLA).toBe(24); // 24 hours
      expect(result.slaDetails.resolutionSLA).toBe(168); // 168 hours (1 week)
    });

    it('should log data protection event for finding creation', async () => {
      await service.trackNewFinding(mockWorkflowFinding, 'audit-123');

      expect(mockEventLogger.logDataProtectionEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'compliance_audit_access',
          operation: 'create',
          resourceType: 'audit_finding',
          automatedDecision: false
        })
      );
    });

    it('should initialize remediation tracking', async () => {
      const result = await service.trackNewFinding(mockWorkflowFinding, 'audit-123');

      expect(result.remediationTracking).toEqual(expect.objectContaining({
        remediationId: expect.stringMatching(/^REM_\d+_/),
        plan: expect.objectContaining({
          planId: expect.stringMatching(/^PLN_\d+_/),
          approach: 'immediate',
          estimatedEffort: 0,
          createdBy: 'system',
          createdAt: expect.any(Date)
        }),
        milestones: [],
        currentPhase: 'planning',
        overallProgress: 0,
        blockers: [],
        resources: [],
        validationResults: [],
        lastUpdate: expect.any(Date),
        updatedBy: 'system'
      }));
    });

    it('should set default escalation triggers', async () => {
      const result = await service.trackNewFinding(mockWorkflowFinding, 'audit-123');

      expect(result.slaDetails.escalationTriggers).toHaveLength(1);
      expect(result.slaDetails.escalationTriggers[0]).toEqual(expect.objectContaining({
        type: 'sla_breach',
        autoEscalate: true,
        escalationDelay: 0,
        condition: 'SLA deadline exceeded',
        recipients: ['security-manager@company.com']
      }));
    });
  });

  describe('updateFindingStatus', () => {
    let trackedFinding: AuditFindingTracker;

    beforeEach(async () => {
      trackedFinding = await service.trackNewFinding(mockWorkflowFinding, 'audit-123');
    });

    it('should update finding status and timestamp', async () => {
      const oldLastUpdate = trackedFinding.lastStatusUpdate;
      
      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 1));
      
      await service.updateFindingStatus(trackedFinding.findingId, FindingTrackingStatus.IN_PROGRESS);

      const updatedFinding = await service.getFindingsByStatus([FindingTrackingStatus.IN_PROGRESS]);
      expect(updatedFinding).toHaveLength(1);
      expect(updatedFinding[0].trackingStatus).toBe(FindingTrackingStatus.IN_PROGRESS);
      expect(updatedFinding[0].lastStatusUpdate.getTime()).toBeGreaterThan(oldLastUpdate.getTime());
    });

    it('should update SLA acknowledgment when status changes to ASSIGNED', async () => {
      await service.updateFindingStatus(trackedFinding.findingId, FindingTrackingStatus.ASSIGNED);

      const findings = await service.getFindingsByStatus([FindingTrackingStatus.ASSIGNED]);
      const finding = findings[0];
      
      expect(finding.slaDetails.acknowledgedAt).toBeDefined();
      expect(finding.slaDetails.acknowledgmentStatus).toBe(SLAStatus.ON_TIME);
    });

    it('should update SLA resolution when status changes to RESOLVED', async () => {
      await service.updateFindingStatus(trackedFinding.findingId, FindingTrackingStatus.RESOLVED);

      const findings = await service.getFindingsByStatus([FindingTrackingStatus.RESOLVED]);
      const finding = findings[0];
      
      expect(finding.slaDetails.resolvedAt).toBeDefined();
      expect(finding.slaDetails.resolutionStatus).toBe(SLAStatus.ON_TIME);
    });

    it('should log status change event', async () => {
      await service.updateFindingStatus(trackedFinding.findingId, FindingTrackingStatus.IN_PROGRESS, 'Starting remediation');

      // Should have 2 calls: one for creation, one for status update
      expect(mockEventLogger.logDataProtectionEvent).toHaveBeenCalledTimes(2);
      
      const statusUpdateCall = mockEventLogger.logDataProtectionEvent.mock.calls[1][0];
      expect(statusUpdateCall).toEqual(expect.objectContaining({
        eventType: 'compliance_rule_triggered',
        operation: 'write',
        metadata: expect.objectContaining({
          oldStatus: FindingTrackingStatus.NEW,
          newStatus: FindingTrackingStatus.IN_PROGRESS,
          reason: 'Starting remediation'
        })
      }));
    });

    it('should throw error for non-existent finding', async () => {
      await expect(
        service.updateFindingStatus('non-existent-id', FindingTrackingStatus.IN_PROGRESS)
      ).rejects.toThrow('Finding non-existent-id not found');
    });
  });

  describe('escalateFinding', () => {
    let trackedFinding: AuditFindingTracker;
    let escalationTrigger: EscalationTrigger;

    beforeEach(async () => {
      trackedFinding = await service.trackNewFinding(mockWorkflowFinding, 'audit-123');
      escalationTrigger = {
        type: 'sla_breach',
        condition: 'SLA exceeded by 2 hours',
        autoEscalate: true,
        escalationDelay: 0,
        recipients: ['manager@company.com', 'director@company.com']
      };
    });

    it('should create escalation record and update status', async () => {
      await service.escalateFinding(trackedFinding.findingId, escalationTrigger, 1);

      const escalatedFindings = await service.getEscalatedFindings();
      expect(escalatedFindings).toHaveLength(1);
      
      const finding = escalatedFindings[0];
      expect(finding.trackingStatus).toBe(FindingTrackingStatus.ESCALATED);
      expect(finding.escalationHistory).toHaveLength(1);
      
      const escalation = finding.escalationHistory[0];
      expect(escalation).toEqual(expect.objectContaining({
        escalationId: expect.stringMatching(/^ESC_\d+_/),
        timestamp: expect.any(Date),
        triggeredBy: escalationTrigger,
        escalatedTo: ['manager@company.com', 'director@company.com'],
        escalationLevel: 1,
        reason: 'SLA exceeded by 2 hours',
        resolution: expect.objectContaining({
          status: 'pending',
          actions: [],
          responseTime: 0,
          resolution: '',
          resolvedBy: ''
        })
      }));
    });

    it('should log escalation event', async () => {
      await service.escalateFinding(trackedFinding.findingId, escalationTrigger, 2);

      // Should have 2 calls: creation + escalation
      expect(mockEventLogger.logDataProtectionEvent).toHaveBeenCalledTimes(2);
      
      const escalationCall = mockEventLogger.logDataProtectionEvent.mock.calls[1][0];
      expect(escalationCall).toEqual(expect.objectContaining({
        eventType: 'regulatory_alert',
        operation: 'escalate',
        automatedDecision: true,
        metadata: expect.objectContaining({
          escalationType: 'sla_breach',
          escalationLevel: 2,
          recipients: ['manager@company.com', 'director@company.com']
        })
      }));
    });

    it('should throw error for non-existent finding', async () => {
      await expect(
        service.escalateFinding('non-existent-id', escalationTrigger)
      ).rejects.toThrow('Finding non-existent-id not found');
    });
  });

  describe('updateRemediationProgress', () => {
    let trackedFinding: AuditFindingTracker;

    beforeEach(async () => {
      trackedFinding = await service.trackNewFinding(mockWorkflowFinding, 'audit-123');
    });

    it('should update remediation progress and calculate overall progress', async () => {
      const milestones = [
        {
          milestoneId: 'milestone-1',
          name: 'Initial Assessment',
          description: 'Complete initial assessment',
          targetDate: new Date('2024-01-02'),
          status: 'completed' as const,
          dependencies: [],
          deliverables: ['assessment-report.pdf'],
          progress: 100
        },
        {
          milestoneId: 'milestone-2', 
          name: 'Remediation Implementation',
          description: 'Implement security fixes',
          targetDate: new Date('2024-01-05'),
          status: 'in_progress' as const,
          dependencies: ['milestone-1'],
          deliverables: ['fix-implementation.md'],
          progress: 60
        }
      ];

      await service.updateRemediationProgress(trackedFinding.findingId, {
        milestones,
        currentPhase: 'implementation',
        updatedBy: 'security-engineer'
      });

      const findings = await service.getFindingsByStatus([FindingTrackingStatus.NEW]);
      const finding = findings[0];
      
      expect(finding.remediationTracking.milestones).toEqual(milestones);
      expect(finding.remediationTracking.currentPhase).toBe('implementation');
      expect(finding.remediationTracking.overallProgress).toBe(50); // 1 of 2 completed
      expect(finding.remediationTracking.updatedBy).toBe('security-engineer');
      expect(finding.remediationTracking.lastUpdate).toBeInstanceOf(Date);
    });

    it('should log remediation progress update', async () => {
      await service.updateRemediationProgress(trackedFinding.findingId, {
        currentPhase: 'validation',
        updatedBy: 'qa-engineer'
      });

      expect(mockEventLogger.logDataProtectionEvent).toHaveBeenCalledTimes(2);
      
      const progressCall = mockEventLogger.logDataProtectionEvent.mock.calls[1][0];
      expect(progressCall).toEqual(expect.objectContaining({
        eventType: 'policy_update_applied',
        operation: 'write',
        automatedDecision: false,
        userId: 'qa-engineer',
        metadata: expect.objectContaining({
          currentPhase: 'validation'
        })
      }));
    });

    it('should throw error for non-existent finding', async () => {
      await expect(
        service.updateRemediationProgress('non-existent-id', { currentPhase: 'test' })
      ).rejects.toThrow('Finding non-existent-id not found');
    });
  });

  describe('generateFindingReport', () => {
    let trackedFinding: AuditFindingTracker;

    beforeEach(async () => {
      trackedFinding = await service.trackNewFinding(mockWorkflowFinding, 'audit-123');
    });

    it('should generate comprehensive finding report', async () => {
      const report = await service.generateFindingReport(trackedFinding.findingId, 'detailed');

      expect(report).toEqual(expect.objectContaining({
        reportId: expect.stringMatching(/^RPT_\d+_/),
        findingId: trackedFinding.findingId,
        generatedAt: expect.any(Date),
        generatedBy: 'system',
        reportType: 'detailed',
        summary: expect.objectContaining({
          finding: trackedFinding,
          currentStatus: FindingTrackingStatus.NEW,
          daysOpen: expect.any(Number),
          slaCompliance: true, // Should be true for new finding
          riskTrend: 'stable',
          remediationProgress: 0,
          stakeholderEngagement: expect.any(Number)
        }),
        timeline: expect.any(Array),
        metrics: expect.objectContaining({
          timeToAcknowledgment: expect.any(Number),
          escalationCount: 0,
          communicationCount: 0,
          stakeholderResponseRate: expect.any(Number),
          slaPerformance: expect.any(Number),
          costToResolve: expect.any(Number)
        }),
        recommendations: expect.any(Array),
        attachments: expect.any(Array)
      }));
    });

    it('should calculate correct days open', async () => {
      // Mock finding created 3 days ago
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 3);
      
      const oldFinding = await service.trackNewFinding({
        ...mockWorkflowFinding,
        createdAt: pastDate
      }, 'audit-123');

      const report = await service.generateFindingReport(oldFinding.findingId);
      
      expect(report.summary.daysOpen).toBe(3);
    });

    it('should throw error for non-existent finding', async () => {
      await expect(
        service.generateFindingReport('non-existent-id')
      ).rejects.toThrow('Finding non-existent-id not found');
    });
  });

  describe('getFindingsByStatus', () => {
    let finding1: AuditFindingTracker;
    let finding2: AuditFindingTracker;

    beforeEach(async () => {
      finding1 = await service.trackNewFinding(mockWorkflowFinding, 'audit-123');
      finding2 = await service.trackNewFinding({
        ...mockWorkflowFinding,
        id: 'finding-456'
      }, 'audit-456');
      
      await service.updateFindingStatus(finding2.findingId, FindingTrackingStatus.IN_PROGRESS);
    });

    it('should return findings with specified statuses', async () => {
      const newFindings = await service.getFindingsByStatus([FindingTrackingStatus.NEW]);
      const inProgressFindings = await service.getFindingsByStatus([FindingTrackingStatus.IN_PROGRESS]);
      
      expect(newFindings).toHaveLength(1);
      expect(newFindings[0].findingId).toBe(finding1.findingId);
      
      expect(inProgressFindings).toHaveLength(1);
      expect(inProgressFindings[0].findingId).toBe(finding2.findingId);
    });

    it('should return findings matching multiple statuses', async () => {
      const findings = await service.getFindingsByStatus([
        FindingTrackingStatus.NEW,
        FindingTrackingStatus.IN_PROGRESS
      ]);
      
      expect(findings).toHaveLength(2);
    });

    it('should return empty array when no findings match', async () => {
      const findings = await service.getFindingsByStatus([FindingTrackingStatus.CLOSED]);
      expect(findings).toHaveLength(0);
    });
  });

  describe('getOverdueFindings', () => {
    it('should identify overdue acknowledgment findings', async () => {
      // Create finding with past acknowledgment deadline
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 10); // 10 hours ago
      
      const overdueFinding = await service.trackNewFinding({
        ...mockWorkflowFinding,
        severity: 'critical', // 1 hour SLA
        createdAt: pastDate
      }, 'audit-123');

      const overdueFindings = await service.getOverdueFindings();
      expect(overdueFindings).toHaveLength(1);
      expect(overdueFindings[0].findingId).toBe(overdueFinding.findingId);
    });

    it('should identify overdue resolution findings', async () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 25); // 25 hours ago
      
      const overdueFinding = await service.trackNewFinding({
        ...mockWorkflowFinding,
        severity: 'high', // 24 hour resolution SLA
        createdAt: pastDate
      }, 'audit-123');

      // Acknowledge the finding to test resolution SLA
      await service.updateFindingStatus(overdueFinding.findingId, FindingTrackingStatus.ASSIGNED);

      const overdueFindings = await service.getOverdueFindings();
      expect(overdueFindings).toHaveLength(1);
    });

    it('should not include resolved findings in overdue list', async () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 10);
      
      const finding = await service.trackNewFinding({
        ...mockWorkflowFinding,
        severity: 'critical',
        createdAt: pastDate
      }, 'audit-123');

      // Resolve the finding
      await service.updateFindingStatus(finding.findingId, FindingTrackingStatus.RESOLVED);

      const overdueFindings = await service.getOverdueFindings();
      expect(overdueFindings).toHaveLength(0);
    });
  });

  describe('getEscalatedFindings', () => {
    it('should return only escalated findings', async () => {
      const finding1 = await service.trackNewFinding(mockWorkflowFinding, 'audit-123');
      const finding2 = await service.trackNewFinding({
        ...mockWorkflowFinding,
        id: 'finding-456'
      }, 'audit-456');

      const escalationTrigger: EscalationTrigger = {
        type: 'manual',
        condition: 'Manual escalation requested',
        autoEscalate: false,
        escalationDelay: 0,
        recipients: ['manager@company.com']
      };

      await service.escalateFinding(finding1.findingId, escalationTrigger);

      const escalatedFindings = await service.getEscalatedFindings();
      expect(escalatedFindings).toHaveLength(1);
      expect(escalatedFindings[0].findingId).toBe(finding1.findingId);
      expect(escalatedFindings[0].trackingStatus).toBe(FindingTrackingStatus.ESCALATED);
    });
  });

  describe('Business Impact Assessment', () => {
    it('should map severity to appropriate risk level', async () => {
      const criticalFinding = await service.trackNewFinding({
        ...mockWorkflowFinding,
        severity: 'critical'
      }, 'audit-123');

      const mediumFinding = await service.trackNewFinding({
        ...mockWorkflowFinding,
        id: 'finding-456',
        severity: 'medium'
      }, 'audit-456');

      expect(criticalFinding.businessImpact.riskLevel).toBe('critical');
      expect(mediumFinding.businessImpact.riskLevel).toBe('medium');
    });

    it('should provide consistent business impact structure', async () => {
      const finding = await service.trackNewFinding(mockWorkflowFinding, 'audit-123');

      expect(finding.businessImpact).toEqual(expect.objectContaining({
        riskLevel: expect.any(String),
        businessUnit: expect.any(String),
        affectedSystems: expect.any(Array),
        potentialDataExposure: expect.objectContaining({
          hasPersonalData: expect.any(Boolean),
          dataTypes: expect.any(Array),
          recordCount: expect.any(Number),
          exposureLevel: expect.any(String),
          affectedPersons: expect.any(Number)
        }),
        regulatoryImplications: expect.any(Array),
        financialImpact: expect.objectContaining({
          directCosts: expect.any(Number),
          indirectCosts: expect.any(Number),
          potentialFines: expect.any(Number),
          totalEstimate: expect.any(Number),
          confidence: expect.any(String)
        }),
        reputationalRisk: expect.any(String),
        operationalImpact: expect.objectContaining({
          systemsAffected: expect.any(Number),
          usersImpacted: expect.any(Number),
          servicesDown: expect.any(Array),
          dataIntegrityRisk: expect.any(Boolean)
        }),
        lastAssessment: expect.any(Date),
        assessor: expect.any(String)
      }));
    });
  });
});