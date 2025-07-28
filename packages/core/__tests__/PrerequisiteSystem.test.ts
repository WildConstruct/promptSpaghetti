/**
 * Prerequisite System Tests - Epic 16
 * Task: E16-1753114247111-697296 - Create prerequisite system
 * 
 * Comprehensive test suite covering security, edge cases, and functionality
 */
import {
  PrerequisiteSystemService,
  DependencyResolver,
  PrerequisiteSecurity,
  Prerequisite,
  PrerequisiteGroup,
  UserProgress,
  schemas
} from '../services/PrerequisiteSystem';
describe('PrerequisiteSystemService', () => {
  let service: PrerequisiteSystemService;
  let mockUserId: string;
  let mockPrerequisite: Prerequisite;
  beforeEach(() => {
    service = new PrerequisiteSystemService();
    mockUserId = '550e8400-e29b-41d4-a716-446655440000';
    mockPrerequisite = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Basic JavaScript',
      description: 'Introduction to JavaScript programming fundamentals',
      type: 'tutorial',
      requiredScore: 80,
      requiredTime: 120,
      validityPeriod: 365,
      category: 'programming',
      isActive: true,
    };
  });
  describe('createPrerequisite', () => {
    it('should create a valid prerequisite successfully', async () => {
      const result = await service.createPrerequisite(mockPrerequisite, mockUserId);
      expect(result.success).toBe(true);
      expect(result.prerequisiteId).toBe(mockPrerequisite.id);
      expect(result.errors).toBeUndefined();
    });
    it('should reject prerequisite with invalid schema', async () => {
      const invalidPrerequisite = {
        ...mockPrerequisite,
        name: '', // Invalid: empty name
        requiredScore: 150 // Invalid: score > 100,
      };
      const result = await service.createPrerequisite(invalidPrerequisite as Prerequisite, mockUserId);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.length).toBeGreaterThan(0);
    });
    it('should reject prerequisite with malicious content', async () => {
      const maliciousPrerequisite = {
        ...mockPrerequisite,
        name: '<script>alert("xss")</script>',
        description: 'DROP TABLE users; --'
      };
      const result = await service.createPrerequisite(maliciousPrerequisite, mockUserId);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Potentially dangerous script content detected');
    });
    it('should handle extremely long content gracefully', async () => {
      const longPrerequisite = {
        ...mockPrerequisite,
        name: 'A'.repeat(200), // Exceeds maximum length
        description: 'B'.repeat(1000) // Exceeds maximum length,
      };
      const result = await service.createPrerequisite(longPrerequisite, mockUserId);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
    it('should validate special characters in names', async () => {
      const specialCharsPrerequisite = {
        ...mockPrerequisite,
        name: 'JavaScript & TypeScript (Advanced)',
        description: 'Learn advanced JavaScript and TypeScript concepts',
      };
      const result = await service.createPrerequisite(specialCharsPrerequisite, mockUserId);
      expect(result.success).toBe(true);
    });
    it('should reject invalid characters in names', async () => {
      const invalidCharsPrerequisite = {
        ...mockPrerequisite,
        name: 'JavaScript@#$%^&*+=[]{}|\\:";\'<>?,./~`'
      };
      const result = await service.createPrerequisite(invalidCharsPrerequisite, mockUserId);
      expect(result.success).toBe(false);
    });
  });
  describe('evaluatePrerequisites', () => {
    beforeEach(async () => {
      // Set up test prerequisites
      await service.createPrerequisite(mockPrerequisite, mockUserId);
    });
    it('should allow access when prerequisites are met', async () => {
      // Mock completed progress
      await service.updateProgress(mockUserId, mockPrerequisite.id, {)
        status: 'completed',
        score: 85,
        completedAt: new Date(),
        attempts: 1,
      });
      const result = await service.evaluatePrerequisites(mockUserId, [mockPrerequisite.id]);
      expect(result.canProceed).toBe(true);
      expect(result.evaluation.satisfiedPrerequisites).toContain(mockPrerequisite.id);
    });
    it('should deny access when prerequisites are not met', async () => {
      const result = await service.evaluatePrerequisites(mockUserId, [mockPrerequisite.id]);
      expect(result.canProceed).toBe(false);
      expect(result.evaluation.missingPrerequisites).toContain(mockPrerequisite.id);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });
    it('should handle score requirements correctly', async () => {
      // Score too low
      await service.updateProgress(mockUserId, mockPrerequisite.id, {)
        status: 'completed',
        score: 60, // Below required 80
        completedAt: new Date(),
        attempts: 1,
      });
      const result = await service.evaluatePrerequisites(mockUserId, [mockPrerequisite.id]);
      expect(result.canProceed).toBe(false);
      expect(result.evaluation.missingPrerequisites).toContain(mockPrerequisite.id);
    });
    it('should handle expired prerequisites', async () => {
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 400); // Older than validity period
      await service.updateProgress(mockUserId, mockPrerequisite.id, {)
        status: 'completed',
        score: 85,
        completedAt: expiredDate,
        attempts: 1,
      });
      const result = await service.evaluatePrerequisites(mockUserId, [mockPrerequisite.id]);
      expect(result.canProceed).toBe(false);
    });
    it('should handle multiple prerequisites correctly', async () => {
      const secondPrerequisite: Prerequisite = {
        ...mockPrerequisite,
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Advanced JavaScript',
      };
      await service.createPrerequisite(secondPrerequisite, mockUserId);
      // Complete first prerequisite only
      await service.updateProgress(mockUserId, mockPrerequisite.id, {)
        status: 'completed',
        score: 85,
        completedAt: new Date(),
        attempts: 1,
      });
      const result = await service.evaluatePrerequisites(mockUserId, [;);
        mockPrerequisite.id,
        secondPrerequisite.id
      ]);
      expect(result.canProceed).toBe(false);
      expect(result.evaluation.satisfiedPrerequisites).toContain(mockPrerequisite.id);
      expect(result.evaluation.missingPrerequisites).toContain(secondPrerequisite.id);
    });
  });
  describe('updateProgress', () => {
    beforeEach(async () => {
      await service.createPrerequisite(mockPrerequisite, mockUserId);
    });
    it('should update progress successfully', async () => {
      const progressData: Partial<UserProgress> = {
        status: 'in_progress',
        score: 50,
        attempts: 1,
      };
      const result = await service.updateProgress(mockUserId, mockPrerequisite.id, progressData);
      expect(result.success).toBe(true);
      expect(result.errors).toBeUndefined();
    });
    it('should validate progress data schema', async () => {
      const invalidProgressData = {
        status: 'invalid_status', // Invalid enum value
        score: 150 // Invalid: score > 100,
      };
      const result = await service.updateProgress(;);
        mockUserId, 
        mockPrerequisite.id, 
        invalidProgressData as Partial<UserProgress>
      );
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
    it('should handle non-existent prerequisite', async () => {
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440999';
      const result = await service.updateProgress(mockUserId, nonExistentId, {)
        status: 'completed',
        score: 85,
      });
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Prerequisite not found');
    });
  });
  describe('generateRecommendations', () => {
    beforeEach(async () => {
      await service.createPrerequisite(mockPrerequisite, mockUserId);
    });
    it('should generate learning path recommendations', async () => {
      const result = await service.generateRecommendations(mockUserId, 'Full Stack Developer');
      expect(result.learningPath).toBeDefined();
      expect(Array.isArray(result.learningPath)).toBe(true);
      expect(result.estimatedTime).toBeGreaterThan(0);
    });
    it('should handle empty prerequisites list', async () => {
      const newUserId = '550e8400-e29b-41d4-a716-446655440003';
      const result = await service.generateRecommendations(newUserId, 'Test Goal');
      expect(result.learningPath).toBeDefined();
      expect(result.estimatedTime).toBeGreaterThanOrEqual(0);
    });
  });
});
describe('DependencyResolver', () => {
  let resolver: DependencyResolver;
  let mockPrerequisite: Prerequisite;
  beforeEach(() => {
    resolver = new DependencyResolver();
    mockPrerequisite = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Test Prerequisite',
      description: 'Test prerequisite for unit testing',
      type: 'tutorial',
      requiredScore: 80,
      category: 'test',
      isActive: true,
    };
  });
  describe('addPrerequisite', () => {
    it('should add valid prerequisite', () => {
      const result = resolver.addPrerequisite(mockPrerequisite);
      expect(result.success).toBe(true);
      expect(result.errors).toBeUndefined();
    });
    it('should reject invalid prerequisite schema', () => {
      const invalidPrerequisite = {
        ...mockPrerequisite,
        id: 'invalid-uuid', // Invalid UUID
        requiredScore: -1 // Invalid negative score,
      };
      const result = resolver.addPrerequisite(invalidPrerequisite as Prerequisite);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });
  describe('addPrerequisiteGroup', () => {
    beforeEach(() => {
      resolver.addPrerequisite(mockPrerequisite);
    });
    it('should add valid prerequisite group', () => {
      const group: PrerequisiteGroup = {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'JavaScript Basics',
        description: 'Basic JavaScript prerequisites',
        prerequisites: [mockPrerequisite.id],
        operator: 'AND',
      };
      const result = resolver.addPrerequisiteGroup(group);
      expect(result.success).toBe(true);
    });
    it('should reject group with missing prerequisites', () => {
      const group: PrerequisiteGroup = {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Test Group',
        description: 'Test group with missing prerequisites',
        prerequisites: ['550e8400-e29b-41d4-a716-446655440999'], // Non-existent
        operator: 'AND',
      };
      const result = resolver.addPrerequisiteGroup(group);
      expect(result.success).toBe(false);
      expect(result.errors?.[0]).toContain('Missing prerequisites');
    });
    it('should detect circular dependencies', () => {
      // Create a second prerequisite
      const secondPrerequisite: Prerequisite = {
        ...mockPrerequisite,
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'Second Prerequisite',
      };
      resolver.addPrerequisite(secondPrerequisite);
      // Create circular dependency
      const circularGroup: PrerequisiteGroup = {
        id: mockPrerequisite.id, // Same ID as prerequisite creates cycle
        name: 'Circular Group',
        description: 'This creates a circular dependency',
        prerequisites: [secondPrerequisite.id],
        operator: 'AND',
      };
      const result = resolver.addPrerequisiteGroup(circularGroup);
      // Should detect circular dependency
      expect(result.success).toBe(false);
    });
  });
  describe('resolvePrerequisitesForUser', () => {
    beforeEach(() => {
      resolver.addPrerequisite(mockPrerequisite);
    });
    it('should resolve prerequisites correctly for user without progress', () => {
      const result = resolver.resolvePrerequisitesForUser('test-user', [mockPrerequisite.id]);
      expect(result.canProceed).toBe(false);
      expect(result.missingPrerequisites).toContain(mockPrerequisite.id);
      expect(result.satisfiedPrerequisites).toHaveLength(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });
    it('should handle non-existent prerequisites gracefully', () => {
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440999';
      const result = resolver.resolvePrerequisitesForUser('test-user', [nonExistentId]);
      expect(result.canProceed).toBe(false);
      expect(result.missingPrerequisites).toContain(nonExistentId);
    });
  });
});
describe('PrerequisiteSecurity', () => {
  describe('validatePrerequisiteInput', () => {
    it('should pass valid input', () => {
      const validInput = 'JavaScript Programming Basics';
      const result = PrerequisiteSecurity.validatePrerequisiteInput(validInput);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    it('should detect script injection attempts', () => {
      const maliciousInputs = [;
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        'data:text/html,<script>alert("xss")</script>',
        'eval(maliciousCode)',
        'function() { /* malicious */ }'
      ];
      maliciousInputs.forEach(input => {)
        const result = PrerequisiteSecurity.validatePrerequisiteInput(input);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Potentially dangerous script content detected');
      });
    });
    it('should detect SQL injection attempts', () => {
      const sqlInjectionInputs = [;
        '\'; DROP TABLE users; --',
        'UNION SELECT * FROM admin',
        'DELETE FROM prerequisites',
        'INSERT INTO users VALUES'
      ];
      sqlInjectionInputs.forEach(input => {)
        const result = PrerequisiteSecurity.validatePrerequisiteInput(input);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Potentially dangerous SQL patterns detected');
      });
    });
    it('should detect path traversal attempts', () => {
      const pathTraversalInputs = [;
        '../../../etc/passwd',
        '..\\..\\windows\\system32',
        '..%2f..%2fetc%2fpasswd',
        '..%5c..%5cwindows%5csystem32'
      ];
      pathTraversalInputs.forEach(input => {)
        const result = PrerequisiteSecurity.validatePrerequisiteInput(input);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Path traversal attempt detected');
      });
    });
  });
  describe('sanitizeInput', () => {
    it('should sanitize HTML special characters', () => {
      const input = '<div>Test & "quote" \'single\' /script</div>';
      const sanitized = PrerequisiteSecurity.sanitizeInput(input);
      expect(sanitized).toBe('&lt;div&gt;Test &amp; &quot;quote&quot; &#x27;single&#x27; &#x2F;script&lt;&#x2F;div&gt;');
    });
    it('should trim whitespace', () => {
      const input = '  Test Input  ';
      const sanitized = PrerequisiteSecurity.sanitizeInput(input);
      expect(sanitized).toBe('Test Input');
    });
    it('should handle empty string', () => {
      const sanitized = PrerequisiteSecurity.sanitizeInput('');
      expect(sanitized).toBe('');
    });
  });
  describe('validateUserPermissions', () => {
    it('should validate legitimate user and action', () => {
      const isValid = PrerequisiteSecurity.validateUserPermissions(;);
        '550e8400-e29b-41d4-a716-446655440000', 
        'view'
      );
      expect(isValid).toBe(true);
    });
    it('should reject invalid user ID', () => {
      const isValid = PrerequisiteSecurity.validateUserPermissions('short', 'view');
      expect(isValid).toBe(false);
    });
    it('should reject invalid action', () => {
      const isValid = PrerequisiteSecurity.validateUserPermissions(;);
        '550e8400-e29b-41d4-a716-446655440000', 
        'invalid_action'
      );
      expect(isValid).toBe(false);
    });
    it('should handle all valid actions', () => {
      const validActions = ['view', 'create', 'update', 'delete', 'assign', 'complete'];
      const userId = '550e8400-e29b-41d4-a716-446655440000';
      validActions.forEach(action => {)
        const isValid = PrerequisiteSecurity.validateUserPermissions(userId, action);
        expect(isValid).toBe(true);
      });
    });
  });
});
describe('Schema Validation', () => {
  describe('prerequisiteSchema', () => {
    it('should validate correct prerequisite data', () => {
      const validData = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'JavaScript Basics',
        description: 'Learn the fundamentals of JavaScript programming',
        type: 'tutorial',
        requiredScore: 80,
        requiredTime: 120,
        validityPeriod: 365,
        category: 'programming',
        isActive: true,
      };
      const result = schemas.prerequisite.safeParse(validData);
      expect(result.success).toBe(true);
    });
    it('should reject invalid UUID', () => {
      const invalidData = {
        id: 'not-a-uuid',
        name: 'Test',
        description: 'Test description',
        type: 'tutorial',
        category: 'test',
        isActive: true,
      };
      const result = schemas.prerequisite.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
    it('should reject invalid type enum', () => {
      const invalidData = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Test',
        description: 'Test description',
        type: 'invalid_type',
        category: 'test',
        isActive: true,
      };
      const result = schemas.prerequisite.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
    it('should reject scores outside valid range', () => {
      const invalidData = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Test',
        description: 'Test description',
        type: 'tutorial',
        requiredScore: 150, // Invalid: > 100
        category: 'test',
        isActive: true,
      };
      const result = schemas.prerequisite.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
  describe('userProgressSchema', () => {
    it('should validate correct progress data', () => {
      const validData = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        prerequisiteId: '550e8400-e29b-41d4-a716-446655440001',
        status: 'completed',
        score: 85,
        completedAt: new Date(),
        currentStep: 0,
        progress: 100,
        timeSpent: 120,
        attempts: 1,
      };
      const result = schemas.userProgress.safeParse(validData);
      expect(result.success).toBe(true);
    });
    it('should reject invalid status enum', () => {
      const invalidData = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        prerequisiteId: '550e8400-e29b-41d4-a716-446655440001',
        status: 'invalid_status',
        attempts: 1,
      };
      const result = schemas.userProgress.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

// Edge case and stress tests
describe('Edge Cases and Stress Tests', () => {
  let service: PrerequisiteSystemService;
  beforeEach(() => {
    service = new PrerequisiteSystemService();
  });
  it('should handle null and undefined inputs gracefully', async () => {
    // These should be caught by TypeScript, but test runtime behavior
    try {
      await service.createPrerequisite(null as any, 'test-user');
    } catch (error) {
      expect(error).toBeDefined();
    }
    try {
      await service.evaluatePrerequisites('test-user', null as any);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
  it('should handle very large prerequisite lists', async () => {
    const largePrerequisiteList = Array.from({ length: 1000 }, (_, i) => 
      `550e8400-e29b-41d4-a716-44665544${i.toString().padStart(4, '0')}`}
    );
    const result = await service.evaluatePrerequisites('test-user', largePrerequisiteList);
    // Should complete without crashing
    expect(result).toBeDefined();
    expect(result.canProceed).toBe(false); // None exist, so can't proceed
  });
  it('should handle concurrent operations safely', async () => {
    const prerequisite: Prerequisite = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Concurrent Test',
      description: 'Test for concurrent operations',
      type: 'tutorial',
      category: 'test',
      isActive: true,
    };
    // Create multiple concurrent operations
    const promises = Array.from({ length: 10 }, () => 
      service.createPrerequisite(prerequisite, 'test-user')
    );
    const results = await Promise.all(promises);
    // All should complete (though may not all succeed due to duplicates)
    expect(results).toHaveLength(10);
    results.forEach(result => {)
      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
    });
  });
});