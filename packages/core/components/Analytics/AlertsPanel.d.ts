import React from 'react';
/**
 * Alerts panel props
 */

}
export interface AlertsPanelProps {
    alerts: unknown[];
    onAcknowledge: (alertId: string) => void;
    onDismiss?: (alertId: string) => void;
    showSummary?: boolean;
    className?: string;


/**
 * Alerts panel component
 */
export declare const AlertsPanel: React.FC<AlertsPanelProps>;
export default AlertsPanel;
//# sourceMappingURL=AlertsPanel.d.ts.map
}