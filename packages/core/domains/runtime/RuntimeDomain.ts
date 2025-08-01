/**
 * Runtime Domain Interface
 * REFACTOR-005: Domain-Driven Architecture
 * 
 * Main interface and export for the runtime execution domain
 */
import React from 'react';
import { ExecutionTask,
  ExecutionInstance,
  ExecutionRecord,
  NodeDefinition,
  RuntimeMetrics,
  RuntimeConfig,
  RuntimeDomainState,
  RuntimeDomainEvents,
  ExecutionOptions,
  ValidationResult,
  NodeMetrics,
  RuntimeDashboardProps,
  ExecutionQueueProps,
  NodeRegistryProps,
  Graph,
  ExecutionContext,
  ExecutionError }
  ExecutionWarning
 from './types/RuntimeTypes';

// Domain service interfaces


export interface IExecutionService { executeGraph(graph: Graph, seeds: number, options?: ExecutionOptions): Promise<ExecutionRecord>;
  executeNode(nodeId: string, inputs: any, context: ExecutionContext): Promise<any>;
  queueExecution(task: ExecutionTask): Promise<string>;
  cancelExecution(taskId: string): Promise<void>;
  getExecutionStatus(taskId: string): Promise<ExecutionInstance | null>;
  getExecutionHistory(filters?: ExecutionHistoryFilters): Promise<ExecutionRecord>;
  getQueueStatus(): Promise<QueueStatus>;
  pauseQueue(): Promise<void>;
  resumeQueue(): Promise<void>;
  clearQueue(): Promise<void> }



export interface INodeRegistryService { registerNode(definition: NodeDefinition): Promise<void>;
  unregisterNode(nodeType: string): Promise<void>;
  getNodeDefinition(nodeType: string): Promise<NodeDefinition | null>;
  getAllNodeDefinitions(): Promise<NodeDefinition>;
  getNodesByCategory(category: string): Promise<NodeDefinition>;
  validateNodeDefinition(definition: NodeDefinition): Promise<ValidationResult>;
  updateNodeDefinition(nodeType: string, updates: Partial<NodeDefinition>): Promise<NodeDefinition>;
  searchNodes(query: string, filters?: NodeSearchFilters): Promise<NodeDefinition>;
  getNodeMetrics(nodeType: string): Promise<NodeMetrics> }



export interface IValidationService { validateGraph(graph: Graph): Promise<ValidationResult>;
  validateNode(node: any, definition: NodeDefinition): Promise<ValidationResult>;
  validateInputs(inputs: any, specifications: any): Promise<ValidationResult>;
  validateOutputs(outputs: any, specifications: any): Promise<ValidationResult>;
  validateConnection(sourceNode: string, targetNode: string, graph: Graph): Promise<ValidationResult>;
  getValidationRules(nodeType: string): Promise<any>;
  addCustomValidation(name: string, validator: Function): Promise<void>;
  removeCustomValidation(name: string): Promise<void> }



export interface IPerformanceService { getMetrics(period?: string): Promise<RuntimeMetrics>;
  getNodeMetrics(nodeType?: string): Promise<Map<string, NodeMetrics>>;
  startProfiling(executionId: string): Promise<void>;
  stopProfiling(executionId: string): Promise<ProfileResult>;
  analyzePerformance(executionId: string): Promise<PerformanceAnalysis>;
  getBottlenecks(): Promise<PerformanceBottleneck>;
  optimizeGraph(graph: Graph): Promise<OptimizedGraph>;
  benchmarkNode(nodeType: string, iterations: number): Promise<BenchmarkResult>;
  generatePerformanceReport(criteria: ReportCriteria): Promise<PerformanceReport> }



export interface ICacheService { get(key: string): Promise<any>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  getStats(): Promise<CacheStats>;
  invalidatePattern(pattern: string): Promise<number>;
  warmup(keys: string): Promise<void>;
  export(): Promise<CacheExport>;
  import(data: CacheExport): Promise<void> }



export interface ISecurityService {
  validateExecution(graph: Graph, context: ExecutionContext): Promise<SecurityValidation>;
  checkPermissions(nodeType: string, userId: string): Promise<boolean>;
  sanitizeInputs(inputs: any, nodeType: string): Promise<any>;
  auditExecution(execution: ExecutionRecord): Promise<void>;
  detectSuspiciousActivity(metrics: RuntimeMetrics): Promise<SecurityAlert>;
  enforceResourceLimits(executionId: string): Promise<void>;
  validateNodeSecurity(definition: NodeDefinition): Promise<SecurityValidation>;
  // Support types




export interface ExecutionHistoryFilters { graphId?: string;
  userId?: string;
  status?: string }

  dateRange?: { start: Date; end: Date };
  nodeTypes?: string;
  limit?: number;
  offset?: number;


export interface QueueStatus { queueSize: number;
  running: number;
  completed: number;
  failed: number;
  paused: boolean;
  averageWaitTime: number;
  estimatedProcessingTime: number }



export interface NodeSearchFilters { category?: string;
  tags?: string;
  author?: string;
  version?: string;
  capabilities?: string }



export interface ProfileResult { executionId: string;
  totalTime: number;
  nodeProfiles: NodeProfile;
  memoryProfile: MemoryProfile;
  cpuProfile: CpuProfile;
  recommendations: string }



export interface NodeProfile { nodeId: string;
  nodeType: string;
  executionTime: number;
  memoryUsage: number;
  cpuUsage: number;
  cacheHits: number;
  cacheMisses: number }



export interface MemoryProfile { peakUsage: number;
  averageUsage: number;
  allocations: number;
  deallocations: number;
  gcTime: number }



export interface CpuProfile { totalTime: number;
  userTime: number;
  systemTime: number;
  idleTime: number;
  samples: CpuSample }



export interface CpuSample { timestamp: number;
  usage: number;
  function: string }



export interface PerformanceAnalysis { executionId: string;
  bottlenecks: PerformanceBottleneck;
  recommendations: PerformanceRecommendation;
  score: number;
  metrics: PerformanceMetrics }



export interface PerformanceBottleneck { type: 'cpu' | 'memory' | 'io' | 'network' | 'serialization' }
  nodeId: string;
  impact: number;
  description: string;
  suggestion: string;




export interface PerformanceRecommendation { type: 'optimization' | 'caching' | 'parallelization' | 'resource_allocation';
  priority: 'low' | 'medium' | 'high';
  description: string;
  expectedImprovement: number;
  effort: 'low' | 'medium' | 'high' }




export interface PerformanceMetrics { throughput: number;
  latency: number;
  resourceUtilization: number;
  efficiency: number }



export interface OptimizedGraph { original: Graph;
  optimized: Graph;
  optimizations: GraphOptimization;
  estimatedImprovement: number }



export interface GraphOptimization { type: 'node_elimination' | 'node_fusion' | 'parallelization' | 'caching' }
  description: string;
  impact: number;
  nodes: string;




export interface BenchmarkResult { nodeType: string;
  iterations: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  standardDeviation: number;
  throughput: number }



export interface ReportCriteria {
  period: { start: Date; end: Date };
  includeNodeMetrics: boolean;
  includeBottlenecks: boolean;
  includeRecommendations: boolean;
  format: 'summary' | 'detailed' | 'executive';


export interface PerformanceReport { criteria: ReportCriteria;
  summary: ReportSummary;
  nodeMetrics: Map<string, NodeMetrics>;
  bottlenecks: PerformanceBottleneck;
  recommendations: PerformanceRecommendation;
  trends: PerformanceTrend;
  generatedAt: Date }



export interface ReportSummary { totalExecutions: number;
  averageExecutionTime: number;
  successRate: number;
  topPerformingNodes: string;
  worstPerformingNodes: string }



export interface PerformanceTrend { metric: string }
},
  values: { timestamp: Date; value: number }[];
  trend: 'improving' | 'degrading' | 'stable';,
  changeRate: number;


export interface CacheStats { size: number;
  hits: number;
  misses: number;
  hitRate: number;
  evictions: number;
  memoryUsage: number }



export interface CacheExport { entries: CacheEntry;
  metadata: CacheMetadata;
  exportedAt: Date }



export interface CacheEntry { key: string;
  value: any;
  ttl: number;
  createdAt: Date;
  lastAccessed: Date }



export interface CacheMetadata { version: string;
  totalEntries: number;
  totalSize: number;
  strategy: string }



export interface SecurityValidation { allowed: boolean;
  risks: SecurityRisk;
  requirements: string;
  recommendations: string }



export interface SecurityRisk { type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  mitigation: string }



export interface SecurityAlert {
  type: string;
  severity: string;
  description: string;
  evidence: any;
  timestamp: Date;
  // Main domain interface




export interface IRuntimeDomain { // React Components
  components: {;
  RuntimeDashboard: React.ComponentType<RuntimeDashboardProps>;
  ExecutionQueue: React.ComponentType<ExecutionQueueProps>;
  NodeRegistry: React.ComponentType<NodeRegistryProps>;
  // Specific runtime components
  ExecutionMonitor: React.ComponentType<any>;
  PerformanceMetrics: React.ComponentType<any>;
  NodeEditor: React.ComponentType<any> }
  ValidationResults: React.ComponentType<any>;


};
  // React Hooks
  hooks: { 
  useRuntime: () => {
  state: RuntimeDomainState;
  executeGraph: (graph: Graph, seeds: number, options?: ExecutionOptions) => Promise<ExecutionRecord>;
  queueExecution: (graph: Graph, seeds: number) => Promise<string>
  cancelExecution: (taskId: string) => Promise<void> }
  getMetrics: () => Promise<RuntimeMetrics>;
};
    useExecutionQueue: () => { 
  queue: ExecutionTask;
  running: ExecutionInstance;
  completed: ExecutionRecord;
  queueSize: number;
  isProcessing: boolean;
  pauseQueue: () => Promise<void>;
  resumeQueue: () => Promise<void> };
    useNodeRegistry: () => { 
  nodes: NodeDefinition;
  loading: boolean;
  registerNode: (definition: NodeDefinition) => Promise<void>
  getNode: (nodeType: string) => NodeDefinition | null }
  searchNodes: (query: string) => NodeDefinition;
};
    usePerformanceMetrics: () => { 
  metrics: RuntimeMetrics | null
  nodeMetrics: Map<string, NodeMetrics>;
  loading: boolean;
  refreshMetrics: () => Promise<void>;
  startProfiling: (executionId: string) => Promise<void> }
  stopProfiling: (executionId: string) => Promise<ProfileResult>;
};
    useValidation: () => { 
  validateGraph: (graph: Graph) => Promise<ValidationResult>
  validateNode: (node: any, definition: NodeDefinition) => Promise<ValidationResult> }
  getValidationRules: (nodeType: string) => Promise<any>;
};
  };
  // Domain Services
  services: { 
  execution: IExecutionService;
  nodeRegistry: INodeRegistryService;
  validation: IValidationService;
  performance: IPerformanceService;
  cache: ICacheService;
  security: ISecurityService };
  // Event System
  events: RuntimeDomainEvents & { 
  subscribe: (event: keyof RuntimeDomainEvents, callback: Function) => () => void }
  emit: (event: keyof RuntimeDomainEvents, ...args: any) => void;
};
  // Configuration
  config: { 
  getConfig: () => RuntimeConfig;
  updateConfig: (config: Partial<RuntimeConfig>) => void }
  resetConfig: () => void;
};
  // Utilities
  utils: { 
  createExecutionContext: (graph: Graph, seed: number) => ExecutionContext }
  measureExecution: <T>(fn: () => Promise<T>) => Promise<{ result: T; metrics: ExecutionMetrics }>;
    optimizeGraph: (graph: Graph) => Promise<OptimizedGraph>
  validateNodeDefinition: (definition: NodeDefinition) => ValidationResult
  generateNodeId: () => string;
    serializeResults: (results: any) => string
  deserializeResults: (data: string) => any;
  };

// Domain factory function


export interface RuntimeDomainFactory {
  create(config?: Partial<RuntimeConfig>): IRuntimeDomain;
  // Event constants for cross-domain communication


export const RUNTIME_DOMAIN_EVENTS = { EXECUTION_STARTED: 'runtime:execution:started'
  EXECUTION_COMPLETED: 'runtime:execution:completed'
  EXECUTION_FAILED: 'runtime:execution:failed'
  EXECUTION_CANCELLED: 'runtime:execution:cancelled'
  NODE_EXECUTED: 'runtime:node:executed'
  NODE_FAILED: 'runtime:node:failed'
  VALIDATION_ERROR: 'runtime:validation:error'
  PERFORMANCE_THRESHOLD_EXCEEDED: 'runtime:performance:threshold:exceeded'
  MEMORY_THRESHOLD_EXCEEDED: 'runtime:memory:threshold:exceeded'
  QUEUE_OVERFLOW: 'runtime:queue:overflow'
  NODE_REGISTERED: 'runtime:node:registered'
  NODE_UNREGISTERED: 'runtime:node:unregistered'
  METRICS_UPDATED: 'runtime:metrics:updated'
  CACHE_CLEARED: 'runtime:cache:cleared'
  PROFILING_STARTED: 'runtime:profiling:started'
  PROFILING_COMPLETED: 'runtime:profiling:completed' }
 as const;

export type RuntimeDomainEventType = typeof RUNTIME_DOMAIN_EVENTS[keyof typeof RUNTIME_DOMAIN_EVENTS];