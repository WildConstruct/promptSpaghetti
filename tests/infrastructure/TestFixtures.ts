/**
 * Test Fixtures for PromptSpaghetti Testing Framework
 * Epic 18 - Implement testing infrastructure
 * Task: E18-1753114562510-5E3421
 */

import { GraphDataGenerator, UserDataGenerator, APIDataGenerator } from './TestDataGenerators';

export interface TestFixture {
  name: string;
  category: 'graph' | 'user' | 'api' | 'performance' | 'security';
  data: any;
  metadata?: Record<string, any>;
}

export interface FixtureOptions {
  persistent?: boolean;
  seed?: string;
  version?: string;
}

/**
 * Test Fixture Manager
 * Manages reusable test data fixtures
 */
export class TestFixtureManager {
  private fixtures: Map<string, TestFixture> = new Map();
  private generators: {
    graph: GraphDataGenerator;
    user: UserDataGenerator;
    api: APIDataGenerator;
  };

  constructor(seed: string = 'fixture-seed-456') {
    this.generators = {
      graph: new GraphDataGenerator(seed),
      user: new UserDataGenerator(seed),
      api: new APIDataGenerator(seed),
    };

    this.initializeDefaultFixtures();
  }

  /**
   * Register a custom fixture
   */
  register(name: string, fixture: Omit<TestFixture, 'name'>): void {
    this.fixtures.set(name, { ...fixture, name });
  }

  /**
   * Get a fixture by name
   */
  get(name: string): TestFixture | undefined {
    return this.fixtures.get(name);
  }

  /**
   * Get fixtures by category
   */
  getByCategory(category: TestFixture['category']): TestFixture[] {
    return Array.from(this.fixtures.values()).filter(f => f.category === category);
  }

  /**
   * List all available fixtures
   */
  list(): string[] {
    return Array.from(this.fixtures.keys()).sort();
  }

  /**
   * Clear all fixtures
   */
  clear(): void {
    this.fixtures.clear();
  }

  /**
   * Initialize default fixtures used across tests
   */
  private initializeDefaultFixtures(): void {
    this.initializeGraphFixtures();
    this.initializeUserFixtures();
    this.initializeAPIFixtures();
    this.initializePerformanceFixtures();
    this.initializeSecurityFixtures();
  }

  private initializeGraphFixtures(): void {
    // Simple linear graph
    this.register('graph-simple-linear', {
      category: 'graph',
      data: {
        nodes: [
          {
            id: 'start',
            type: 'subject',
            position: { x: 100, y: 100 },
            data: { text: 'The quick brown fox' },
          },
          {
            id: 'middle',
            type: 'action',
            position: { x: 300, y: 100 },
            data: { text: 'jumps over' },
          },
          {
            id: 'end',
            type: 'output',
            position: { x: 500, y: 100 },
            data: { text: 'the lazy dog' },
          },
        ],
        edges: [
          { id: 'e1', source: 'start', target: 'middle' },
          { id: 'e2', source: 'middle', target: 'end' },
        ],
      },
      metadata: { description: 'Simple three-node linear graph for basic testing' },
    });

    // Complex branching graph
    this.register('graph-complex-branching', {
      category: 'graph',
      data: this.generators.graph.generateGraph({
        nodeCount: 20,
        edgeCount: 18,
        complexity: 'complex',
      }),
      metadata: { description: 'Complex graph with multiple branches and node types' },
    });

    // Circular dependency graph (for validation testing)
    this.register('graph-circular', {
      category: 'graph',
      data: {
        nodes: [
          { id: 'a', type: 'concat', position: { x: 100, y: 100 }, data: { text: 'Node A' } },
          { id: 'b', type: 'concat', position: { x: 300, y: 100 }, data: { text: 'Node B' } },
          { id: 'c', type: 'output', position: { x: 200, y: 200 }, data: { text: 'Node C' } },
        ],
        edges: [
          { id: 'e1', source: 'a', target: 'b' },
          { id: 'e2', source: 'b', target: 'c' },
          { id: 'e3', source: 'c', target: 'a' }, // Creates circular dependency
        ],
      },
      metadata: { description: 'Graph with circular dependency for validation testing' },
    });

    // Empty graph
    this.register('graph-empty', {
      category: 'graph',
      data: { nodes: [], edges: [] },
      metadata: { description: 'Empty graph for edge case testing' },
    });

    // Single node graph
    this.register('graph-single-node', {
      category: 'graph',
      data: {
        nodes: [{ id: 'only', type: 'output', position: { x: 200, y: 200 }, data: { text: 'Single output' } }],
        edges: [],
      },
      metadata: { description: 'Graph with only one node' },
    });
  }

  private initializeUserFixtures(): void {
    // Standard admin user
    this.register('user-admin', {
      category: 'user',
      data: {
        id: 'admin-001',
        email: 'admin@promptspaghetti.test',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        auth: {
          hashedPassword: 'hashed_admin_password',
          twoFactorEnabled: true,
          loginAttempts: 0,
        },
        profile: {
          preferences: { theme: 'dark', notifications: true },
        },
      },
      metadata: { description: 'Standard admin user for authentication testing' },
    });

    // Standard regular user
    this.register('user-regular', {
      category: 'user',
      data: {
        id: 'user-001',
        email: 'user@promptspaghetti.test',
        firstName: 'Regular',
        lastName: 'User',
        role: 'user',
        isActive: true,
        createdAt: '2024-01-15T00:00:00Z',
        auth: {
          hashedPassword: 'hashed_user_password',
          twoFactorEnabled: false,
          loginAttempts: 0,
        },
      },
      metadata: { description: 'Standard regular user for basic functionality testing' },
    });

    // Deactivated user
    this.register('user-deactivated', {
      category: 'user',
      data: {
        id: 'user-deactivated',
        email: 'deactivated@promptspaghetti.test',
        firstName: 'Deactivated',
        lastName: 'User',
        role: 'user',
        isActive: false,
        createdAt: '2024-01-01T00:00:00Z',
        deactivatedAt: '2024-06-01T00:00:00Z',
      },
      metadata: { description: 'Deactivated user for access control testing' },
    });

    // Multiple users batch
    this.register('users-batch', {
      category: 'user',
      data: this.generators.user.generateUsers(10, { roles: ['admin', 'user', 'moderator'] }),
      metadata: { description: 'Batch of 10 users with different roles' },
    });
  }

  private initializeAPIFixtures(): void {
    // Successful authentication request/response
    this.register('api-auth-success', {
      category: 'api',
      data: {
        request: {
          method: 'POST',
          endpoint: '/api/auth/login',
          body: {
            email: 'user@promptspaghetti.test',
            password: 'correct-password',
          },
        },
        response: {
          statusCode: 200,
          data: {
            token: 'jwt-token-example',
            user: {
              id: 'user-001',
              email: 'user@promptspaghetti.test',
              role: 'user',
            },
          },
        },
      },
      metadata: { description: 'Successful authentication API interaction' },
    });

    // Failed authentication
    this.register('api-auth-failure', {
      category: 'api',
      data: {
        request: {
          method: 'POST',
          endpoint: '/api/auth/login',
          body: {
            email: 'user@promptspaghetti.test',
            password: 'wrong-password',
          },
        },
        response: {
          statusCode: 401,
          error: {
            code: 401,
            message: 'Invalid credentials',
            details: 'Email or password is incorrect',
          },
        },
      },
      metadata: { description: 'Failed authentication API interaction' },
    });

    // Graph execution request
    this.register('api-graph-execute', {
      category: 'api',
      data: {
        request: {
          method: 'POST',
          endpoint: '/api/execute',
          body: {
            graph: this.fixtures.get('graph-simple-linear')?.data,
            seed: 12345,
          },
        },
        response: {
          statusCode: 200,
          data: {
            result: 'The quick brown fox jumps over the lazy dog',
            executionTime: 150,
            variables: {},
          },
        },
      },
      metadata: { description: 'Graph execution API request/response' },
    });

    // Rate limit exceeded
    this.register('api-rate-limit', {
      category: 'api',
      data: {
        response: {
          statusCode: 429,
          error: {
            code: 429,
            message: 'Rate limit exceeded',
            details: 'Too many requests. Try again later.',
          },
          headers: {
            'x-rate-limit-limit': '100',
            'x-rate-limit-remaining': '0',
            'x-rate-limit-reset': '1640995200',
          },
        },
      },
      metadata: { description: 'Rate limit exceeded response' },
    });
  }

  private initializePerformanceFixtures(): void {
    // Performance metrics baseline
    this.register('performance-baseline', {
      category: 'performance',
      data: {
        loadTime: 1200,
        renderTime: 150,
        memoryUsage: 45,
        bundleSize: 2048,
        nodeCount: 10,
        executionTime: 89,
        timestamp: '2024-01-01T00:00:00Z',
      },
      metadata: { description: 'Baseline performance metrics for comparison' },
    });

    // Large graph performance data
    this.register('performance-large-graph', {
      category: 'performance',
      data: {
        nodeCount: 1000,
        edgeCount: 800,
        loadTime: 5600,
        renderTime: 2300,
        executionTime: 1450,
        memoryUsage: 256,
        peakMemory: 512,
        cpuUsage: 78,
      },
      metadata: { description: 'Performance metrics for large graph processing' },
    });

    // Load test scenarios
    this.register('performance-load-scenarios', {
      category: 'performance',
      data: [
        { users: 10, duration: 60, expectedRps: 50 },
        { users: 50, duration: 300, expectedRps: 200 },
        { users: 100, duration: 600, expectedRps: 350 },
      ],
      metadata: { description: 'Load testing scenarios with different user counts' },
    });
  }

  private initializeSecurityFixtures(): void {
    // XSS attack attempts
    this.register('security-xss-payloads', {
      category: 'security',
      data: [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src="x" onerror="alert(\'xss\')">',
        '<svg onload="alert(\'xss\')">',
        '"><script>alert("xss")</script>',
        '\';alert("xss");//',
      ],
      metadata: { description: 'Common XSS attack payloads for security testing' },
    });

    // SQL injection attempts
    this.register('security-sql-injection', {
      category: 'security',
      data: [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "' UNION SELECT password FROM users --",
        "'; DELETE FROM graphs; --",
        "' OR 1=1 --",
      ],
      metadata: { description: 'SQL injection attack patterns' },
    });

    // Invalid JWT tokens
    this.register('security-invalid-tokens', {
      category: 'security',
      data: [
        'invalid.jwt.token',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature',
        'expired.token.here',
        '',
        'Bearer malformed-token',
      ],
      metadata: { description: 'Invalid JWT tokens for authentication testing' },
    });

    // Malicious file upload attempts
    this.register('security-malicious-uploads', {
      category: 'security',
      data: [
        { filename: 'test.php', content: '<?php system($_GET["cmd"]); ?>' },
        { filename: 'test.js', content: 'require("child_process").exec("rm -rf /")' },
        { filename: 'test.exe', content: 'binary executable content' },
        { filename: '../../../etc/passwd', content: 'path traversal attempt' },
      ],
      metadata: { description: 'Malicious file upload attempts for security testing' },
    });
  }
}

/**
 * Test Database Manager
 * Manages test database setup and teardown
 */
export class TestDatabaseManager {
  private connections: Map<string, any> = new Map();
  private schemas: Map<string, string[]> = new Map();

  /**
   * Setup test database
   */
  async setupTestDatabase(name: string, schema?: string[]): Promise<void> {
    // In a real implementation, this would:
    // 1. Create a test database instance
    // 2. Apply schema migrations
    // 3. Seed with test data
    // 4. Return connection info

    console.log(`Setting up test database: ${name}`);
    if (schema) {
      this.schemas.set(name, schema);
      console.log(`Applied schema with ${schema.length} tables`);
    }
  }

  /**
   * Cleanup test database
   */
  async cleanupTestDatabase(name: string): Promise<void> {
    // In a real implementation, this would:
    // 1. Close connections
    // 2. Drop test database
    // 3. Clean up resources

    console.log(`Cleaning up test database: ${name}`);
    this.connections.delete(name);
    this.schemas.delete(name);
  }

  /**
   * Reset test data
   */
  async resetTestData(name: string): Promise<void> {
    console.log(`Resetting test data for database: ${name}`);
    // Implementation would truncate tables and reseed
  }
}

/**
 * Test Environment Manager
 * Manages test environment setup and configuration
 */
export class TestEnvironmentManager {
  private environments: Map<string, any> = new Map();

  /**
   * Setup test environment
   */
  async setupEnvironment(name: string, config: any): Promise<void> {
    console.log(`Setting up test environment: ${name}`);

    // Environment setup would include:
    // - Setting environment variables
    // - Starting services (Redis, databases, etc.)
    // - Configuring network settings
    // - Setting up monitoring

    this.environments.set(name, {
      name,
      config,
      startedAt: new Date(),
      services: ['redis', 'postgres', 'api-server'],
      ports: { api: 3001, redis: 6380, postgres: 5433 },
    });
  }

  /**
   * Cleanup test environment
   */
  async cleanupEnvironment(name: string): Promise<void> {
    console.log(`Cleaning up test environment: ${name}`);
    const env = this.environments.get(name);

    if (env) {
      // Stop services, clean up ports, reset configurations
      this.environments.delete(name);
    }
  }

  /**
   * Get environment status
   */
  getEnvironmentStatus(name: string): any {
    return this.environments.get(name) || null;
  }

  /**
   * List active environments
   */
  listEnvironments(): string[] {
    return Array.from(this.environments.keys());
  }
}

export default TestFixtureManager;
