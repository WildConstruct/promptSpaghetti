import { 
  WorkflowConfig,
  WorkflowInstance,
  WorkflowState,
  WorkflowAction,
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
class WorkflowService {
  private baseUrl: string;
  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  // Workflow Configuration
  async getWorkflowConfigs(workspaceId?: string): Promise<WorkflowConfig> {
    const params = new URLSearchParams();
    if (workspaceId) params.append('workspaceId', workspaceId);
    const response = await fetch(`${this.baseUrl}/workflows/configs?${params}`);}
    if (!response.ok) throw new Error(`Failed to fetch workflow configs: ${response.statusText}`);}
    return response.json();
  async getWorkflowConfig(configId: string): Promise<WorkflowConfig> {
    const response = await fetch(`${this.baseUrl}/workflows/configs/${configId}`);}
    if (!response.ok) throw new Error(`Failed to fetch workflow config: ${response.statusText}`);}
    return response.json();
  async createWorkflowConfig(config: Omit<WorkflowConfig)
    'id' | 'created_at' | 'updated_at'>
  ): Promise<WorkflowConfig> {
    const response = await fetch(`${this.baseUrl}/workflows/configs`, {)}
  },
  method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config);
  });
    if (!response.ok) throw new Error(`Failed to create workflow config: ${response.statusText}`);}
    return response.json();
  async updateWorkflowConfig(configId: string, updates: Partial<WorkflowConfig>): Promise<WorkflowConfig> {
    const response = await fetch(`${this.baseUrl}/workflows/configs/${configId}`, {)}
  },
  method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates);
  });
    if (!response.ok) throw new Error(`Failed to update workflow config: ${response.statusText}`);}
    return response.json();
  async deleteWorkflowConfig(configId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/workflows/configs/${configId}`, {)}
  },
  method: 'DELETE'
  });
    if (!response.ok) throw new Error(`Failed to delete workflow config: ${response.statusText}`);}
  // Workflow Instances
  async getWorkflowInstance(resourceId: string, resourceType: string): Promise<WorkflowInstance | null> {
    const params = new URLSearchParams({)
  resourceId,
      resourceType
    });
    const response = await fetch(`${this.baseUrl}/workflows/instances?${params}`);}
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Failed to fetch workflow instance: ${response.statusText}`);}
    return response.json();
  async createWorkflowInstance(resourceId: string)
    resourceType: string,
    configId: string,
    metadata?: Record<string, any>
  ): Promise<WorkflowInstance> {
    const response = await fetch(`${this.baseUrl}/workflows/instances`, {)}
  },
  method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({,)
  resource_id: resourceId,
  resource_type: resourceType,
  workflow_config_id: configId,
  metadata
}
    });
    if (!response.ok) throw new Error(`Failed to create workflow instance: ${response.statusText}`);}
    return response.json();
  async transitionWorkflow(()
    instanceId: string,
    request: WorkflowTransitionRequest,
  ): Promise<WorkflowInstance> {
    const response = await fetch(`${this.baseUrl}/workflows/instances/${instanceId}/transition`, {)}
  },
  method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request);
  });
    if (!response.ok) throw new Error(`Failed to transition workflow: ${response.statusText}`);}
    return response.json();
  async getWorkflowStats(workspaceId?: string, configId?: string): Promise<WorkflowStats> {
    const params = new URLSearchParams();
    if (workspaceId) params.append('workspaceId', workspaceId);
    if (configId) params.append('configId', configId);
    const response = await fetch(`${this.baseUrl}/workflows/stats?${params}`);}
    if (!response.ok) throw new Error(`Failed to fetch workflow stats: ${response.statusText}`);}
    return response.json();
  // Approval Process
  async getApprovalRequests(workspaceId?: string, userId?: string): Promise<ApprovalRequest> {
    const params = new URLSearchParams();
    if (workspaceId) params.append('workspaceId', workspaceId);
    if (userId) params.append('userId', userId);
    const response = await fetch(`${this.baseUrl}/workflows/approvals?${params}`);}
    if (!response.ok) throw new Error(`Failed to fetch approval requests: ${response.statusText}`);}
    return response.json();
  async getApprovalRequest(requestId: string): Promise<ApprovalRequest> {
    const response = await fetch(`${this.baseUrl}/workflows/approvals/${requestId}`);}
    if (!response.ok) throw new Error(`Failed to fetch approval request: ${response.statusText}`);}
    return response.json();
  async respondToApproval(requestId: string, response: ApprovalResponse): Promise<ApprovalRequest> {
    const resp = await fetch(`${this.baseUrl}/workflows/approvals/${requestId}/respond`, {)}
  },
  method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response);
  });
    if (!resp.ok) throw new Error(`Failed to respond to approval: ${resp.statusText}`);}
    return resp.json();
  // Resource Locking
  async getLocks(resourceId?: string, resourceType?: string, userId?: string): Promise<ResourceLock> {
    const params = new URLSearchParams();
    if (resourceId) params.append('resourceId', resourceId);
    if (resourceType) params.append('resourceType', resourceType);
    if (userId) params.append('userId', userId);
    const response = await fetch(`${this.baseUrl}/workflows/locks?${params}`);}
    if (!response.ok) throw new Error(`Failed to fetch locks: ${response.statusText}`);}
    return response.json();
  async acquireLock(request: LockRequest): Promise<ResourceLock> {
    const response = await fetch(`${this.baseUrl}/workflows/locks`, {)}
  },
  method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request);
  });
    if (!response.ok) throw new Error(`Failed to acquire lock: ${response.statusText}`);}
    return response.json();
  async releaseLock(lockId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/workflows/locks/${lockId}`, {)}
  },
  method: 'DELETE'
  });
    if (!response.ok) throw new Error(`Failed to release lock: ${response.statusText}`);}
  async breakLock(lockId: string, reason?: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/workflows/locks/${lockId}/break`, {)}
  },
  method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    if (!response.ok) throw new Error(`Failed to break lock: ${response.statusText}`);}
  // Audit Trail
  async getAuditLogs(filter: AuditFilter = {}): Promise<{ entries: AuditLogEntry; total: number; has_more: boolean }> {
    const params = new URLSearchParams();
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          params.append(key, value.join(','));
        } else {
          params.append(key, value.toString());
    });
    const response = await fetch(`${this.baseUrl}/workflows/audit?${params}`);}
    if (!response.ok) throw new Error(`Failed to fetch audit logs: ${response.statusText}`);}
    return response.json();
  async createAuditEntry(entry: Omit<AuditLogEntry, 'id' | 'created_at'>): Promise<AuditLogEntry> {
    const response = await fetch(`${this.baseUrl}/workflows/audit`, {)}
  },
  method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry);
  });
    if (!response.ok) throw new Error(`Failed to create audit entry: ${response.statusText}`);}
    return response.json();
  // Webhooks
  async getWebhooks(configId?: string): Promise<WorkflowWebhook> {
    const params = new URLSearchParams();
    if (configId) params.append('configId', configId);
    const response = await fetch(`${this.baseUrl}/workflows/webhooks?${params}`);}
    if (!response.ok) throw new Error(`Failed to fetch webhooks: ${response.statusText}`);}
    return response.json();
  async createWebhook(webhook: Omit<WorkflowWebhook, 'id' | 'created_at' | 'updated_at'>): Promise<WorkflowWebhook> {
    const response = await fetch(`${this.baseUrl}/workflows/webhooks`, {)}
  },
  method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhook);
  });
    if (!response.ok) throw new Error(`Failed to create webhook: ${response.statusText}`);}
    return response.json();
  async updateWebhook(webhookId: string, updates: Partial<WorkflowWebhook>): Promise<WorkflowWebhook> {
    const response = await fetch(`${this.baseUrl}/workflows/webhooks/${webhookId}`, {)}
  },
  method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates);
  });
    if (!response.ok) throw new Error(`Failed to update webhook: ${response.statusText}`);}
    return response.json();
  async deleteWebhook(webhookId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/workflows/webhooks/${webhookId}`, {)}
  },
  method: 'DELETE'
  });
    if (!response.ok) throw new Error(`Failed to delete webhook: ${response.statusText}`);}
  // Scheduled Execution
  async getScheduledExecutions(resourceId?: string, resourceType?: string): Promise<ScheduledExecution> {
    const params = new URLSearchParams();
    if (resourceId) params.append('resourceId', resourceId);
    if (resourceType) params.append('resourceType', resourceType);
    const response = await fetch(`${this.baseUrl}/workflows/scheduled?${params}`);}
    if (!response.ok) throw new Error(`Failed to fetch scheduled executions: ${response.statusText}`);}
    return response.json();
  async createScheduledExecution(execution: Omit<ScheduledExecution, 'id' | 'created_at' | 'updated_at' | 'execution_count' | 'failure_count'>)
  ): Promise<ScheduledExecution> {
    const response = await fetch(`${this.baseUrl}/workflows/scheduled`, {)}
  },
  method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(execution);
  });
    if (!response.ok) throw new Error(`Failed to create scheduled execution: ${response.statusText}`);}
    return response.json();
  async updateScheduledExecution(()
    executionId: string,
    updates: Partial<ScheduledExecution>,
  ): Promise<ScheduledExecution> {
    const response = await fetch(`${this.baseUrl}/workflows/scheduled/${executionId}`, {)}
  },
  method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates);
  });
    if (!response.ok) throw new Error(`Failed to update scheduled execution: ${response.statusText}`);}
    return response.json();
  async deleteScheduledExecution(executionId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/workflows/scheduled/${executionId}`, {)}
  },
  method: 'DELETE'
  });
    if (!response.ok) throw new Error(`Failed to delete scheduled execution: ${response.statusText}`);}
  async getExecutionResults(executionId: string): Promise<ExecutionResult> {
    const response = await fetch(`${this.baseUrl}/workflows/scheduled/${executionId}/results`);}
    if (!response.ok) throw new Error(`Failed to fetch execution results: ${response.statusText}`);}
    return response.json();

export const workflowService = new WorkflowService();