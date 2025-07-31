/**
 * Test Data Generators for PromptSpaghetti Testing Framework
 * Epic 18 - Implement testing infrastructure
 * Task: E18-1753114562510-5E3421
 */

import seedrandom from 'seedrandom';
import { Node, Edge } from 'reactflow';

export interface GeneratorOptions {
  seed?: string;
  count?: number;
  randomize?: boolean;
}

export interface GraphGeneratorOptions extends GeneratorOptions {
  nodeCount?: number;
  edgeCount?: number;
  nodeTypes?: string[];
  complexity?: 'simple' | 'medium' | 'complex';
}

export interface UserGeneratorOptions extends GeneratorOptions {
  includeAuth?: boolean;
  includeProfile?: boolean;
  roles?: string[];
}

export interface APIGeneratorOptions extends GeneratorOptions {
  endpoints?: string[];
  methods?: ('GET' | 'POST' | 'PUT' | 'DELETE')[];
  statusCodes?: number[];
}

/**
 * Base Test Data Generator
 */
export abstract class BaseTestDataGenerator {
  protected rng: () => number;
  protected seed: string;

  constructor(seed: string = 'test-seed-123') {
    this.seed = seed;
    this.rng = seedrandom(seed);
  }

  /**
   * Generate a random string
   */
  protected randomString(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(this.rng() * chars.length)];
    }
    return result;
  }

  /**
   * Generate a random number
   */
  protected randomNumber(min: number = 0, max: number = 100): number {
    return Math.floor(this.rng() * (max - min + 1)) + min;
  }

  /**
   * Pick random item from array
   */
  protected randomChoice<T>(array: T[]): T {
    return array[Math.floor(this.rng() * array.length)];
  }

  /**
   * Generate random boolean
   */
  protected randomBoolean(): boolean {
    return this.rng() > 0.5;
  }

  /**
   * Reset the random number generator with a new seed
   */
  setSeed(seed: string): void {
    this.seed = seed;
    this.rng = seedrandom(seed);
  }
}

/**
 * Graph Data Generator
 * Generates realistic graph structures for testing
 */
export class GraphDataGenerator extends BaseTestDataGenerator {
  private nodeTypes = [
    'output',
    'concat',
    'weightedChoice',
    'include',
    'setVariable',
    'getVariable',
    'conditional',
    'sequential',
    'markov',
    'subject',
    'action',
  ];

  private nodePositions: { x: number; y: number }[] = [];

  /**
   * Generate a complete graph with nodes and edges
   */
  generateGraph(options: GraphGeneratorOptions = {}): { nodes: Node[]; edges: Edge[] } {
    const { nodeCount = 10, edgeCount = 8, nodeTypes = this.nodeTypes, complexity = 'medium' } = options;

    this.initializePositions(nodeCount);

    const nodes = this.generateNodes(nodeCount, nodeTypes, complexity);
    const edges = this.generateEdges(edgeCount, nodes, complexity);

    return { nodes, edges };
  }

  /**
   * Generate array of nodes
   */
  generateNodes(
    count: number,
    nodeTypes: string[] = this.nodeTypes,
    complexity: 'simple' | 'medium' | 'complex' = 'medium'
  ): Node[] {
    const nodes: Node[] = [];

    for (let i = 0; i < count; i++) {
      const nodeType = this.randomChoice(nodeTypes);
      const position = this.nodePositions[i] || { x: this.randomNumber(0, 1000), y: this.randomNumber(0, 800) };

      const node: Node = {
        id: `node-${i + 1}`,
        type: nodeType,
        position,
        data: this.generateNodeData(nodeType, complexity),
        draggable: true,
        selectable: true,
      };

      nodes.push(node);
    }

    return nodes;
  }

  /**
   * Generate array of edges
   */
  generateEdges(count: number, nodes: Node[], complexity: 'simple' | 'medium' | 'complex' = 'medium'): Edge[] {
    const edges: Edge[] = [];
    const usedConnections = new Set<string>();

    for (let i = 0; i < count && i < nodes.length - 1; i++) {
      let sourceIndex, targetIndex;
      let connectionKey;

      // Ensure we don't create duplicate edges
      do {
        sourceIndex = this.randomNumber(0, nodes.length - 1);
        targetIndex = this.randomNumber(0, nodes.length - 1);
        connectionKey = `${sourceIndex}-${targetIndex}`;
      } while (sourceIndex === targetIndex || usedConnections.has(connectionKey));

      usedConnections.add(connectionKey);

      const edge: Edge = {
        id: `edge-${i + 1}`,
        source: nodes[sourceIndex].id,
        target: nodes[targetIndex].id,
        type: this.getEdgeType(complexity),
        animated: this.randomBoolean(),
        style: this.getEdgeStyle(complexity),
      };

      edges.push(edge);
    }

    return edges;
  }

  /**
   * Generate node data based on type
   */
  private generateNodeData(nodeType: string, complexity: 'simple' | 'medium' | 'complex'): any {
    const baseData = {
      label: `${nodeType} ${this.randomString(5)}`,
      description: `Generated ${nodeType} node for testing`,
    };

    switch (nodeType) {
      case 'output':
        return {
          ...baseData,
          text: `Output: ${this.randomString(20)}`,
          variables: this.generateVariables(complexity === 'simple' ? 1 : 3),
        };

      case 'concat':
        return {
          ...baseData,
          parts: Array.from({ length: this.randomNumber(2, 5) }, () => this.randomString(10)),
          separator: this.randomChoice([' ', ', ', '\n', '']),
        };

      case 'weightedChoice':
        return {
          ...baseData,
          choices: Array.from({ length: this.randomNumber(2, 6) }, (_, i) => ({
            text: `Choice ${i + 1}: ${this.randomString(15)}`,
            weight: this.randomNumber(1, 10),
          })),
        };

      case 'conditional':
        return {
          ...baseData,
          condition: `variable_${this.randomString(5)} === "${this.randomString(8)}"`,
          trueBranch: `True: ${this.randomString(15)}`,
          falseBranch: `False: ${this.randomString(15)}`,
        };

      case 'sequential':
        return {
          ...baseData,
          items: Array.from({ length: this.randomNumber(3, 8) }, () => this.randomString(12)),
          pattern: this.randomChoice(['linear', 'cyclical', 'random', 'weighted']),
        };

      case 'markov':
        return {
          ...baseData,
          states: this.generateMarkovStates(),
          initialState: 'start',
        };

      case 'setVariable':
        return {
          ...baseData,
          variableName: `var_${this.randomString(6)}`,
          value: this.randomString(15),
        };

      case 'getVariable':
        return {
          ...baseData,
          variableName: `var_${this.randomString(6)}`,
          defaultValue: this.randomString(10),
        };

      default:
        return baseData;
    }
  }

  private generateVariables(count: number): Record<string, any> {
    const variables: Record<string, any> = {};
    for (let i = 0; i < count; i++) {
      variables[`var_${i + 1}`] = this.randomChoice([
        this.randomString(10),
        this.randomNumber(1, 100),
        this.randomBoolean(),
      ]);
    }
    return variables;
  }

  private generateMarkovStates(): Record<string, any> {
    const states = ['start', 'middle1', 'middle2', 'end'];
    const stateData: Record<string, any> = {};

    states.forEach(state => {
      const transitions: Record<string, number> = {};
      const numTransitions = this.randomNumber(1, 3);

      for (let i = 0; i < numTransitions; i++) {
        const targetState = this.randomChoice(states.filter(s => s !== state));
        transitions[targetState] = this.randomNumber(1, 10) / 10;
      }

      stateData[state] = {
        text: `${state}: ${this.randomString(15)}`,
        transitions,
      };
    });

    return stateData;
  }

  private initializePositions(nodeCount: number): void {
    this.nodePositions = [];
    const gridSize = Math.ceil(Math.sqrt(nodeCount));

    for (let i = 0; i < nodeCount; i++) {
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;

      this.nodePositions.push({
        x: col * 200 + this.randomNumber(-50, 50),
        y: row * 150 + this.randomNumber(-30, 30),
      });
    }
  }

  private getEdgeType(complexity: 'simple' | 'medium' | 'complex'): string {
    const types = complexity === 'simple' ? ['default'] : ['default', 'straight', 'step', 'smoothstep'];
    return this.randomChoice(types);
  }

  private getEdgeStyle(complexity: 'simple' | 'medium' | 'complex'): any {
    if (complexity === 'simple') {
      return { strokeWidth: 2 };
    }

    return {
      strokeWidth: this.randomNumber(1, 4),
      stroke: this.randomChoice(['#666', '#888', '#aaa', '#333']),
      strokeDasharray: this.randomBoolean() ? `${this.randomNumber(5, 15)},${this.randomNumber(3, 8)}` : undefined,
    };
  }
}

/**
 * User Data Generator
 * Generates realistic user data for authentication and profile testing
 */
export class UserDataGenerator extends BaseTestDataGenerator {
  private firstNames = [
    'Alice',
    'Bob',
    'Charlie',
    'Diana',
    'Edward',
    'Fiona',
    'George',
    'Hannah',
    'Ian',
    'Julia',
    'Kevin',
    'Laura',
  ];

  private lastNames = [
    'Anderson',
    'Brown',
    'Clark',
    'Davis',
    'Evans',
    'Fisher',
    'Garcia',
    'Harris',
    'Johnson',
    'King',
    'Lee',
    'Miller',
  ];

  private domains = ['example.com', 'test.org', 'demo.net'];
  private roles = ['admin', 'user', 'moderator', 'viewer'];

  /**
   * Generate a single user
   */
  generateUser(options: UserGeneratorOptions = {}): any {
    const { includeAuth = true, includeProfile = true, roles = this.roles } = options;

    const firstName = this.randomChoice(this.firstNames);
    const lastName = this.randomChoice(this.lastNames);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${this.randomChoice(this.domains)}`;

    const user: any = {
      id: `user-${this.randomString(8)}`,
      email,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      role: this.randomChoice(roles),
      isActive: this.randomBoolean(),
      createdAt: this.generateRandomDate(new Date(2020, 0, 1), new Date()),
      lastLogin: this.generateRandomDate(new Date(2024, 0, 1), new Date()),
    };

    if (includeAuth) {
      user.auth = {
        hashedPassword: `hashed_${this.randomString(32)}`,
        salt: this.randomString(16),
        twoFactorEnabled: this.randomBoolean(),
        loginAttempts: this.randomNumber(0, 5),
        lockedUntil: this.randomBoolean() ? this.generateRandomDate(new Date(), new Date(Date.now() + 86400000)) : null,
      };
    }

    if (includeProfile) {
      user.profile = {
        avatar: `https://avatar.example.com/${user.id}`,
        bio: `Generated bio for ${firstName} ${lastName}`,
        preferences: {
          theme: this.randomChoice(['light', 'dark', 'auto']),
          language: this.randomChoice(['en', 'es', 'fr', 'de']),
          notifications: this.randomBoolean(),
          newsletter: this.randomBoolean(),
        },
        metadata: {
          lastIpAddress: this.generateRandomIP(),
          userAgent: this.generateRandomUserAgent(),
          timezone: this.randomChoice(['UTC', 'EST', 'PST', 'CET']),
        },
      };
    }

    return user;
  }

  /**
   * Generate multiple users
   */
  generateUsers(count: number, options: UserGeneratorOptions = {}): any[] {
    return Array.from({ length: count }, () => this.generateUser(options));
  }

  private generateRandomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + this.rng() * (end.getTime() - start.getTime()));
  }

  private generateRandomIP(): string {
    return `${this.randomNumber(1, 255)}.${this.randomNumber(0, 255)}.${this.randomNumber(0, 255)}.${this.randomNumber(1, 254)}`;
  }

  private generateRandomUserAgent(): string {
    const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
    const versions = ['91.0', '92.0', '93.0', '94.0'];
    const browser = this.randomChoice(browsers);
    const version = this.randomChoice(versions);
    return `Mozilla/5.0 (compatible; ${browser}/${version})`;
  }
}

/**
 * API Data Generator
 * Generates API request/response data for testing
 */
export class APIDataGenerator extends BaseTestDataGenerator {
  private endpoints = [
    '/api/users',
    '/api/graphs',
    '/api/auth/login',
    '/api/auth/register',
    '/api/nodes',
    '/api/edges',
    '/api/execute',
    '/api/preview',
  ];

  private methods = ['GET', 'POST', 'PUT', 'DELETE'] as const;
  private statusCodes = [200, 201, 400, 401, 403, 404, 422, 500];

  /**
   * Generate API request data
   */
  generateRequest(options: APIGeneratorOptions = {}): any {
    const { endpoints = this.endpoints, methods = this.methods } = options;

    const endpoint = this.randomChoice(endpoints);
    const method = this.randomChoice(methods);

    return {
      method,
      endpoint,
      headers: this.generateHeaders(),
      params: this.generateParams(endpoint),
      body: ['POST', 'PUT'].includes(method) ? this.generateBody(endpoint) : undefined,
      timestamp: new Date().toISOString(),
      requestId: `req-${this.randomString(12)}`,
    };
  }

  /**
   * Generate API response data
   */
  generateResponse(request: any, options: APIGeneratorOptions = {}): any {
    const { statusCodes = this.statusCodes } = options;

    const statusCode = this.randomChoice(statusCodes);
    const success = statusCode < 400;

    return {
      statusCode,
      success,
      data: success ? this.generateResponseData(request.endpoint) : undefined,
      error: !success ? this.generateErrorData(statusCode) : undefined,
      headers: {
        'content-type': 'application/json',
        'x-request-id': request.requestId,
        'x-response-time': `${this.randomNumber(50, 500)}ms`,
      },
      timestamp: new Date().toISOString(),
      duration: this.randomNumber(50, 2000),
    };
  }

  private generateHeaders(): Record<string, string> {
    return {
      'content-type': 'application/json',
      authorization: `Bearer ${this.randomString(32)}`,
      'user-agent': 'PromptSpaghetti-Test/1.0',
      accept: 'application/json',
    };
  }

  private generateParams(endpoint: string): Record<string, any> {
    const params: Record<string, any> = {};

    if (endpoint.includes('users')) {
      params.limit = this.randomNumber(10, 50);
      params.offset = this.randomNumber(0, 100);
    }

    if (endpoint.includes('graphs')) {
      params.userId = `user-${this.randomString(8)}`;
      params.includeNodes = this.randomBoolean();
    }

    return params;
  }

  private generateBody(endpoint: string): any {
    if (endpoint.includes('login')) {
      return {
        email: 'test@example.com',
        password: 'password123',
      };
    }

    if (endpoint.includes('register')) {
      return {
        email: `test-${this.randomString(5)}@example.com`,
        password: 'password123',
        firstName: this.randomString(8),
        lastName: this.randomString(8),
      };
    }

    if (endpoint.includes('graphs')) {
      const graphGen = new GraphDataGenerator(this.seed);
      return graphGen.generateGraph({ nodeCount: 5, edgeCount: 4 });
    }

    return {
      data: this.randomString(20),
      metadata: {
        source: 'test-generator',
        timestamp: new Date().toISOString(),
      },
    };
  }

  private generateResponseData(endpoint: string): any {
    if (endpoint.includes('users')) {
      const userGen = new UserDataGenerator(this.seed);
      return {
        users: userGen.generateUsers(this.randomNumber(1, 5)),
        pagination: {
          total: this.randomNumber(100, 1000),
          page: 1,
          limit: 10,
        },
      };
    }

    if (endpoint.includes('graphs')) {
      const graphGen = new GraphDataGenerator(this.seed);
      return graphGen.generateGraph();
    }

    if (endpoint.includes('execute')) {
      return {
        result: this.randomString(50),
        execution_time: this.randomNumber(100, 5000),
        variables: {
          output: this.randomString(30),
        },
      };
    }

    return {
      message: 'Success',
      data: this.randomString(30),
    };
  }

  private generateErrorData(statusCode: number): any {
    const errorMessages = {
      400: 'Bad Request - Invalid input parameters',
      401: 'Unauthorized - Invalid authentication token',
      403: 'Forbidden - Insufficient permissions',
      404: 'Not Found - Resource does not exist',
      422: 'Unprocessable Entity - Validation failed',
      500: 'Internal Server Error - Something went wrong',
    };

    return {
      code: statusCode,
      message: errorMessages[statusCode as keyof typeof errorMessages] || 'Unknown error',
      details: `Error generated for testing: ${this.randomString(20)}`,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Performance Data Generator
 * Generates data for performance testing scenarios
 */
export class PerformanceDataGenerator extends BaseTestDataGenerator {
  /**
   * Generate large graph for performance testing
   */
  generateLargeGraph(nodeCount: number = 1000, edgeRatio: number = 0.8): { nodes: Node[]; edges: Edge[] } {
    const graphGen = new GraphDataGenerator(this.seed);
    return graphGen.generateGraph({
      nodeCount,
      edgeCount: Math.floor(nodeCount * edgeRatio),
      complexity: 'complex',
    });
  }

  /**
   * Generate performance metrics
   */
  generatePerformanceMetrics(): any {
    return {
      executionTime: this.randomNumber(100, 5000),
      memoryUsage: this.randomNumber(50, 500),
      cpuUsage: this.randomNumber(10, 90),
      networkRequests: this.randomNumber(5, 50),
      renderTime: this.randomNumber(50, 1000),
      bundleSize: this.randomNumber(1000, 10000),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Generate load testing scenarios
   */
  generateLoadTestScenarios(concurrentUsers: number): any[] {
    return Array.from({ length: concurrentUsers }, (_, i) => ({
      userId: `load-user-${i + 1}`,
      scenario: this.randomChoice(['light', 'medium', 'heavy']),
      requestsPerSecond: this.randomNumber(1, 10),
      duration: this.randomNumber(60, 300),
      expectedLatency: this.randomNumber(100, 1000),
    }));
  }
}

export { BaseTestDataGenerator, GraphDataGenerator, UserDataGenerator, APIDataGenerator, PerformanceDataGenerator };
