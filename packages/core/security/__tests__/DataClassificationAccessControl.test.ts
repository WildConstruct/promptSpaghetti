/**
 * Tests for Data Classification Access Control Model
 * 
 * Comprehensive test suite covering RBAC, ABAC, and combined access control
 * for data classification-aware security.
 */
import { AccessControlModel,
  RBACModel,
  ABACModel,
  DataClassificationRole,
  DataClassificationPermission,
  ClassificationAccessPolicy,
  ABACPolicy,
  AccessRequest,
  AccessDecision,
  STANDARD_CLASSIFICATION_ROLES,
  ACCESS_CONTROL_MATRIX }
  DataOperation
 from '../DataClassificationAccessControl';
import { DataClassificationLevel } from '../../types/DataClassification';
import DataClassificationAccessControlEngine from '../DataClassificationAccessControlEngine';
describe('DataClassificationAccessControl', () => { let mockRBACModel: RBACModel;
  let mockABACModel: ABACModel;
  let mockClassificationPolicies: ClassificationAccessPolicy;
  let accessControlEngine: DataClassificationAccessControlEngine;
  beforeEach(() => {
  // Setup mock RBAC model
  mockRBACModel = {
  roles: [
  {
  id: 'role-admin',
  name: 'System Administrator',
  description: 'Full system access',
  category: 'SYSTEM',
  permissions: ['perm-all'],
  maxClassificationLevel: 'RESTRICTED',
  constraints: [],
  parentRoles: [],
  isActive: true,
  metadata: {,
  createdBy: 'system',
  createdAt: new Date(),
  lastModified: new Date(),
  approvalRequired: false,
  riskLevel: 'CRITICAL' }

        { id: 'role-analyst',
          name: 'Data Analyst',
          description: 'Data analysis access',
          category: 'FUNCTIONAL',
          permissions: ['perm-read', 'perm-analyze'],
          maxClassificationLevel: 'CONFIDENTIAL',
          constraints: [
            {
              type: 'TIME',
              operator: 'BETWEEN' }
              value: [8, 18], // Business hours
              metadata: {}
          ],
          parentRoles: [],
          isActive: true,
          metadata: { ,
  createdBy: 'admin',
  createdAt: new Date(),
  lastModified: new Date(),
  approvalRequired: false,
  riskLevel: 'MEDIUM' }

        { id: 'role-viewer',
  name: 'Read-Only User',
  description: 'Read-only access',
  category: 'FUNCTIONAL',
  permissions: ['perm-read'],
  maxClassificationLevel: 'INTERNAL',
  constraints: [],
  parentRoles: [],
  isActive: true,
  metadata: {,
  createdBy: 'admin',
  createdAt: new Date(),
  lastModified: new Date(),
  approvalRequired: false,
  riskLevel: 'LOW'],
  permissions: [
  {
  id: 'perm-all',
  name: 'All Operations',
  description: 'All operations on all data',
  operation: '*' as DataOperation,
  resourceType: 'DOCUMENT',
  classificationLevels: ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'],
  conditions: [],
  effect: 'ALLOW',
  priority: 100 }

        { id: 'perm-read',
  name: 'Read Access',
  description: 'Read access to data',
  operation: 'READ',
  resourceType: 'DOCUMENT',
  classificationLevels: ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL'],
  conditions: [],
  effect: 'ALLOW',
  priority: 50 }

        { id: 'perm-analyze',
  name: 'Analysis Access',
  description: 'Data analysis operations',
  operation: 'AGGREGATE',
  resourceType: 'DATASET',
  classificationLevels: ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL'],
  conditions: [],
  effect: 'ALLOW',
  priority: 50],
  roleHierarchy: {,
  hierarchy: [
  {
  level: 1,
  name: 'Administrative',
  description: 'Administrative roles',
  roles: ['role-admin'],
  automaticInheritance: false,
  maxClassificationAccess: 'RESTRICTED' }

          { level: 2,
  name: 'Functional',
  description: 'Functional roles',
  roles: ['role-analyst', 'role-viewer'],
  automaticInheritance: true,
  maxClassificationAccess: 'CONFIDENTIAL'],
  inheritanceRules: [] }
},
  userRoleAssignments: [
        { userId: 'user-admin',
  roleId: 'role-admin',
  assignedBy: 'system',
  assignedAt: new Date(),
  conditions: [],
  approvals: [],
  status: 'ACTIVE' }

        { userId: 'user-analyst',
  roleId: 'role-analyst',
  assignedBy: 'admin',
  assignedAt: new Date(),
  conditions: [],
  approvals: [],
  status: 'ACTIVE' }

        { userId: 'user-viewer',
  roleId: 'role-viewer',
  assignedBy: 'admin',
  assignedAt: new Date(),
  conditions: [],
  approvals: [] }
  status: 'ACTIVE'];
};
    // Setup mock ABAC model
    mockABACModel = { subjects: {,
  userId: 'user-test',
  roles: ['role-analyst'],
  clearanceLevel: 'CONFIDENTIAL',
  department: 'Analytics',
  jobTitle: 'Senior Analyst',
  location: {,
  country: 'US',
  region: 'California',
  city: 'San Francisco',
  timezone: 'America/Los_Angeles',
  withinApprovedRegions: true }
},
  device: { ,
  deviceId: 'device-123',
  deviceType: 'LAPTOP',
  operatingSystem: 'Windows 11',
  managed: true,
  encrypted: true,
  patchLevel: 'current',
  riskScore: 10,
  registered: true,
  lastSeen: new Date() }
},
  behaviorProfile: { ,
  normalAccessPatterns: [],
          anomalyScore: 5,
          typicalHours: [9, 10, 11, 12, 13, 14, 15, 16, 17],
          typicalLocations: ['office'],
          accessFrequency: 'MEDIUM',
          dataAccessPatterns: { }
  PUBLIC: { operations: ['READ'], frequency: 10, timeRanges: [], locations: [], dataTypes: [] },
            INTERNAL: { operations: ['READ'], frequency: 8, timeRanges: [], locations: [], dataTypes: [] },
            CONFIDENTIAL: { operations: ['READ'], frequency: 3, timeRanges: [], locations: [], dataTypes: [] },
            RESTRICTED: { operations: [], frequency: 0, timeRanges: [], locations: [], dataTypes: [] }
  },
  riskScore: 15,
        certifications: ['ISO27001'],
        lastActivity: new Date(),
        mfaVerified: true,
        trustLevel: 'HIGH'

  objects: { ,
  dataId: 'data-123',
  classification: 'CONFIDENTIAL',
  dataOwner: 'data-owner-1',
  createdAt: new Date(),
  lastModified: new Date(),
  retentionPeriod: 2555, // 7 years,
  complianceFrameworks: ['GDPR', 'SOC2'],
  tags: ['financial', 'customer'],
  sensitivity: 'SENSITIVE',
  businessValue: 'HIGH',
  dataType: 'customer_data',
  sourceSystem: 'CRM',
  encryptionStatus: 'ENCRYPTED' }
},
  actions: { ,
  operation: 'READ',
  purpose: 'analysis',
  urgency: 'ROUTINE',
  duration: 60, // minutes,
  bulkOperation: false,
  automated: false,
  delegated: false,
  riskLevel: 'MEDIUM' }
},
  environment: { ,
  timestamp: new Date(),
  location: {,
  country: 'US',
  region: 'California',
  city: 'San Francisco',
  timezone: 'America/Los_Angeles',
  withinApprovedRegions: true }
},
  network: { ,
  ipAddress: '192.168.1.100',
  vpnConnection: true,
  corporateNetwork: true,
  securityLevel: 'SECURED',
  bandwidth: '1Gbps',
  connectionType: 'VPN' }
},
  securityContext: { ,
  authenticationMethod: 'MFA',
  sessionAge: 30, // minutes,
  sessionRisk: 10,
  recentSecurityEvents: [],
  complianceStatus: 'COMPLIANT' }
},
  complianceMode: true,
        auditMode: true,
        emergencyMode: false

  policies: [
        { id: 'policy-business-hours',
  name: 'Business Hours Access Policy',
  description: 'Restricts access to business hours for confidential data',
  target: {,
  subjects: [{,
  attribute: 'clearanceLevel',
  operator: 'IN',
  value: ['CONFIDENTIAL', 'RESTRICTED'] }
],
            objects: [{ ,
  attribute: 'classification',
  operator: 'IN',
  value: ['CONFIDENTIAL', 'RESTRICTED'] }
],
            actions: [{ ,
  attribute: 'operation',
  operator: 'IN',
  value: ['READ', 'WRITE', 'UPDATE'] }
],
            environment: [{ ,
  attribute: 'timestamp.hours',
  operator: 'BETWEEN',
  value: [8, 18] }
]
  },
  rule: { ,
  condition: {,
  type: 'SIMPLE',
  expression: 'business_hours_check' }
},
  effect: 'PERMIT',
          obligations: [
            { id: 'audit-access',
              type: 'AUDIT',
              action: 'log_access' }
              parameters: { level: 'detailed' },
              fulfillmentRequired: true],
          priority: 100,
          enabled: true,
          version: '1.0',
          metadata: { ,
  createdBy: 'security-team',
  createdAt: new Date(),
  lastModified: new Date(),
  reviewDue: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  tags: ['security', 'compliance'],
  complianceFrameworks: ['SOC2'] }
  riskAssessment: 'Medium risk policy for temporal access control'];
};
    // Setup mock classification policies
    mockClassificationPolicies = [
      { id: 'policy-confidential',
        name: 'Confidential Data Policy',
        classification: 'CONFIDENTIAL',
        accessRules: [
          {
            id: 'rule-read-confidential',
            operation: 'READ',
            subjects: {,
  roles: ['role-analyst', 'role-admin'],
              clearanceLevel: 'CONFIDENTIAL',
              departments: ['Analytics', 'Security'] }
              attributes: {}
  },
  conditions: [
              { type: 'TEMPORAL',
  specification: {,
  attribute: 'timestamp.hours',
  operator: 'BETWEEN',
  value: [8, 18] }
},
  required: true],
            effect: 'ALLOW',
            requirements: [
              { type: 'MFA',
                specification: { }
  parameters: { method: 'TOTP' },
                  validation: []

  mandatory: true],
            priority: 100],
        handlingRequirements: { ,
  storage: {,
  encryptionRequired: true,
  encryptionAlgorithm: 'AES-256',
  keyRotationDays: 90,
  accessControls: ['MFA', 'RBAC'],
  backupEncryption: true,
  retentionDays: 2555,
  approvedLocations: ['primary-dc', 'backup-dc'],
  redundancyLevel: 'HIGH' }
},
  transmission: { ,
  tlsVersion: 'TLS 1.3',
  certificatePinning: true,
  networkRestrictions: ['corporate-network'],
  loggingLevel: 'COMPREHENSIVE',
  compressionAllowed: false,
  endToEndEncryption: true }
},
  processing: { ,
  approvedEnvironments: ['production', 'staging'],
  loggingRequired: true,
  cachingRestrictions: {,
  allowed: true,
  encryptionRequired: true,
  maxTtlSeconds: 300,
  purgeOnAccess: true,
  secureEviction: true }
},
  thirdPartyProcessing: false,
            isolationRequired: true,
            auditTrailRequired: true

  access: { ,
  authenticationLevel: 'MFA',
  authorizationRequired: true,
  approvalWorkflow: false,
  timeRestrictions: true,
  purposeLimitation: true,
  auditLogging: 'ENHANCED',
  exportRestrictions: true }
},
  monitoring: { ,
  alertingEnabled: true,
  anomalyDetection: true,
  alertThreshold: 'MEDIUM',
  realtimeMonitoring: true,
  complianceChecks: true,
  incidentResponse: true }
},
  exceptions: [],
        approvalWorkflows: [],
        monitoringRequirements: [],
        violationActions: [],
        metadata: { ,
  createdBy: 'security-officer',
  createdAt: new Date(),
  lastModified: new Date(),
  reviewDue: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  tags: ['confidential', 'compliance'],
  complianceFrameworks: ['GDPR', 'SOC2'],
  riskAssessment: 'High sensitivity data requiring enhanced controls'];
  accessControlEngine = new DataClassificationAccessControlEngine()
  mockRBACModel,
  mockABACModel }
  mockClassificationPolicies
  );
});
  describe('RBAC Evaluation', () => { it('should grant access for user with appropriate role and clearance', async () => {
  const request: AccessRequest = {,
  requestId: 'req-001',
  timestamp: new Date(),
  subject: {,
  ...mockABACModel.subjects,
  userId: 'user-analyst',
  clearanceLevel: 'CONFIDENTIAL' }
},
  object: { ...mockABACModel.objects,
  classification: 'INTERNAL' }
},
  action: { ...mockABACModel.actions,
  operation: 'READ' }
},
  environment: mockABACModel.environment,
        context: { ,
  operation: 'read',
  userId: 'user-analyst',
  sessionId: 'session-123',
  purpose: 'analysis',
  environment: 'production',
  timestamp: new Date(),
  source: '192.168.1.100',
  requestId: 'req-001' }
};
      const rbacDecision = await accessControlEngine.evaluateRBAC(request);
      expect(rbacDecision.permitted).toBe(true);
      expect(rbacDecision.matchedRoles).toContain('role-analyst');
      expect(rbacDecision.matchedPermissions.length).toBeGreaterThan(0);
      expect(rbacDecision.denialReasons).toHaveLength(0);
    });
    it('should deny access for user without sufficient clearance', async () => { const request: AccessRequest = {,
  requestId: 'req-002',
  timestamp: new Date(),
  subject: {,
  ...mockABACModel.subjects,
  userId: 'user-viewer',
  clearanceLevel: 'INTERNAL' }
},
  object: { ...mockABACModel.objects,
  classification: 'RESTRICTED' }
},
  action: { ...mockABACModel.actions,
  operation: 'READ' }
},
  environment: mockABACModel.environment,
        context: { ,
  operation: 'read',
  userId: 'user-viewer',
  sessionId: 'session-124',
  purpose: 'analysis',
  environment: 'production',
  timestamp: new Date(),
  source: '192.168.1.100',
  requestId: 'req-002' }
};
      const rbacDecision = await accessControlEngine.evaluateRBAC(request);
      expect(rbacDecision.permitted).toBe(false);
      expect(rbacDecision.denialReasons.length).toBeGreaterThan(0);
    });
    it('should enforce time-based constraints', async () => { // Create request during non-business hours
  const lateNightTime = new Date();
  lateNightTime.setHours(22, 0, 0, 0); // 10 PM
  const request: AccessRequest = {,
  requestId: 'req-003',
  timestamp: lateNightTime,
  subject: {,
  ...mockABACModel.subjects,
  userId: 'user-analyst',
  clearanceLevel: 'CONFIDENTIAL' }
},
  object: { ...mockABACModel.objects,
  classification: 'CONFIDENTIAL' }
},
  action: { ...mockABACModel.actions,
  operation: 'READ' }
},
  environment: { ...mockABACModel.environment,
  timestamp: lateNightTime }
},
  context: { ,
  operation: 'read',
  userId: 'user-analyst',
  sessionId: 'session-125',
  purpose: 'analysis',
  environment: 'production',
  timestamp: lateNightTime,
  source: '192.168.1.100',
  requestId: 'req-003' }
};
      const rbacDecision = await accessControlEngine.evaluateRBAC(request);
      expect(rbacDecision.permitted).toBe(false);
      expect(rbacDecision.denialReasons).toContain()
        expect.stringContaining('constraints not satisfied')
      );
    });
    it('should validate access control matrix compliance', async () => { const request: AccessRequest = {,
  requestId: 'req-004',
  timestamp: new Date(),
  subject: {,
  ...mockABACModel.subjects,
  userId: 'user-viewer',
  clearanceLevel: 'INTERNAL' }
},
  object: { ...mockABACModel.objects,
  classification: 'CONFIDENTIAL' }
},
  action: { ...mockABACModel.actions,
  operation: 'WRITE' }
},
  environment: mockABACModel.environment,
        context: { ,
  operation: 'write',
  userId: 'user-viewer',
  sessionId: 'session-126',
  purpose: 'update',
  environment: 'production',
  timestamp: new Date(),
  source: '192.168.1.100',
  requestId: 'req-004' }
};
      const rbacDecision = await accessControlEngine.evaluateRBAC(request);
      expect(rbacDecision.permitted).toBe(false);
      expect(rbacDecision.denialReasons).toContain()
        'Operation not permitted by access control matrix'
      );
    });
  });
  describe('ABAC Evaluation', () => { it('should evaluate subject attributes correctly', async () => {
  const request: AccessRequest = {,
  requestId: 'req-005',
  timestamp: new Date(),
  subject: mockABACModel.subjects,
  object: mockABACModel.objects,
  action: mockABACModel.actions,
  environment: mockABACModel.environment,
  context: {,
  operation: 'read',
  userId: 'user-test',
  sessionId: 'session-127',
  purpose: 'analysis',
  environment: 'production',
  timestamp: new Date(),
  source: '192.168.1.100',
  requestId: 'req-005' }
};
      const abacDecision = await accessControlEngine.evaluateABAC(request);
      expect(abacDecision.permitted).toBe(true);
      expect(abacDecision.matchedPolicies.length).toBeGreaterThan(0);
      expect(abacDecision.confidence).toBeGreaterThan(0.5);
    });
    it('should evaluate environmental constraints', async () => { const request: AccessRequest = {,
  requestId: 'req-006',
  timestamp: new Date(),
  subject: mockABACModel.subjects,
  object: mockABACModel.objects,
  action: mockABACModel.actions,
  environment: {,
  ...mockABACModel.environment,
  securityContext: {,
  ...mockABACModel.environment.securityContext,
  complianceStatus: 'NON_COMPLIANT' }
},
  context: { ,
  operation: 'read',
  userId: 'user-test',
  sessionId: 'session-128',
  purpose: 'analysis',
  environment: 'production',
  timestamp: new Date(),
  source: '192.168.1.100',
  requestId: 'req-006' }
};
      const abacDecision = await accessControlEngine.evaluateABAC(request);
      // Should still permit but with lower confidence
      expect(abacDecision.confidence).toBeLessThan(1.0);
    });
    it('should handle classification-specific policies', async () => { const request: AccessRequest = {,
  requestId: 'req-007',
  timestamp: new Date(),
  subject: {,
  ...mockABACModel.subjects,
  clearanceLevel: 'CONFIDENTIAL' }
},
  object: { ...mockABACModel.objects,
  classification: 'CONFIDENTIAL' }
},
  action: { ...mockABACModel.actions,
  operation: 'READ' }
},
  environment: mockABACModel.environment,
        context: { ,
  operation: 'read',
  userId: 'user-test',
  sessionId: 'session-129',
  purpose: 'analysis',
  environment: 'production',
  timestamp: new Date(),
  source: '192.168.1.100',
  requestId: 'req-007' }
};
      const abacDecision = await accessControlEngine.evaluateABAC(request);
      expect(abacDecision.matchedPolicies).toContain('policy-confidential');
    });
  });
  describe('Combined Decision Making', () => { it('should combine RBAC and ABAC decisions correctly', async () => {
  const businessHoursTime = new Date();
  businessHoursTime.setHours(14, 0, 0, 0); // 2 PM
  const request: AccessRequest = {,
  requestId: 'req-008',
  timestamp: businessHoursTime,
  subject: {,
  ...mockABACModel.subjects,
  userId: 'user-analyst',
  clearanceLevel: 'CONFIDENTIAL' }
},
  object: { ...mockABACModel.objects,
  classification: 'CONFIDENTIAL' }
},
  action: { ...mockABACModel.actions,
  operation: 'READ' }
},
  environment: { ...mockABACModel.environment,
  timestamp: businessHoursTime }
},
  context: { ,
  operation: 'read',
  userId: 'user-analyst',
  sessionId: 'session-130',
  purpose: 'analysis',
  environment: 'production',
  timestamp: businessHoursTime,
  source: '192.168.1.100',
  requestId: 'req-008' }
};
      const decision = await accessControlEngine.evaluateAccess(request);
      expect(decision.decision).toBe('PERMIT');
      expect(decision.reason).toContain('Access granted');
      expect(decision.riskLevel).toBeDefined();
      expect(decision.auditRequired).toBeDefined();
      expect(decision.metadata.evaluationTime).toBeGreaterThan(0);
    });
    it('should deny access when either RBAC or ABAC fails', async () => { const request: AccessRequest = {,
  requestId: 'req-009',
  timestamp: new Date(),
  subject: {,
  ...mockABACModel.subjects,
  userId: 'user-viewer',
  clearanceLevel: 'INTERNAL' }
},
  object: { ...mockABACModel.objects,
  classification: 'RESTRICTED' }
},
  action: { ...mockABACModel.actions,
  operation: 'WRITE' }
},
  environment: mockABACModel.environment,
        context: { ,
  operation: 'write',
  userId: 'user-viewer',
  sessionId: 'session-131',
  purpose: 'update',
  environment: 'production',
  timestamp: new Date(),
  source: '192.168.1.100',
  requestId: 'req-009' }
};
      const decision = await accessControlEngine.evaluateAccess(request);
      expect(decision.decision).toBe('DENY');
      expect(decision.reason).toBeDefined();
      expect(decision.riskLevel).toBe('HIGH');
    });
    it('should calculate appropriate risk levels', async () => { const request: AccessRequest = {,
  requestId: 'req-010',
  timestamp: new Date(),
  subject: {,
  ...mockABACModel.subjects,
  userId: 'user-admin',
  clearanceLevel: 'RESTRICTED' }
},
  object: { ...mockABACModel.objects,
  classification: 'RESTRICTED' }
},
  action: { ...mockABACModel.actions,
  operation: 'DELETE',
  riskLevel: 'CRITICAL' }
},
  environment: mockABACModel.environment,
        context: { ,
  operation: 'delete',
  userId: 'user-admin',
  sessionId: 'session-132',
  purpose: 'cleanup',
  environment: 'production',
  timestamp: new Date(),
  source: '192.168.1.100',
  requestId: 'req-010' }
};
      const decision = await accessControlEngine.evaluateAccess(request);
      expect(decision.riskLevel).toMatch(/HIGH|CRITICAL/);
      expect(decision.monitoring.length).toBeGreaterThan(0);
      expect(decision.auditRequired).toBe(true);
    });
    it('should handle caching correctly', async () => { const request: AccessRequest = {,
  requestId: 'req-011',
  timestamp: new Date(),
  subject: {,
  ...mockABACModel.subjects,
  userId: 'user-analyst',
  clearanceLevel: 'CONFIDENTIAL' }
},
  object: { ...mockABACModel.objects,
  classification: 'INTERNAL' }
},
  action: { ...mockABACModel.actions,
  operation: 'READ' }
},
  environment: mockABACModel.environment,
        context: { ,
  operation: 'read',
  userId: 'user-analyst',
  sessionId: 'session-133',
  purpose: 'analysis',
  environment: 'production',
  timestamp: new Date(),
  source: '192.168.1.100',
  requestId: 'req-011' }
};
      // First request
      const decision1 = await accessControlEngine.evaluateAccess(request);
      expect(decision1.metadata.cacheHit).toBe(false);
      // Second identical request should hit cache
      const decision2 = await accessControlEngine.evaluateAccess(request);
      expect(decision2.metadata.cacheHit).toBe(true);
    });
  });
  describe('Access Control Matrix', () => { it('should validate PUBLIC data access permissions', () => {
      const publicMatrix = ACCESS_CONTROL_MATRIX.PUBLIC;
      expect(publicMatrix.READ).toContain('VIEWER');
      expect(publicMatrix.READ).toContain('USER');
      expect(publicMatrix.READ).toContain('ANALYST');
      expect(publicMatrix.WRITE).not.toContain('VIEWER');
      expect(publicMatrix.WRITE).toContain('USER');
      expect(publicMatrix.DELETE).toContain('DATA_OWNER');
      expect(publicMatrix.DELETE).not.toContain('USER') });
    it('should validate RESTRICTED data access permissions', () => { const restrictedMatrix = ACCESS_CONTROL_MATRIX.RESTRICTED;
      expect(restrictedMatrix.READ).toContain('DATA_OWNER');
      expect(restrictedMatrix.READ).toContain('SYSTEM_ADMIN');
      expect(restrictedMatrix.READ).not.toContain('USER');
      expect(restrictedMatrix.EXPORT).toHaveLength(0);
      expect(restrictedMatrix.SHARE).toHaveLength(0) });
    it('should enforce progressive access restrictions', () => { const classifications: DataClassificationLevel = ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'];
  // Each higher classification should have more restrictions
  for (let i = 1; i < classifications.length; i++) {
  const current = ACCESS_CONTROL_MATRIX[classifications[i]];
  const previous = ACCESS_CONTROL_MATRIX[classifications[i - 1]];
  // Higher classifications should generally have fewer roles with access
  expect(current.READ.length).toBeLessThanOrEqual(previous.READ.length);
  expect(current.WRITE.length).toBeLessThanOrEqual(previous.WRITE.length) });
  });
  describe('Standard Roles', () => { it('should define appropriate clearance levels for standard roles', () => {
      expect(STANDARD_CLASSIFICATION_ROLES.SYSTEM_ADMIN.maxClassification).toBe('RESTRICTED');
      expect(STANDARD_CLASSIFICATION_ROLES.DATA_OWNER.maxClassification).toBe('RESTRICTED');
      expect(STANDARD_CLASSIFICATION_ROLES.ANALYST.maxClassification).toBe('CONFIDENTIAL');
      expect(STANDARD_CLASSIFICATION_ROLES.USER.maxClassification).toBe('INTERNAL');
      expect(STANDARD_CLASSIFICATION_ROLES.VIEWER.maxClassification).toBe('PUBLIC') });
    it('should assign appropriate risk levels to roles', () => { expect(STANDARD_CLASSIFICATION_ROLES.SYSTEM_ADMIN.riskLevel).toBe('CRITICAL');
      expect(STANDARD_CLASSIFICATION_ROLES.SECURITY_OFFICER.riskLevel).toBe('HIGH');
      expect(STANDARD_CLASSIFICATION_ROLES.VIEWER.riskLevel).toBe('LOW') });
    it('should categorize roles correctly', () => { expect(STANDARD_CLASSIFICATION_ROLES.SYSTEM_ADMIN.category).toBe('SYSTEM');
      expect(STANDARD_CLASSIFICATION_ROLES.DATA_OWNER.category).toBe('DATA_OWNER');
      expect(STANDARD_CLASSIFICATION_ROLES.ANALYST.category).toBe('FUNCTIONAL');
      expect(STANDARD_CLASSIFICATION_ROLES.COMPLIANCE_OFFICER.category).toBe('ADMINISTRATIVE') });
  });
  describe('Error Handling', () => { it('should handle invalid user gracefully', async () => {
  const request: AccessRequest = {,
  requestId: 'req-012',
  timestamp: new Date(),
  subject: {,
  ...mockABACModel.subjects,
  userId: 'non-existent-user',
  clearanceLevel: 'PUBLIC' }
},
  object: mockABACModel.objects,
        action: mockABACModel.actions,
        environment: mockABACModel.environment,
        context: { ,
  operation: 'read',
  userId: 'non-existent-user',
  sessionId: 'session-134',
  purpose: 'analysis',
  environment: 'production',
  timestamp: new Date(),
  source: '192.168.1.100',
  requestId: 'req-012' }
};
      const decision = await accessControlEngine.evaluateAccess(request);
      expect(decision.decision).toBe('DENY');
      expect(decision.riskLevel).toBe('HIGH');
    });
    it('should handle malformed requests gracefully', async () => { const invalidRequest = {
  requestId: 'req-013',
  timestamp: new Date(),
  // Missing required fields
  context: {,
  operation: 'read',
  userId: 'user-test',
  sessionId: 'session-135',
  purpose: 'analysis',
  environment: 'production',
  timestamp: new Date(),
  source: '192.168.1.100',
  requestId: 'req-013' }
 as any;
      const decision = await accessControlEngine.evaluateAccess(invalidRequest);
      expect(decision.decision).toBe('DENY');
      expect(decision.reason).toContain('system error');
    });
  });
});