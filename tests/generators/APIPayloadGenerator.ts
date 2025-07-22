/**
 * API Payload Generator for Testing
 * 
 * Generates comprehensive API test payloads including valid requests,
 * invalid requests, edge cases, security test cases, and performance
 * stress testing payloads for all API endpoints.
 * 
 * Task: E18-1753114562159-0BC5A0
 */

import seedrandom from 'seedrandom';
import { Graph, Node } from '../../packages/core/graphSchema';

export interface APITestPayload {
  name: string;
  description: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  headers?: Record<string, string>;
  body?: any;
  queryParams?: Record<string, string>;
  expectedStatus: number;
  expectedBehavior: 'success' | 'error' | 'timeout' | 'rate_limit';
  testCategory: 'valid' | 'invalid' | 'security' | 'performance' | 'edge_case';
  timeout?: number;
}

export interface AuthenticationPayload {
  type: 'login' | 'logout' | 'refresh' | 'register' | 'forgot_password';
  credentials?: {
    username?: string;
    email?: string;
    password?: string;
    token?: string;
    mfaCode?: string;
  };
  expectedOutcome: 'success' | 'failure' | 'mfa_required' | 'rate_limited';
}

export interface GraphOperationPayload {
  operation: 'create' | 'update' | 'delete' | 'execute' | 'validate' | 'export';
  graph?: Graph;
  graphId?: string;
  executionOptions?: {
    seeds?: number[];
    timeout?: number;
    maxNodes?: number;
  };
  exportFormat?: 'json' | 'yaml' | 'csv';
}

export interface RuleManagementPayload {
  operation: 'create' | 'update' | 'delete' | 'list' | 'search' | 'bulk_update';
  rule?: {
    name?: string;
    pattern?: string;
    replacement?: string;
    isRegex?: boolean;
    priority?: number;
    category?: string;
    tags?: string[];
  };
  ruleId?: string;
  filters?: {
    category?: string;
    tags?: string[];
    status?: string;
    dateRange?: {
      start: string;
      end: string;
    };
  };
  bulkData?: any[];
}

export class APIPayloadGenerator {
  private rng: seedrandom.PRNG;

  constructor(seed: number = 12345) {
    this.rng = seedrandom(seed.toString());
  }

  /**
   * Generate valid API test payloads
   */
  generateValidPayloads(): APITestPayload[] {
    return [
      // Authentication endpoints
      {
        name: 'valid-login',
        description: 'Successful user login with valid credentials',
        method: 'POST',
        endpoint: '/api/auth/login',
        headers: { 'Content-Type': 'application/json' },
        body: {
          email: 'test@example.com',
          password: 'validPassword123!',
          rememberMe: true
        },
        expectedStatus: 200,
        expectedBehavior: 'success',
        testCategory: 'valid'
      },
      
      // Graph operations
      {
        name: 'create-simple-graph',
        description: 'Create a simple graph with basic nodes',
        method: 'POST',
        endpoint: '/api/graphs',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: this.generateSimpleGraph(),
        expectedStatus: 201,
        expectedBehavior: 'success',
        testCategory: 'valid'
      },
      
      {
        name: 'execute-graph',
        description: 'Execute a graph with multiple seeds',
        method: 'POST',
        endpoint: '/api/graphs/execute',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: {
          graph: this.generateSimpleGraph(),
          seeds: [123, 456, 789],
          options: {
            timeout: 5000,
            maxOutputs: 10
          }
        },
        expectedStatus: 200,
        expectedBehavior: 'success',
        testCategory: 'valid'
      },
      
      // Rule management
      {
        name: 'create-correction-rule',
        description: 'Create a new correction rule',
        method: 'POST',
        endpoint: '/api/rules',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: {
          name: 'Test Rule',
          pattern: 'teh',
          replacement: 'the',
          isRegex: false,
          priority: 1,
          category: 'spelling',
          tags: ['common', 'typo']
        },
        expectedStatus: 201,
        expectedBehavior: 'success',
        testCategory: 'valid'
      },
      
      // Analytics endpoints
      {
        name: 'get-analytics-dashboard',
        description: 'Retrieve analytics dashboard data',
        method: 'GET',
        endpoint: '/api/analytics/dashboard',
        headers: { 'Authorization': 'Bearer valid-token' },
        queryParams: {
          period: '30d',
          metrics: 'usage,performance,errors'
        },
        expectedStatus: 200,
        expectedBehavior: 'success',
        testCategory: 'valid'
      }
    ];
  }

  /**
   * Generate invalid API test payloads
   */
  generateInvalidPayloads(): APITestPayload[] {
    return [
      // Missing required fields
      {
        name: 'login-missing-password',
        description: 'Login attempt without password',
        method: 'POST',
        endpoint: '/api/auth/login',
        headers: { 'Content-Type': 'application/json' },
        body: {
          email: 'test@example.com'
        },
        expectedStatus: 400,
        expectedBehavior: 'error',
        testCategory: 'invalid'
      },
      
      // Invalid data types
      {
        name: 'create-graph-invalid-seed',
        description: 'Create graph with invalid seed type',
        method: 'POST',
        endpoint: '/api/graphs',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: {
          seed: 'not-a-number',
          nodes: [],
          edges: []
        },
        expectedStatus: 400,
        expectedBehavior: 'error',
        testCategory: 'invalid'
      },
      
      // Malformed JSON
      {
        name: 'malformed-json',
        description: 'Request with malformed JSON body',
        method: 'POST',
        endpoint: '/api/rules',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: '{ "name": "test", "pattern": }', // Malformed JSON
        expectedStatus: 400,
        expectedBehavior: 'error',
        testCategory: 'invalid'
      },
      
      // Resource not found
      {
        name: 'get-nonexistent-graph',
        description: 'Attempt to retrieve non-existent graph',
        method: 'GET',
        endpoint: '/api/graphs/nonexistent-id',
        headers: { 'Authorization': 'Bearer valid-token' },
        expectedStatus: 404,
        expectedBehavior: 'error',
        testCategory: 'invalid'
      },
      
      // Invalid authorization
      {
        name: 'unauthorized-access',
        description: 'Access protected resource without valid token',
        method: 'GET',
        endpoint: '/api/analytics/dashboard',
        headers: { 'Authorization': 'Bearer invalid-token' },
        expectedStatus: 401,
        expectedBehavior: 'error',
        testCategory: 'invalid'
      }
    ];
  }

  /**
   * Generate security-focused test payloads
   */
  generateSecurityPayloads(): APITestPayload[] {
    return [
      // SQL Injection attempts
      {
        name: 'sql-injection-login',
        description: 'SQL injection attempt in login form',
        method: 'POST',
        endpoint: '/api/auth/login',
        headers: { 'Content-Type': 'application/json' },
        body: {
          email: \"admin'; DROP TABLE users; --\",
          password: 'password'
        },
        expectedStatus: 400,
        expectedBehavior: 'error',
        testCategory: 'security'
      },
      
      // XSS attempts
      {
        name: 'xss-in-rule-name',
        description: 'XSS attempt in rule name field',
        method: 'POST',
        endpoint: '/api/rules',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: {
          name: '<script>alert(\"XSS\")</script>',
          pattern: 'test',
          replacement: 'safe',
          isRegex: false
        },
        expectedStatus: 400,
        expectedBehavior: 'error',
        testCategory: 'security'
      },
      
      // Command injection
      {
        name: 'command-injection-pattern',
        description: 'Command injection attempt in regex pattern',
        method: 'POST',
        endpoint: '/api/rules',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: {
          name: 'Malicious Rule',
          pattern: '; rm -rf / #',
          replacement: 'safe',
          isRegex: true
        },
        expectedStatus: 400,
        expectedBehavior: 'error',
        testCategory: 'security'
      },
      
      // Path traversal
      {
        name: 'path-traversal-export',
        description: 'Path traversal attempt in export filename',
        method: 'POST',
        endpoint: '/api/export',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: {
          filename: '../../../etc/passwd',
          format: 'json',
          data: {}
        },
        expectedStatus: 400,
        expectedBehavior: 'error',
        testCategory: 'security'
      },
      
      // Large payload attack
      {
        name: 'oversized-payload',
        description: 'Oversized payload to test DoS protection',
        method: 'POST',
        endpoint: '/api/graphs',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: {
          seed: 123,
          nodes: Array.from({ length: 100000 }, (_, i) => ({
            id: `malicious-node-${i}`,
            type: 'WeightedChoice',
            choices: Array.from({ length: 1000 }, (_, j) => ({
              text: 'A'.repeat(10000), // Very large text
              weight: 1
            }))
          })),
          edges: []
        },
        expectedStatus: 413,
        expectedBehavior: 'error',
        testCategory: 'security'
      }
    ];
  }

  /**
   * Generate performance test payloads
   */
  generatePerformancePayloads(): APITestPayload[] {
    return [
      // Concurrent requests
      {
        name: 'concurrent-graph-execution',
        description: 'Multiple concurrent graph executions',
        method: 'POST',
        endpoint: '/api/graphs/execute',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: {
          graph: this.generateComplexGraph(100),
          seeds: Array.from({ length: 50 }, (_, i) => i + 1),
          options: { timeout: 30000 }
        },
        expectedStatus: 200,
        expectedBehavior: 'success',
        testCategory: 'performance',
        timeout: 30000
      },
      
      // Large data processing
      {
        name: 'bulk-rule-import',
        description: 'Bulk import of many rules',
        method: 'POST',
        endpoint: '/api/rules/bulk',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: {
          rules: Array.from({ length: 1000 }, (_, i) => ({
            name: `Bulk Rule ${i}`,
            pattern: `pattern${i}`,
            replacement: `replacement${i}`,
            isRegex: i % 2 === 0,
            priority: i % 10,
            category: `category${i % 5}`
          }))
        },
        expectedStatus: 202,
        expectedBehavior: 'success',
        testCategory: 'performance',
        timeout: 60000
      },
      
      // Memory intensive operation
      {
        name: 'memory-intensive-export',
        description: 'Export large dataset to test memory usage',
        method: 'POST',
        endpoint: '/api/export',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: {
          format: 'json',
          includeAnalytics: true,
          includeHistory: true,
          dateRange: {
            start: '2020-01-01',
            end: '2024-12-31'
          },
          compression: false
        },
        expectedStatus: 200,
        expectedBehavior: 'success',
        testCategory: 'performance',
        timeout: 120000
      }
    ];
  }

  /**
   * Generate edge case test payloads
   */
  generateEdgeCasePayloads(): APITestPayload[] {
    return [
      // Empty payloads
      {
        name: 'empty-graph',
        description: 'Create graph with no nodes or edges',
        method: 'POST',
        endpoint: '/api/graphs',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: {
          seed: 123,
          nodes: [],
          edges: []
        },
        expectedStatus: 201,
        expectedBehavior: 'success',
        testCategory: 'edge_case'
      },
      
      // Unicode and special characters
      {
        name: 'unicode-rule-name',
        description: 'Rule with unicode characters in name',
        method: 'POST',
        endpoint: '/api/rules',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: {
          name: '🎯 Unicode Rule 测试 ñoël',
          pattern: 'émoticon',
          replacement: '😊',
          isRegex: false,
          priority: 1
        },
        expectedStatus: 201,
        expectedBehavior: 'success',
        testCategory: 'edge_case'
      },
      
      // Boundary values
      {
        name: 'max-integer-seed',
        description: 'Graph with maximum safe integer as seed',
        method: 'POST',
        endpoint: '/api/graphs',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: {
          seed: Number.MAX_SAFE_INTEGER,
          nodes: [
            {
              id: 'test-node',
              type: 'WeightedChoice',
              choices: [{ text: 'Test', weight: 1 }]
            }
          ],
          edges: []
        },
        expectedStatus: 201,
        expectedBehavior: 'success',
        testCategory: 'edge_case'
      },
      
      // Null values in optional fields
      {
        name: 'null-optional-fields',
        description: 'Request with null values in optional fields',
        method: 'POST',
        endpoint: '/api/rules',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: {
          name: 'Null Test Rule',
          pattern: 'test',
          replacement: 'result',
          isRegex: false,
          priority: null,
          category: null,
          tags: null
        },
        expectedStatus: 201,
        expectedBehavior: 'success',
        testCategory: 'edge_case'
      }
    ];
  }

  /**
   * Generate authentication-specific payloads
   */
  generateAuthenticationPayloads(): AuthenticationPayload[] {
    return [
      // Valid login scenarios
      {
        type: 'login',
        credentials: {
          email: 'user@example.com',
          password: 'validPassword123!'
        },
        expectedOutcome: 'success'
      },
      
      // MFA required scenario
      {
        type: 'login',
        credentials: {
          email: 'mfa-user@example.com',
          password: 'validPassword123!'
        },
        expectedOutcome: 'mfa_required'
      },
      
      // Invalid credentials
      {
        type: 'login',
        credentials: {
          email: 'user@example.com',
          password: 'wrongPassword'
        },
        expectedOutcome: 'failure'
      },
      
      // Rate limited login
      {
        type: 'login',
        credentials: {
          email: 'rate-limited@example.com',
          password: 'password'
        },
        expectedOutcome: 'rate_limited'
      },
      
      // Token refresh
      {
        type: 'refresh',
        credentials: {
          token: 'valid-refresh-token'
        },
        expectedOutcome: 'success'
      },
      
      // Registration
      {
        type: 'register',
        credentials: {
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'strongPassword123!'
        },
        expectedOutcome: 'success'
      }
    ];
  }

  private generateSimpleGraph(): Graph {
    return {
      seed: 123,
      nodes: [
        {
          id: 'choice1',
          type: 'WeightedChoice',
          choices: [
            { text: 'Option A', weight: 1 },
            { text: 'Option B', weight: 1 }
          ]
        },
        {
          id: 'output1',
          type: 'Output',
          inputs: ['choice1']
        }
      ],
      edges: [
        {
          id: 'e1',
          source: 'choice1',
          target: 'output1'
        }
      ]
    };
  }

  private generateComplexGraph(nodeCount: number): Graph {
    const nodes: Node[] = [];
    const edges: any[] = [];

    // Create nodes
    for (let i = 0; i < nodeCount; i++) {
      if (i === nodeCount - 1) {
        // Final output node
        nodes.push({
          id: `node${i}`,
          type: 'Output',
          inputs: [`node${i - 1}`]
        });
      } else if (i % 3 === 0) {
        // Weighted choice nodes
        nodes.push({
          id: `node${i}`,
          type: 'WeightedChoice',
          choices: Array.from({ length: 10 }, (_, j) => ({
            text: `Choice ${i}_${j}`,
            weight: this.rng() * 5
          }))
        });
      } else {
        // Concat nodes
        nodes.push({
          id: `node${i}`,
          type: 'Concat',
          inputs: i > 0 ? [`node${i - 1}`] : []
        });
      }

      // Create edges
      if (i > 0) {
        edges.push({
          id: `edge${i}`,
          source: `node${i - 1}`,
          target: `node${i}`
        });
      }
    }

    return {
      seed: 456,
      nodes,
      edges
    };
  }

  /**
   * Generate a comprehensive API test suite
   */
  generateAPITestSuite(): {
    validPayloads: APITestPayload[];
    invalidPayloads: APITestPayload[];
    securityPayloads: APITestPayload[];
    performancePayloads: APITestPayload[];
    edgeCasePayloads: APITestPayload[];
    authenticationPayloads: AuthenticationPayload[];
  } {
    return {
      validPayloads: this.generateValidPayloads(),
      invalidPayloads: this.generateInvalidPayloads(),
      securityPayloads: this.generateSecurityPayloads(),
      performancePayloads: this.generatePerformancePayloads(),
      edgeCasePayloads: this.generateEdgeCasePayloads(),
      authenticationPayloads: this.generateAuthenticationPayloads()
    };
  }
}

export default APIPayloadGenerator;