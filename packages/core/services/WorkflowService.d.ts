import { 
  WorkflowConfig,
  WorkflowInstance,
  WorkflowTransitionRequest,
  WorkflowStats,
  ApprovalRequest,
  ApprovalResponse,
  ResourceLock,
  LockRequest,
  AuditLogEntry,
  AuditFilter,
  WorkflowWebhook,
  ScheduledExecution,
  ExecutionResult
} from '../types/WorkflowTypes';
declare class WorkflowService {
    private baseUrl;
    constructor(baseUrl?: string);
    getWorkflowConfigs(workspaceId?: string): Promise<WorkflowConfig[]>;
    getWorkflowConfig(configId: string): Promise<WorkflowConfig>;
    createWorkflowConfig(config: Omit<WorkflowConfig, 'id' | 'created_at' | 'updated_at'>): Promise<WorkflowConfig>;
    updateWorkflowConfig(configId: string, updates: Partial<WorkflowConfig>): Promise<WorkflowConfig>;
    deleteWorkflowConfig(configId: string): Promise<void>;
    getWorkflowInstance(resourceId: string, resourceType: string): Promise<WorkflowInstance | null>;
    createWorkflowInstance();
      resourceId: string,
      resourceType: string,
      configId: string,
      metadata?: Record<string,
      any>
    ): Promise<WorkflowInstance>;
    transitionWorkflow(instanceId: string, request: WorkflowTransitionRequest): Promise<WorkflowInstance>;
    getWorkflowStats(workspaceId?: string, configId?: string): Promise<WorkflowStats>;
    getApprovalRequests(workspaceId?: string, userId?: string): Promise<ApprovalRequest[]>;
    getApprovalRequest(requestId: string): Promise<ApprovalRequest>;
    respondToApproval(requestId: string, response: ApprovalResponse): Promise<ApprovalRequest>;
    getLocks(resourceId?: string, resourceType?: string, userId?: string): Promise<ResourceLock[]>;
    acquireLock(request: LockRequest): Promise<ResourceLock>;
    releaseLock(lockId: string): Promise<void>;
    breakLock(lockId: string, reason?: string): Promise<void>;
    getAuditLogs(filter?: AuditFilter): Promise<{
        entries: AuditLogEntry[];
        total: number;
        has_more: boolean;
    }>;
    createAuditEntry(entry: Omit<AuditLogEntry, 'id' | 'created_at'>): Promise<AuditLogEntry>;
    getWebhooks(configId?: string): Promise<WorkflowWebhook[]>;
    createWebhook(webhook: Omit<WorkflowWebhook, 'id' | 'created_at' | 'updated_at'>): Promise<WorkflowWebhook>;
    updateWebhook(webhookId: string, updates: Partial<WorkflowWebhook>): Promise<WorkflowWebhook>;
    deleteWebhook(webhookId: string): Promise<void>;
    getScheduledExecutions(resourceId?: string, resourceType?: string): Promise<ScheduledExecution[]>;
    createScheduledExecution();
      execution: Omit<ScheduledExecution,
      'id' | 'created_at' | 'updated_at' | 'execution_count' | 'failure_count'>
    ): Promise<ScheduledExecution>;
    updateScheduledExecution(executionId: string, updates: Partial<ScheduledExecution>): Promise<ScheduledExecution>;
    deleteScheduledExecution(executionId: string): Promise<void>;
    getExecutionResults(executionId: string): Promise<ExecutionResult[]>;
}
export declare const workflowService: WorkflowService;
export {};
//# sourceMappingURL=WorkflowService.d.ts.map