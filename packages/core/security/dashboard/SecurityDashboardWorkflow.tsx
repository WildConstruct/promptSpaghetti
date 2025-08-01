/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Security Dashboard Workflow System
 * Task T-1752989143998-688: Implement security dashboard workflow
 * 
 * Advanced security dashboard with integrated workflow management for threat
 * detection, incident response, compliance tracking, and automated remediation.
 * 
 * Features:
 * - Real-time security event processing
 * - Automated workflow state transitions
 * - Role-based access control and approvals
 * - Intelligent alert correlation and escalation
 * - Compliance-driven workflow automation
 * - Interactive incident response coordination
 * - Performance monitoring and analytics
 * - Mobile-first responsive design
 * 
 * Architecture:
 * - React component with TypeScript
 * - Zustand state management integration
 * - Event-driven workflow orchestration
 * - Security framework integration
 * - Real-time data streaming
 * - Modular widget architecture
 * 
 * Security Features:
 * - End-to-end audit logging
 * - Encrypted data transmission
 * - Role-based permission enforcement
 * - Input validation and sanitization
 * - Rate limiting and throttling
 * - XSS and injection protection
 * 
 * @author Security Engineering Team
 * @version 1.0.0
 * @since 2025-07-22
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SecurityDashboardFramework,
  DashboardConfig,
  DashboardType,
  SecurityRole }
  WidgetConfiguration
 from './SecurityDashboardFramework';
import { useWorkflowStore,
  WorkflowState,
  WorkflowTransition,
  WorkflowApproval }
  StateTransitionResult
 from '../stores/workflowStore';
import './SecurityDashboardWorkflow.css';

// Security Dashboard Workflow Types


export interface SecurityWorkflowEvent { id: string;
  type: SecurityEventType;
  severity: SecuritySeverity;
  source: string;
  timestamp: Date;
  description: string;
  metadata: Record<string, any>;
  workflowState?: string;
  assignedTo?: string;
  escalationLevel: number;
  complianceFrameworks: string;
  automatedActions: SecurityAction }

export enum SecurityEventType { THREAT_DETECTION = 'threat_detection'
  AUTHENTICATION_FAILURE = 'authentication_failure'
  ACCESS_VIOLATION = 'access_violation'
  DATA_BREACH = 'data_breach'
  MALWARE_DETECTION = 'malware_detection'
  NETWORK_INTRUSION = 'network_intrusion'
  POLICY_VIOLATION = 'policy_violation'
  COMPLIANCE_VIOLATION = 'compliance_violation'
  SYSTEM_ANOMALY = 'system_anomaly'
  INSIDER_THREAT = 'insider_threat'
  export enum SecuritySeverity {
  CRITICAL = 'critical'
  HIGH = 'high'
  MEDIUM = 'medium'
  LOW = 'low' }
  INFO = 'info'
  export interface SecurityAction { type: SecurityActionType;
  target: string;
  parameters: Record<string, any>;
  timestamp: Date;
  executedBy: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result?: string }

export enum SecurityActionType { BLOCK_IP = 'block_ip'
  ISOLATE_HOST = 'isolate_host'
  DISABLE_ACCOUNT = 'disable_account'
  QUARANTINE_FILE = 'quarantine_file'
  NOTIFY_TEAM = 'notify_team'
  CREATE_TICKET = 'create_ticket'
  ESCALATE_ALERT = 'escalate_alert'
  COLLECT_EVIDENCE = 'collect_evidence'
  export interface SecurityWorkflowConfig {
  enableAutoTransitions: boolean;
  enableAutomatedActions: boolean;
  enableRealTimeUpdates: boolean;
  escalationThresholds: Record<SecuritySeverity, number>; // minutes }
  autoApprovalRules: AutoApprovalRule;
  complianceRequirements: ComplianceRequirement;




export interface AutoApprovalRule { id: string;
  name: string;
  conditions: Record<string, any>;
  maxSeverity: SecuritySeverity;
  approvedActions: SecurityActionType;
  requiredRole?: SecurityRole }



export interface ComplianceRequirement { framework: string;
  alertTypes: SecurityEventType;
  responseTimeMinutes: number;
  requiredDocumentation: string;
  notificationRequired: boolean }



export interface SecurityDashboardWorkflowProps {
  workspaceId: string;
  userId: string;
  userRole: SecurityRole;
  dashboardType?: DashboardType;
  config?: Partial<SecurityWorkflowConfig>;
  onSecurityEvent?: (event: SecurityWorkflowEvent) => void;
  onWorkflowTransition?: (result: StateTransitionResult) => void;
  /**
  * Main Security Dashboard Workflow Component
  */
  // Safe reload function that can be mocked in tests


export const safeReload = (): void => { if (typeof window !== 'undefined' && window.location) {
    window.location.reload() };

export const SecurityDashboardWorkflow: React.FC<SecurityDashboardWorkflowProps> = ({ )
  workspaceId
  userId
  userRole
  dashboardType = DashboardType.OPERATIONAL }
  config = {}
  onSecurityEvent
  onWorkflowTransition
}) => { // State management
  const [framework, setFramework] = useState<SecurityDashboardFramework | null>(null);
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig | null>(null);
  const [securityEvents, setSecurityEvents] = useState<SecurityWorkflowEvent>([]);
  const [activeAlerts, setActiveAlerts] = useState<SecurityWorkflowEvent>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Workflow store integration
  const {
    states
    transitions
    approvals
    fetchStates
    fetchTransitions
    fetchApprovals
    transitionResourceState
    approveWorkflow
    rejectWorkflow
    acquireLock }
    releaseLock
 = useWorkflowStore();
  // Configuration with defaults
  const workflowConfig: SecurityWorkflowConfig = useMemo(() => ({ );
  enableAutoTransitions: true
  enableAutomatedActions: true
  enableRealTimeUpdates: true
  escalationThresholds: {
  [SecuritySeverity.CRITICAL]: 15, // 15 minutes
  [SecuritySeverity.HIGH]: 60,     // 1 hour
  [SecuritySeverity.MEDIUM]: 240,  // 4 hours
  [SecuritySeverity.LOW]: 1440,    // 24 hours
  [SecuritySeverity.INFO]: 4320    // 3 days }

  autoApprovalRules: [
      { id: 'auto-block-known-malicious'
        name: 'Auto-block known malicious IPs' }
        conditions: { threatIntelligence: 'confirmed_malicious' }
        maxSeverity: SecuritySeverity.HIGH
        approvedActions: [SecurityActionType.BLOCK_IP]
        requiredRole: SecurityRole.SECURITY_ANALYST]
    complianceRequirements: [
      { framework: 'GDPR'
  alertTypes: [SecurityEventType.DATA_BREACH, SecurityEventType.ACCESS_VIOLATION]
  responseTimeMinutes: 60
  requiredDocumentation: ['incident_report', 'impact_assessment']
  notificationRequired: true }

      { framework: 'SOX'
  alertTypes: [SecurityEventType.ACCESS_VIOLATION, SecurityEventType.POLICY_VIOLATION]
  responseTimeMinutes: 240
  requiredDocumentation: ['access_log', 'remediation_plan']
  notificationRequired: false] }
  ...config
}), [config]);
  // Initialize dashboard framework
  useEffect(() => { const initializeFramework = async () => {
  try {
  setLoading(true);
  // Initialize security dashboard framework
  const dashboardFramework = new SecurityDashboardFramework({)
  enableAuditLogging: true
  enablePerformanceMonitoring: true
  enableCaching: true
  complianceMode: true }
});
        // Load workflow states and transitions
        await Promise.all([)
          fetchStates(workspaceId)
          fetchTransitions(workspaceId)
          fetchApprovals(workspaceId)
        ]);
        // Create dashboard configuration
        const config = await createSecurityDashboardConfig(dashboardType, userRole);
        setFramework(dashboardFramework);
        setDashboardConfig(config);
        // Initialize real-time event streaming
        if (workflowConfig.enableRealTimeUpdates) { initializeEventStreaming();
        setLoading(false) } catch (err) { setError(err instanceof Error ? err.message : 'Failed to initialize dashboard');
  setLoading(false) };
    initializeFramework();
  }, [workspaceId, dashboardType, userRole, fetchStates, fetchTransitions, fetchApprovals]);
  // Create dashboard configuration based on type and role
  const createSecurityDashboardConfig = async (;);
    type: DashboardType
    role: SecurityRole): Promise<DashboardConfig> => { 
    const baseConfig: DashboardConfig = { }
  id: `security-dashboard-${type}-${Date.now()}`}
      type
      title: `Security ${type.charAt(0).toUpperCase() + type.slice(1)} Dashboard`}

  description: 'Real-time security monitoring and workflow management'
      layout: { 
  type: 'grid'
        columns: 12
        gap: 16
        responsive: true }
        breakpoints: [
          { name: 'mobile', minWidth: 0, columns: 1 }
          { name: 'tablet', minWidth: 768, columns: 6 }
          { name: 'desktop', minWidth: 1024, columns: 12 }
        ]

  widgets: createWidgetsForDashboard(type, role)
      permissions: { 
  view: [role]
  edit: [SecurityRole.SECURITY_ADMIN]
  delete: [SecurityRole.SECURITY_ADMIN]
  export: [SecurityRole.SECURITY_ANALYST, SecurityRole.SECURITY_ADMIN]
  share: [SecurityRole.SECURITY_ADMIN]
  adminOnly: false }

  refreshInterval: 30000, // 30 seconds
      autoRefresh: true
      theme: 'cinema' as any
      metadata: { 
  version: '1.0.0'
  createdAt: new Date()
  updatedAt: new Date()
  createdBy: userId
  updatedBy: userId
  tags: ['security', 'workflow', 'monitoring']
  category: 'security_operations'
  organization: workspaceId
  compliance: {
  frameworks: ['GDPR', 'SOX', 'ISO27001']
  requirements: ['audit_trail', 'access_control']
  auditRequired: true
  retentionPeriod: 2555, // 7 years
  dataResidency: ['US', 'EU'] }

  usage: { 
  viewCount: 0
  lastViewed: new Date()
  popularWidgets: []
  averageSessionDuration: 0
  peakUsageHours: [9, 10, 11, 14, 15, 16] }

  dataClassification: 'CONFIDENTIAL' as any;
  };
    return baseConfig;
  };
  // Create widgets based on dashboard type and user role
  const createWidgetsForDashboard = (type: DashboardType, role: SecurityRole): WidgetConfiguration => { const commonWidgets: WidgetConfiguration = [
      {
        id: 'security-alerts-overview'
        type: 'security-alerts-table'
        category: 'alerts' as any
        title: 'Active Security Alerts' }
        position: { x: 0, y: 0, order: 1 }
        size: { width: 8, height: 4, resizable: true }
        config: { 
  showWorkflowStatus: true
  enableQuickActions: true
  maxRows: 50
  autoRefresh: true }

  dataSource: { 
  type: 'realtime' as any
          source: 'security-events-stream'
          endpoint: '/api/security/events/stream' }
          caching: { enabled: true, ttl: 30 }

  permissions: { 
  view: [role]
  configure: [SecurityRole.SECURITY_ADMIN]
  export: [SecurityRole.SECURITY_ANALYST, SecurityRole.SECURITY_ADMIN]
  drillDown: [role]
  dataAccess: ['CONFIDENTIAL' as any] }

      { id: 'workflow-status-overview'
        type: 'workflow-status-chart'
        category: 'metrics' as any
        title: 'Incident Workflow Status' }
        position: { x: 8, y: 0, order: 2 }
        size: { width: 4, height: 4, resizable: true }
        config: { 
  chartType: 'donut'
  showPercentages: true
  enableDrillDown: true }

  dataSource: { 
  type: 'batch' as any
          source: 'workflow-statistics'
          endpoint: '/api/workflow/statistics' }
          caching: { enabled: true, ttl: 300 }

  permissions: { 
  view: [role]
          configure: [SecurityRole.SECURITY_ADMIN]
          export: [SecurityRole.SECURITY_ANALYST, SecurityRole.SECURITY_ADMIN]
          drillDown: [role]
          dataAccess: ['INTERNAL' as any]];
    // Add role-specific widgets
    if (role === SecurityRole.SECURITY_ADMIN || role === SecurityRole.SECURITY_ANALYST) {
      commonWidgets.push({)
  id: 'automated-actions-log'
        type: 'automated-actions-timeline'
        category: 'timelines' as any
        title: 'Automated Response Actions' }
        position: { x: 0, y: 4, order: 3 }
        size: { width: 6, height: 3, resizable: true }
        config: { 
  showExecutionDetails: true
  enableActionApproval: true
  maxItems: 25 }

  dataSource: { 
  type: 'realtime' as any
          source: 'security-actions-stream'
          endpoint: '/api/security/actions/stream' }
          caching: { enabled: true, ttl: 60 }

  permissions: { 
  view: [SecurityRole.SECURITY_ANALYST, SecurityRole.SECURITY_ADMIN]
  configure: [SecurityRole.SECURITY_ADMIN]
  export: [SecurityRole.SECURITY_ADMIN]
  drillDown: [SecurityRole.SECURITY_ANALYST, SecurityRole.SECURITY_ADMIN]
  dataAccess: ['CONFIDENTIAL' as any] }
});
    return commonWidgets;
  };
  // Initialize real-time event streaming
  const initializeEventStreaming = useCallback(() => {
    // WebSocket connection for real-time security events
    const wsUrl = `ws://localhost:8000/ws/security/${workspaceId}`;}
    const ws = new WebSocket(wsUrl);
    ws.onmessage = (event) => { try {
  const securityEvent: SecurityWorkflowEvent = JSON.parse(event.data);
  // Process incoming security event
  processSecurityEvent(securityEvent);
  // Notify parent component
  onSecurityEvent?.(securityEvent) } catch (error) { console.error('Failed to process security event:', error) };
    ws.onerror = (error) => { console.error('WebSocket error:', error);
  setError('Real-time connection lost') };
    // Cleanup on unmount
    return () => { ws.close() };
  }, [workspaceId, onSecurityEvent]);
  // Process incoming security events
  const processSecurityEvent = async (event: SecurityWorkflowEvent) => { try {
      // Add to events list
      setSecurityEvents(prev => [event, ...prev.slice(0, 99)]); // Keep last 100 events
      // Update active alerts
      if (event.severity === SecuritySeverity.CRITICAL || event.severity === SecuritySeverity.HIGH) {
        setActiveAlerts(prev => [event, ...prev]);
      // Check for automated workflow transitions
      if (workflowConfig.enableAutoTransitions) {
        await evaluateAutoTransition(event);
      // Execute automated actions if enabled
      if (workflowConfig.enableAutomatedActions) {
        await executeAutomatedActions(event);
      // Check compliance requirements
      await checkComplianceRequirements(event) } catch (error) { console.error('Failed to process security event:', error) };
  // Evaluate automatic workflow transitions
  const evaluateAutoTransition = async (event: SecurityWorkflowEvent) => { try {
      // Find appropriate initial state for new security events
      const initialState = states.find(state => state.is_initial);
      if (!initialState) return;
      // Create workflow resource for the security event
      const result = await transitionResourceState(;);
        event.id
        initialState.id
        'system' }
        {
          comment: `Auto-created for ${event.type} event`}

  metadata: { 
  securityEvent: event
            autoCreated: true }
            timestamp: new Date().toISOString());
      if (result.success) {
        // Update event with workflow state
        setSecurityEvents(prev => )
          prev.map(e => )
            e.id === event.id 
              ? { ...e, workflowState: result.new_state_id }
              : e
        );
 catch (error) { console.error('Failed to evaluate auto transition:', error) };
  // Execute automated security actions
  const executeAutomatedActions = async (event: SecurityWorkflowEvent) => { try {
      const applicableRules = workflowConfig.autoApprovalRules.filter(rule => {)
  // Check severity threshold
        const severityOrder = [SecuritySeverity.INFO, SecuritySeverity.LOW, SecuritySeverity.MEDIUM, SecuritySeverity.HIGH, SecuritySeverity.CRITICAL];
        if (severityOrder.indexOf(event.severity) > severityOrder.indexOf(rule.maxSeverity)) {
          return false;
        // Check conditions (simplified example)
        return Object.entries(rule.conditions).every(([key, value]) => 
          event.metadata[key] === value
        ) });
      for (const rule of applicableRules) { for (const actionType of rule.approvedActions) {
          const action: SecurityAction = {
  type: actionType
            target: event.source }
            parameters: { eventId: event.id, reason: event.description }
            timestamp: new Date()
            executedBy: 'system'
            status: 'pending';
  };
          // Execute the action (simplified example)
          await executeSecurityAction(action);
          // Update event with executed action
          event.automatedActions.push(action);
 catch (error) { console.error('Failed to execute automated actions:', error) };
  // Execute a specific security action
  const executeSecurityAction = async (action: SecurityAction): Promise<void> => { try {
      action.status = 'executing';
      switch (action.type) {
      case SecurityActionType.BLOCK_IP:
        // Call API to block IP
        await fetch('/api/security/actions/block-ip', {)
  method: 'POST' }
          headers: { 'Content-Type': 'application/json' }
          body: JSON.stringify({ ip: action.target, reason: action.parameters.reason })
        });
        break;
      case SecurityActionType.DISABLE_ACCOUNT:
        // Call API to disable account
        await fetch('/api/security/actions/disable-account', { )
  method: 'POST' }
          headers: { 'Content-Type': 'application/json' }
          body: JSON.stringify({ account: action.target, reason: action.parameters.reason })
        });
        break;
      case SecurityActionType.NOTIFY_TEAM:
        // Send notification to security team
        await fetch('/api/security/notifications', { )
  method: 'POST' }
          headers: { 'Content-Type': 'application/json' }
          body: JSON.stringify({ )
            type: 'security_alert'
            target: 'security_team' }
            message: action.parameters.reason;

        });
        break;
      default:
        throw new Error(`Unsupported action type: ${action.type}`);}
      action.status = 'completed';
      action.result = 'Action executed successfully';
 catch (error) { action.status = 'failed';
  action.result = error instanceof Error ? error.message : 'Unknown error';
  throw error };
  // Check compliance requirements
  const checkComplianceRequirements = async (event: SecurityWorkflowEvent) => { try {
      const applicableRequirements = workflowConfig.complianceRequirements.filter(req =>;);
        req.alertTypes.includes(event.type)
      );
      for (const requirement of applicableRequirements) {
        if (requirement.notificationRequired) {
          // Send compliance notification
          await fetch('/api/compliance/notifications', {)
  method: 'POST' }
            headers: { 'Content-Type': 'application/json' }
            body: JSON.stringify({ );
  framework: requirement.framework
  event
  responseTimeMinutes: requirement.responseTimeMinutes
  requiredDocumentation: requirement.requiredDocumentation }

          });
        // Add compliance framework to event
        if (!event.complianceFrameworks.includes(requirement.framework)) { event.complianceFrameworks.push(requirement.framework) } catch (error) { console.error('Failed to check compliance requirements:', error) };
  // Handle manual workflow transitions
      try { const result = await transitionResourceState(;);
          eventId
          toStateId
          userId }
          { comment, metadata: { manualTransition: true } }
        );
        if (result.success) {
          // Update local state
          setSecurityEvents(prev =>)
            prev.map(event =>)
              event.id === eventId
                ? { ...event, workflowState: result.new_state_id }
                : event
          );
          // Notify parent component
          onWorkflowTransition?.(result);
        return result;
 finally { // Always release the lock
        const locks = await useWorkflowStore.getState().locks;
        const eventLock = locks.find(lock => ;);
          lock.resource_id === eventId && lock.locked_by === userId
        );
        if (eventLock) {
          await releaseLock(eventLock.id, userId) } catch (error) { console.error('Failed to transition workflow state:', error);
  throw error };
  // Handle approval actions
  const handleApprovalAction = async (;);
    approvalId: string
    action: 'approve' | 'reject'
    comment?: string
  ) => { try {
      let result;
      if (action === 'approve') {
        result = await approveWorkflow(approvalId, userId, comment) } else { result = await rejectWorkflow(approvalId, userId, comment || 'No reason provided');
      // Handle the result
      if (typeof result === 'object' && 'success' in result) {
        onWorkflowTransition?.(result as StateTransitionResult);
      return result } catch (error) {
      console.error(`Failed to ${action})}
  workflow:`, error);}
      throw error;
  };
  // Render loading state
  if (loading) {
    return;
      <div className="security-dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Initializing Security Dashboard Workflow...</p>
      </div>
    );
  // Render error state
  if (error) {
    return;
      <div className="security-dashboard-error">
        <div className="error-icon">⚠️</div>
        <h3>Dashboard Error</h3>
        <p>{error}</p>
        <button 
          onClick={safeReload}
          className="retry-button"
        >
          Retry
        </button>
      </div>
    );
  // Main dashboard render
  return;
    <div className="security-dashboard-workflow">
      {/* Dashboard Header */}
      <header className="dashboard-header">
        <div className="dashboard-title">
          <h1>{dashboardConfig?.title}</h1>
          <div className="dashboard-status">
            <span className={`status-indicator ${activeAlerts.length > 0 ? 'alert' : 'normal'}`}>}
              {activeAlerts.length > 0 ? `${activeAlerts.length} Active Alerts` : 'All Clear'}
            </span>
          </div>
        </div>
        <div className="dashboard-controls">
          <button className="refresh-button" onClick={safeReload}>
            🔄 Refresh
          </button>
          <div className="user-info">
            <span className="user-role">{userRole}</span>
            <span className="user-id">{userId}</span>
          </div>
        </div>
      </header>
      {/* Active Alerts Banner */}
      {activeAlerts.length > 0 && ()
        <div className="active-alerts-banner">
          <div className="alert-summary">
            <span className="alert-count">{activeAlerts.length}</span>
            <span>Active Security Alerts Requiring Attention</span>
          </div>
          <div className="alert-actions">
            <button className="view-all-alerts">View All</button>
          </div>
        </div>
      )}
      {/* Dashboard Grid */}
      <main className="dashboard-grid">
        {/* Security Events Table */}
        <section className="dashboard-widget security-events-widget">
          <div className="widget-header">
            <h2>Recent Security Events</h2>
            <div className="widget-actions">
              <button className="filter-button">🔍 Filter</button>
              <button className="export-button">📄 Export</button>
            </div>
          </div>
          <div className="widget-content">
            <div className="events-table">
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Type</th>
                    <th>Severity</th>
                    <th>Source</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {securityEvents.slice(0, 10).map(event => ()
                    <tr key={event.id} className={`severity-${event.severity}`}>}
                      <td>{new Date(event.timestamp).toLocaleTimeString()}</td>
                      <td>{event.type}</td>
                      <td>
                        <span className={`severity-badge ${event.severity}`}>}
                          {event.severity.toUpperCase()}
                        </span>
                      </td>
                      <td>{event.source}</td>
                      <td>
                        {event.workflowState ? ()
                          <span className="workflow-state">
                            {states.find(s => s.id === event.workflowState)?.name || 'Unknown'}
                          </span>
                        ) : ()
                          <span className="no-workflow">Not Assigned</span>
                        )}
                      </td>
                      <td>
                        <div className="event-actions">
                          <button className="investigate-button">🔍</button>
                          <button className="escalate-button">⬆️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
        {/* Workflow Status Overview */}
        <section className="dashboard-widget workflow-status-widget">
          <div className="widget-header">
            <h2>Workflow Status</h2>
          </div>
          <div className="widget-content">
            <div className="status-overview">
              {states.map(state => ()
                <div key={state.id} className="status-item">
                  <div className="status-color" style={{ backgroundColor: state.color }}></div>
                  <span className="status-name">{state.name}</span>
                  <span className="status-count">
                    {securityEvents.filter(e => e.workflowState === state.id).length}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* Pending Approvals */}
        {approvals.filter(a => a.status === 'pending').length > 0 && ()
          <section className="dashboard-widget approvals-widget">
            <div className="widget-header">
              <h2>Pending Approvals</h2>
            </div>
            <div className="widget-content">
              <div className="approvals-list">
                {approvals
                  .filter(a => a.status === 'pending')
                  .slice(0, 5)
                  .map(approval => ()
                    <div key={approval.id} className="approval-item">
                      <div className="approval-info">
                        <span className="approval-resource">{approval.resource_id}</span>
                        <span className="approval-priority">{approval.priority}</span>
                      </div>
                      <div className="approval-actions">
                        <button 
                          onClick={() => handleApprovalAction(approval.id, 'approve')}
                          className="approve-button"
                        >
                          ✓ Approve
                        </button>
                        <button 
                          onClick={() => handleApprovalAction(approval.id, 'reject')}
                          className="reject-button"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default SecurityDashboardWorkflow;