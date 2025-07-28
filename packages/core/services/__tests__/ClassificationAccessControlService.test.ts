/**
 * Tests for Classification Access Control Service
 * 
 * Comprehensive test suite covering access control policies,
 * user clearance validation, and audit logging.
 */
import ClassificationAccessControlService, {
  AccessRequest,
  UserAccessProfile
} from '../ClassificationAccessControlService';
import { DataClassificationLevel, OperationContext } from '../../types/DataClassification';
describe('ClassificationAccessControlService', () => {
  let service: ClassificationAccessControlService;
  let mockUserProfile: UserAccessProfile;
  let mockRequest: AccessRequest;
  let mockContext: OperationContext;
  beforeEach(() => {
    service = new ClassificationAccessControlService();
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
    mockUserProfile = {
      userId: 'user123',
      roles: ['analyst', 'user'],
      clearanceLevel: 'INTERNAL' as DataClassificationLevel,
      permissions: ['data.read', 'data.analyze'],
      restrictions: [],
      mfaVerified: true,
      lastAuthenticationAt: new Date(),
      authenticationLevel: 'MFA',
    };
    mockRequest = {
      userId: 'user123',
      dataId: 'data123',
      classification: 'INTERNAL' as DataClassificationLevel,
      operation: 'read',
      purpose: 'data analysis',
      context: mockContext,
      requestedAt: new Date()
    };
  });
  describe('Default Policy Initialization', () => {
    it('should initialize with default policies for all classification levels', () => {
      const publicPolicy = service.getAccessPolicy('PUBLIC');
      const internalPolicy = service.getAccessPolicy('INTERNAL');
      const confidentialPolicy = service.getAccessPolicy('CONFIDENTIAL');
      const restrictedPolicy = service.getAccessPolicy('RESTRICTED');
      expect(publicPolicy).toBeDefined();
      expect(internalPolicy).toBeDefined();
      expect(confidentialPolicy).toBeDefined();
      expect(restrictedPolicy).toBeDefined();
      expect(publicPolicy?.requirements.authenticationLevel).toBe('STANDARD');
      expect(internalPolicy?.requirements.authenticationLevel).toBe('STANDARD');
      expect(confidentialPolicy?.requirements.authenticationLevel).toBe('MFA');
      expect(restrictedPolicy?.requirements.authenticationLevel).toBe('STRONG_MFA');
    });
    it('should have progressively stricter requirements for higher classifications', () => {
      const publicPolicy = service.getAccessPolicy('PUBLIC');
      const restrictedPolicy = service.getAccessPolicy('RESTRICTED');
      expect(publicPolicy?.requirements.approvalWorkflow).toBe(false);
      expect(restrictedPolicy?.requirements.approvalWorkflow).toBe(true);
      expect(publicPolicy?.requirements.timeRestrictions).toBe(false);
      expect(restrictedPolicy?.requirements.timeRestrictions).toBe(true);
      expect(publicPolicy?.requirements.auditLogging).toBe('STANDARD');
      expect(restrictedPolicy?.requirements.auditLogging).toBe('REALTIME');
    });
  });
  describe('Access Evaluation', () => {
    beforeEach(async () => {
      await service.registerUserProfile(mockUserProfile);
    });
    it('should grant access when user has sufficient clearance', async () => {
      const decision = await service.evaluateAccess(mockRequest);
      expect(decision.granted).toBe(true);
      expect(decision.reason).toContain('Access granted');
      expect(decision.auditRequired).toBe(true);
    });
    it('should deny access when user lacks sufficient clearance', async () => {
      // Give user sufficient authentication but insufficient clearance
      const userWithStrongAuth = {
        ...mockUserProfile,
        authenticationLevel: 'STRONG_MFA' as const // Satisfies RESTRICTED auth requirement
      };
      await service.registerUserProfile(userWithStrongAuth);
      const highClassificationRequest = {
        ...mockRequest,
        classification: 'RESTRICTED' as DataClassificationLevel
      };
      const decision = await service.evaluateAccess(highClassificationRequest);
      expect(decision.granted).toBe(false);
      expect(decision.reason).toContain('Insufficient clearance level');
      expect(decision.monitoringLevel).toBe('ENHANCED');
    });
    it('should deny access when user profile is not found', async () => {
      const unknownUserRequest = {
        ...mockRequest,
        userId: 'unknown_user',
      };
      const decision = await service.evaluateAccess(unknownUserRequest);
      expect(decision.granted).toBe(false);
      expect(decision.reason).toBe('User profile not found');
    });
    it('should deny access when authentication level is insufficient', async () => {
      const weakAuthProfile = {
        ...mockUserProfile,
        authenticationLevel: 'STANDARD' as const
      };
      await service.registerUserProfile(weakAuthProfile);
      const confidentialRequest = {
        ...mockRequest,
        classification: 'CONFIDENTIAL' as DataClassificationLevel
      };
      const decision = await service.evaluateAccess(confidentialRequest);
      expect(decision.granted).toBe(false);
      expect(decision.reason).toContain('Insufficient authentication level');
    });
    it('should require approval workflow for confidential data', async () => {
      const mfaProfile = {
        ...mockUserProfile,
        clearanceLevel: 'CONFIDENTIAL' as DataClassificationLevel,
        authenticationLevel: 'MFA' as const
      };
      await service.registerUserProfile(mfaProfile);
      const confidentialRequest = {
        ...mockRequest,
        classification: 'CONFIDENTIAL' as DataClassificationLevel
      };
      const decision = await service.evaluateAccess(confidentialRequest);
      expect(decision.granted).toBe(false);
      expect(decision.reason).toBe('Approval workflow required');
    });
  });
  describe('Clearance Level Validation', () => {
    beforeEach(async () => {
      await service.registerUserProfile(mockUserProfile);
    });
    it('should allow access to same or lower classification levels', async () => {
      const requests = [;
        { ...mockRequest, classification: 'PUBLIC' as DataClassificationLevel },
        { ...mockRequest, classification: 'INTERNAL' as DataClassificationLevel }
      ];
      for (const request of requests) {
        const decision = await service.evaluateAccess(request);
        expect(decision.granted).toBe(true);
      }
    });
    it('should deny access to higher classification levels', async () => {
      // Update profile to have sufficient authentication for higher levels
      const userWithStrongAuth = {
        ...mockUserProfile,
        authenticationLevel: 'STRONG_MFA' as const // Satisfies all auth requirements
      };
      await service.registerUserProfile(userWithStrongAuth);
      const requests = [;
        { ...mockRequest, classification: 'CONFIDENTIAL' as DataClassificationLevel },
        { ...mockRequest, classification: 'RESTRICTED' as DataClassificationLevel }
      ];
      for (const request of requests) {
        const decision = await service.evaluateAccess(request);
        expect(decision.granted).toBe(false);
        expect(decision.reason).toContain('Insufficient clearance level');
      }
    });
  });
  describe('Access Conditions Generation', () => {
    beforeEach(async () => {
      const confidentialProfile = {
        ...mockUserProfile,
        clearanceLevel: 'CONFIDENTIAL' as DataClassificationLevel,
        authenticationLevel: 'MFA' as const
      };
      await service.registerUserProfile(confidentialProfile);
    });
    it('should generate time restrictions for confidential data', async () => {
      const confidentialRequest = {
        ...mockRequest,
        classification: 'CONFIDENTIAL' as DataClassificationLevel
      };
      // Note: This will fail approval workflow, but we can check conditions
      const decision = await service.evaluateAccess(confidentialRequest);
      const timeRestriction = decision.conditions.find(c => c.type === 'TIME_RESTRICTION');
      expect(timeRestriction).toBeDefined();
      expect(timeRestriction?.parameters.businessDaysOnly).toBe(true);
    });
    it('should generate purpose limitations for internal data', async () => {
      const decision = await service.evaluateAccess(mockRequest);
      const purposeLimitation = decision.conditions.find(c => c.type === 'PURPOSE_LIMITATION');
      expect(purposeLimitation).toBeDefined();
      expect(purposeLimitation?.parameters.allowedPurposes).toContain('data analysis');
    });
    it('should generate export restrictions for classified data', async () => {
      const decision = await service.evaluateAccess(mockRequest);
      const exportRestriction = decision.conditions.find(c => c.type === 'EXPORT_RESTRICTED');
      expect(exportRestriction).toBeDefined();
      expect(exportRestriction?.parameters.allowExport).toBe(false);
    });
  });
  describe('Audit Logging', () => {
    beforeEach(async () => {
      await service.registerUserProfile(mockUserProfile);
    });
    it('should create audit events for access attempts', async () => {
      await service.evaluateAccess(mockRequest);
      const auditEvents = service.getAuditEvents('user123');
      expect(auditEvents).toHaveLength(1);
      expect(auditEvents[0].eventType).toBe('ACCESS_GRANTED');
      expect(auditEvents[0].userId).toBe('user123');
      expect(auditEvents[0].dataId).toBe('data123');
    });
    it('should create audit events for denied access', async () => {
      const restrictedRequest = {
        ...mockRequest,
        classification: 'RESTRICTED' as DataClassificationLevel
      };
      await service.evaluateAccess(restrictedRequest);
      const auditEvents = service.getAuditEvents('user123');
      expect(auditEvents).toHaveLength(1);
      expect(auditEvents[0].eventType).toBe('ACCESS_DENIED');
      expect(auditEvents[0].result).toBe('FAILURE');
    });
    it('should filter audit events by user and data ID', async () => {
      const anotherRequest = {
        ...mockRequest,
        userId: 'user456',
        dataId: 'data456',
      };
      const anotherProfile = {
        ...mockUserProfile,
        userId: 'user456',
      };
      await service.registerUserProfile(anotherProfile);
      await service.evaluateAccess(mockRequest);
      await service.evaluateAccess(anotherRequest);
      const user123Events = service.getAuditEvents('user123');
      const data456Events = service.getAuditEvents(undefined, 'data456');
      expect(user123Events).toHaveLength(1);
      expect(user123Events[0].userId).toBe('user123');
      expect(data456Events).toHaveLength(1);
      expect(data456Events[0].dataId).toBe('data456');
    });
  });
  describe('User Profile Management', () => {
    it('should register user profiles successfully', async () => {
      await service.registerUserProfile(mockUserProfile);
      const decision = await service.evaluateAccess(mockRequest);
      expect(decision.granted).toBe(true);
    });
    it('should update user clearance levels', async () => {
      await service.registerUserProfile(mockUserProfile);
      const result = await service.updateUserClearance('user123', 'CONFIDENTIAL');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      // Test access to confidential data
      const confidentialRequest = {
        ...mockRequest,
        classification: 'CONFIDENTIAL' as DataClassificationLevel
      };
      // Update profile to have MFA authentication for confidential access
      const updatedProfile = {
        ...mockUserProfile,
        clearanceLevel: 'CONFIDENTIAL' as DataClassificationLevel,
        authenticationLevel: 'MFA' as const
      };
      await service.registerUserProfile(updatedProfile);
      // This should still fail due to approval workflow, but clearance check should pass
      const decision = await service.evaluateAccess(confidentialRequest);
      expect(decision.reason).toBe('Approval workflow required'); // Not clearance issue
    });
    it('should handle invalid user ID for clearance update', async () => {
      const result = await service.updateUserClearance('nonexistent', 'PUBLIC');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('User profile not found');
    });
  });
  describe('Policy Management', () => {
    it('should update access policies', async () => {
      const updates = {
        requirements: {,
          authenticationLevel: 'BIOMETRIC' as const,
          authorizationRequired: true,
          approvalWorkflow: false,
          timeRestrictions: false,
          purposeLimitation: true,
          auditLogging: 'ENHANCED' as const,
          exportRestrictions: true,
        }
      };
      await service.updateAccessPolicy('INTERNAL', updates);
      const updatedPolicy = service.getAccessPolicy('INTERNAL');
      expect(updatedPolicy?.requirements.authenticationLevel).toBe('BIOMETRIC');
      expect(updatedPolicy?.lastModified).toBeInstanceOf(Date);
    });
    it('should increment version when updating policies', async () => {
      const originalPolicy = service.getAccessPolicy('INTERNAL');
      const originalVersion = originalPolicy?.version;
      await service.updateAccessPolicy('INTERNAL', {)
        name: 'Updated Internal Policy'
      });
      const updatedPolicy = service.getAccessPolicy('INTERNAL');
      expect(updatedPolicy?.version).not.toBe(originalVersion);
      expect(updatedPolicy?.name).toBe('Updated Internal Policy');
    });
    it('should throw error when updating non-existent policy', async () => {
      await expect()
        service.updateAccessPolicy('INVALID' as DataClassificationLevel, {})
      ).rejects.toThrow('No policy found for classification: INVALID');
    });
  });
  describe('Access Condition Validation', () => {
    beforeEach(async () => {
      await service.registerUserProfile(mockUserProfile);
    });
    it('should validate time restrictions during business hours', async () => {
      const businessHourContext = {
        ...mockContext,
        timestamp: new Date('2024-01-15T14:00:00Z') // Monday 2 PM
      };
      const timeCondition = {
        type: 'TIME_RESTRICTION' as const,
        description: 'Business hours only',
        parameters: {,
          startHour: 9,
          endHour: 17,
          businessDaysOnly: true,
        },
        mandatory: true,
      };
      const result = await service.validateAccessConditions([timeCondition], businessHourContext);
      expect(result.valid).toBe(true);
    });
    it('should reject access outside business hours', async () => {
      const afterHoursContext = {
        ...mockContext,
        timestamp: new Date('2024-01-15T20:00:00Z') // Monday 8 PM
      };
      const timeCondition = {
        type: 'TIME_RESTRICTION' as const,
        description: 'Business hours only',
        parameters: {,
          startHour: 9,
          endHour: 17,
          businessDaysOnly: true,
        },
        mandatory: true,
      };
      const result = await service.validateAccessConditions([timeCondition], afterHoursContext);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Access attempted outside allowed time window');
    });
    it('should validate purpose limitations', async () => {
      const purposeCondition = {
        type: 'PURPOSE_LIMITATION' as const,
        description: 'Purpose restricted',
        parameters: {,
          allowedPurposes: ['data analysis', 'reporting']
        },
        mandatory: true,
      };
      let result = await service.validateAccessConditions([purposeCondition], mockContext);
      expect(result.valid).toBe(true);
      const invalidPurposeContext = {
        ...mockContext,
        purpose: 'data mining'
      };
      result = await service.validateAccessConditions([purposeCondition], invalidPurposeContext);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Access purpose does not match approved purpose');
    });
    it('should validate export restrictions', async () => {
      const exportRestriction = {
        type: 'EXPORT_RESTRICTED' as const,
        description: 'Export not allowed',
        parameters: {,
          allowExport: false,
        },
        mandatory: true,
      };
      const exportContext = {
        ...mockContext,
        operation: 'export' as const
      };
      const result = await service.validateAccessConditions([exportRestriction], exportContext);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Export operation not permitted for this classification');
    });
  });
  describe('Monitoring Levels', () => {
    it('should assign appropriate monitoring levels by classification', async () => {
      await service.registerUserProfile(mockUserProfile);
      const publicRequest = { ...mockRequest, classification: 'PUBLIC' as DataClassificationLevel };
      const publicDecision = await service.evaluateAccess(publicRequest);
      expect(publicDecision.monitoringLevel).toBe('STANDARD');
      const confidentialProfile = {
        ...mockUserProfile,
        clearanceLevel: 'RESTRICTED' as DataClassificationLevel,
        authenticationLevel: 'STRONG_MFA' as const
      };
      await service.registerUserProfile(confidentialProfile);
      const restrictedRequest = { ...mockRequest, classification: 'RESTRICTED' as DataClassificationLevel };
      const restrictedDecision = await service.evaluateAccess(restrictedRequest);
      expect(restrictedDecision.monitoringLevel).toBe('REALTIME');
    });
  });
});