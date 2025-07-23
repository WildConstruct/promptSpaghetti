/**
 * Epic 16 Ticket Integration Service
 *
 * Comprehensive ticket integration system for Epic 16 Marketplace & Community Features.
 * Provides seamless integration between community support, marketplace issues,
 * template submissions, and internal ticketing systems.
 */
import { EventEmitter } from 'events';
export var MarketplaceTicketType;
(function (MarketplaceTicketType) {
    MarketplaceTicketType["TEMPLATE_SUBMISSION"] = "template_submission";
    MarketplaceTicketType["TEMPLATE_ISSUE"] = "template_issue";
    MarketplaceTicketType["BILLING_DISPUTE"] = "billing_dispute";
    MarketplaceTicketType["REFUND_REQUEST"] = "refund_request";
    MarketplaceTicketType["CONTENT_MODERATION"] = "content_moderation";
    MarketplaceTicketType["COMMUNITY_SUPPORT"] = "community_support";
    MarketplaceTicketType["FEATURE_REQUEST"] = "feature_request";
    MarketplaceTicketType["BUG_REPORT"] = "bug_report";
    MarketplaceTicketType["ACCOUNT_ISSUE"] = "account_issue";
    MarketplaceTicketType["POLICY_VIOLATION"] = "policy_violation";
    MarketplaceTicketType["PARTNERSHIP_INQUIRY"] = "partnership_inquiry";
    MarketplaceTicketType["TECHNICAL_SUPPORT"] = "technical_support";
})(MarketplaceTicketType || (MarketplaceTicketType = {}));
export var TicketStatus;
(function (TicketStatus) {
    TicketStatus["NEW"] = "new";
    TicketStatus["OPEN"] = "open";
    TicketStatus["IN_PROGRESS"] = "in_progress";
    TicketStatus["PENDING_USER"] = "pending_user";
    TicketStatus["PENDING_REVIEW"] = "pending_review";
    TicketStatus["PENDING_APPROVAL"] = "pending_approval";
    TicketStatus["RESOLVED"] = "resolved";
    TicketStatus["CLOSED"] = "closed";
    TicketStatus["REOPENED"] = "reopened";
    TicketStatus["ESCALATED"] = "escalated";
    TicketStatus["ON_HOLD"] = "on_hold";
})(TicketStatus || (TicketStatus = {}));
export var TicketPriority;
(function (TicketPriority) {
    TicketPriority["LOW"] = "low";
    TicketPriority["MEDIUM"] = "medium";
    TicketPriority["HIGH"] = "high";
    TicketPriority["URGENT"] = "urgent";
    TicketPriority["CRITICAL"] = "critical";
})(TicketPriority || (TicketPriority = {}));
export var TicketCategory;
(function (TicketCategory) {
    TicketCategory["MARKETPLACE"] = "marketplace";
    TicketCategory["COMMUNITY"] = "community";
    TicketCategory["TECHNICAL"] = "technical";
    TicketCategory["BILLING"] = "billing";
    TicketCategory["CONTENT"] = "content";
    TicketCategory["ACCOUNT"] = "account";
    TicketCategory["POLICY"] = "policy";
    TicketCategory["PARTNERSHIP"] = "partnership";
})(TicketCategory || (TicketCategory = {}));
/**
 * Epic 16 Ticket Integration Service
 *
 * Core service for managing marketplace and community tickets with
 * comprehensive integration capabilities.
 */
export class Epic16TicketIntegrationService extends EventEmitter {
    tickets = new Map();
    workflows = new Map();
    integrations;
    config;
    metrics = new Map();
    constructor(config = {}) {
        super();
        this.config = {
            defaultWorkflow: 'standard_support',
            autoAssignment: true,
            slaEnabled: true,
            integrations: {
                github: { enabled: false, repository: '', token: '', labelMapping: {}, autoCreateIssues: false, syncComments: false },
                jira: { enabled: false, url: '', username: '', token: '', project: '', issueTypeMapping: {}, fieldMapping: {} },
                zendesk: { enabled: false, domain: '', email: '', token: '', customFields: {} },
                slack: { enabled: false, webhookUrl: '', channel: '', mentionRoles: [] },
                discord: { enabled: false, webhookUrl: '', serverId: '', channelId: '', roleMapping: {} },
                email: { enabled: false, smtpHost: '', smtpPort: 587, username: '', password: '', fromAddress: '', templates: {} },
                webhook: { enabled: false, endpoints: [], retryPolicy: { maxRetries: 3, backoffStrategy: 'exponential', baseDelay: 1000, maxDelay: 30000 } }
            },
            notifications: {
                enabled: true,
                channels: ['email', 'slack'],
                templates: {}
            },
            security: {
                encryptAttachments: true,
                scanUploads: true,
                retentionPeriod: 365
            },
            analytics: {
                trackMetrics: true,
                dashboardEnabled: true,
                reportingEnabled: true
            },
            ...config
        };
        this.integrations = this.config.integrations;
        this.initializeDefaultWorkflows();
    }
    /**
     * Create a new marketplace/community ticket
     */
    async createTicket(ticketData) {
        const ticketId = this.generateTicketId();
        const now = new Date();
        const ticket = {
            ...ticketData,
            id: ticketId,
            createdAt: now,
            updatedAt: now,
            sla: this.calculateSLA(ticketData.type, ticketData.priority)
        };
        this.tickets.set(ticketId, ticket);
        // Auto-assign if enabled
        if (this.config.autoAssignment) {
            await this.autoAssignTicket(ticket);
        }
        // Execute workflow
        await this.executeWorkflow(ticket, 'created');
        // Send notifications
        if (this.config.notifications.enabled) {
            await this.sendNotifications(ticket, 'created');
        }
        // Sync with external systems
        await this.syncWithIntegrations(ticket, 'created');
        this.emit('ticket_created', { ticket });
        return ticket;
    }
    /**
     * Update ticket status
     */
    async updateTicketStatus(ticketId, newStatus, userId, comment) {
        const ticket = this.tickets.get(ticketId);
        if (!ticket)
            return null;
        const oldStatus = ticket.status;
        ticket.status = newStatus;
        ticket.updatedAt = new Date();
        // Add system comment for status change
        if (comment) {
            await this.addComment(ticketId, {
                content: comment,
                author: userId,
                authorType: 'agent',
                visibility: 'internal'
            });
        }
        // Update SLA tracking
        this.updateSLATracking(ticket, newStatus);
        // Execute workflow for status change
        await this.executeWorkflow(ticket, 'status_changed', { oldStatus, newStatus });
        // Send notifications
        await this.sendNotifications(ticket, 'status_changed', { oldStatus, newStatus });
        // Sync with external systems
        await this.syncWithIntegrations(ticket, 'status_changed', { oldStatus, newStatus });
        this.emit('ticket_status_changed', { ticket, oldStatus, newStatus });
        return ticket;
    }
    /**
     * Add comment to ticket
     */
    async addComment(ticketId, commentData) {
        const ticket = this.tickets.get(ticketId);
        if (!ticket)
            return null;
        const comment = {
            ...commentData,
            id: this.generateCommentId(),
            createdAt: new Date(),
            reactions: []
        };
        ticket.comments.push(comment);
        ticket.updatedAt = new Date();
        // Execute workflow for comment added
        await this.executeWorkflow(ticket, 'comment_added', { comment });
        // Send notifications for public comments
        if (comment.visibility === 'public') {
            await this.sendNotifications(ticket, 'comment_added', { comment });
        }
        // Sync with external systems
        await this.syncWithIntegrations(ticket, 'comment_added', { comment });
        this.emit('comment_added', { ticket, comment });
        return comment;
    }
    /**
     * Assign ticket to user or team
     */
    async assignTicket(ticketId, assigneeId, assignerId) {
        const ticket = this.tickets.get(ticketId);
        if (!ticket)
            return null;
        const oldAssignee = ticket.assignedTo;
        ticket.assignedTo = assigneeId;
        ticket.updatedAt = new Date();
        // Add system comment
        await this.addComment(ticketId, {
            content: `Ticket assigned to ${assigneeId}`,
            author: assignerId,
            authorType: 'system',
            visibility: 'internal'
        });
        // Send notifications
        await this.sendNotifications(ticket, 'assigned', { oldAssignee, newAssignee: assigneeId });
        // Sync with external systems
        await this.syncWithIntegrations(ticket, 'assigned');
        this.emit('ticket_assigned', { ticket, oldAssignee, newAssignee: assigneeId });
        return ticket;
    }
    /**
     * Escalate ticket
     */
    async escalateTicket(ticketId, reason, escalatedBy) {
        const ticket = this.tickets.get(ticketId);
        if (!ticket)
            return null;
        const oldStatus = ticket.status;
        ticket.status = TicketStatus.ESCALATED;
        ticket.priority = this.increasePriority(ticket.priority);
        ticket.updatedAt = new Date();
        // Add escalation comment
        await this.addComment(ticketId, {
            content: `Ticket escalated: ${reason}`,
            author: escalatedBy,
            authorType: 'agent',
            visibility: 'internal'
        });
        // Execute escalation workflow
        await this.executeWorkflow(ticket, 'escalated', { reason, escalatedBy });
        // Send escalation notifications
        await this.sendNotifications(ticket, 'escalated', { reason });
        // Sync with external systems
        await this.syncWithIntegrations(ticket, 'escalated');
        this.emit('ticket_escalated', { ticket, reason, escalatedBy });
        return ticket;
    }
    /**
     * Get tickets with filtering and pagination
     */
    async getTickets(filters = {}) {
        let filtered = Array.from(this.tickets.values());
        // Apply filters
        if (filters.status) {
            filtered = filtered.filter(t => filters.status.includes(t.status));
        }
        if (filters.type) {
            filtered = filtered.filter(t => filters.type.includes(t.type));
        }
        if (filters.priority) {
            filtered = filtered.filter(t => filters.priority.includes(t.priority));
        }
        if (filters.assignedTo) {
            filtered = filtered.filter(t => t.assignedTo === filters.assignedTo);
        }
        if (filters.category) {
            filtered = filtered.filter(t => t.category === filters.category);
        }
        if (filters.dateRange) {
            filtered = filtered.filter(t => t.createdAt >= filters.dateRange.start &&
                t.createdAt <= filters.dateRange.end);
        }
        const total = filtered.length;
        const limit = filters.limit || 50;
        const offset = filters.offset || 0;
        // Apply pagination
        const tickets = filtered
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(offset, offset + limit);
        return {
            tickets,
            total,
            hasMore: offset + limit < total
        };
    }
    /**
     * Get ticket metrics and analytics
     */
    async getTicketMetrics(timeRange) {
        const tickets = Array.from(this.tickets.values()).filter(t => t.createdAt >= timeRange.start && t.createdAt <= timeRange.end);
        const totalTickets = tickets.length;
        // Calculate metrics
        const ticketsByStatus = tickets.reduce((acc, ticket) => {
            acc[ticket.status] = (acc[ticket.status] || 0) + 1;
            return acc;
        }, {});
        const ticketsByType = tickets.reduce((acc, ticket) => {
            acc[ticket.type] = (acc[ticket.type] || 0) + 1;
            return acc;
        }, {});
        const ticketsByPriority = tickets.reduce((acc, ticket) => {
            acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
            return acc;
        }, {});
        const slaBreached = tickets.filter(t => t.sla.breached).length;
        const escalated = tickets.filter(t => t.status === TicketStatus.ESCALATED).length;
        return {
            totalTickets,
            ticketsByStatus,
            ticketsByType,
            ticketsByPriority,
            averageResponseTime: this.calculateAverageResponseTime(tickets),
            averageResolutionTime: this.calculateAverageResolutionTime(tickets),
            slaBreachRate: totalTickets > 0 ? (slaBreached / totalTickets) * 100 : 0,
            escalationRate: totalTickets > 0 ? (escalated / totalTickets) * 100 : 0,
            customerSatisfaction: 85 // Mock value - would come from surveys
        };
    }
    // Private helper methods
    generateTicketId() {
        return `MKT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    }
    generateCommentId() {
        return `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    calculateSLA(type, priority) {
        const now = new Date();
        // SLA targets in minutes
        const slaTargets = {
            [TicketPriority.CRITICAL]: { response: 15, resolution: 240 }, // 15min / 4h
            [TicketPriority.URGENT]: { response: 30, resolution: 480 }, // 30min / 8h
            [TicketPriority.HIGH]: { response: 60, resolution: 1440 }, // 1h / 24h
            [TicketPriority.MEDIUM]: { response: 240, resolution: 4320 }, // 4h / 72h
            [TicketPriority.LOW]: { response: 480, resolution: 10080 } // 8h / 7days
        };
        const targets = slaTargets[priority];
        return {
            responseTime: {
                target: targets.response,
                deadline: new Date(now.getTime() + targets.response * 60000),
                breached: false,
                warningThreshold: Math.floor(targets.response * 0.8)
            },
            resolutionTime: {
                target: targets.resolution,
                deadline: new Date(now.getTime() + targets.resolution * 60000),
                breached: false,
                warningThreshold: Math.floor(targets.resolution * 0.8)
            },
            escalationTime: {
                target: targets.resolution * 0.5,
                deadline: new Date(now.getTime() + (targets.resolution * 0.5) * 60000),
                breached: false,
                warningThreshold: Math.floor((targets.resolution * 0.5) * 0.8)
            },
            breached: false
        };
    }
    updateSLATracking(ticket, newStatus) {
        const now = new Date();
        // Update response time if first response
        if (!ticket.sla.responseTime.actual &&
            [TicketStatus.IN_PROGRESS, TicketStatus.PENDING_USER].includes(newStatus)) {
            const responseTime = (now.getTime() - ticket.createdAt.getTime()) / (1000 * 60);
            ticket.sla.responseTime.actual = responseTime;
            ticket.sla.responseTime.breached = responseTime > ticket.sla.responseTime.target;
        }
        // Update resolution time if resolved
        if ([TicketStatus.RESOLVED, TicketStatus.CLOSED].includes(newStatus)) {
            const resolutionTime = (now.getTime() - ticket.createdAt.getTime()) / (1000 * 60);
            ticket.sla.resolutionTime.actual = resolutionTime;
            ticket.sla.resolutionTime.breached = resolutionTime > ticket.sla.resolutionTime.target;
            ticket.resolvedAt = now;
            if (newStatus === TicketStatus.CLOSED) {
                ticket.closedAt = now;
            }
        }
        // Check overall SLA breach
        ticket.sla.breached = ticket.sla.responseTime.breached || ticket.sla.resolutionTime.breached;
    }
    async autoAssignTicket(ticket) {
        // Simple round-robin assignment - in real implementation would be more sophisticated
        const availableAgents = ['agent-1', 'agent-2', 'agent-3', 'agent-4'];
        const assigneeIndex = ticket.id.length % availableAgents.length;
        ticket.assignedTo = availableAgents[assigneeIndex];
    }
    async executeWorkflow(ticket, event, context) {
        const workflow = this.workflows.get(this.config.defaultWorkflow);
        if (!workflow || !workflow.active)
            return;
        // Find applicable workflow steps
        const applicableTriggers = workflow.triggers.filter(trigger => trigger.type === event || (event === 'status_changed' && trigger.type === 'status_change'));
        for (const trigger of applicableTriggers) {
            // Execute workflow actions
            for (const step of workflow.steps) {
                await this.executeWorkflowStep(step, ticket, context);
            }
        }
    }
    async executeWorkflowStep(step, ticket, context) {
        // Execute workflow actions
        for (const action of step.actions) {
            await this.executeWorkflowAction(action, ticket, context);
        }
        // Send step notifications
        for (const notification of step.notifications) {
            await this.sendWorkflowNotification(notification, ticket, context);
        }
    }
    async executeWorkflowAction(action, ticket, context) {
        switch (action.type) {
            case 'set_field':
                // Set field on ticket
                const field = action.parameters.field;
                const value = action.parameters.value;
                if (field in ticket) {
                    ticket[field] = value;
                }
                break;
            case 'update_status':
                ticket.status = action.parameters.status;
                break;
            case 'call_webhook':
                await this.callWebhook(action.parameters.url, ticket, action.parameters.method || 'POST');
                break;
        }
    }
    async sendNotifications(ticket, event, context) {
        if (!this.config.notifications.enabled)
            return;
        for (const channel of this.config.notifications.channels) {
            await this.sendNotificationByChannel(channel, ticket, event, context);
        }
    }
    async sendNotificationByChannel(channel, ticket, event, context) {
        switch (channel) {
            case 'email':
                if (this.integrations.email.enabled) {
                    await this.sendEmailNotification(ticket, event, context);
                }
                break;
            case 'slack':
                if (this.integrations.slack.enabled) {
                    await this.sendSlackNotification(ticket, event, context);
                }
                break;
            case 'discord':
                if (this.integrations.discord.enabled) {
                    await this.sendDiscordNotification(ticket, event, context);
                }
                break;
        }
    }
    async syncWithIntegrations(ticket, event, context) {
        const syncPromises = [];
        if (this.integrations.github.enabled) {
            syncPromises.push(this.syncWithGitHub(ticket, event, context));
        }
        if (this.integrations.jira.enabled) {
            syncPromises.push(this.syncWithJira(ticket, event, context));
        }
        if (this.integrations.zendesk.enabled) {
            syncPromises.push(this.syncWithZendesk(ticket, event, context));
        }
        await Promise.allSettled(syncPromises);
    }
    increasePriority(currentPriority) {
        const priorityOrder = [TicketPriority.LOW, TicketPriority.MEDIUM, TicketPriority.HIGH, TicketPriority.URGENT, TicketPriority.CRITICAL];
        const currentIndex = priorityOrder.indexOf(currentPriority);
        return priorityOrder[Math.min(currentIndex + 1, priorityOrder.length - 1)];
    }
    calculateAverageResponseTime(tickets) {
        const responseTimes = tickets
            .filter(t => t.sla.responseTime.actual)
            .map(t => t.sla.responseTime.actual);
        return responseTimes.length > 0
            ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
            : 0;
    }
    calculateAverageResolutionTime(tickets) {
        const resolutionTimes = tickets
            .filter(t => t.sla.resolutionTime.actual)
            .map(t => t.sla.resolutionTime.actual);
        return resolutionTimes.length > 0
            ? resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length
            : 0;
    }
    initializeDefaultWorkflows() {
        // Initialize standard workflows - simplified for brevity
        const standardWorkflow = {
            id: 'standard_support',
            name: 'Standard Support Workflow',
            description: 'Default workflow for marketplace and community support tickets',
            ticketTypes: Object.values(MarketplaceTicketType),
            steps: [],
            triggers: [],
            conditions: [],
            active: true,
            version: '1.0.0'
        };
        this.workflows.set('standard_support', standardWorkflow);
    }
    // Placeholder integration methods - would implement actual API calls
    async sendEmailNotification(ticket, event, context) {
        // Email notification implementation
    }
    async sendSlackNotification(ticket, event, context) {
        // Slack notification implementation
    }
    async sendDiscordNotification(ticket, event, context) {
        // Discord notification implementation
    }
    async sendWorkflowNotification(notification, ticket, context) {
        // Workflow notification implementation
    }
    async callWebhook(url, ticket, method) {
        // Webhook call implementation
    }
    async syncWithGitHub(ticket, event, context) {
        // GitHub sync implementation
    }
    async syncWithJira(ticket, event, context) {
        // Jira sync implementation
    }
    async syncWithZendesk(ticket, event, context) {
        // Zendesk sync implementation
    }
}
export default Epic16TicketIntegrationService;
