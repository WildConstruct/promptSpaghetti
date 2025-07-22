/**
 * Alert Rule Builder Component
 *
 * Advanced visual interface for creating and managing security alert rules.
 * Provides drag-and-drop rule building, condition chaining, and action configuration.
 */
import React from 'react';
import { SecurityEventType, SecurityEventSeverity } from '../../security/SecurityEventLoggingPolicies';
import './AlertRuleBuilder.css';
interface AlertRule {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    event_types: SecurityEventType[];
    severity_threshold: SecurityEventSeverity;
    conditions: AlertCondition[];
    actions: AlertAction[];
    notification_channels: NotificationChannel[];
    escalation_config?: EscalationConfig;
    created_at: Date;
    updated_at: Date;
}
interface AlertCondition {
    id: string;
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'regex' | 'in' | 'not_in';
    value: any;
    logic_operator?: 'and' | 'or';
}
interface AlertAction {
    id: string;
    type: 'notification' | 'containment' | 'escalation' | 'logging' | 'webhook';
    name: string;
    config: Record<string, any>;
    enabled: boolean;
    delay_seconds?: number;
}
interface NotificationChannel {
    id: string;
    name: string;
    type: 'email' | 'sms' | 'slack' | 'webhook' | 'dashboard';
    config: Record<string, any>;
    enabled: boolean;
}
interface EscalationConfig {
    enabled: boolean;
    escalation_delay_minutes: number;
    escalation_targets: string[];
    max_escalations: number;
}
/**
 * Main Alert Rule Builder Component
 */
export declare const AlertRuleBuilder: React.FC<{
    alertRules: AlertRule[];
    onRulesChange: (rules: AlertRule[]) => void;
}>;
export default AlertRuleBuilder;
//# sourceMappingURL=AlertRuleBuilder.d.ts.map