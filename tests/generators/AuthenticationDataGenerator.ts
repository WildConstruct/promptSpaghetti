/**
 * Authentication Data Generator for Testing
 * 
 * Generates comprehensive authentication test data including users, sessions,
 * tokens, permissions, and various authentication scenarios.
 * 
 * Task: E18-1753114562159-0BC5A0
 */

import seedrandom from 'seedrandom';

export interface UserRole {
  id: string;
  name: string;
  permissions: string[];
  hierarchy: number;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface TestUser {
  id: string;
  username: string;
  email: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  isVerified: boolean;
  mfaEnabled: boolean;
  organizationId?: string;
  metadata: Record<string, any>;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface SessionData {
  sessionId: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
  deviceInfo?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthenticationScenario {
  name: string;
  description: string;
  user: TestUser;
  session?: SessionData;
  expectedBehavior: 'success' | 'failure' | 'conditional';
  permissions: Permission[];
  roles: UserRole[];
  testActions: Array<{
    action: string;
    resource: string;
    expected: boolean;
    reason?: string;
  }>;
}

export class AuthenticationDataGenerator {
  private rng: seedrandom.PRNG;

  constructor(seed: number = 12345) {
    this.rng = seedrandom(seed.toString());
  }

  /**
   * Generate standard user roles with hierarchical permissions
   */
  generateStandardRoles(): UserRole[] {
    return [
      {
        id: 'admin',
        name: 'Administrator',
        permissions: [
          'user:*', 'project:*', 'rule:*', 'system:*',
          'analytics:read', 'settings:write', 'export:*'
        ],
        hierarchy: 100
      },
      {
        id: 'manager',
        name: 'Project Manager',
        permissions: [
          'project:read', 'project:write', 'rule:read', 'rule:write',
          'user:read', 'analytics:read', 'export:project'
        ],
        hierarchy: 50
      },
      {
        id: 'editor',
        name: 'Content Editor',
        permissions: [
          'rule:read', 'rule:write', 'project:read',
          'analytics:read'
        ],
        hierarchy: 30
      },
      {
        id: 'viewer',
        name: 'Viewer',
        permissions: [
          'rule:read', 'project:read'
        ],
        hierarchy: 10
      },
      {
        id: 'guest',
        name: 'Guest User',
        permissions: [
          'project:read'
        ],
        hierarchy: 0
      }
    ];
  }

  /**
   * Generate comprehensive permission set
   */
  generatePermissions(): Permission[] {
    const resources = ['user', 'project', 'rule', 'analytics', 'settings', 'export', 'system'];
    const actions = ['create', 'read', 'update', 'delete', 'execute', 'admin'];
    const permissions: Permission[] = [];

    resources.forEach(resource => {
      actions.forEach(action => {
        permissions.push({
          id: `${resource}:${action}`,
          name: `${action.charAt(0).toUpperCase() + action.slice(1)} ${resource}`,
          resource,
          action,
          conditions: this.generatePermissionConditions(resource, action)
        });
      });

      // Add wildcard permission
      permissions.push({
        id: `${resource}:*`,
        name: `All ${resource} permissions`,
        resource,
        action: '*'
      });
    });

    return permissions;
  }

  private generatePermissionConditions(resource: string, action: string): Record<string, any> | undefined {
    // Generate context-specific conditions
    const conditions: Record<string, any> = {};

    if (resource === 'project' && action === 'update') {
      conditions.ownership = 'owner_or_collaborator';
      conditions.status = ['active', 'draft'];
    }

    if (resource === 'rule' && action === 'delete') {
      conditions.ownership = 'owner';
      conditions.status = ['draft', 'deprecated'];
    }

    if (resource === 'analytics' && action === 'read') {
      conditions.scope = ['own_projects', 'public_projects'];
    }

    if (resource === 'export' && action === 'execute') {
      conditions.rate_limit = '10_per_hour';
      conditions.size_limit = '1000_rules';
    }

    return Object.keys(conditions).length > 0 ? conditions : undefined;
  }

  /**
   * Generate test users with various configurations
   */
  generateTestUsers(count: number): TestUser[] {
    const users: TestUser[] = [];
    const roles = this.generateStandardRoles();
    const organizations = ['org-1', 'org-2', 'org-3', null];

    for (let i = 0; i < count; i++) {
      const role = roles[Math.floor(this.rng() * roles.length)];
      const isActive = this.rng() > 0.1; // 90% active
      const isVerified = this.rng() > 0.2; // 80% verified
      const mfaEnabled = this.rng() > 0.6; // 40% with MFA
      const hasOrg = this.rng() > 0.3; // 70% with organization

      users.push({
        id: `user-${i.toString().padStart(4, '0')}`,
        username: `testuser${i}`,
        email: `testuser${i}@example.com`,
        role: role.id,
        permissions: role.permissions,
        isActive,
        isVerified,
        mfaEnabled,
        organizationId: hasOrg ? organizations[Math.floor(this.rng() * (organizations.length - 1))] : undefined,
        metadata: {
          preference_theme: this.rng() > 0.5 ? 'dark' : 'light',
          preference_language: ['en', 'es', 'fr', 'de'][Math.floor(this.rng() * 4)],
          tutorial_completed: this.rng() > 0.3,
          beta_features: this.rng() > 0.7
        },
        createdAt: new Date(Date.now() - (this.rng() * 365 * 24 * 60 * 60 * 1000)), // Within last year
        lastLoginAt: isActive && this.rng() > 0.2 
          ? new Date(Date.now() - (this.rng() * 30 * 24 * 60 * 60 * 1000)) // Within last 30 days
          : undefined
      });
    }

    return users;
  }

  /**
   * Generate session data for users
   */
  generateSessions(users: TestUser[]): SessionData[] {
    const sessions: SessionData[] = [];
    
    users.forEach(user => {
      if (user.isActive && this.rng() > 0.3) { // 70% of active users have sessions
        const sessionCount = Math.floor(this.rng() * 3) + 1; // 1-3 sessions per user
        
        for (let i = 0; i < sessionCount; i++) {
          const createdAt = new Date(Date.now() - (this.rng() * 7 * 24 * 60 * 60 * 1000)); // Within last week
          const expiresAt = new Date(createdAt.getTime() + (24 * 60 * 60 * 1000)); // 24 hours from creation
          
          sessions.push({
            sessionId: `sess-${user.id}-${i}-${Date.now()}`,
            userId: user.id,
            accessToken: this.generateToken('access'),
            refreshToken: this.generateToken('refresh'),
            expiresAt,
            createdAt,
            deviceInfo: this.generateDeviceInfo(),
            ipAddress: this.generateIPAddress(),
            userAgent: this.generateUserAgent()
          });
        }
      }
    });

    return sessions;
  }

  private generateToken(type: 'access' | 'refresh'): string {
    const prefix = type === 'access' ? 'acc' : 'ref';
    const randomPart = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return `${prefix}_${randomPart}`;
  }

  private generateDeviceInfo(): string {
    const devices = [
      'iPhone 14 Pro',
      'Samsung Galaxy S23',
      'MacBook Pro M2',
      'Windows 11 Desktop',
      'iPad Pro',
      'Chrome OS Laptop'
    ];
    return devices[Math.floor(this.rng() * devices.length)];
  }

  private generateIPAddress(): string {
    return `${Math.floor(this.rng() * 256)}.${Math.floor(this.rng() * 256)}.${Math.floor(this.rng() * 256)}.${Math.floor(this.rng() * 256)}`;
  }

  private generateUserAgent(): string {
    const agents = [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0'
    ];
    return agents[Math.floor(this.rng() * agents.length)];
  }

  /**
   * Generate comprehensive authentication test scenarios
   */
  generateAuthenticationScenarios(): AuthenticationScenario[] {
    const roles = this.generateStandardRoles();
    const permissions = this.generatePermissions();
    const users = this.generateTestUsers(10);
    const scenarios: AuthenticationScenario[] = [];

    // Valid authentication scenarios
    scenarios.push({
      name: 'admin-full-access',
      description: 'Administrator with full system access',
      user: users.find(u => u.role === 'admin') || users[0],
      expectedBehavior: 'success',
      permissions,
      roles,
      testActions: [
        { action: 'read', resource: 'user', expected: true },
        { action: 'write', resource: 'project', expected: true },
        { action: 'delete', resource: 'rule', expected: true },
        { action: 'admin', resource: 'system', expected: true }
      ]
    });

    scenarios.push({
      name: 'editor-limited-access',
      description: 'Editor with content editing permissions',
      user: users.find(u => u.role === 'editor') || users[1],
      expectedBehavior: 'conditional',
      permissions,
      roles,
      testActions: [
        { action: 'read', resource: 'rule', expected: true },
        { action: 'write', resource: 'rule', expected: true },
        { action: 'delete', resource: 'user', expected: false, reason: 'Insufficient permissions' },
        { action: 'admin', resource: 'system', expected: false, reason: 'Admin rights required' }
      ]
    });

    scenarios.push({
      name: 'viewer-read-only',
      description: 'Viewer with read-only access',
      user: users.find(u => u.role === 'viewer') || users[2],
      expectedBehavior: 'conditional',
      permissions,
      roles,
      testActions: [
        { action: 'read', resource: 'rule', expected: true },
        { action: 'read', resource: 'project', expected: true },
        { action: 'write', resource: 'rule', expected: false, reason: 'Read-only user' },
        { action: 'delete', resource: 'project', expected: false, reason: 'Read-only user' }
      ]
    });

    // Authentication failure scenarios
    scenarios.push({
      name: 'inactive-user',
      description: 'Inactive user attempting access',
      user: { ...users[3], isActive: false },
      expectedBehavior: 'failure',
      permissions,
      roles,
      testActions: [
        { action: 'read', resource: 'project', expected: false, reason: 'User account inactive' }
      ]
    });

    scenarios.push({
      name: 'unverified-user',
      description: 'Unverified user with limited access',
      user: { ...users[4], isVerified: false },
      expectedBehavior: 'conditional',
      permissions,
      roles,
      testActions: [
        { action: 'read', resource: 'project', expected: true },
        { action: 'write', resource: 'rule', expected: false, reason: 'Email verification required' }
      ]
    });

    // MFA scenarios
    scenarios.push({
      name: 'mfa-required',
      description: 'High-privilege action requiring MFA',
      user: users.find(u => u.mfaEnabled && u.role === 'admin') || users[0],
      expectedBehavior: 'conditional',
      permissions,
      roles,
      testActions: [
        { action: 'read', resource: 'project', expected: true },
        { action: 'delete', resource: 'user', expected: false, reason: 'MFA verification required' },
        { action: 'admin', resource: 'system', expected: false, reason: 'MFA verification required' }
      ]
    });

    // Organization-based access
    scenarios.push({
      name: 'organization-scoped',
      description: 'User access scoped to organization',
      user: users.find(u => u.organizationId) || users[5],
      expectedBehavior: 'conditional',
      permissions,
      roles,
      testActions: [
        { action: 'read', resource: 'project', expected: true, reason: 'Within organization' },
        { action: 'read', resource: 'analytics', expected: false, reason: 'Cross-organization access denied' }
      ]
    });

    return scenarios;
  }

  /**
   * Generate edge case authentication scenarios
   */
  generateEdgeCaseScenarios(): AuthenticationScenario[] {
    const roles = this.generateStandardRoles();
    const permissions = this.generatePermissions();
    
    return [
      {
        name: 'expired-session',
        description: 'User with expired session attempting access',
        user: this.generateTestUsers(1)[0],
        session: {
          sessionId: 'expired-session',
          userId: 'user-0001',
          accessToken: 'expired-token',
          refreshToken: 'refresh-token',
          expiresAt: new Date(Date.now() - 3600000), // Expired 1 hour ago
          createdAt: new Date(Date.now() - 86400000), // Created 24 hours ago
        },
        expectedBehavior: 'failure',
        permissions,
        roles,
        testActions: [
          { action: 'read', resource: 'project', expected: false, reason: 'Session expired' }
        ]
      },
      {
        name: 'malformed-token',
        description: 'Authentication with malformed token',
        user: this.generateTestUsers(1)[0],
        session: {
          sessionId: 'malformed-session',
          userId: 'user-0002',
          accessToken: 'malformed.token.invalid',
          refreshToken: 'malformed.refresh.invalid',
          expiresAt: new Date(Date.now() + 3600000),
          createdAt: new Date(),
        },
        expectedBehavior: 'failure',
        permissions,
        roles,
        testActions: [
          { action: 'read', resource: 'project', expected: false, reason: 'Invalid token format' }
        ]
      },
      {
        name: 'concurrent-sessions',
        description: 'User with multiple concurrent sessions',
        user: this.generateTestUsers(1)[0],
        expectedBehavior: 'conditional',
        permissions,
        roles,
        testActions: [
          { action: 'read', resource: 'project', expected: true },
          { action: 'write', resource: 'rule', expected: false, reason: 'Session conflict detected' }
        ]
      }
    ];
  }

  /**
   * Generate a complete authentication test suite
   */
  generateTestSuite(): {
    users: TestUser[];
    sessions: SessionData[];
    roles: UserRole[];
    permissions: Permission[];
    scenarios: AuthenticationScenario[];
    edgeCases: AuthenticationScenario[];
  } {
    const users = this.generateTestUsers(50);
    const sessions = this.generateSessions(users);
    const roles = this.generateStandardRoles();
    const permissions = this.generatePermissions();
    const scenarios = this.generateAuthenticationScenarios();
    const edgeCases = this.generateEdgeCaseScenarios();

    return {
      users,
      sessions,
      roles,
      permissions,
      scenarios,
      edgeCases
    };
  }
}

export default AuthenticationDataGenerator;