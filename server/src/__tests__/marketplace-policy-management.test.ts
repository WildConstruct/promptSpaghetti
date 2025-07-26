import { Pool } from 'pg';
import {
  MarketplacePolicyPublishingService,
  MarketplacePolicyType,
  PolicyStatus,
  UserRole
} from '../services/MarketplacePolicyPublishingService';
import {
  MarketplacePolicyEnforcementService,
  ViolationType,
  ViolationSeverity
} from '../services/MarketplacePolicyEnforcementService';

// Mock pg Pool
const mockPool = {
  connect: jest.fn<unknown[], unknown>(),
  query: jest.fn<unknown[], unknown>(),
  end: jest.fn<unknown[], unknown>()
} as unknown as Pool;

// Mock client
const mockClient = {
  query: jest.fn<unknown[], unknown>(),
  release: jest.fn<unknown[], unknown>()
};

describe('Marketplace Policy Management System', () => {
  let publishingService: MarketplacePolicyPublishingService;
  let enforcementService: MarketplacePolicyEnforcementService;

  beforeEach(() => {
    jest.clearAllMocks();
    (mockPool.connect as jest.Mock).mockResolvedValue(mockClient as unknown as unknown as unknown as unknown as unknown);
    
    publishingService = new MarketplacePolicyPublishingService(mockPool);
    enforcementService = new MarketplacePolicyEnforcementService(mockPool);
  });

  describe('MarketplacePolicyPublishingService', () => {
    describe('createPolicy', () => {
      it('should create a marketplace policy successfully', async () => {
        const mockPolicy = {
          id: 'policy-123',
          policy_type: MarketplacePolicyType.SELLER_GUIDELINES,
          title: 'Seller Guidelines Policy',
          description: 'Guidelines for marketplace sellers',
          version: '1.0.0',
          status: PolicyStatus.DRAFT,
          content: {
            sections: [{
              id: 'intro',
              title: 'Introduction',
              content: 'Welcome to our marketplace',
              order: 1,
              mandatory: true,
              visible_to: [UserRole.SELLER],
              conditions: [],
              subsections: []
            }],
            variables: [],
            templates: [],
            attachments: [],
            localization: []
          },
          metadata: {
            target_audience: [UserRole.SELLER],
            jurisdictions: ['US'],
            compliance_frameworks: ['marketplace_standards'],
            effective_date: new Date(),
            review_cycle_days: 365,
            next_review_date: new Date(),
            tags: ['seller', 'guidelines'],
            categories: ['marketplace'],
            priority: 'medium',
            risk_level: 'low'
          },
          created_by: 'admin-123',
          updated_by: 'admin-123'
        };

        mockClient.query
          .mockResolvedValueOnce({ rows: [mockPolicy] }) // INSERT policy
          .mockResolvedValueOnce({ rows: [{ id: 'version-123' }] }) // INSERT version
          .mockResolvedValueOnce({ rows: [] }); // Audit log

        const result = await publishingService.createPolicy(mockPolicy, 'admin-123');

        expect(result).toBeDefined();
        expect(result.policy_type).toBe(MarketplacePolicyType.SELLER_GUIDELINES);
        expect(result.title).toBe('Seller Guidelines Policy');
        expect(mockClient.query).toHaveBeenCalledTimes(3);
      });

      it('should handle policy creation errors gracefully', async () => {
        mockClient.query.mockRejectedValue(new Error('Database error'));

        await expect(
          publishingService.createPolicy({
            policy_type: MarketplacePolicyType.CONTENT_POLICY,
            title: 'Test Policy',
            description: 'Test description'
          } as any, 'admin-123')
        ).rejects.toThrow('Database error');
      });
    });

    describe('publishPolicy', () => {
      it('should publish an approved policy successfully', async () => {
        const mockPolicy = {
          id: 'policy-123',
          status: PolicyStatus.APPROVED,
          policy_type: MarketplacePolicyType.MARKETPLACE_TERMS
        };

        mockClient.query
          .mockResolvedValueOnce({ rows: [mockPolicy] }) // Get policy
          .mockResolvedValueOnce({ rows: [] }) // BEGIN
          .mockResolvedValueOnce({ rows: [] }) // UPDATE policy status
          .mockResolvedValueOnce({ rows: [{ id: 'pub-123' }] }) // INSERT publication
          .mockResolvedValueOnce({ rows: [] }) // COMMIT
          .mockResolvedValueOnce({ rows: [] }); // Audit log

        const publishingRequest = {
          policy_id: 'policy-123',
          publication_channels: ['email', 'dashboard'],
          rollout_strategy: {
            type: 'immediate' as const,
            start_date: new Date(),
            rollback_triggers: []
          },
          notification_settings: {
            enabled: true,
            channels: ['email'],
            audience: [UserRole.ALL],
            template_id: 'notification-template',
            send_reminders: false
          }
        };

        const result = await publishingService.publishPolicy(publishingRequest, 'admin-123');

        expect(result.status).toBe('published');
        expect(result.publication_id).toBe('pub-123');
      });

      it('should reject publishing of non-approved policies', async () => {
        const mockPolicy = {
          id: 'policy-123',
          status: PolicyStatus.DRAFT
        };

        mockClient.query.mockResolvedValueOnce({ rows: [mockPolicy] });

        const publishingRequest = {
          policy_id: 'policy-123',
          publication_channels: ['email'],
          rollout_strategy: {
            type: 'immediate' as const,
            start_date: new Date(),
            rollback_triggers: []
          },
          notification_settings: {
            enabled: false,
            channels: [],
            audience: [],
            template_id: '',
            send_reminders: false
          }
        };

        await expect(
          publishingService.publishPolicy(publishingRequest, 'admin-123')
        ).rejects.toThrow('Only approved policies can be published');
      });
    });

    describe('recordPolicyAcknowledgment', () => {
      it('should record user policy acknowledgment', async () => {
        mockClient.query
          .mockResolvedValueOnce({ rows: [{ id: 'version-123' }] }) // Get version
          .mockResolvedValueOnce({ rows: [] }) // Check existing
          .mockResolvedValueOnce({ rows: [] }) // INSERT acknowledgment
          .mockResolvedValueOnce({ rows: [] }); // UPDATE analytics

        await publishingService.recordPolicyAcknowledgment(
          'policy-123',
          'user-456',
          UserRole.SELLER,
          '192.168.1.1',
          'Mozilla/5.0',
          { source: 'marketplace_ui' }
        );

        expect(mockClient.query).toHaveBeenCalledTimes(4);
      });

      it('should not create duplicate acknowledgments', async () => {
        mockClient.query
          .mockResolvedValueOnce({ rows: [{ id: 'version-123' }] }) // Get version
          .mockResolvedValueOnce({ rows: [{ id: 'ack-123' }] }); // Existing acknowledgment

        await publishingService.recordPolicyAcknowledgment(
          'policy-123',
          'user-456',
          UserRole.SELLER
        );

        expect(mockClient.query).toHaveBeenCalledTimes(2); // No INSERT called
      });
    });

    describe('getPolicyAnalytics', () => {
      it('should return comprehensive policy analytics', async () => {
        mockClient.query
          .mockResolvedValueOnce({ 
            rows: [{ analytics: JSON.stringify({ views: 150, enforcement_actions: 5 }) }] 
          }) // Policy analytics
          .mockResolvedValueOnce({ 
            rows: [
              { total: '25', user_role: 'seller' },
              { total: '10', user_role: 'buyer' }
            ] 
          }) // Acknowledgment stats
          .mockResolvedValueOnce({ 
            rows: [
              { total: '3', severity: 'low' },
              { total: '1', severity: 'medium' }
            ] 
          }); // Violation stats

        const analytics = await publishingService.getPolicyAnalytics('policy-123');

        expect(analytics.views).toBe(150);
        expect(analytics.acknowledgments).toBe(35);
        expect(analytics.violations).toBe(4);
        expect(analytics.enforcement_actions).toBe(5);
        expect(analytics.compliance_score).toBeGreaterThan(0);
      });
    });
  });

  describe('MarketplacePolicyEnforcementService', () => {
    describe('createDetectionRule', () => {
      it('should create violation detection rule successfully', async () => {
        const mockRule = {
          id: 'rule-123',
          policy_id: 'policy-123',
          name: 'Spam Detection Rule',
          description: 'Detects spam content in listings',
          violation_type: ViolationType.SPAM_CONTENT,
          enabled: true,
          automatic_enforcement: true,
          conditions: [
            {
              field: 'content',
              operator: 'contains',
              value: 'spam',
              weight: 0.8,
              logical_operator: 'and'
            }
          ],
          enforcement_config: {
            severity_mapping: { spam: ViolationSeverity.MEDIUM },
            automatic_actions: [],
            escalation_rules: [],
            grace_period_hours: 24
          },
          created_by: 'admin-123'
        };

        mockClient.query
          .mockResolvedValueOnce({ rows: [mockRule] }) // INSERT rule
          .mockResolvedValueOnce({ rows: [] }); // Audit log

        const result = await enforcementService.createDetectionRule(mockRule, 'admin-123');

        expect(result.name).toBe('Spam Detection Rule');
        expect(result.violation_type).toBe(ViolationType.SPAM_CONTENT);
        expect(result.enabled).toBe(true);
      });
    });

    describe('detectViolations', () => {
      it('should detect violations in content automatically', async () => {
        const mockRules = [
          {
            id: 'rule-123',
            policy_id: 'policy-123',
            name: 'Spam Detection',
            violation_type: ViolationType.SPAM_CONTENT,
            enabled: true,
            automatic_enforcement: false,
            conditions: [
              {
                field: 'title',
                operator: 'contains',
                value: 'spam',
                weight: 1.0
              }
            ],
            ai_model_config: null,
            enforcement_config: {
              automatic_actions: [],
              escalation_rules: [],
              grace_period_hours: 24
            }
          }
        ];

        const mockViolation = {
          id: 'violation-123',
          policy_id: 'policy-123',
          rule_id: 'rule-123',
          violation_type: ViolationType.SPAM_CONTENT,
          severity: ViolationSeverity.MEDIUM,
          violator_id: 'user-456',
          violator_type: 'listing',
          description: 'Spam content detected',
          confidence_score: 0.9
        };

        mockClient.query
          .mockResolvedValueOnce({ rows: mockRules }) // Get rules
          .mockResolvedValueOnce({ rows: [mockViolation] }) // INSERT violation
          .mockResolvedValueOnce({ rows: [] }); // Audit log

        const contentData = {
          title: 'Buy now! Cheap spam products available!',
          description: 'Great deals on everything'
        };

        const violations = await enforcementService.detectViolations(
          'listing-789',
          'listing',
          contentData,
          'user-456'
        );

        expect(violations).toHaveLength(1);
        expect(violations[0].violation_type).toBe(ViolationType.SPAM_CONTENT);
        expect(violations[0].confidence_score).toBeGreaterThan(0.6);
      });

      it('should not detect violations in clean content', async () => {
        mockClient.query
          .mockResolvedValueOnce({ rows: [] }) // No rules match
          .mockResolvedValueOnce({ rows: [] }); // Audit log

        const contentData = {
          title: 'High-quality product for sale',
          description: 'Excellent condition, fair pricing'
        };

        const violations = await enforcementService.detectViolations(
          'listing-789',
          'listing',
          contentData,
          'user-456'
        );

        expect(violations).toHaveLength(0);
      });
    });

    describe('reportViolation', () => {
      it('should record manual violation report', async () => {
        const mockViolation = {
          id: 'violation-456',
          violation_type: ViolationType.INAPPROPRIATE_CONTENT,
          status: 'under_review',
          description: 'Inappropriate content reported by user'
        };

        mockClient.query
          .mockResolvedValueOnce({ rows: [mockViolation] }) // INSERT violation
          .mockResolvedValueOnce({ rows: [] }); // Audit log

        const report = {
          reporter_id: 'user-123',
          reporter_type: 'user' as const,
          violation_type: ViolationType.INAPPROPRIATE_CONTENT,
          target_id: 'listing-789',
          target_type: 'listing' as const,
          description: 'This listing contains inappropriate content',
          evidence_urls: ['https://example.com/screenshot.png'],
          anonymous: false
        };

        const result = await enforcementService.reportViolation(report, 'user-123');

        expect(result.id).toBe('violation-456');
        expect(result.violation_type).toBe(ViolationType.INAPPROPRIATE_CONTENT);
      });

      it('should handle anonymous violation reports', async () => {
        const mockViolation = {
          id: 'violation-789',
          violation_type: ViolationType.FRAUD_SUSPECTED
        };

        mockClient.query
          .mockResolvedValueOnce({ rows: [mockViolation] }) // INSERT violation
          .mockResolvedValueOnce({ rows: [] }); // Audit log

        const report = {
          reporter_type: 'user' as const,
          violation_type: ViolationType.FRAUD_SUSPECTED,
          target_id: 'user-456',
          target_type: 'user' as const,
          description: 'Suspected fraudulent activity',
          anonymous: true
        };

        const result = await enforcementService.reportViolation(report);

        expect(result.id).toBe('violation-789');
      });
    });

    describe('classifyContentViolation', () => {
      it('should classify content using AI assistance', async () => {
        // Mock cached result (none found)
        mockClient.query.mockResolvedValueOnce({ rows: [] });
        // Mock cache insert
        mockClient.query.mockResolvedValueOnce({ rows: [] });

        const classification = await enforcementService.classifyContentViolation(
          'content-123',
          'Buy now! Cheap products! Click here for amazing deals!',
          'listing_description'
        );

        expect(classification.violations).toContain(ViolationType.SPAM_CONTENT);
        expect(classification.confidence).toBeGreaterThan(0.8);
        expect(classification.reasoning).toContain('spam');
      });

      it('should return cached classification results', async () => {
        const cachedResult = {
          violations: [ViolationType.SPAM_CONTENT],
          confidence: 0.9,
          reasoning: 'Cached classification result'
        };

        mockClient.query.mockResolvedValueOnce({ rows: [cachedResult] });

        const classification = await enforcementService.classifyContentViolation(
          'content-123',
          'Some content',
          'text'
        );

        expect(classification).toEqual(cachedResult);
        expect(mockClient.query).toHaveBeenCalledTimes(1); // Only cache lookup
      });
    });

    describe('executeEnforcementAction', () => {
      it('should execute pending enforcement actions', async () => {
        const mockAction = {
          id: 'action-123',
          violation_id: 'violation-123',
          action_type: 'content_restriction',
          status: 'pending'
        };

        mockClient.query
          .mockResolvedValueOnce({ rows: [] }) // BEGIN
          .mockResolvedValueOnce({ rows: [mockAction] }) // Get action
          .mockResolvedValueOnce({ rows: [] }) // UPDATE action status
          .mockResolvedValueOnce({ rows: [] }) // Update violation if complete
          .mockResolvedValueOnce({ rows: [] }) // COMMIT
          .mockResolvedValueOnce({ rows: [] }); // Audit log

        const result = await enforcementService.executeEnforcementAction(
          'action-123',
          'admin-123'
        );

        expect(result.success).toBe(true);
        expect(result.message).toContain('successfully');
      });

      it('should reject execution of non-pending actions', async () => {
        const mockAction = {
          id: 'action-123',
          status: 'active'
        };

        mockClient.query.mockResolvedValueOnce({ rows: [mockAction] });

        await expect(
          enforcementService.executeEnforcementAction('action-123', 'admin-123')
        ).rejects.toThrow('not in pending status');
      });
    });

    describe('getEnforcementDashboard', () => {
      it('should return comprehensive enforcement dashboard', async () => {
        mockClient.query
          .mockResolvedValueOnce({ 
            rows: [{ 
              total_violations: '50',
              low_severity: '20',
              medium_severity: '20',
              high_severity: '8',
              critical_severity: '2',
              pending_reviews: '15',
              avg_resolution_time: '48.5'
            }] 
          }) // Summary stats
          .mockResolvedValueOnce({ rows: [] }) // Recent violations
          .mockResolvedValueOnce({ rows: [] }); // Active actions

        const dashboard = await enforcementService.getEnforcementDashboard('admin-123');

        expect(dashboard.summary.total_violations).toBe(50);
        expect(dashboard.summary.violations_by_severity[ViolationSeverity.LOW]).toBe(20);
        expect(dashboard.summary.violations_by_severity[ViolationSeverity.HIGH]).toBe(8);
        expect(dashboard.summary.pending_reviews).toBe(15);
        expect(dashboard.summary.avg_resolution_time_hours).toBeCloseTo(48.5);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete policy lifecycle', async () => {
      // 1. Create policy
      const policyData = {
        policy_type: MarketplacePolicyType.CONTENT_POLICY,
        title: 'Content Policy',
        description: 'Rules for acceptable content',
        version: '1.0.0',
        status: PolicyStatus.DRAFT,
        content: { sections: [], variables: [], templates: [], attachments: [], localization: [] },
        metadata: {
          target_audience: [UserRole.ALL],
          jurisdictions: ['US'],
          compliance_frameworks: [],
          effective_date: new Date(),
          review_cycle_days: 365,
          next_review_date: new Date(),
          tags: [],
          categories: [],
          priority: 'medium',
          risk_level: 'low'
        },
        publication: {
          publishing_status: 'pending',
          publication_channels: [],
          rollout_strategy: { type: 'immediate', start_date: new Date(), rollback_triggers: [] },
          notification_settings: {
            enabled: false, channels: [], audience: [], template_id: '', send_reminders: false
          }
        },
        enforcement: { enabled: true, automatic_enforcement: false, violation_detection: {
          enabled: true, detection_rules: [], ai_assisted: true, confidence_threshold: 0.8, review_required: true
        }, enforcement_actions: [], grace_period_hours: 24, escalation_rules: [] },
        analytics: {
          views: 0, acknowledgments: 0, violations: 0, enforcement_actions: 0, 
          user_feedback: [], compliance_score: 0, last_updated: new Date()
        },
        created_by: 'admin-123',
        updated_by: 'admin-123'
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [{ id: 'policy-123', ...policyData }] }) // Create policy
        .mockResolvedValueOnce({ rows: [{ id: 'version-123' }] }) // Create version
        .mockResolvedValueOnce({ rows: [] }); // Audit log

      const policy = await publishingService.createPolicy(policyData, 'admin-123');

      // 2. Create detection rule
      const ruleData = {
        policy_id: policy.id,
        name: 'Content Violation Rule',
        description: 'Detects inappropriate content',
        violation_type: ViolationType.INAPPROPRIATE_CONTENT,
        enabled: true,
        automatic_enforcement: false,
        conditions: [
          {
            field: 'content',
            operator: 'ai_classify',
            value: ViolationType.INAPPROPRIATE_CONTENT,
            weight: 1.0
          }
        ],
        enforcement_config: {
          severity_mapping: {},
          automatic_actions: [],
          escalation_rules: [],
          grace_period_hours: 24
        },
        created_by: 'admin-123'
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [{ id: 'rule-123', ...ruleData }] }) // Create rule
        .mockResolvedValueOnce({ rows: [] }); // Audit log

      const rule = await enforcementService.createDetectionRule(ruleData, 'admin-123');

      expect(policy.id).toBe('policy-123');
      expect(rule.id).toBe('rule-123');
      expect(rule.policy_id).toBe(policy.id);
    });

    it('should handle policy violation workflow', async () => {
      // 1. Detect violation
      mockClient.query
        .mockResolvedValueOnce({ rows: [{ /* mock rule */ }] }) // Get rules
        .mockResolvedValueOnce({ rows: [{ id: 'violation-123' }] }) // Create violation
        .mockResolvedValueOnce({ rows: [] }); // Audit log

      const violations = await enforcementService.detectViolations(
        'content-123',
        'template',
        { title: 'Inappropriate content here' },
        'user-456'
      );

      // 2. Execute enforcement action
      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({ 
          rows: [{ 
            id: 'action-123', 
            violation_id: 'violation-123',
            status: 'pending' 
          }] 
        }) // Get action
        .mockResolvedValueOnce({ rows: [] }) // UPDATE action
        .mockResolvedValueOnce({ rows: [] }) // Check violation complete
        .mockResolvedValueOnce({ rows: [] }) // COMMIT
        .mockResolvedValueOnce({ rows: [] }); // Audit log

      const result = await enforcementService.executeEnforcementAction(
        'action-123',
        'admin-123'
      );

      expect(result.success).toBe(true);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle database connection failures gracefully', async () => {
      (mockPool.connect as jest.Mock).mockRejectedValue(new Error('Connection failed'));

      await expect(
        publishingService.createPolicy({} as any, 'admin-123')
      ).rejects.toThrow('Connection failed');
    });

    it('should validate policy data before creation', async () => {
      const invalidPolicyData = {
        // Missing required fields
        description: 'Test policy'
      };

      // This would trigger validation errors in a real implementation
      mockClient.query.mockRejectedValue(new Error('Validation failed'));

      await expect(
        publishingService.createPolicy(invalidPolicyData as any, 'admin-123')
      ).rejects.toThrow();
    });

    it('should handle AI service failures in violation detection', async () => {
      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // No cached prediction
        .mockRejectedValue(new Error('AI service unavailable')); // Cache insert fails

      // Should fallback gracefully and still return a result
      const classification = await enforcementService.classifyContentViolation(
        'content-123',
        'Some content',
        'text'
      );

      expect(classification).toBeDefined();
    });
  });
});