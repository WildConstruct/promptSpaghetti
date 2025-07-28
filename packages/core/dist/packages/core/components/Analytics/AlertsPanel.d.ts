import React from 'react';
/**
 * Alerts panel props
 */
export interface AlertsPanelProps {
    alerts: unknown;
    onAcknowledge: (alertId: string) => void;
    onDismiss?: (alertId: string) => void;
    showSummary?: boolean;
    className?: string;
}
export declare const AlertsPanel: React.FC<AlertsPanelProps>;
//# sourceMappingURL=AlertsPanel.d.ts.map