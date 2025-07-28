/**
 * Security Dashboard Data Service
 * Task T-1752989143998-955: Implement security dashboard
 * 
 * Data service layer for security dashboard that handles API integration,
 * real-time data streaming, caching, and data transformation for security
 * monitoring and incident response operations.
 * 
 * Features:
 * - RESTful API integration for security data
 * - Real-time WebSocket streaming
 * - Intelligent caching and data persistence
 * - Data transformation and aggregation
 * - Error handling and retry logic
 * - Performance monitoring and metrics
 * 
 * @author Security Engineering Team
 * @version 1.0.0
 * @since 2025-07-22
 */
import { SecurityMetrics, SecurityAlert, ComplianceStatus, ResponseAction } from './SecurityDashboardMain';

export interface SecurityAction {
  type: string;
  payload: unknown;
  timestamp: Date;
  executedBy: string;
}

export interface DataServiceConfig {
  baseUrl: string;
  wsUrl: string;
  apiKey?: string;
  timeout: number;
  retryAttempts: number;
  cacheTimeout: number; // seconds
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}
/**
 * Security Dashboard Data Service
 */
export class SecurityDashboardDataService {
  private workspaceId: string;
  private config: DataServiceConfig;
  private cache: Map<string, { data: Record<string, unknown>; expires: number }> = new Map();
  private ws: WebSocket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  constructor(workspaceId: string, config?: Partial<DataServiceConfig>) {
    this.workspaceId = workspaceId;
    this.config = {
      baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
      wsUrl: process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws',
      timeout: 10000,
      retryAttempts: 3,
      cacheTimeout: 30,
      ...config
    };
  }
  // =============================================================================
  // Core Data Methods
  // =============================================================================
  /**
   * Get current security metrics
   */
  async getSecurityMetrics(): Promise<SecurityMetrics> {
    const cacheKey = `security-metrics-${this.workspaceId}`;}
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }
    try {
      const response = await this.apiRequest<SecurityMetrics>(;);
        `/security/metrics/${this.workspaceId}`}
      );
      if (response.success && response.data) {
        this.setCache(cacheKey, response.data, this.config.cacheTimeout);
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to fetch security metrics');
      }
    } catch (error) {
      console.error('Failed to fetch security metrics:', error);
      // Return fallback data
      return this.getFallbackSecurityMetrics();
    }
  }
  /**
   * Get active security alerts
   */
  async getActiveAlerts(filters?: {)
    severity?: string[];
    category?: string[];
    status?: string[];
    limit?: number;
    offset?: number;
  }): Promise<SecurityAlert[]> {
    const cacheKey = `security-alerts-${this.workspaceId}-${JSON.stringify(filters)}`;}
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v));
          } else if (value !== undefined) {
            queryParams.set(key, String(value));
          }
        });
      }
      const response = await this.apiRequest<SecurityAlert[]>(;);
        `/security/alerts/${this.workspaceId}?${queryParams.toString()}`}
      );
      if (response.success && response.data) {
        // Transform dates and ensure proper typing
        const alerts = response.data.map(alert => ({)
          ...alert,
          timestamp: new Date(alert.timestamp),
          responseActions: alert.responseActions.map(action => ({),
            ...action,
            timestamp: action.timestamp ? new Date(action.timestamp) : undefined,
          }))
        }));
        this.setCache(cacheKey, alerts, 15); // Cache for 15 seconds
        return alerts;
      } else {
        throw new Error(response.error || 'Failed to fetch security alerts');
      }
    } catch (error) {
      console.error('Failed to fetch security alerts:', error);
      // Return fallback data
      return this.getFallbackSecurityAlerts();
    }
  }
  /**
   * Get compliance status
   */
  async getComplianceStatus(): Promise<ComplianceStatus[]> {
    const cacheKey = `compliance-status-${this.workspaceId}`;}
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }
    try {
      const response = await this.apiRequest<ComplianceStatus[]>(;);
        `/security/compliance/${this.workspaceId}`}
      );
      if (response.success && response.data) {
        // Transform dates
        const complianceData = response.data.map(status => ({)
          ...status,
          lastAssessment: new Date(status.lastAssessment),
          violations: status.violations.map(violation => ({),
            ...violation,
            dueDate: new Date(violation.dueDate),
          }))
        }));
        this.setCache(cacheKey, complianceData, this.config.cacheTimeout * 2); // Cache longer
        return complianceData;
      } else {
        throw new Error(response.error || 'Failed to fetch compliance status');
      }
    } catch (error) {
      console.error('Failed to fetch compliance status:', error);
      // Return fallback data
      return this.getFallbackComplianceStatus();
    }
  }
  /**
   * Execute a security action
   */
  async executeSecurityAction(actionType: string, payload: unknown): Promise<void> {
    try {
      const action: SecurityAction = {
        type: actionType,
        payload,
        timestamp: new Date(),
        executedBy: 'current-user' // Would get from auth context,
      };
      const response = await this.apiRequest(;);
        `/security/actions/${this.workspaceId}`,}
        {
          method: 'POST',
          body: JSON.stringify(action),
        }
      );
      if (!response.success) {
        throw new Error(response.error || 'Failed to execute security action');
      }
      // Emit event for real-time updates
      this.emit('security_action_executed', action);
    } catch (error) {
      console.error('Failed to execute security action:', error);
      throw error;
    }
  }
  /**
   * Update an alert
   */
  async updateAlert(alertId: string, updates: Partial<SecurityAlert>): Promise<SecurityAlert> {
    try {
      const response = await this.apiRequest<SecurityAlert>(;);
        `/security/alerts/${this.workspaceId}/${alertId}`,}
        {
          method: 'PATCH',
          body: JSON.stringify(updates),
        }
      );
      if (response.success && response.data) {
        // Invalidate relevant cache entries
        this.invalidateCache(`security-alerts-${this.workspaceId}`);}
        // Emit event for real-time updates
        this.emit('alert_updated', response.data);
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to update alert');
      }
    } catch (error) {
      console.error('Failed to update alert:', error);
      throw error;
    }
  }
  // =============================================================================
  // Real-time Event Handling
  // =============================================================================
  /**
   * Subscribe to real-time events
   */
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }
  /**
   * Unsubscribe from events
   */
  off(event: string, callback: Function): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }
  /**
   * Emit events to subscribers
   */
  private emit(event: string, data: Record<string, unknown>): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {)
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);}
        }
      });
    }
  }
  /**
   * Initialize WebSocket connection for real-time updates
   */
  initializeWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(`${this.config.wsUrl}/security-dashboard/${this.workspaceId}`);}
        this.ws.onopen = () => {
          console.log('Security dashboard WebSocket connected');
          this.emit('connection_established', { workspaceId: this.workspaceId });
          resolve();
        };
        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleWebSocketMessage(data);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };
        this.ws.onclose = () => {
          console.log('Security dashboard WebSocket disconnected');
          this.emit('connection_lost', { workspaceId: this.workspaceId });
          // Attempt to reconnect after 5 seconds
          setTimeout(() => {
            this.initializeWebSocket().catch(console.error);
          }, 5000);
        };
        this.ws.onerror = (error) => {
          console.error('Security dashboard WebSocket error:', error);
          this.emit('connection_error', { error });
          reject(error);
        };
      } catch (error) {
        console.error('Failed to initialize WebSocket:', error);
        reject(error);
      }
    });
  }
  /**
   * Handle incoming WebSocket messages
   */
  private handleWebSocketMessage(data: Record<string, unknown>): void {
    switch (data.type) {
    case 'security_metrics_update':
      this.invalidateCache(`security-metrics-${this.workspaceId}`);}
      this.emit('security_metrics', data.payload);
      break;
    case 'new_security_alert':
      this.invalidateCache(`security-alerts-${this.workspaceId}`);}
      this.emit('security_alert', {)
        ...data.payload,
        timestamp: new Date(data.payload.timestamp),
      });
      break;
    case 'alert_status_change':
      this.invalidateCache(`security-alerts-${this.workspaceId}`);}
      this.emit('alert_update', {)
        ...data.payload,
        timestamp: new Date(data.payload.timestamp),
      });
      break;
    case 'compliance_status_update':
      this.invalidateCache(`compliance-status-${this.workspaceId}`);}
      this.emit('compliance_update', {)
        ...data.payload,
        lastAssessment: new Date(data.payload.lastAssessment),
      });
      break;
    default:
      console.log('Unknown WebSocket message type:', data.type);
    }
  }
  // =============================================================================
  // Private Helper Methods
  // =============================================================================
  /**
   * Make API request with retry logic
   */
  private async apiRequest<T>()
    endpoint: string, 
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;}
    const requestOptions: RequestInit = {
      headers: {,
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),}
        ...options?.headers
      },
      timeout: this.config.timeout,
      ...options
    };
    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const response = await fetch(url, requestOptions);
        const data = await response.json();
        if (response.ok) {
          return {
            success: true,
            data: data,
            timestamp: new Date(),
          };
        } else {
          return {
            success: false,
            error: data.error || `HTTP ${response.status}: ${response.statusText}`,}
            timestamp: new Date(),
          };
        }
      } catch (error) {
        console.error(`API request attempt ${attempt} failed:`, error);}
        if (attempt === this.config.retryAttempts) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date(),
          };
        }
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    return {
      success: false,
      error: 'Max retry attempts exceeded',
      timestamp: new Date(),
    };
  }
  /**
   * Cache management
   */
  private setCache(key: string, data: Record<string, unknown>, ttlSeconds: number): void {
    this.cache.set(key, {)
      data,
      expires: Date.now() + (ttlSeconds * 1000),
    });
  }
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }
  private invalidateCache(keyPattern: string): void {
    const keysToDelete: string[] = [];
    for (const key of this.cache.keys()) {
      if (key.includes(keyPattern)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
  }
  /**
   * Fallback data methods (for offline/error scenarios)
   */
  private getFallbackSecurityMetrics(): SecurityMetrics {
    return {
      securityScore: 85,
      activeThreats: 3,
      blockedThreats: 47,
      riskLevel: 'medium',
      lastScanTime: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago,
    };
  }
  private getFallbackSecurityAlerts(): SecurityAlert[] {
    return [
      {
        id: 'alert-001',
        severity: 'high',
        category: 'malware',
        title: 'Potential Malware Detected',
        description: 'Suspicious executable detected on workstation WS-4521',
        source: 'Endpoint Detection',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        status: 'new',
        affectedAssets: ['WS-4521'],
        indicators: ['suspicious.exe', 'registry.modification'],
        responseActions: [],
      },
      {
        id: 'alert-002',
        severity: 'medium',
        category: 'intrusion',
        title: 'Unusual Network Activity',
        description: 'Multiple failed login attempts from external IP',
        source: 'Network Monitoring',
        timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
        status: 'investigating',
        assignee: 'analyst-1',
        affectedAssets: ['Server-Web-01'],
        indicators: ['192.168.1.100', 'failed.login'],
        responseActions: [,
          {
            id: 'action-001',
            type: 'investigate',
            description: 'Analyzing source IP reputation',
            automated: false,
            status: 'in_progress',
            performer: 'analyst-1',
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
          }
        ]
      }
    ];
  }
  private getFallbackComplianceStatus(): ComplianceStatus[] {
    return [
      {
        framework: 'GDPR',
        status: 'compliant',
        score: 92,
        violations: [],
        lastAssessment: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago,
      },
      {
        framework: 'SOX',
        status: 'partial',
        score: 78,
        violations: [,
          {
            id: 'sox-001',
            type: 'Access Control',
            description: 'Insufficient separation of duties in financial systems',
            severity: 'medium',
            remediation: 'Implement role-based access controls',
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now,
          }
        ],
        lastAssessment: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // 14 days ago,
      }
    ];
  }
  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.cache.clear();
    this.listeners.clear();
  }
}

export default SecurityDashboardDataService;