import React from 'react';
import { NetworkStatus } from '../../network-resilience/NetworkResilienceManager';
import { QueuedOperation } from '../../network-resilience/OfflineOperationQueue';
interface NetworkResiliencePanelProps {
    status: NetworkStatus;
    queuedOperations: QueuedOperation[];
    onRetryConnection?: () => void;
    onForceSync?: () => void;
    onClearQueue?: () => void;
    onRetryOperation?: (operationId: string) => void;
    isOpen: boolean;
    onClose: () => void;
}
export declare const NetworkResiliencePanel: React.FC<NetworkResiliencePanelProps>;
export {};
//# sourceMappingURL=NetworkResiliencePanel.d.ts.map