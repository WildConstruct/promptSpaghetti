class WorkflowService {
    baseUrl;
    constructor(baseUrl = '/api') {
        this.baseUrl = baseUrl;
    }
    // Workflow Configuration
    async getWorkflowConfigs(workspaceId) {
        const params = new URLSearchParams();
        if (workspaceId)
            params.append('workspaceId', workspaceId);
        const response = await fetch(`${this.baseUrl}/workflows/configs?${params}`);
        if (!response.ok)
            throw new Error(`Failed to fetch workflow configs: ${response.statusText}`);
        return response.json();
    }
    async getWorkflowConfig(configId) {
        const response = await fetch(`${this.baseUrl}/workflows/configs/${configId}`);
        if (!response.ok)
            throw new Error(`Failed to fetch workflow config: ${response.statusText}`);
        return response.json();
    }
    async createWorkflowConfig(config) {
        const response = await fetch(`${this.baseUrl}/workflows/configs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        });
        if (!response.ok)
            throw new Error(`Failed to create workflow config: ${response.statusText}`);
        return response.json();
    }
    async updateWorkflowConfig(configId, updates) {
        const response = await fetch(`${this.baseUrl}/workflows/configs/${configId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        if (!response.ok)
            throw new Error(`Failed to update workflow config: ${response.statusText}`);
        return response.json();
    }
    async deleteWorkflowConfig(configId) {
        const response = await fetch(`${this.baseUrl}/workflows/configs/${configId}`, {
            method: 'DELETE'
        });
        if (!response.ok)
            throw new Error(`Failed to delete workflow config: ${response.statusText}`);
    }
    // Workflow Instances
    async getWorkflowInstance(resourceId, resourceType) {
        const params = new URLSearchParams({
            resourceId,
            resourceType
        });
        const response = await fetch(`${this.baseUrl}/workflows/instances?${params}`);
        if (response.status === 404)
            return null;
        if (!response.ok)
            throw new Error(`Failed to fetch workflow instance: ${response.statusText}`);
        return response.json();
    }
    async createWorkflowInstance(resourceId, resourceType, configId, metadata) {
        const response = await fetch(`${this.baseUrl}/workflows/instances`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                resource_id: resourceId,
                resource_type: resourceType,
                workflow_config_id: configId,
                metadata
            })
        });
        if (!response.ok)
            throw new Error(`Failed to create workflow instance: ${response.statusText}`);
        return response.json();
    }
    async transitionWorkflow(instanceId, request) {
        const response = await fetch(`${this.baseUrl}/workflows/instances/${instanceId}/transition`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request)
        });
        if (!response.ok)
            throw new Error(`Failed to transition workflow: ${response.statusText}`);
        return response.json();
    }
    async getWorkflowStats(workspaceId, configId) {
        const params = new URLSearchParams();
        if (workspaceId)
            params.append('workspaceId', workspaceId);
        if (configId)
            params.append('configId', configId);
        const response = await fetch(`${this.baseUrl}/workflows/stats?${params}`);
        if (!response.ok)
            throw new Error(`Failed to fetch workflow stats: ${response.statusText}`);
        return response.json();
    }
    // Approval Process
    async getApprovalRequests(workspaceId, userId) {
        const params = new URLSearchParams();
        if (workspaceId)
            params.append('workspaceId', workspaceId);
        if (userId)
            params.append('userId', userId);
        const response = await fetch(`${this.baseUrl}/workflows/approvals?${params}`);
        if (!response.ok)
            throw new Error(`Failed to fetch approval requests: ${response.statusText}`);
        return response.json();
    }
    async getApprovalRequest(requestId) {
        const response = await fetch(`${this.baseUrl}/workflows/approvals/${requestId}`);
        if (!response.ok)
            throw new Error(`Failed to fetch approval request: ${response.statusText}`);
        return response.json();
    }
    async respondToApproval(requestId, response) {
        const resp = await fetch(`${this.baseUrl}/workflows/approvals/${requestId}/respond`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response)
        });
        if (!resp.ok)
            throw new Error(`Failed to respond to approval: ${resp.statusText}`);
        return resp.json();
    }
    // Resource Locking
    async getLocks(resourceId, resourceType, userId) {
        const params = new URLSearchParams();
        if (resourceId)
            params.append('resourceId', resourceId);
        if (resourceType)
            params.append('resourceType', resourceType);
        if (userId)
            params.append('userId', userId);
        const response = await fetch(`${this.baseUrl}/workflows/locks?${params}`);
        if (!response.ok)
            throw new Error(`Failed to fetch locks: ${response.statusText}`);
        return response.json();
    }
    async acquireLock(request) {
        const response = await fetch(`${this.baseUrl}/workflows/locks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request)
        });
        if (!response.ok)
            throw new Error(`Failed to acquire lock: ${response.statusText}`);
        return response.json();
    }
    async releaseLock(lockId) {
        const response = await fetch(`${this.baseUrl}/workflows/locks/${lockId}`, {
            method: 'DELETE'
        });
        if (!response.ok)
            throw new Error(`Failed to release lock: ${response.statusText}`);
    }
    async breakLock(lockId, reason) {
        const response = await fetch(`${this.baseUrl}/workflows/locks/${lockId}/break`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason })
        });
        if (!response.ok)
            throw new Error(`Failed to break lock: ${response.statusText}`);
    }
    // Audit Trail
    async getAuditLogs(filter = {}) {
        const params = new URLSearchParams();
        Object.entries(filter).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (Array.isArray(value)) {
                    params.append(key, value.join(','));
                }
                else {
                    params.append(key, value.toString());
                }
            }
        });
        const response = await fetch(`${this.baseUrl}/workflows/audit?${params}`);
        if (!response.ok)
            throw new Error(`Failed to fetch audit logs: ${response.statusText}`);
        return response.json();
    }
    async createAuditEntry(entry) {
        const response = await fetch(`${this.baseUrl}/workflows/audit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry)
        });
        if (!response.ok)
            throw new Error(`Failed to create audit entry: ${response.statusText}`);
        return response.json();
    }
    // Webhooks
    async getWebhooks(configId) {
        const params = new URLSearchParams();
        if (configId)
            params.append('configId', configId);
        const response = await fetch(`${this.baseUrl}/workflows/webhooks?${params}`);
        if (!response.ok)
            throw new Error(`Failed to fetch webhooks: ${response.statusText}`);
        return response.json();
    }
    async createWebhook(webhook) {
        const response = await fetch(`${this.baseUrl}/workflows/webhooks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(webhook)
        });
        if (!response.ok)
            throw new Error(`Failed to create webhook: ${response.statusText}`);
        return response.json();
    }
    async updateWebhook(webhookId, updates) {
        const response = await fetch(`${this.baseUrl}/workflows/webhooks/${webhookId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        if (!response.ok)
            throw new Error(`Failed to update webhook: ${response.statusText}`);
        return response.json();
    }
    async deleteWebhook(webhookId) {
        const response = await fetch(`${this.baseUrl}/workflows/webhooks/${webhookId}`, {
            method: 'DELETE'
        });
        if (!response.ok)
            throw new Error(`Failed to delete webhook: ${response.statusText}`);
    }
    // Scheduled Execution
    async getScheduledExecutions(resourceId, resourceType) {
        const params = new URLSearchParams();
        if (resourceId)
            params.append('resourceId', resourceId);
        if (resourceType)
            params.append('resourceType', resourceType);
        const response = await fetch(`${this.baseUrl}/workflows/scheduled?${params}`);
        if (!response.ok)
            throw new Error(`Failed to fetch scheduled executions: ${response.statusText}`);
        return response.json();
    }
    async createScheduledExecution(execution) {
        const response = await fetch(`${this.baseUrl}/workflows/scheduled`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(execution)
        });
        if (!response.ok)
            throw new Error(`Failed to create scheduled execution: ${response.statusText}`);
        return response.json();
    }
    async updateScheduledExecution(executionId, updates) {
        const response = await fetch(`${this.baseUrl}/workflows/scheduled/${executionId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        if (!response.ok)
            throw new Error(`Failed to update scheduled execution: ${response.statusText}`);
        return response.json();
    }
    async deleteScheduledExecution(executionId) {
        const response = await fetch(`${this.baseUrl}/workflows/scheduled/${executionId}`, {
            method: 'DELETE'
        });
        if (!response.ok)
            throw new Error(`Failed to delete scheduled execution: ${response.statusText}`);
    }
    async getExecutionResults(executionId) {
        const response = await fetch(`${this.baseUrl}/workflows/scheduled/${executionId}/results`);
        if (!response.ok)
            throw new Error(`Failed to fetch execution results: ${response.statusText}`);
        return response.json();
    }
}
export const workflowService = new WorkflowService();
