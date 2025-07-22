/**
 * API Mocks - Comprehensive API Layer Mocking System
 * 
 * Provides specialized mock implementations for all API endpoints including
 * authentication, graph operations, database operations, and external services.
 * 
 * Task: E18-1753114562158-DAD671
 */

import { rest } from 'msw';
import { setupServer } from 'msw/node';
import MockFactory, { MockConfig, MockBehavior } from './MockFactory';
import seedrandom from 'seedrandom';

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
  headers?: Record<string, string>;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
  sessionId: string;
  expiresAt: number;
}

export interface GraphExecutionRequest {
  graph: any;
  seeds?: number[];
  options?: {
    timeout?: number;
    maxOutputs?: number;
    includeMetrics?: boolean;
  };
}

export interface DatabaseOperationRequest {
  operation: 'query' | 'insert' | 'update' | 'delete';
  table?: string;
  data?: any;
  conditions?: any;
  sql?: string;
  params?: any[];
}

export class APIMockService {
  private factory: MockFactory;
  private server: any; // MSW server
  private baseUrl: string;
  private rng: seedrandom.PRNG;
  private mockData: Map<string, any> = new Map();

  constructor(config: MockConfig = {}) {
    this.factory = new MockFactory(config);
    this.baseUrl = config.baseUrl || 'http://localhost:3000';
    this.rng = seedrandom(config.seed?.toString() || '12345');
    this.initializeMockData();
    this.setupMSWServer();
  }

  /**
   * Initialize the MSW server with all API handlers
   */
  private setupMSWServer(): void {
    const handlers = [
      // Authentication endpoints
      rest.post(`${this.baseUrl}/api/auth/login`, this.handleLogin.bind(this)),
      rest.post(`${this.baseUrl}/api/auth/logout`, this.handleLogout.bind(this)),
      rest.post(`${this.baseUrl}/api/auth/refresh`, this.handleRefreshToken.bind(this)),
      rest.get(`${this.baseUrl}/api/auth/me`, this.handleGetCurrentUser.bind(this)),
      rest.post(`${this.baseUrl}/api/auth/register`, this.handleRegister.bind(this)),
      
      // Graph operations
      rest.post(`${this.baseUrl}/api/graphs/execute`, this.handleGraphExecution.bind(this)),
      rest.post(`${this.baseUrl}/api/graphs`, this.handleCreateGraph.bind(this)),
      rest.get(`${this.baseUrl}/api/graphs/:id`, this.handleGetGraph.bind(this)),
      rest.put(`${this.baseUrl}/api/graphs/:id`, this.handleUpdateGraph.bind(this)),
      rest.delete(`${this.baseUrl}/api/graphs/:id`, this.handleDeleteGraph.bind(this)),
      rest.post(`${this.baseUrl}/api/graphs/:id/export`, this.handleExportGraph.bind(this)),
      
      // Preview endpoint
      rest.post(`${this.baseUrl}/api/preview`, this.handlePreview.bind(this)),
      
      // Database operations
      rest.post(`${this.baseUrl}/api/database/query`, this.handleDatabaseQuery.bind(this)),
      rest.get(`${this.baseUrl}/api/database/health`, this.handleDatabaseHealth.bind(this)),
      
      // Analytics endpoints
      rest.post(`${this.baseUrl}/api/analytics/track`, this.handleAnalyticsTrack.bind(this)),
      rest.get(`${this.baseUrl}/api/analytics/dashboard`, this.handleAnalyticsDashboard.bind(this)),
      
      // File operations
      rest.post(`${this.baseUrl}/api/files/upload`, this.handleFileUpload.bind(this)),
      rest.get(`${this.baseUrl}/api/files/:id`, this.handleFileDownload.bind(this)),
      
      // WebSocket fallback for testing
      rest.get(`${this.baseUrl}/ws/collaboration`, this.handleWebSocketConnection.bind(this))
    ];

    this.server = setupServer(...handlers);
  }

  /**
   * Start the mock server
   */
  start(): void {
    this.server.listen({
      onUnhandledRequest: 'warn'
    });
    console.log('🚀 API Mock Server started');
  }

  /**
   * Stop the mock server
   */
  stop(): void {
    this.server.close();
    this.factory.cleanup();
    console.log('🛑 API Mock Server stopped');
  }

  /**
   * Reset all handlers to their default state
   */
  resetHandlers(): void {
    this.server.resetHandlers();
    this.factory.resetAll();
    this.initializeMockData();
    console.log('🔄 API Mock handlers reset');
  }

  /**
   * Add custom mock behaviors
   */
  addCustomBehavior(endpoint: string, behavior: MockBehavior): void {
    this.factory.addBehavior(endpoint, behavior);
  }

  // Authentication Handlers
  private async handleLogin(req: any, res: any, ctx: any) {
    const { email, password, mfa } = await req.json();
    
    // Simulate authentication logic
    if (email === 'test@example.com' && password === 'password123') {
      const user = {
        id: 'user_123',
        email,
        role: 'admin',
        permissions: ['read', 'write', 'admin'],
        verified: true
      };

      const sessionId = this.generateId();
      const token = this.generateJWT(user, sessionId);
      const refreshToken = this.generateId();

      // Store session
      this.mockData.set(`session_${sessionId}`, {
        user,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });

      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          data: {
            user,
            token,
            refreshToken,
            sessionId
          }
        })
      );
    } else {
      return res(
        ctx.status(401),
        ctx.json({
          success: false,
          error: 'Invalid credentials'
        })
      );
    }
  }

  private async handleLogout(req: any, res: any, ctx: any) {
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      const sessionId = this.extractSessionFromToken(authHeader);
      if (sessionId) {
        this.mockData.delete(`session_${sessionId}`);
      }
    }

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Logged out successfully'
      })
    );
  }

  private async handleRefreshToken(req: any, res: any, ctx: any) {
    const { refreshToken } = await req.json();
    
    // Simple refresh token validation
    if (refreshToken && refreshToken.startsWith('mock_')) {
      const user = {
        id: 'user_123',
        email: 'test@example.com',
        role: 'admin',
        permissions: ['read', 'write', 'admin']
      };

      const sessionId = this.generateId();
      const newToken = this.generateJWT(user, sessionId);
      const newRefreshToken = this.generateId();

      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          data: {
            token: newToken,
            refreshToken: newRefreshToken
          }
        })
      );
    }

    return res(
      ctx.status(401),
      ctx.json({
        success: false,
        error: 'Invalid refresh token'
      })
    );
  }

  private async handleGetCurrentUser(req: any, res: any, ctx: any) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return res(
        ctx.status(401),
        ctx.json({
          success: false,
          error: 'No authorization header'
        })
      );
    }

    const sessionId = this.extractSessionFromToken(authHeader);
    const session = this.mockData.get(`session_${sessionId}`);

    if (session && new Date() < session.expiresAt) {
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          data: session.user
        })
      );
    }

    return res(
      ctx.status(401),
      ctx.json({
        success: false,
        error: 'Invalid or expired token'
      })
    );
  }

  private async handleRegister(req: any, res: any, ctx: any) {
    const { email, password, username } = await req.json();
    
    // Check if user already exists
    const existingUser = Array.from(this.mockData.values()).find(
      (value: any) => value.user && value.user.email === email
    );

    if (existingUser) {
      return res(
        ctx.status(409),
        ctx.json({
          success: false,
          error: 'User already exists'
        })
      );
    }

    // Create new user
    const user = {
      id: this.generateId(),
      email,
      username,
      role: 'user',
      permissions: ['read'],
      verified: false,
      createdAt: new Date()
    };

    const sessionId = this.generateId();
    const token = this.generateJWT(user, sessionId);

    this.mockData.set(`user_${user.id}`, user);
    this.mockData.set(`session_${sessionId}`, {
      user,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        data: {
          user,
          token,
          message: 'User registered successfully'
        }
      })
    );
  }

  // Graph Operation Handlers
  private async handleGraphExecution(req: any, res: any, ctx: any) {
    const request: GraphExecutionRequest = await req.json();
    
    // Simulate graph execution
    const results = request.seeds?.map(seed => {
      return {
        seed,
        output: this.simulateGraphExecution(request.graph, seed),
        executionTime: Math.floor(this.rng() * 1000) + 50, // 50-1050ms
        memoryUsed: Math.floor(this.rng() * 50) + 10 // 10-60MB
      };
    }) || [];

    const response: APIResponse = {
      success: true,
      data: {
        results,
        totalExecutionTime: results.reduce((sum, r) => sum + r.executionTime, 0),
        averageExecutionTime: results.length > 0 ? results.reduce((sum, r) => sum + r.executionTime, 0) / results.length : 0
      }
    };

    return res(
      ctx.status(200),
      ctx.json(response)
    );
  }

  private async handleCreateGraph(req: any, res: any, ctx: any) {
    const graphData = await req.json();
    
    const graph = {
      id: this.generateId(),
      ...graphData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.mockData.set(`graph_${graph.id}`, graph);

    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        data: graph
      })
    );
  }

  private async handleGetGraph(req: any, res: any, ctx: any) {
    const { id } = req.params;
    const graph = this.mockData.get(`graph_${id}`);

    if (graph) {
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          data: graph
        })
      );
    }

    return res(
      ctx.status(404),
      ctx.json({
        success: false,
        error: 'Graph not found'
      })
    );
  }

  private async handleUpdateGraph(req: any, res: any, ctx: any) {
    const { id } = req.params;
    const updates = await req.json();
    const graph = this.mockData.get(`graph_${id}`);

    if (graph) {
      const updatedGraph = {
        ...graph,
        ...updates,
        updatedAt: new Date()
      };
      
      this.mockData.set(`graph_${id}`, updatedGraph);

      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          data: updatedGraph
        })
      );
    }

    return res(
      ctx.status(404),
      ctx.json({
        success: false,
        error: 'Graph not found'
      })
    );
  }

  private async handleDeleteGraph(req: any, res: any, ctx: any) {
    const { id } = req.params;
    const existed = this.mockData.delete(`graph_${id}`);

    return res(
      ctx.status(existed ? 200 : 404),
      ctx.json({
        success: existed,
        message: existed ? 'Graph deleted successfully' : 'Graph not found'
      })
    );
  }

  private async handleExportGraph(req: any, res: any, ctx: any) {
    const { id } = req.params;
    const { format = 'json' } = await req.json();
    const graph = this.mockData.get(`graph_${id}`);

    if (graph) {
      let exportData;
      switch (format) {
        case 'json':
          exportData = JSON.stringify(graph, null, 2);
          break;
        case 'yaml':
          exportData = `# Graph Export\nid: ${graph.id}\nname: ${graph.name || 'Untitled'}\n`;
          break;
        default:
          exportData = JSON.stringify(graph);
      }

      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          data: {
            format,
            content: exportData,
            filename: `graph-${id}.${format}`
          }
        })
      );
    }

    return res(
      ctx.status(404),
      ctx.json({
        success: false,
        error: 'Graph not found'
      })
    );
  }

  private async handlePreview(req: any, res: any, ctx: any) {
    const request = await req.json();
    
    // Simulate preview generation
    const previews = (request.seeds || [123, 456, 789]).map((seed: number) => ({
      seed,
      result: this.simulateGraphExecution(request.graph, seed)
    }));

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        previews
      })
    );
  }

  // Database Operation Handlers
  private async handleDatabaseQuery(req: any, res: any, ctx: any) {
    const request: DatabaseOperationRequest = await req.json();
    
    // Simulate database operations
    let result;
    switch (request.operation) {
      case 'query':
        result = {
          rows: this.generateMockTableData(5),
          count: 5,
          executionTime: Math.floor(this.rng() * 100) + 10
        };
        break;
      case 'insert':
        result = {
          id: this.generateId(),
          ...request.data,
          created_at: new Date().toISOString()
        };
        break;
      case 'update':
        result = {
          affected: Math.floor(this.rng() * 5) + 1,
          updated_at: new Date().toISOString()
        };
        break;
      case 'delete':
        result = {
          affected: Math.floor(this.rng() * 3) + 1
        };
        break;
    }

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: result
      })
    );
  }

  private async handleDatabaseHealth(req: any, res: any, ctx: any) {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          status: 'healthy',
          connections: {
            active: 5,
            idle: 10,
            max: 20
          },
          performance: {
            avgQueryTime: Math.floor(this.rng() * 50) + 20,
            slowQueries: Math.floor(this.rng() * 3)
          },
          uptime: Math.floor(this.rng() * 86400) + 3600 // 1-24 hours
        }
      })
    );
  }

  // Analytics Handlers
  private async handleAnalyticsTrack(req: any, res: any, ctx: any) {
    const { event, properties, userId } = await req.json();
    
    const eventData = {
      id: this.generateId(),
      event,
      properties,
      userId,
      timestamp: new Date().toISOString()
    };

    // Store event data
    if (!this.mockData.has('analytics_events')) {
      this.mockData.set('analytics_events', []);
    }
    this.mockData.get('analytics_events').push(eventData);

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          eventId: eventData.id,
          message: 'Event tracked successfully'
        }
      })
    );
  }

  private async handleAnalyticsDashboard(req: any, res: any, ctx: any) {
    const events = this.mockData.get('analytics_events') || [];
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          totalEvents: events.length,
          recentEvents: events.slice(-10),
          topEvents: this.aggregateEvents(events),
          metrics: {
            dailyActiveUsers: Math.floor(this.rng() * 1000) + 100,
            sessionDuration: Math.floor(this.rng() * 3600) + 300,
            bounceRate: this.rng() * 0.4 + 0.1
          }
        }
      })
    );
  }

  // File Operation Handlers
  private async handleFileUpload(req: any, res: any, ctx: any) {
    // Simulate file upload
    const file = {
      id: this.generateId(),
      filename: 'uploaded-file.json',
      size: Math.floor(this.rng() * 10000) + 1000,
      mimeType: 'application/json',
      uploadedAt: new Date().toISOString()
    };

    this.mockData.set(`file_${file.id}`, file);

    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        data: file
      })
    );
  }

  private async handleFileDownload(req: any, res: any, ctx: any) {
    const { id } = req.params;
    const file = this.mockData.get(`file_${id}`);

    if (file) {
      return res(
        ctx.status(200),
        ctx.set('Content-Type', file.mimeType),
        ctx.set('Content-Disposition', `attachment; filename="${file.filename}"`),
        ctx.text('Mock file content')
      );
    }

    return res(
      ctx.status(404),
      ctx.json({
        success: false,
        error: 'File not found'
      })
    );
  }

  private async handleWebSocketConnection(req: any, res: any, ctx: any) {
    // Simulate WebSocket connection response
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          connectionId: this.generateId(),
          status: 'connected',
          protocols: ['collaboration', 'presence']
        }
      })
    );
  }

  // Helper Methods
  private initializeMockData(): void {
    // Initialize with some default data
    this.mockData.set('analytics_events', []);
    this.mockData.set('users', []);
    this.mockData.set('graphs', []);
  }

  private generateId(): string {
    return `mock_${Date.now()}_${Math.floor(this.rng() * 10000)}`;
  }

  private generateJWT(user: any, sessionId: string): string {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      sessionId,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000
    };
    
    // Simple mock JWT (not secure, just for testing)
    return `mock_jwt_${btoa(JSON.stringify(payload))}`;
  }

  private extractSessionFromToken(authHeader: string): string | null {
    const token = authHeader.replace('Bearer ', '');
    if (token.startsWith('mock_jwt_')) {
      try {
        const payload = JSON.parse(atob(token.replace('mock_jwt_', '')));
        return payload.sessionId;
      } catch {
        return null;
      }
    }
    return null;
  }

  private simulateGraphExecution(graph: any, seed: number): string {
    const rng = seedrandom(seed.toString());
    const outputs = [
      'Generated creative content A',
      'Generated creative content B', 
      'Generated creative content C',
      'Alternative creative output',
      'Unique generated result'
    ];
    return outputs[Math.floor(rng() * outputs.length)];
  }

  private generateMockTableData(count: number): any[] {
    const data = [];
    for (let i = 0; i < count; i++) {
      data.push({
        id: this.generateId(),
        name: `Mock Entry ${i + 1}`,
        value: Math.floor(this.rng() * 1000),
        created_at: new Date(Date.now() - this.rng() * 86400000).toISOString()
      });
    }
    return data;
  }

  private aggregateEvents(events: any[]): any[] {
    const eventCounts: Record<string, number> = {};
    events.forEach(event => {
      eventCounts[event.event] = (eventCounts[event.event] || 0) + 1;
    });
    
    return Object.entries(eventCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([event, count]) => ({ event, count }));
  }

  /**
   * Get mock server instance for direct manipulation
   */
  getServer(): any {
    return this.server;
  }

  /**
   * Get mock factory instance
   */
  getFactory(): MockFactory {
    return this.factory;
  }

  /**
   * Get current mock data
   */
  getMockData(): Map<string, any> {
    return this.mockData;
  }
}

export default APIMockService;