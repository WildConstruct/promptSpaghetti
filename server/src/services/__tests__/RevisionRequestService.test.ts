/**
 * Revision Request Service Tests - E17-1753114397311-674990
 * 
 * Comprehensive test suite for revision request management system
 * for Epic 17 - Backstage Admin Controls.
 */

import { RevisionRequestService } from '../RevisionRequestService';
import { Database } from '../../database/connection';
import {
  RevisionRequest,
  RevisionRequestStatus,
  RevisionRequestPriority,
  RevisionContentType,
  RevisionRequestType,
  RevisionEvidenceType,
  RevisionRequestFormData,
  RevisionRequestReviewFormData,
  RevisionRequestSearchQuery,
  DEFAULT_REVISION_REQUEST_CONFIG
} from '../../../../packages/core/types/RevisionRequestTypes';

// Mock Database
jest.mock('../../database/connection', () => ({
  Database: jest.fn<unknown[], unknown>()
}));

describe('RevisionRequestService', () => {
  let service: RevisionRequestService;
  let mockDb: jest.Mocked<Database>;

  const mockRevisionRequest: RevisionRequest = {
    id: 'rev_test_123',
    requesterId: 'user_requester_123',
    requesterName: 'John Requester',
    requesterEmail: 'john@example.com',
    contentType: RevisionContentType.TEMPLATE,
    contentId: 'template_456',
    contentTitle: 'Test Template',
    contentVersion: '1.0',
    title: 'Update Template Color Scheme',
    description: 'The current color scheme needs to be updated to match new brand guidelines.',
    requestedChanges: 'Change primary color from blue to green and update all related elements.',
    businessJustification: 'Brand guidelines have changed to reflect our new corporate identity.',
    type: RevisionRequestType.CONTENT_UPDATE,
    priority: RevisionRequestPriority.HIGH,
    status: RevisionRequestStatus.SUBMITTED,
    reviewerId: 'reviewer_456',
    reviewerName: 'Jane Reviewer',
    assignedAt: new Date('2024-01-15T09:00:00Z'),
    dueDate: new Date('2024-01-20T17:00:00Z'),
    estimatedHours: 8,
    actualHours: undefined,
    createdAt: new Date('2024-01-15T08:00:00Z'),
    updatedAt: new Date('2024-01-15T09:00:00Z'),
    completedAt: undefined,
    reviewNotes: undefined,
    rejectionReason: undefined,
    approvalNotes: undefined,
    implementationNotes: undefined,
    evidence: [],
    timeline: [],
    tags: ['branding', 'color-scheme', 'template'],
    metadata: {},
    urgencyScore: 75,
    complexityScore: 40,
    impactScore: undefined
  };

  const mockFormData: RevisionRequestFormData = {
    title: 'Update Template Color Scheme',
    description: 'The current color scheme needs to be updated to match new brand guidelines.',
    requestedChanges: 'Change primary color from blue to green and update all related elements.',
    businessJustification: 'Brand guidelines have changed to reflect our new corporate identity.',
    contentType: RevisionContentType.TEMPLATE,
    contentId: 'template_456',
    type: RevisionRequestType.CONTENT_UPDATE,
    priority: RevisionRequestPriority.HIGH,
    dueDate: new Date('2024-01-20T17:00:00Z'),
    estimatedHours: 8,
    tags: ['branding', 'color-scheme', 'template'],
    evidence: []
  };

  beforeEach(() => {
    mockDb = {
      query: jest.fn<unknown[], unknown>()
    } as any;
    service = new RevisionRequestService(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Configuration', () => {
    it('should initialize with default configuration', () => {
      expect(service).toBeDefined();
    });

    it('should initialize with custom configuration', () => {
      const customConfig = {
        ...DEFAULT_REVISION_REQUEST_CONFIG,
        enableAutoAssignment: false,
        enableSLA: false
      };
      
      const customService = new RevisionRequestService(mockDb, customConfig);
      expect(customService).toBeDefined();
    });
  });

  describe('createRevisionRequest', () => {
    it('should create a new revision request', async () => {
      const mockResult = {
        rows: [{
          id: 'rev_test_123',
          requester_id: 'user_requester_123',
          requester_name: 'John Requester',
          requester_email: 'john@example.com',
          content_type: 'template',
          content_id: 'template_456',
          content_title: 'Test Template',
          title: 'Update Template Color Scheme',
          description: 'The current color scheme needs to be updated to match new brand guidelines.',
          requested_changes: 'Change primary color from blue to green and update all related elements.',
          business_justification: 'Brand guidelines have changed to reflect our new corporate identity.',
          type: 'content_update',
          priority: 'high',
          status: 'draft',
          due_date: '2024-01-20T17:00:00Z',
          estimated_hours: 8,
          tags: ['branding', 'color-scheme', 'template'],
          urgency_score: 75,
          complexity_score: 40,
          created_at: '2024-01-15T08:00:00Z',
          updated_at: '2024-01-15T08:00:00Z'
        }]
      };

      mockDb.query.mockResolvedValue(mockResult as unknown as unknown);

      const result = await service.createRevisionRequest(
        mockFormData,
        'user_requester_123',
        'John Requester',
        'john@example.com'
      );

      expect(result).toBeDefined();
      expect(result.id).toBe('rev_test_123');
      expect(result.title).toBe('Update Template Color Scheme');
      expect(result.status).toBe(RevisionRequestStatus.DRAFT);
      expect(result.priority).toBe(RevisionRequestPriority.HIGH);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO revision_requests'),
        expect.arrayContaining([
          expect.any(String), // id
          'user_requester_123',
          'John Requester',
          'john@example.com'
        ])
      );
    });

    it('should calculate urgency and complexity scores', async () => {
      const mockResult = {
        rows: [{
          id: 'rev_test_critical',
          urgency_score: 100,
          complexity_score: 90
          // ... other fields
        }]
      };

      mockDb.query.mockResolvedValue(mockResult as unknown as unknown);

      const criticalFormData = {
        ...mockFormData,
        priority: RevisionRequestPriority.CRITICAL,
        type: RevisionRequestType.SECURITY_UPDATE,
        estimatedHours: 50,
        dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours from now
      };

      const result = await service.createRevisionRequest(
        criticalFormData,
        'user_requester_123',
        'John Requester',
        'john@example.com'
      );

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('urgency_score, complexity_score'),
        expect.arrayContaining([
          expect.any(Number), // urgency_score should be calculated
          expect.any(Number)  // complexity_score should be calculated
        ])
      );
    });

    it('should handle database errors during creation', async () => {
      mockDb.query.mockRejectedValue(new Error('Database connection failed'));

      await expect(service.createRevisionRequest(
        mockFormData,
        'user_requester_123',
        'John Requester',
        'john@example.com'
      )).rejects.toThrow('Database connection failed');
    });
  });

  describe('getRevisionRequest', () => {
    it('should retrieve a revision request by ID', async () => {
      const mockResult = {
        rows: [{
          id: 'rev_test_123',
          requester_id: 'user_requester_123',
          requester_name: 'John Requester',
          requester_email: 'john@example.com',
          content_type: 'template',
          content_id: 'template_456',
          content_title: 'Test Template',
          title: 'Update Template Color Scheme',
          description: 'The current color scheme needs to be updated.',
          requested_changes: 'Change primary color from blue to green.',
          business_justification: 'Brand guidelines have changed.',
          type: 'content_update',
          priority: 'high',
          status: 'submitted',
          reviewer_id: 'reviewer_456',
          reviewer_name: 'Jane Reviewer',
          assigned_at: '2024-01-15T09:00:00Z',
          due_date: '2024-01-20T17:00:00Z',
          estimated_hours: 8,
          tags: ['branding', 'color-scheme', 'template'],
          urgency_score: 75,
          complexity_score: 40,
          created_at: '2024-01-15T08:00:00Z',
          updated_at: '2024-01-15T09:00:00Z'
        }]
      };

      mockDb.query.mockResolvedValue(mockResult as unknown as unknown);

      const result = await service.getRevisionRequest('rev_test_123');

      expect(result).toBeDefined();
      expect(result?.id).toBe('rev_test_123');
      expect(result?.title).toBe('Update Template Color Scheme');
      expect(result?.status).toBe(RevisionRequestStatus.SUBMITTED);
      expect(result?.reviewerId).toBe('reviewer_456');
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM revision_requests'),
        ['rev_test_123']
      );
    });

    it('should return null for non-existent revision request', async () => {
      mockDb.query.mockResolvedValue({ rows: [] } as unknown as unknown);

      const result = await service.getRevisionRequest('non_existent');

      expect(result).toBeNull();
      expect(mockDb.query).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      mockDb.query.mockRejectedValue(new Error('Database connection failed'));

      await expect(service.getRevisionRequest('rev_test_123'))
        .rejects.toThrow('Database connection failed');
    });
  });

  describe('searchRevisionRequests', () => {
    const mockSearchResults = {
      rows: [
        {
          id: 'rev_1',
          title: 'Request 1',
          status: 'submitted',
          priority: 'high',
          total_count: '2',
          requester_name: 'John Doe',
          content_type: 'template',
          type: 'content_update',
          created_at: '2024-01-15T08:00:00Z',
          updated_at: '2024-01-15T09:00:00Z'
  }
        {
          id: 'rev_2',
          title: 'Request 2',
          status: 'under_review',
          priority: 'medium',
          total_count: '2',
          requester_name: 'Jane Smith',
          content_type: 'graph',
          type: 'feature_enhancement',
          created_at: '2024-01-14T08:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        }
      ]
    };

    const mockAggregationResults = {
      rows: [
        { status: 'submitted', priority: 'high', type: 'content_update', content_type: 'template', count: '1' },
        { status: 'under_review', priority: 'medium', type: 'feature_enhancement', content_type: 'graph', count: '1' }
      ]
    };

    beforeEach(() => {
      // Mock both the main query and the aggregations query
      mockDb.query.mockImplementation((query: string) => {
        if (query.includes('COUNT(*) OVER()')) {
          return Promise.resolve(mockSearchResults as unknown);
        }
        return Promise.resolve(mockAggregationResults as unknown);
      });
    });

    it('should search revision requests with basic query', async () => {
      const query: RevisionRequestSearchQuery = {
        page: 1,
        pageSize: 10,
        sortBy: 'created_at',
        sortOrder: 'desc'
      };

      const result = await service.searchRevisionRequests(query);

      expect(result).toBeDefined();
      expect(result.requests).toHaveLength(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.pageSize).toBe(10);
      expect(result.pagination.total).toBe(2);
      expect(mockDb.query).toHaveBeenCalled();
    });

    it('should search revision requests with status filter', async () => {
      const query: RevisionRequestSearchQuery = {
        status: [RevisionRequestStatus.SUBMITTED],
        page: 1,
        pageSize: 10
      };

      await service.searchRevisionRequests(query);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('rr.status = ANY'),
        expect.arrayContaining([['submitted']])
      );
    });

    it('should search revision requests with priority filter', async () => {
      const query: RevisionRequestSearchQuery = {
        priority: [RevisionRequestPriority.HIGH, RevisionRequestPriority.URGENT],
        page: 1,
        pageSize: 10
      };

      await service.searchRevisionRequests(query);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('rr.priority = ANY'),
        expect.arrayContaining([['high', 'urgent']])
      );
    });

    it('should search revision requests with date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      
      const query: RevisionRequestSearchQuery = {
        dateRange: { start: startDate, end: endDate },
        page: 1,
        pageSize: 10
      };

      await service.searchRevisionRequests(query);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('rr.created_at BETWEEN'),
        expect.arrayContaining([startDate, endDate])
      );
    });

    it('should search revision requests with text search', async () => {
      const query: RevisionRequestSearchQuery = {
        search: 'color scheme',
        page: 1,
        pageSize: 10
      };

      await service.searchRevisionRequests(query);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE'),
        expect.arrayContaining(['%color scheme%'])
      );
    });

    it('should handle pagination correctly', async () => {
      const query: RevisionRequestSearchQuery = {
        page: 3,
        pageSize: 25
      };

      await service.searchRevisionRequests(query);

      const offset = (3 - 1) * 25; // 50
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('OFFSET'),
        expect.arrayContaining([offset, 25])
      );
    });

    it('should filter by unassigned requests', async () => {
      const query: RevisionRequestSearchQuery = {
        unassigned: true,
        page: 1,
        pageSize: 10
      };

      await service.searchRevisionRequests(query);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('rr.reviewer_id IS NULL'),
        expect.any(Array)
      );
    });
  });

  describe('updateRevisionRequest', () => {
    it('should update a revision request', async () => {
      const mockResult = {
        rows: [{
          id: 'rev_test_123',
          title: 'Updated Title',
          status: 'under_review',
          reviewer_id: 'reviewer_456',
          updated_at: '2024-01-15T10:00:00Z'
          // ... other fields
        }]
      };

      mockDb.query.mockResolvedValue(mockResult as unknown as unknown);

      const updates = {
        title: 'Updated Title',
        status: RevisionRequestStatus.UNDER_REVIEW,
        reviewerId: 'reviewer_456'
      };

      const result = await service.updateRevisionRequest(
        'rev_test_123',
        updates,
        'admin_123',
        'Admin User'
      );

      expect(result).toBeDefined();
      expect(result.title).toBe('Updated Title');
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE revision_requests'),
        expect.arrayContaining(['Updated Title'])
      );
    });

    it('should throw error for non-existent revision request', async () => {
      mockDb.query.mockResolvedValue({ rows: [] } as unknown as unknown);

      await expect(service.updateRevisionRequest(
        'non_existent',
        { title: 'New Title' },
        'admin_123',
        'Admin User'
      )).rejects.toThrow('Revision request non_existent not found');
    });

    it('should throw error when no fields to update', async () => {
      await expect(service.updateRevisionRequest(
        'rev_test_123',
        {},
        'admin_123',
        'Admin User'
      )).rejects.toThrow('No valid fields to update');
    });
  });

  describe('assignReviewer', () => {
    it('should assign reviewer to revision request', async () => {
      const mockUpdateResult = {
        rows: [{
          id: 'rev_test_123',
          reviewer_id: 'reviewer_456',
          reviewer_name: 'Jane Reviewer',
          status: 'under_review',
          assigned_at: '2024-01-15T10:00:00Z'
        }]
      };

      const mockTimelineResult = {
        rows: [{
          id: 'event_123',
          event_type: 'assigned_to_reviewer',
          actor_name: 'Admin User',
          description: 'Assigned to reviewer: Jane Reviewer'
        }]
      };

      mockDb.query
        .mockResolvedValueOnce(mockUpdateResult as unknown) // Update query
        .mockResolvedValueOnce(mockTimelineResult as unknown); // Timeline query

      const result = await service.assignReviewer(
        'rev_test_123',
        'reviewer_456',
        'Jane Reviewer',
        'admin_123',
        'Admin User'
      );

      expect(result).toBeDefined();
      expect(result.reviewerId).toBe('reviewer_456');
      expect(result.reviewerName).toBe('Jane Reviewer');
      expect(result.status).toBe(RevisionRequestStatus.UNDER_REVIEW);
      
      // Should have called both update and timeline creation
      expect(mockDb.query).toHaveBeenCalledTimes(2);
    });
  });

  describe('reviewRevisionRequest', () => {
    it('should approve revision request', async () => {
      const mockResult = {
        rows: [{
          id: 'rev_test_123',
          status: 'approved',
          review_notes: 'Looks good, approved for implementation',
          approval_notes: 'All requirements met',
          completed_at: '2024-01-15T12:00:00Z'
        }]
      };

      mockDb.query
        .mockResolvedValueOnce({ rows: [{ id: 'timeline_123' }] } as unknown) // Timeline insert
        .mockResolvedValueOnce(mockResult as unknown); // Update query

      const reviewData: RevisionRequestReviewFormData = {
        decision: 'approve',
        reviewNotes: 'Looks good, approved for implementation',
        approvalNotes: 'All requirements met'
      };

      const result = await service.reviewRevisionRequest(
        'rev_test_123',
        reviewData,
        'reviewer_456',
        'Jane Reviewer'
      );

      expect(result).toBeDefined();
      expect(result.status).toBe(RevisionRequestStatus.APPROVED);
      expect(result.reviewNotes).toBe('Looks good, approved for implementation');
      expect(result.approvalNotes).toBe('All requirements met');
    });

    it('should reject revision request', async () => {
      const mockResult = {
        rows: [{
          id: 'rev_test_123',
          status: 'rejected',
          review_notes: 'Requirements not clear',
          rejection_reason: 'Insufficient detail in requested changes',
          completed_at: '2024-01-15T12:00:00Z'
        }]
      };

      mockDb.query
        .mockResolvedValueOnce({ rows: [{ id: 'timeline_123' }] } as unknown) // Timeline insert
        .mockResolvedValueOnce(mockResult as unknown); // Update query

      const reviewData: RevisionRequestReviewFormData = {
        decision: 'reject',
        reviewNotes: 'Requirements not clear',
        rejectionReason: 'Insufficient detail in requested changes'
      };

      const result = await service.reviewRevisionRequest(
        'rev_test_123',
        reviewData,
        'reviewer_456',
        'Jane Reviewer'
      );

      expect(result.status).toBe(RevisionRequestStatus.REJECTED);
      expect(result.rejectionReason).toBe('Insufficient detail in requested changes');
    });

    it('should request additional information', async () => {
      const mockResult = {
        rows: [{
          id: 'rev_test_123',
          status: 'additional_info_requested',
          review_notes: 'Please provide more details about the color specifications'
        }]
      };

      mockDb.query
        .mockResolvedValueOnce({ rows: [{ id: 'timeline_123' }] } as unknown) // Timeline insert
        .mockResolvedValueOnce(mockResult as unknown); // Update query

      const reviewData: RevisionRequestReviewFormData = {
        decision: 'request_info',
        reviewNotes: 'Please provide more details about the color specifications'
      };

      const result = await service.reviewRevisionRequest(
        'rev_test_123',
        reviewData,
        'reviewer_456',
        'Jane Reviewer'
      );

      expect(result.status).toBe(RevisionRequestStatus.ADDITIONAL_INFO_REQUESTED);
      expect(result.reviewNotes).toBe('Please provide more details about the color specifications');
    });

    it('should throw error for invalid review decision', async () => {
      const invalidReviewData = {
        decision: 'invalid_decision' as any,
        reviewNotes: 'Some notes'
      };

      await expect(service.reviewRevisionRequest(
        'rev_test_123',
        invalidReviewData,
        'reviewer_456',
        'Jane Reviewer'
      )).rejects.toThrow('Invalid review decision: invalid_decision');
    });
  });

  describe('Evidence Management', () => {
    it('should add evidence to revision request', async () => {
      const mockEvidenceResult = {
        rows: [{
          id: 'ev_test_123',
          revision_request_id: 'rev_test_123',
          evidence_type: 'screenshot',
          title: 'Current Color Scheme',
          description: 'Screenshot showing the current blue color scheme',
          file_url: 'https://example.com/screenshot.png',
          file_name: 'screenshot.png',
          file_size: 1024000,
          mime_type: 'image/png',
          uploaded_by: 'user_123',
          uploaded_at: '2024-01-15T11:00:00Z'
        }]
      };

      const mockTimelineResult = {
        rows: [{ id: 'timeline_123' }]
      };

      mockDb.query
        .mockResolvedValueOnce(mockEvidenceResult as unknown) // Evidence insert
        .mockResolvedValueOnce(mockTimelineResult as unknown); // Timeline insert

      const result = await service.addEvidence(
        'rev_test_123',
        RevisionEvidenceType.SCREENSHOT,
        'Current Color Scheme',
        'Screenshot showing the current blue color scheme',
        'https://example.com/screenshot.png',
        'screenshot.png',
        1024000,
        'image/png',
        'user_123'
      );

      expect(result).toBeDefined();
      expect(result.evidenceType).toBe(RevisionEvidenceType.SCREENSHOT);
      expect(result.title).toBe('Current Color Scheme');
      expect(result.fileUrl).toBe('https://example.com/screenshot.png');
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO revision_evidence'),
        expect.arrayContaining(['rev_test_123', 'screenshot', 'Current Color Scheme'])
      );
    });

    it('should get evidence for revision request', async () => {
      const mockResult = {
        rows: [{
          id: 'ev_test_123',
          revision_request_id: 'rev_test_123',
          evidence_type: 'screenshot',
          title: 'Current Color Scheme',
          uploaded_at: '2024-01-15T11:00:00Z'
        }]
      };

      mockDb.query.mockResolvedValue(mockResult as unknown as unknown);

      const result = await service.getRevisionEvidence('rev_test_123');

      expect(result).toHaveLength(1);
      expect(result[0].evidenceType).toBe(RevisionEvidenceType.SCREENSHOT);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM revision_evidence'),
        ['rev_test_123']
      );
    });

    it('should remove evidence', async () => {
      const mockEvidenceResult = {
        rows: [{
          id: 'ev_test_123',
          revision_request_id: 'rev_test_123',
          title: 'Old Screenshot'
        }]
      };

      mockDb.query
        .mockResolvedValueOnce(mockEvidenceResult as unknown) // Evidence lookup
        .mockResolvedValueOnce({ rows: [] } as unknown) // Delete query
        .mockResolvedValueOnce({ rows: [{ id: 'timeline_123' }] } as unknown); // Timeline insert

      await service.removeEvidence('ev_test_123', 'admin_123', 'Admin User');

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM revision_evidence'),
        ['ev_test_123']
      );
    });
  });

  describe('Comments Management', () => {
    it('should add comment to revision request', async () => {
      const mockResult = {
        rows: [{
          id: 'comment_123',
          revision_request_id: 'rev_test_123',
          author_id: 'user_123',
          author_name: 'John User',
          content: 'This looks great, when can we expect implementation?',
          is_internal: false,
          created_at: '2024-01-15T13:00:00Z'
        }]
      };

      mockDb.query
        .mockResolvedValueOnce(mockResult as unknown) // Comment insert
        .mockResolvedValueOnce({ rows: [{ id: 'timeline_123' }] } as unknown); // Timeline insert

      const result = await service.addComment(
        'rev_test_123',
        'This looks great, when can we expect implementation?',
        'user_123',
        'John User',
        false,
        undefined,
        []
      );

      expect(result).toBeDefined();
      expect(result.content).toBe('This looks great, when can we expect implementation?');
      expect(result.isInternal).toBe(false);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO revision_comments'),
        expect.arrayContaining(['rev_test_123', 'user_123', 'John User'])
      );
    });

    it('should get comments for revision request', async () => {
      const mockResult = {
        rows: [
          {
            id: 'comment_1',
            content: 'First comment',
            is_internal: false,
            created_at: '2024-01-15T13:00:00Z'
  }
          {
            id: 'comment_2',
            content: 'Internal note',
            is_internal: true,
            created_at: '2024-01-15T14:00:00Z'
          }
        ]
      };

      mockDb.query.mockResolvedValue(mockResult as unknown as unknown);

      const result = await service.getComments('rev_test_123', true);

      expect(result).toHaveLength(2);
      expect(result[0].isInternal).toBe(false);
      expect(result[1].isInternal).toBe(true);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM revision_comments'),
        ['rev_test_123']
      );
    });

    it('should exclude internal comments when requested', async () => {
      const mockResult = {
        rows: [{
          id: 'comment_1',
          content: 'Public comment',
          is_internal: false,
          created_at: '2024-01-15T13:00:00Z'
        }]
      };

      mockDb.query.mockResolvedValue(mockResult as unknown as unknown);

      const result = await service.getComments('rev_test_123', false);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('AND is_internal = FALSE'),
        ['rev_test_123']
      );
    });
  });

  describe('Analytics and Performance', () => {
    it('should get revision request analytics', async () => {
      // Mock multiple analytics queries
      mockDb.query.mockImplementation((query: string) => {
        if (query.includes('total_requests')) {
          return Promise.resolve({
            rows: [{
              total_requests: '50',
              completed_requests: '35',
              pending_requests: '15',
              overdue_requests: '3',
              average_completion_time: '24.5'
            }]
          } as unknown);
        }
        return Promise.resolve({ rows: [] } as unknown);
      });

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const result = await service.getRevisionRequestAnalytics(startDate, endDate);

      expect(result).toBeDefined();
      expect(result.period.startDate).toEqual(startDate);
      expect(result.period.endDate).toEqual(endDate);
      expect(mockDb.query).toHaveBeenCalled();
    });

    it('should get reviewer performance', async () => {
      const mockResult = {
        rows: [{
          reviewer_id: 'reviewer_456',
          reviewer_name: 'Jane Reviewer',
          total_assigned: '25',
          total_completed: '20',
          avg_completion_hours: '16.5',
          on_time_rate: '0.85'
        }]
      };

      mockDb.query.mockResolvedValue(mockResult as unknown as unknown);

      const result = await service.getReviewerPerformance('reviewer_456');

      expect(result).toHaveLength(1);
      expect(result[0].reviewerId).toBe('reviewer_456');
      expect(result[0].totalAssigned).toBe(25);
      expect(result[0].totalCompleted).toBe(20);
      expect(result[0].onTimeRate).toBe(0.85);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('reviewer_id IS NOT NULL'),
        ['reviewer_456']
      );
    });

    it('should get all reviewer performance when no specific reviewer provided', async () => {
      const mockResult = {
        rows: [
          {
            reviewer_id: 'reviewer_1',
            reviewer_name: 'Reviewer One',
            total_assigned: '15',
            total_completed: '12'
  }
          {
            reviewer_id: 'reviewer_2',
            reviewer_name: 'Reviewer Two',
            total_assigned: '20',
            total_completed: '18'
          }
        ]
      };

      mockDb.query.mockResolvedValue(mockResult as unknown as unknown);

      const result = await service.getReviewerPerformance();

      expect(result).toHaveLength(2);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('reviewer_id IS NOT NULL'),
        []
      );
    });
  });

  describe('Export Functionality', () => {
    beforeEach(() => {
      // Mock searchRevisionRequests for export
      jest.spyOn(service, 'searchRevisionRequests').mockResolvedValue({
        requests: [mockRevisionRequest],
        pagination: { page: 1, pageSize: 10000, total: 1, totalPages: 1 },
        aggregations: {} as any,
        filters: { count: 0, filters: [] }
      } as unknown as unknown);
    });

    it('should export revision requests in CSV format', async () => {
      const exportRequest = {
        format: 'csv' as const,
        query: {},
        fields: ['id', 'title', 'status', 'priority']
      };

      const result = await service.exportRevisionRequests(exportRequest);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('id,title,status,priority');
      expect(result).toContain('rev_test_123');
      expect(result).toContain('Update Template Color Scheme');
    });

    it('should export revision requests in JSON format', async () => {
      const exportRequest = {
        format: 'json' as const,
        query: {}
      };

      const result = await service.exportRevisionRequests(exportRequest);

      expect(result).toBeDefined();
      
      const parsed = JSON.parse(result);
      expect(parsed.exported_at).toBeDefined();
      expect(parsed.total_records).toBe(1);
      expect(parsed.revision_requests).toHaveLength(1);
      expect(parsed.revision_requests[0].id).toBe('rev_test_123');
    });

    it('should handle unsupported export format', async () => {
      const exportRequest = {
        format: 'xml' as any,
        query: {}
      };

      await expect(service.exportRevisionRequests(exportRequest))
        .rejects.toThrow('Unsupported export format: xml');
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection failures gracefully', async () => {
      mockDb.query.mockRejectedValue(new Error('Connection timeout'));

      await expect(service.getRevisionRequest('rev_123'))
        .rejects.toThrow('Connection timeout');
    });

    it('should handle malformed data gracefully', async () => {
      const malformedResult = {
        rows: [{
          id: 'rev_malformed'
          // Missing required fields
        }]
      };

      mockDb.query.mockResolvedValue(malformedResult as unknown as unknown);

      const result = await service.getRevisionRequest('rev_malformed');

      // Should handle missing fields and provide defaults
      expect(result?.id).toBe('rev_malformed');
    });

    it('should validate review decisions', async () => {
      const invalidReviewData = {
        decision: 'maybe' as any,
        reviewNotes: 'Not sure'
      };

      await expect(service.reviewRevisionRequest(
        'rev_test_123',
        invalidReviewData,
        'reviewer_456',
        'Jane Reviewer'
      )).rejects.toThrow('Invalid review decision: maybe');
    });
  });

  describe('Workflow Integration', () => {
    it('should support end-to-end workflow', async () => {
      // Mock create request
      mockDb.query.mockResolvedValueOnce({
        rows: [{ id: 'rev_new_123', status: 'draft' }]
      } as unknown);

      // Mock submit request
      mockDb.query
        .mockResolvedValueOnce({ rows: [{ id: 'timeline_123' }] } as unknown)
        .mockResolvedValueOnce({
          rows: [{ id: 'rev_new_123', status: 'submitted' }]
        } as unknown);

      // Mock assign reviewer
      mockDb.query
        .mockResolvedValueOnce({ rows: [{ id: 'timeline_124' }] } as unknown)
        .mockResolvedValueOnce({
          rows: [{ id: 'rev_new_123', status: 'under_review', reviewer_id: 'reviewer_456' }]
        } as unknown);

      // Create request
      const createdRequest = await service.createRevisionRequest(
        mockFormData,
        'user_123',
        'John User',
        'john@example.com'
      );

      expect(createdRequest.status).toBe(RevisionRequestStatus.DRAFT);

      // Submit request
      const submittedRequest = await service.submitRevisionRequest(
        'rev_new_123',
        'user_123',
        'John User'
      );

      expect(submittedRequest.status).toBe(RevisionRequestStatus.SUBMITTED);

      // Assign reviewer
      const assignedRequest = await service.assignReviewer(
        'rev_new_123',
        'reviewer_456',
        'Jane Reviewer',
        'admin_123',
        'Admin User'
      );

      expect(assignedRequest.status).toBe(RevisionRequestStatus.UNDER_REVIEW);
      expect(assignedRequest.reviewerId).toBe('reviewer_456');
    });
  });
});

describe('RevisionRequestService Integration', () => {
  let service: RevisionRequestService;
  let mockDb: jest.Mocked<Database>;

  beforeEach(() => {
    mockDb = {
      query: jest.fn<unknown[], unknown>()
    } as any;
    service = new RevisionRequestService(mockDb);
  });

  it('should support complex search with multiple filters and get detailed analytics', async () => {
    // Mock complex search with multiple results
    mockDb.query.mockImplementation((query: string) => {
      if (query.includes('COUNT(*) OVER()')) {
        return Promise.resolve({
          rows: [
            { id: 'rev_1', status: 'submitted', priority: 'high', content_type: 'template', total_count: '3' },
            { id: 'rev_2', status: 'under_review', priority: 'medium', content_type: 'graph', total_count: '3' },
            { id: 'rev_3', status: 'approved', priority: 'high', content_type: 'template', total_count: '3' }
          ]
        } as unknown);
      }
      if (query.includes('GROUP BY')) {
        return Promise.resolve({
          rows: [
            { status: 'submitted', priority: 'high', type: 'content_update', content_type: 'template', count: '2' },
            { status: 'under_review', priority: 'medium', type: 'feature_enhancement', content_type: 'graph', count: '1' }
          ]
        } as unknown);
      }
      return Promise.resolve({ rows: [] } as unknown);
    });

    // Perform complex search
    const searchResults = await service.searchRevisionRequests({
      status: [RevisionRequestStatus.SUBMITTED, RevisionRequestStatus.UNDER_REVIEW],
      priority: [RevisionRequestPriority.HIGH, RevisionRequestPriority.MEDIUM],
      contentType: [RevisionContentType.TEMPLATE, RevisionContentType.GRAPH],
      search: 'color scheme',
      page: 1,
      pageSize: 10
    });

    expect(searchResults.requests).toHaveLength(3);
    expect(searchResults.aggregations.statusBreakdown.submitted).toBe(2);
    expect(searchResults.aggregations.statusBreakdown.under_review).toBe(1);

    // Mock analytics queries
    mockDb.query.mockImplementation((query: string) => {
      if (query.includes('total_requests')) {
        return Promise.resolve({
          rows: [{
            total_requests: '3',
            completed_requests: '1',
            pending_requests: '2'
          }]
        } as unknown);
      }
      return Promise.resolve({ rows: [] } as unknown);
    });

    // Get analytics for the same period
    const analytics = await service.getRevisionRequestAnalytics(
      new Date('2024-01-01'),
      new Date('2024-01-31')
    );

    expect(analytics).toBeDefined();
    expect(analytics.overview).toBeDefined();
  });
});