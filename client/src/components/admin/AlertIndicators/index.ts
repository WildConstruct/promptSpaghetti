/**
 * Alert Indicators - Export Module
 * 
 * Epic 17.1.2 - Admin Dashboard UI
 * Task: E17-1753114396757-764E97 - Implement alert indicators
 * 
 * Centralized exports for all alert indicator components.
 */

export { default as AlertIndicatorBadge } from './AlertIndicatorBadge';
export type { AlertCount, AlertSeverity } from './AlertIndicatorBadge';

export { default as AlertStatusIndicator } from './AlertStatusIndicator';
export type { AlertSystemStatus } from './AlertStatusIndicator';

export { default as AdminAlertPanel } from './AdminAlertPanel';

// Define types locally for use in this file
type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
type AlertCount = {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
};

// Re-export common types for convenience
export interface AlertItem {
  id: string;
  type: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  timestamp: Date;
  source: string;
  status: 'active' | 'acknowledged' | 'resolved';
  affectedComponent?: string;
  userId?: string;
  userName?: string;
}

// Utility functions
export const getHighestAlertLevel = (alertCounts: { high: number; medium: number; low: number; info: number }) => {
  if (alertCounts.high > 0) return 'high';
  if (alertCounts.medium > 0) return 'medium';
  if (alertCounts.low > 0) return 'low';
  if (alertCounts.info > 0) return 'info';
  return null;
};