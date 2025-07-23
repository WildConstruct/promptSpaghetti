/**
 * Appeal Process Service Tests - Epic 17
 * 
 * Comprehensive test suite for the appeal process service, covering
 * appeal submission, review workflow, decision making, and metrics.
 * 
 * Task: E17-1753114397383-FB5EA7 - Create appeal process
 * Epic: 17 - Backstage Admin Controls
 */

import { 
  AppealProcessService, 
  AppealStatus, 
  AppealCategory, 
  AppealPriority,
  AppealDecision,
  Appeal
} from '../AppealProcessService';
import { Database } from '../../../database';
import { AuditService } from '../../../auth/services/AuditService';

// Mock dependencies
jest.mock('../../../database/connection');
jest.mock('../../../auth/services/AuditService');

describe('AppealProcessService', () => {
  let appealService: AppealProcessService;
  let mockDatabase: jest.Mocked<Database>;
  let mockAuditService: jest.Mocked<AuditService>;
  let mockClient: unknown;

  beforeEach(() => {
    // Setup mocks
    mockClient = {
      query: jest.fn<unknown[], unknown>(),
      release: jest.fn<unknown[], unknown>()
    };

    mockDatabase = {
      getClient: jest.fn<unknown[], unknown>().mockResolvedValue(mockClient as unknown as unknown as unknown as unknown),
      query: jest.fn<unknown[], unknown>()
    } as any;

    mockAuditService = {
      logEvent: jest.fn<unknown[], unknown>()
    } as any;

    // Create service instance
    appealService = new AppealProcessService(mockDatabase, mockAuditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Appeal Submission', () => {
    it('should submit a new appeal successfully', async () => {
      // Arrange
      const appealData = {
        appellant_id: 'user-12345',
        appellant_type: 'user' as const,
        original_decision_id: 'enforcement-action-001',
        original_decision_type: 'automated_enforcement',
        category: 'enforcement_action' as AppealCategory,
        subject: 'Appeal of Trust Score Restriction',
        description: 'I believe my account was incorrectly restricted due to a false positive in the trust scoring system.',
        requested_outcome: 'Please review and lift the account restriction.',
        impact_statement: 'This restriction prevents me from completing important transactions.'
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({ rows: [] }) // INSERT appeals
        .mockResolvedValueOnce({ rows: [] }) // INSERT timeline
        .mockResolvedValueOnce({ rows: [] }) // Auto-assign queries
        .mockResolvedValueOnce({ rows: [] }); // COMMIT

      // Mock private methods
      jest.spyOn(
        appealService as any,
        'calculateAppealPriority'
      ).mockResolvedValue('medium' as unknown as unknown as unknown as unknown);
      jest.spyOn(
        appealService as any,
        'determineReviewComplexity'
      ).mockResolvedValue('standard' as unknown as unknown as unknown as unknown);
      jest.spyOn(
        appealService as any,
        'autoAssignReviewer'
      ).mockResolvedValue(undefined as unknown as unknown as unknown as unknown);
      jest.spyOn(
        appealService as any,
        'sendAppealNotifications'
      ).mockResolvedValue(undefined as unknown as unknown as unknown as unknown);

      // Act
      const appealId = await appealService.submitAppeal(appealData);

      // Assert
      expect(appealId).toBeDefined();
      expect(appealId).toMatch(/^appeal-/);
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockAuditService.logEvent).toHaveBeenCalledWith({
        userId: appealData.appellant_id,
        action: 'appeal_submitted',
        details: expect.objectContaining({
          appeal_id: appealId,
          category: appealData.category,
          original_decision: appealData.original_decision_id,
          priority: 'medium'
        }),
        severity: 'info'
      });
    });

    it('should handle database errors during appeal submission', async () => {
      // Arrange
      const appealData = {
        appellant_id: 'user-12345',
        appellant_type: 'user' as const,
        original_decision_id: 'enforcement-action-001',
        original_decision_type: 'automated_enforcement',
        category: 'enforcement_action' as AppealCategory,
        subject: 'Appeal Test',
        description: 'Test description',
        requested_outcome: 'Test outcome'
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockRejectedValueOnce(new Error('Database connection failed')); // INSERT fails

      jest.spyOn(
        appealService as any,
        'calculateAppealPriority'
      ).mockResolvedValue('medium' as unknown as unknown as unknown as unknown);
      jest.spyOn(
        appealService as any,
        'determineReviewComplexity'
      ).mockResolvedValue('standard' as unknown as unknown as unknown as unknown);

      // Act & Assert
      await expect(appealService.submitAppeal(appealData))
        .rejects.toThrow('Database connection failed');
      
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should calculate appeal priority correctly', async () => {
      const service = appealService as any;
      
      // High priority for financial impacts
      expect(await service.calculateAppealPriority('block_transaction', 'transaction_block'))
        .toBe('high');
      
      // Medium priority for enforcement actions
      expect(await service.calculateAppealPriority('automated_enforcement', 'enforcement_action'))
        .toBe('medium');
      
      // Urgent for safety-related impact statements
      expect(await service.calculateAppealPriority(
        'policy_violation', 
        'content_moderation',
        'This affects my financial safety and ability to work'
      )).toBe('urgent');
    });
  });

  describe('Appeal Retrieval and Updates', () => {
    it('should retrieve appeal by ID with complete details', async () => {
      // Arrange
      const appealId = 'appeal-test-001';
      const mockAppealRow = {
        appeal_id: appealId,
        appellant_id: 'user-12345',
        appellant_type: 'user',
        original_decision_id: 'enforcement-001',
        original_decision_type: 'automated_enforcement',
        category: 'enforcement_action',
        priority: 'medium',
        status: 'submitted',
        subject: 'Test Appeal',
        description: 'Test description',
        requested_outcome: 'Test outcome',
        submitted_at: new Date(),
        last_updated: new Date(),
        escalation_level: 0,
        review_complexity: 'standard',
        follow_up_required: false,
        allow_resubmission: true,
        resubmission_count: 0,
        max_resubmissions: 3
      };

      mockDatabase.query.mockResolvedValue({ rows: [mockAppealRow] } as unknown as unknown as unknown as unknown);

      // Act
      const result = await appealService.getAppeal(appealId);

      // Assert
      expect(result).toBeDefined();
      expect(result!.appeal_id).toBe(appealId);
      expect(result!.appellant_id).toBe('user-12345');
      expect(result!.status).toBe('submitted');
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM appeals'),
        [appealId]
      );
    });

    it('should return null for non-existent appeal', async () => {
      // Arrange
      mockDatabase.query.mockResolvedValue({ rows: [] } as unknown as unknown as unknown as unknown);

      // Act
      const result = await appealService.getAppeal('non-existent');

      // Assert
      expect(result).toBeNull();
    });

    it('should update appeal status successfully', async () => {
      // Arrange
      const appealId = 'appeal-test-001';
      const newStatus: AppealStatus = 'under_review';
      const updatedBy = 'reviewer-001';
      const notes = 'Starting review process';

      const existingAppeal = {
        appeal_id: appealId,
        status: 'submitted',
        appellant_id: 'user-12345'
      } as Appeal;

      jest.spyOn(appealService, 'getAppeal').mockResolvedValue(existingAppeal as unknown as unknown as unknown as unknown);
      jest.spyOn(
        appealService as any,
        'addTimelineEvent'
      ).mockResolvedValue(undefined as unknown as unknown as unknown as unknown);
      jest.spyOn(
        appealService as any,
        'sendAppealNotifications'
      ).mockResolvedValue(undefined as unknown as unknown as unknown as unknown);

      mockDatabase.query.mockResolvedValue({ rows: [] } as unknown as unknown as unknown as unknown);

      // Act
      await appealService.updateAppealStatus(appealId, newStatus, updatedBy, notes);

      // Assert
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE appeals'),
        [newStatus, appealId]
      );
    });
  });

  describe('Evidence Management', () => {
    it('should add evidence to appeal successfully', async () => {
      // Arrange
      const appealId = 'appeal-test-001';
      const evidenceData = {
        evidence_type: 'document' as any,
        title: 'Transaction Receipt',
        description: 'Receipt showing successful transaction',
        file_url: 'https://example.com/receipt.pdf',
        submitted_by: 'user-12345'
      };

      mockDatabase.query.mockResolvedValue({ rows: [] } as unknown as unknown as unknown as unknown);
      jest.spyOn(
        appealService as any,
        'addTimelineEvent'
      ).mockResolvedValue(undefined as unknown as unknown as unknown as unknown);

      // Act
      const evidenceId = await appealService.addEvidence(appealId, evidenceData);

      // Assert
      expect(evidenceId).toBeDefined();
      expect(evidenceId).toMatch(/^evidence-/);
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO appeal_evidence'),
        expect.arrayContaining([
          evidenceId,
          appealId,
          evidenceData.evidence_type,
          evidenceData.title,
          evidenceData.description,
          evidenceData.file_url,
          undefined, // content
          '{}', // metadata JSON
          evidenceData.submitted_by
        ])
      );
    });
  });

  describe('Reviewer Assignment', () => {
    it('should assign reviewer to appeal', async () => {
      // Arrange
      const appealId = 'appeal-test-001';
      const reviewerId = 'reviewer-001';
      const reviewerRole = 'tier1';

      const existingAppeal = {
        appeal_id: appealId,
        status: 'submitted' as AppealStatus
      } as Appeal;

      jest.spyOn(appealService, 'getAppeal').mockResolvedValue(existingAppeal as unknown as unknown as unknown as unknown);
      jest.spyOn(appealService, 'updateAppealStatus').mockResolvedValue(undefined as unknown as unknown as unknown as unknown);
      jest.spyOn(
        appealService as any,
        'addTimelineEvent'
      ).mockResolvedValue(undefined as unknown as unknown as unknown as unknown);

      mockDatabase.query.mockResolvedValue({ rows: [] } as unknown as unknown as unknown as unknown);

      // Act
      await appealService.assignReviewer(appealId, reviewerId, reviewerRole as any);

      // Assert
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE appeals'),
        expect.arrayContaining([reviewerId, reviewerRole, appealId])
      );
      expect(appealService.updateAppealStatus).toHaveBeenCalledWith(
        appealId, 'under_review', reviewerId
      );
    });
  });

  describe('Decision Making', () => {
    it('should make decision on appeal successfully', async () => {
      // Arrange
      const appealId = 'appeal-test-001';
      const decision: AppealDecision = 'approve';
      const rationale = {
        primary_reasoning: 'Evidence supports appellant\'s claim',
        supporting_factors: ['Clear documentation provided', 'Policy was misapplied'],
        policy_references: ['Trust Policy 2.1', 'Appeals Process 1.3'],
        risk_considerations: ['Low risk of false positive']
      };
      const reviewerId = 'reviewer-001';
      const reviewCriteria = {
        policy_adherence: 8,
        evidence_quality: 9,
        procedural_fairness: 10,
        proportionality: 8,
        precedent_consistency: 7,
        risk_assessment: 6
      };

      const existingAppeal = {
        appeal_id: appealId,
        appellant_id: 'user-12345',
        submitted_at: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      } as Appeal;

      jest.spyOn(appealService, 'getAppeal').mockResolvedValue(existingAppeal as unknown as unknown as unknown as unknown);
      jest.spyOn(
        appealService as any,
        'storeReviewCriteria'
      ).mockResolvedValue(undefined as unknown as unknown as unknown as unknown);
      jest.spyOn(
        appealService as any,
        'addTimelineEvent'
      ).mockResolvedValue(undefined as unknown as unknown as unknown as unknown);
      jest.spyOn(
        appealService as any,
        'executeDecisionActions'
      ).mockResolvedValue(undefined as unknown as unknown as unknown as unknown);
      jest.spyOn(
        appealService as any,
        'sendAppealNotifications'
      ).mockResolvedValue(undefined as unknown as unknown as unknown as unknown);

      mockDatabase.query.mockResolvedValue({ rows: [] } as unknown as unknown as unknown as unknown);

      // Act
      await appealService.makeDecision(appealId, decision, rationale, reviewerId, reviewCriteria);

      // Assert
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE appeals'),
        expect.arrayContaining([
          'approved', // final status
          decision,
          JSON.stringify(rationale),
          expect.any(Number), // resolution time hours
          appealId
        ])
      );

      expect(mockAuditService.logEvent).toHaveBeenCalledWith({
        userId: reviewerId,
        action: 'appeal_decision',
        details: expect.objectContaining({
          appeal_id: appealId,
          decision,
          appellant_id: existingAppeal.appellant_id
        }),
        severity: 'warning' // approve decisions get warning level
      });
    });

    it('should handle different decision types correctly', async () => {
      const testCases: Array<{ decision: AppealDecision; expectedStatus: AppealStatus; expectedSeverity: string }> = [
        { decision: 'approve', expectedStatus: 'approved', expectedSeverity: 'warning' },
        { decision: 'partially_approve', expectedStatus: 'partially_approved', expectedSeverity: 'warning' },
        { decision: 'deny', expectedStatus: 'denied', expectedSeverity: 'info' },
        { decision: 'dismiss', expectedStatus: 'dismissed', expectedSeverity: 'info' }
      ];

      for (const testCase of testCases) {
        // Arrange
        const appealId = `appeal-test-${testCase.decision}`;
        const rationale = {
          primary_reasoning: `Test reasoning for ${testCase.decision}`,
          policy_references: ['Test Policy'],
          supporting_factors: [],
          risk_considerations: []
        };
        const reviewerId = 'reviewer-001';

        const existingAppeal = {
          appeal_id: appealId,
          appellant_id: 'user-12345',
          submitted_at: new Date()
        } as Appeal;

        jest.spyOn(appealService, 'getAppeal').mockResolvedValue(existingAppeal as unknown as unknown as unknown as unknown);
        jest.spyOn(
          appealService as any,
          'addTimelineEvent'
        ).mockResolvedValue(undefined as unknown as unknown as unknown as unknown);
        jest.spyOn(
          appealService as any,
          'executeDecisionActions'
        ).mockResolvedValue(undefined as unknown as unknown as unknown as unknown);
        jest.spyOn(
          appealService as any,
          'sendAppealNotifications'
        ).mockResolvedValue(undefined as unknown as unknown as unknown as unknown);

        mockDatabase.query.mockResolvedValue({ rows: [] } as unknown as unknown as unknown as unknown);

        // Act
        await appealService.makeDecision(appealId, testCase.decision, rationale, reviewerId);

        // Assert
        expect(mockDatabase.query).toHaveBeenCalledWith(
          expect.stringContaining('UPDATE appeals'),
          expect.arrayContaining([testCase.expectedStatus, testCase.decision])
        );

        expect(mockAuditService.logEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            severity: testCase.expectedSeverity
          })
        );

        // Reset mocks for next iteration
        jest.clearAllMocks();
        mockDatabase.query.mockResolvedValue({ rows: [] } as unknown as unknown as unknown as unknown);
      }
    });
  });

  describe('Appeal Listing and Filtering', () => {
    it('should list appeals with filters', async () => {
      // Arrange
      const filters = {
        status: 'under_review' as AppealStatus,
        category: 'enforcement_action' as AppealCategory,
        priority: 'high' as AppealPriority,
        limit: 10,
        offset: 0
      };

      const mockAppealsData = [
        {
          appeal_id: 'appeal-001',
          status: 'under_review',
          category: 'enforcement_action',
          priority: 'high',
          total_count: '2'
        },
        {
          appeal_id: 'appeal-002',
          status: 'under_review',
          category: 'enforcement_action',
          priority: 'high',
          total_count: '2'
        }
      ];

      mockDatabase.query.mockResolvedValue({ rows: mockAppealsData } as unknown as unknown as unknown as unknown);

      // Act
      const result = await appealService.listAppeals(filters);

      // Assert
      expect(result.appeals).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE status = $1 AND category = $2 AND priority = $3'),
        ['under_review', 'enforcement_action', 'high', 10, 0]
      );
    });

    it('should handle empty results gracefully', async () => {
      // Arrange
      mockDatabase.query.mockResolvedValue({ rows: [] } as unknown as unknown as unknown as unknown);

      // Act
      const result = await appealService.listAppeals();

      // Assert
      expect(result.appeals).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('Appeal Statistics', () => {
    it('should return comprehensive statistics', async () => {
      // Arrange
      const timeRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31')
      };

      const mockStatsData = {
        total_appeals: '50',
        avg_resolution_time: '48.5',
        approved_count: '30',
        avg_satisfaction: '8.2'
      };

      const mockStatusData = [
        { status: 'approved', count: '20' },
        { status: 'denied', count: '15' },
        { status: 'pending', count: '10' },
        { status: 'dismissed', count: '5' }
      ];

      const mockCategoryData = [
        { category: 'enforcement_action', count: '25' },
        { category: 'trust_score', count: '15' },
        { category: 'policy_violation', count: '10' }
      ];

      mockDatabase.query
        .mockResolvedValueOnce({ rows: [mockStatsData] })
        .mockResolvedValueOnce({ rows: mockStatusData })
        .mockResolvedValueOnce({ rows: mockCategoryData });

      // Act
      const result = await appealService.getAppealStatistics(timeRange);

      // Assert
      expect(result.total_appeals).toBe(50);
      expect(result.resolution_metrics.average_resolution_time_hours).toBe(48.5);
      expect(result.resolution_metrics.approval_rate).toBe(60); // 30/50 * 100
      expect(result.by_status.approved).toBe(20);
      expect(result.by_status.denied).toBe(15);
      expect(result.by_category.enforcement_action).toBe(25);
    });

    it('should handle empty statistics gracefully', async () => {
      // Arrange
      mockDatabase.query
        .mockResolvedValueOnce({ rows: [{ total_appeals: '0' }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      // Act
      const result = await appealService.getAppealStatistics();

      // Assert
      expect(result.total_appeals).toBe(0);
      expect(result.resolution_metrics.approval_rate).toBe(0);
    });
  });

  describe('Helper Methods', () => {
    it('should calculate SLA target based on priority and complexity', async () => {
      const service = appealService as any;
      
      // Urgent + simple = 4 hours
      expect(service.calculateSLATarget('urgent', 'simple')).toBe(4);
      
      // High + complex = 72 hours
      expect(service.calculateSLATarget('high', 'complex')).toBe(72);
      
      // Medium + standard = 72 hours
      expect(service.calculateSLATarget('medium', 'standard')).toBe(72);
      
      // Default case
      expect(service.calculateSLATarget('low', 'unknown')).toBe(72);
    });

    it('should determine review complexity appropriately', async () => {
      const service = appealService as any;
      
      expect(await service.determineReviewComplexity({ category: 'other' }))
        .toBe('simple');
        
      expect(await service.determineReviewComplexity({ category: 'enforcement_action' }))
        .toBe('complex');
        
      expect(await service.determineReviewComplexity({ category: 'trust_score' }))
        .toBe('standard');
    });

    it('should map database row to Appeal object correctly', async () => {
      // Arrange
      const service = appealService as any;
      const mockRow = {
        appeal_id: 'appeal-001',
        appellant_id: 'user-123',
        appellant_type: 'user',
        original_decision_id: 'decision-001',
        category: 'enforcement_action',
        priority: 'medium',
        status: 'submitted',
        subject: 'Test Appeal',
        description: 'Test description',
        requested_outcome: 'Test outcome',
        submitted_at: new Date(),
        escalation_level: 0,
        follow_up_required: false,
        related_appeals: '[]',
        precedent_appeals: '[]'
      };

      // Act
      const appeal = service.mapRowToAppeal(mockRow);

      // Assert
      expect(appeal.appeal_id).toBe('appeal-001');
      expect(appeal.appellant_id).toBe('user-123');
      expect(appeal.category).toBe('enforcement_action');
      expect(appeal.related_appeals).toEqual([]);
      expect(appeal.precedent_appeals).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    it('should handle appeal not found errors', async () => {
      // Arrange
      jest.spyOn(appealService, 'getAppeal').mockResolvedValue(null as unknown as unknown as unknown as unknown);

      // Act & Assert
      await expect(
        appealService.updateAppealStatus('non-existent', 'under_review', 'reviewer-001')
      ).rejects.toThrow('Appeal not found: non-existent');
    });

    it('should handle database transaction errors', async () => {
      // Arrange
      const appealData = {
        appellant_id: 'user-12345',
        appellant_type: 'user' as const,
        original_decision_id: 'decision-001',
        original_decision_type: 'test',
        category: 'other' as AppealCategory,
        subject: 'Test',
        description: 'Test',
        requested_outcome: 'Test'
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockRejectedValueOnce(new Error('Transaction failed')); // INSERT fails

      jest.spyOn(
        appealService as any,
        'calculateAppealPriority'
      ).mockResolvedValue('medium' as unknown as unknown as unknown as unknown);
      jest.spyOn(
        appealService as any,
        'determineReviewComplexity'
      ).mockResolvedValue('standard' as unknown as unknown as unknown as unknown);

      // Act & Assert
      await expect(appealService.submitAppeal(appealData))
        .rejects.toThrow('Transaction failed');
      
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });
});