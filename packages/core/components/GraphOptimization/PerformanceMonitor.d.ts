/**
 * PerformanceMonitor - Real-time graph execution performance monitoring
 */
import React from 'react';

}
}
interface ExecutionMetric { timestamp: number;
    duration: number;
    memoryUsage: number;
    nodeCount: number;
    cacheHitRate: number;
    outputLength: number }
}
}
interface PerformanceMonitorProps {
    isVisible: boolean;
    onToggle: () => void;
    onMetricsCollected?: (metrics: ExecutionMetric) => void;

export declare const PerformanceMonitor: React.FC<PerformanceMonitorProps>;
export default PerformanceMonitor;
//# sourceMappingURL=PerformanceMonitor.d.ts.map
}
}