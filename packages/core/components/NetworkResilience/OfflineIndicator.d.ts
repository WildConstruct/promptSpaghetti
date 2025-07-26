import React from 'react';
import { NetworkStatus } from '../../network-resilience/NetworkResilienceManager';
interface OfflineIndicatorProps {
    status: NetworkStatus;
    position?: 'top' | 'bottom';
    showQueueInfo?: boolean;
    showActions?: boolean;
    onRetryConnection?: () => void;
    onViewQueue?: () => void;
    className?: string;
}
export declare const OfflineIndicator: React.FC<OfflineIndicatorProps>;
export {};
//# sourceMappingURL=OfflineIndicator.d.ts.map