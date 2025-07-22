// Epic 19.4 - Security Types Definition
// Task: T-1752989145014 - Create frontend components for Security Monitoring & Incident Response

export interface SecurityMetric {
  id: string;
  name: string;
  value: number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  change?: number;
  timestamp: Date;
}

export interface SecurityEvent {
  id: string;
  timestamp: Date;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: 'authentication' | 'authorization' | 'data_access' | 'system' | 'api' | 'network';
  event_type: string;
  description: string;
  source_ip?: string;
  user_id?: string;
  user_email?: string;
  resource: string;
  action: string;
  outcome: 'success' | 'failure' | 'blocked';
  metadata?: Record<string, any>;
}

export interface SecurityAlert {
  id: string;
  type: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  title: string;
  message: string;
  timestamp: Date;
  source: string;
  status: 'unread' | 'read' | 'acknowledged' | 'dismissed';
  actions?: AlertAction[];
  metadata?: Record<string, any>;
  escalation_level: number;
}

export interface AlertAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  action: 'block_ip' | 'quarantine_user' | 'escalate' | 'investigate' | 'dismiss';
}

export interface ThreatData {
  id: string;
  type: 'malware' | 'phishing' | 'brute_force' | 'ddos' | 'injection' | 'data_breach';
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  source_ip: string;
  target: string;
  detected_at: Date;
  status: 'active' | 'blocked' | 'investigating';
  description: string;
}

export interface SecurityIncident {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'investigating' | 'contained' | 'resolved' | 'closed';
  created_at: Date;
  updated_at: Date;
  assigned_to?: string;
  reporter: string;
  category: string;
  affected_systems: string[];
  evidence: Evidence[];
  timeline: TimelineEntry[];
  response_actions: ResponseAction[];
}

export interface Evidence {
  id: string;
  type: 'log' | 'screenshot' | 'file' | 'url' | 'note';
  title: string;
  content: string;
  collected_at: Date;
  collected_by: string;
}

export interface TimelineEntry {
  id: string;
  timestamp: Date;
  event: string;
  description: string;
  author: string;
  type: 'status_change' | 'assignment' | 'action' | 'note' | 'evidence';
}

export interface ResponseAction {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  assigned_to?: string;
  due_date?: Date;
  completed_at?: Date;
}

export interface ThreatStats {
  total_threats: number;
  active_threats: number;
  blocked_threats: number;
  threat_types: Record<string, number>;
  severity_distribution: Record<string, number>;
  hourly_detection_rate: Array<{ hour: number; count: number }>;
}

export interface SecurityDashboardProps {
  onIncidentClick?: (incidentId: string) => void;
  onThreatClick?: (threatId: string) => void;
}

export interface SecurityEventLogProps {
  onEventClick?: (event: SecurityEvent) => void;
  initialFilters?: {
    severity?: string[];
    category?: string[];
    dateRange?: [Date, Date];
  };
}

export interface IncidentResponsePanelProps {
  incidentId: string;
  onIncidentUpdate?: (incident: SecurityIncident) => void;
  onClose?: () => void;
}

export interface ThreatDetectionVisualizerProps {
  onThreatClick?: (threat: ThreatData) => void;
  refreshInterval?: number;
}

export interface SecurityAlertsProps {
  onAlertAction?: (alertId: string, action: string) => void;
  maxVisible?: number;
  showDismissed?: boolean;
}