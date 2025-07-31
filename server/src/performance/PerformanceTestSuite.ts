import { EventEmitter } from 'events';
import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { performance } from 'perf_hooks';

/**
 * Performance metrics collected during testing
 */
}
}
export interface PerformanceMetrics {
  // WebSocket performance
  connectionTime: number;
  messageLatency: number;
  messageRate: number;
  disconnectionRate: number;
  
  // Collaboration performance
  conflictResolutionTime: number;
  synchronizationTime: number;
  stateUpdateLatency: number;
  
  // System performance
  cpuUsage: number;
  memoryUsage: number;
  networkThroughput: number;
  
  // User experience metrics
  responseTime: number;
  operationSuccessRate: number;
  errorRate: number;
  
  // Timestamp and context
  timestamp: number;
  testScenario: string;
  userCount: number;
}
}
}

/**
 * Test scenario configuration
 */
}
}
export interface TestScenario {
  name: string;
  description: string;
  userCount: number;
  duration: number; // in milliseconds
  operationRate: number; // operations per second per user
  operationTypes: OperationType[];
  documentComplexity: DocumentComplexity;
  networkConditions?: NetworkConditions;
}
}
}

/**
 * Types of operations to simulate
 */
export enum OperationType {
  CREATE_NODE = 'create_node',
  DELETE_NODE = 'delete_node',
  UPDATE_NODE_PROPERTIES = 'update_node_properties',
  MOVE_NODE = 'move_node',
  CREATE_EDGE = 'create_edge',
  DELETE_EDGE = 'delete_edge',
  UPDATE_CURSOR = 'update_cursor',
  UPDATE_SELECTION = 'update_selection',
  TYPING_ACTIVITY = 'typing_activity',
  TOOL_CHANGE = 'tool_change'
}

/**
 * Document complexity levels
 */
export enum DocumentComplexity {
  SIMPLE = 'simple',     // 10-20 nodes, 10-15 edges
  MEDIUM = 'medium',     // 50-100 nodes, 60-120 edges
  COMPLEX = 'complex',   // 200-500 nodes, 300-800 edges
  ENTERPRISE = 'enterprise' // 1000+ nodes, 1500+ edges
}

/**
 * Network conditions simulation
 */
}
}
export interface NetworkConditions {
  latency: number; // in milliseconds
  bandwidth: number; // in kbps
  packetLoss: number; // percentage (0-100)
  jitter: number; // in milliseconds
}
}
}

/**
 * Simulated user for performance testing
 */
export class SimulatedUser extends EventEmitter {
  private ws: WebSocket | null = null;
  private connectionId: string | null = null;
  private userId: string;
  private documentId: string;
  private isConnected: boolean = false;
  private operationQueue: Array<() => Promise<void>> = [];
  private metrics: PerformanceMetrics[] = [];
  private scenario: TestScenario;
  private startTime: number = 0;

  constructor(userId: string, documentId: string, scenario: TestScenario) {
    super();
    this.userId = userId;
    this.documentId = documentId;
    this.scenario = scenario;
  }

  /**
   * Connect to WebSocket server
   */
  async connect(serverUrl: string): Promise<void> {

    return new Promise((resolve, reject) => {
      const connectStartTime = performance.now();
      
      this.ws = new WebSocket(serverUrl);
      
      this.ws.on('open', () => {
        const connectionTime = performance.now() - connectStartTime;
        this.recordMetric({
          connectionTime,
          messageLatency: 0,
          messageRate: 0,
          disconnectionRate: 0,
          conflictResolutionTime: 0,
          synchronizationTime: 0,
          stateUpdateLatency: 0,
          cpuUsage: 0,
          memoryUsage: 0,
          networkThroughput: 0,
          responseTime: connectionTime,
          operationSuccessRate: 100,
          errorRate: 0,
          timestamp: Date.now(),
          testScenario: this.scenario.name,
          userCount: this.scenario.userCount
        });
        
        this.isConnected = true;
        this.emit('connected');
        resolve();
      });

      this.ws.on('message', (data) => {
        this.handleMessage(data);
      });

      this.ws.on('error', (error) => {
        this.emit('error', error);
        reject(error);
      });

      this.ws.on('close', () => {
        this.isConnected = false;
        this.emit('disconnected');
      });

      // Timeout for connection
      setTimeout(() => {
        if (!this.isConnected) {
          reject(new Error('Connection timeout'));
        }
      }, 10000);
    });
  }

  /**
   * Start performing operations according to scenario
   */
  startOperations(): void {
    this.startTime = performance.now();
    const interval = 1000 / this.scenario.operationRate; // milliseconds between operations
    
    const operationTimer = setInterval(() => {
      if (!this.isConnected || (performance.now() - this.startTime) > this.scenario.duration) {
        clearInterval(operationTimer);
        return;
      }
      
      this.performRandomOperation();
    }, interval);
  }

  /**
   * Perform a random operation based on scenario configuration
   */
  private async performRandomOperation(): Promise<void> {

    const operationType = this.scenario.operationTypes[
      Math.floor(Math.random() * this.scenario.operationTypes.length)
    ];
    
    const operationStartTime = performance.now();
    
    try {
      switch (operationType) {
      case OperationType.CREATE_NODE:
        await this.createNode();
        break;
      case OperationType.DELETE_NODE:
        await this.deleteNode();
        break;
      case OperationType.UPDATE_NODE_PROPERTIES:
        await this.updateNodeProperties();
        break;
      case OperationType.MOVE_NODE:
        await this.moveNode();
        break;
      case OperationType.CREATE_EDGE:
        await this.createEdge();
        break;
      case OperationType.DELETE_EDGE:
        await this.deleteEdge();
        break;
      case OperationType.UPDATE_CURSOR:
        await this.updateCursor();
        break;
      case OperationType.UPDATE_SELECTION:
        await this.updateSelection();
        break;
      case OperationType.TYPING_ACTIVITY:
        await this.simulateTyping();
        break;
      case OperationType.TOOL_CHANGE:
        await this.changeTool();
        break;
      }
      
      const operationTime = performance.now() - operationStartTime;
      this.recordOperationMetric(operationType, operationTime, true);
      
    } catch (error) {
      const operationTime = performance.now() - operationStartTime;
      this.recordOperationMetric(operationType, operationTime, false);
      this.emit('operation_error', { operationType, error });
    }
  }

  /**
   * Record performance metrics for operations
   */
  private recordOperationMetric(operationType: OperationType, duration: number, success: boolean): void {
    this.recordMetric({
      connectionTime: 0,
      messageLatency: 0,
      messageRate: 0,
      disconnectionRate: 0,
      conflictResolutionTime: 0,
      synchronizationTime: 0,
      stateUpdateLatency: 0,
      cpuUsage: 0,
      memoryUsage: 0,
      networkThroughput: 0,
      responseTime: duration,
      operationSuccessRate: success ? 100 : 0,
      errorRate: success ? 0 : 100,
      timestamp: Date.now(),
      testScenario: `${this.scenario.name}_${operationType}`,
      userCount: this.scenario.userCount
    });
  }

  /**
   * Create a new node
   */
  private async createNode(): Promise<void> {

    const nodeId = uuidv4();
    const nodeData = {
      id: nodeId,
      type: 'output',
      position: {
        x: Math.random() * 800,
        y: Math.random() * 600
  }
      data: {
        text: `Test node ${Date.now()}`
      }
    };

    await this.sendMessage('graph_update', {
      documentId: this.documentId,
      operations: [{
        type: 'node_add',
        nodeId,
        data: nodeData,
        timestamp: Date.now()
      }]
    });
  }

  /**
   * Delete a random node
   */
  private async deleteNode(): Promise<void> {

    const nodeId = `node_${Math.floor(Math.random() * 100)}`;
    
    await this.sendMessage('graph_update', {
      documentId: this.documentId,
      operations: [{
        type: 'node_remove',
        nodeId,
        timestamp: Date.now()
      }]
    });
  }

  /**
   * Update node properties
   */
  private async updateNodeProperties(): Promise<void> {

    const nodeId = `node_${Math.floor(Math.random() * 100)}`;
    
    await this.sendMessage('graph_update', {
      documentId: this.documentId,
      operations: [{
        type: 'node_update',
        nodeId,
        data: {
          text: `Updated text ${Date.now()}`
  }
        timestamp: Date.now()
      }]
    });
  }

  /**
   * Move a node to a new position
   */
  private async moveNode(): Promise<void> {

    const nodeId = `node_${Math.floor(Math.random() * 100)}`;
    
    await this.sendMessage('graph_update', {
      documentId: this.documentId,
      operations: [{
        type: 'node_update',
        nodeId,
        data: {
          position: {
            x: Math.random() * 800,
            y: Math.random() * 600
          }
  }
        timestamp: Date.now()
      }]
    });
  }

  /**
   * Create a new edge
   */
  private async createEdge(): Promise<void> {

    const edgeId = uuidv4();
    const sourceNodeId = `node_${Math.floor(Math.random() * 100)}`;
    const targetNodeId = `node_${Math.floor(Math.random() * 100)}`;
    
    await this.sendMessage('graph_update', {
      documentId: this.documentId,
      operations: [{
        type: 'edge_add',
        edgeId,
        data: {
          id: edgeId,
          source: sourceNodeId,
          target: targetNodeId
  }
        timestamp: Date.now()
      }]
    });
  }

  /**
   * Delete a random edge
   */
  private async deleteEdge(): Promise<void> {

    const edgeId = `edge_${Math.floor(Math.random() * 100)}`;
    
    await this.sendMessage('graph_update', {
      documentId: this.documentId,
      operations: [{
        type: 'edge_remove',
        edgeId,
        timestamp: Date.now()
      }]
    });
  }

  /**
   * Update cursor position
   */
  private async updateCursor(): Promise<void> {

    await this.sendMessage('cursor_update', {
      x: Math.random() * 800,
      y: Math.random() * 600,
      nodeId: `node_${Math.floor(Math.random() * 100)}`,
      viewportBounds: {
        x: 0,
        y: 0,
        width: 800,
        height: 600
      }
    });
  }

  /**
   * Update selection
   */
  private async updateSelection(): Promise<void> {

    const nodeIds = Array.from(
      { length: Math.floor(Math.random() * 3) + 1 },
      () => `node_${Math.floor(Math.random() * 100)}`
    );
    
    await this.sendMessage('selection_update', {
      nodeIds,
      edgeIds: [],
      selectionBox: {
        x: Math.random() * 800,
        y: Math.random() * 600,
        width: Math.random() * 200,
        height: Math.random() * 200
      }
    });
  }

  /**
   * Simulate typing activity
   */
  private async simulateTyping(): Promise<void> {

    await this.sendMessage('activity_update', {
      currentTool: 'text',
      isTyping: true,
      focusedNodeId: `node_${Math.floor(Math.random() * 100)}`
    });
    
    // Stop typing after a random interval
    setTimeout(async () => {
      await this.sendMessage('activity_update', {
        currentTool: 'text',
        isTyping: false,
        focusedNodeId: null
      });
    }, Math.random() * 2000 + 500);
  }

  /**
   * Change current tool
   */
  private async changeTool(): Promise<void> {

    const tools = ['select', 'text', 'node', 'edge', 'delete'];
    const tool = tools[Math.floor(Math.random() * tools.length)];
    
    await this.sendMessage('activity_update', {
      currentTool: tool,
      isTyping: false,
      focusedNodeId: null
    });
  }

  /**
   * Send a message to the WebSocket server
   */
  private async sendMessage(type: string, payload: any): Promise<void> {

    if (!this.ws || !this.isConnected) {
      throw new Error('Not connected to server');
    }
    
    const messageStartTime = performance.now();
    
    const message = {
      type,
      payload,
      timestamp: Date.now(),
      messageId: uuidv4(),
      documentId: this.documentId
    };
    
    return new Promise((resolve, reject) => {
      this.ws!.send(JSON.stringify(message));
      
      // Track message latency (simplified - in real implementation would wait for response)
      setTimeout(() => {
        const messageLatency = performance.now() - messageStartTime;
        this.recordMetric({
          connectionTime: 0,
          messageLatency,
          messageRate: 0,
          disconnectionRate: 0,
          conflictResolutionTime: 0,
          synchronizationTime: 0,
          stateUpdateLatency: 0,
          cpuUsage: 0,
          memoryUsage: 0,
          networkThroughput: 0,
          responseTime: messageLatency,
          operationSuccessRate: 100,
          errorRate: 0,
          timestamp: Date.now(),
          testScenario: this.scenario.name,
          userCount: this.scenario.userCount
        });
        resolve();
      }, 10);
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(data: WebSocket.Data): void {
    try {
      const message = JSON.parse(data.toString());
      
      // Track different types of messages for performance analysis
      switch (message.type) {
      case 'conflict_detected':
        this.handleConflictDetected(message);
        break;
      case 'graph_update':
        this.handleGraphUpdate(message);
        break;
      case 'presence_update':
        this.handlePresenceUpdate(message);
        break;
      case 'sync_response':
        this.handleSyncResponse(message);
        break;
      }
      
    } catch (error) {
      this.emit('message_error', error);
    }
  }

  /**
   * Handle conflict detection and resolution
   */
  private handleConflictDetected(message: any): void {
    const conflictStartTime = performance.now();
    
    // Simulate conflict resolution time
    setTimeout(() => {
      const conflictResolutionTime = performance.now() - conflictStartTime;
      this.recordMetric({
        connectionTime: 0,
        messageLatency: 0,
        messageRate: 0,
        disconnectionRate: 0,
        conflictResolutionTime,
        synchronizationTime: 0,
        stateUpdateLatency: 0,
        cpuUsage: 0,
        memoryUsage: 0,
        networkThroughput: 0,
        responseTime: conflictResolutionTime,
        operationSuccessRate: 100,
        errorRate: 0,
        timestamp: Date.now(),
        testScenario: `${this.scenario.name}_conflict_resolution`,
        userCount: this.scenario.userCount
      });
    }, Math.random() * 100 + 50);
  }

  /**
   * Handle graph updates
   */
  private handleGraphUpdate(message: any): void {
    const updateLatency = Date.now() - message.timestamp;
    
    this.recordMetric({
      connectionTime: 0,
      messageLatency: 0,
      messageRate: 0,
      disconnectionRate: 0,
      conflictResolutionTime: 0,
      synchronizationTime: 0,
      stateUpdateLatency: updateLatency,
      cpuUsage: 0,
      memoryUsage: 0,
      networkThroughput: 0,
      responseTime: updateLatency,
      operationSuccessRate: 100,
      errorRate: 0,
      timestamp: Date.now(),
      testScenario: `${this.scenario.name}_state_update`,
      userCount: this.scenario.userCount
    });
  }

  /**
   * Handle presence updates
   */
  private handlePresenceUpdate(message: any): void {
    // Track presence update frequency and latency
    this.emit('presence_update_received', message);
  }

  /**
   * Handle synchronization responses
   */
  private handleSyncResponse(message: any): void {
    const syncLatency = Date.now() - message.timestamp;
    
    this.recordMetric({
      connectionTime: 0,
      messageLatency: 0,
      messageRate: 0,
      disconnectionRate: 0,
      conflictResolutionTime: 0,
      synchronizationTime: syncLatency,
      stateUpdateLatency: 0,
      cpuUsage: 0,
      memoryUsage: 0,
      networkThroughput: 0,
      responseTime: syncLatency,
      operationSuccessRate: 100,
      errorRate: 0,
      timestamp: Date.now(),
      testScenario: `${this.scenario.name}_synchronization`,
      userCount: this.scenario.userCount
    });
  }

  /**
   * Record a performance metric
   */
  private recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    this.emit('metric_recorded', metric);
  }

  /**
   * Get collected metrics
   */
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Disconnect from server
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
    }
  }
}

/**
 * Main performance test suite
 */
export class PerformanceTestSuite extends EventEmitter {
  private users: SimulatedUser[] = [];
  private aggregatedMetrics: PerformanceMetrics[] = [];
  private isRunning: boolean = false;

  /**
   * Run a performance test scenario
   */
  async runScenario(scenario: TestScenario, serverUrl: string): Promise<PerformanceMetrics[]> {

    this.isRunning = true;
    this.users = [];
    this.aggregatedMetrics = [];

    console.log(`Starting performance test: ${scenario.name}`);
    console.log(`Users: ${scenario.userCount}, Duration: ${scenario.duration}ms`);

    // Create simulated users
    const documentId = uuidv4();
    
    for (let i = 0; i < scenario.userCount; i++) {
      const userId = `user_${i}`;
      const user = new SimulatedUser(userId, documentId, scenario);
      
      user.on('metric_recorded', (metric) => {
        this.aggregatedMetrics.push(metric);
      });
      
      user.on('error', (error) => {
        console.error(`User ${userId} error:`, error);
      });
      
      this.users.push(user);
    }

    // Connect all users
    const connectionPromises = this.users.map(user => user.connect(serverUrl));
    await Promise.all(connectionPromises);

    console.log(`All ${scenario.userCount} users connected`);

    // Start operations
    this.users.forEach(user => user.startOperations());

    // Wait for test duration
    await new Promise(resolve => setTimeout(resolve, scenario.duration));

    // Disconnect all users
    this.users.forEach(user => user.disconnect());

    console.log(`Performance test completed: ${scenario.name}`);
    this.isRunning = false;

    return this.aggregatedMetrics;
  }

  /**
   * Run multiple scenarios in sequence
   */
  async runBenchmark(scenarios: TestScenario[], serverUrl: string): Promise<{ [scenarioName: string]: PerformanceMetrics[] }> {

    const results: { [scenarioName: string]: PerformanceMetrics[] } = {};
    
    for (const scenario of scenarios) {
      if (!this.isRunning) {
        break;
      }
      
      const metrics = await this.runScenario(scenario, serverUrl);
      results[scenario.name] = metrics;
      
      // Wait between scenarios
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    return results;
  }

  /**
   * Generate performance report
   */
  generateReport(metrics: PerformanceMetrics[]): any {
    if (metrics.length === 0) {
      return null;
    }

    // Calculate aggregated statistics
    const stats = {
      connectionTime: this.calculateStats(metrics.map(m => m.connectionTime).filter(v => v > 0)),
      messageLatency: this.calculateStats(metrics.map(m => m.messageLatency).filter(v => v > 0)),
      conflictResolutionTime: this.calculateStats(metrics.map(m => m.conflictResolutionTime).filter(v => v > 0)),
      synchronizationTime: this.calculateStats(metrics.map(m => m.synchronizationTime).filter(v => v > 0)),
      stateUpdateLatency: this.calculateStats(metrics.map(m => m.stateUpdateLatency).filter(v => v > 0)),
      responseTime: this.calculateStats(metrics.map(m => m.responseTime).filter(v => v > 0)),
      operationSuccessRate: this.calculateStats(metrics.map(m => m.operationSuccessRate)),
      errorRate: this.calculateStats(metrics.map(m => m.errorRate))
    };

    return {
      testDuration: Math.max(...metrics.map(m => m.timestamp)) - Math.min(...metrics.map(m => m.timestamp)),
      totalOperations: metrics.length,
      userCount: metrics[0]?.userCount || 0,
      scenario: metrics[0]?.testScenario || 'unknown',
      statistics: stats,
      rawMetrics: metrics
    };
  }

  /**
   * Calculate statistical measures for a dataset
   */
  private calculateStats(values: number[]): any {
    if (values.length === 0) {
      return { min: 0, max: 0, mean: 0, median: 0, p95: 0, p99: 0 };
    }

    const sorted = values.sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      mean: sum / values.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }

  /**
   * Stop running tests
   */
  stop(): void {
    this.isRunning = false;
    this.users.forEach(user => user.disconnect());
  }
}

/**
 * Predefined test scenarios
 */
export const TEST_SCENARIOS: TestScenario[] = [
  {
    name: 'light_editing',
    description: 'Light collaborative editing with few users',
    userCount: 2,
    duration: 60000, // 1 minute
    operationRate: 0.5, // 0.5 operations per second per user
    operationTypes: [
      OperationType.UPDATE_NODE_PROPERTIES,
      OperationType.UPDATE_CURSOR,
      OperationType.UPDATE_SELECTION,
      OperationType.TYPING_ACTIVITY
    ],
    documentComplexity: DocumentComplexity.SIMPLE
  }
  {
    name: 'medium_collaboration',
    description: 'Medium intensity collaboration',
    userCount: 5,
    duration: 120000, // 2 minutes
    operationRate: 1, // 1 operation per second per user
    operationTypes: [
      OperationType.CREATE_NODE,
      OperationType.UPDATE_NODE_PROPERTIES,
      OperationType.MOVE_NODE,
      OperationType.CREATE_EDGE,
      OperationType.UPDATE_CURSOR,
      OperationType.UPDATE_SELECTION
    ],
    documentComplexity: DocumentComplexity.MEDIUM
  }
  {
    name: 'heavy_editing',
    description: 'Heavy collaborative editing with many operations',
    userCount: 10,
    duration: 180000, // 3 minutes
    operationRate: 2, // 2 operations per second per user
    operationTypes: Object.values(OperationType),
    documentComplexity: DocumentComplexity.COMPLEX
  }
  {
    name: 'stress_test',
    description: 'Stress test with maximum users and operations',
    userCount: 25,
    duration: 300000, // 5 minutes
    operationRate: 3, // 3 operations per second per user
    operationTypes: Object.values(OperationType),
    documentComplexity: DocumentComplexity.ENTERPRISE
  }
  {
    name: 'conflict_heavy',
    description: 'Test with high conflict rate',
    userCount: 8,
    duration: 120000, // 2 minutes
    operationRate: 2,
    operationTypes: [
      OperationType.UPDATE_NODE_PROPERTIES,
      OperationType.MOVE_NODE,
      OperationType.DELETE_NODE,
      OperationType.CREATE_NODE
    ],
    documentComplexity: DocumentComplexity.MEDIUM
  }
];