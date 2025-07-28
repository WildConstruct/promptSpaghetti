/**
 * Node Generation Error Boundary
 * Epic 36.3: Node Generation and Canvas Integration
 *
 * Comprehensive error boundary for node generation operations with graceful
 * error handling, user-friendly fallback UI, and production monitoring
 */
import { Component, ErrorInfo, ReactNode } from 'react';
export interface NodeGenerationErrorBoundaryProps {
    children: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    fallback?: (error: Error, retry: () => void) => ReactNode;
    theme?: 'light' | 'dark' | 'cinema';
}
export interface NodeGenerationErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    retryCount: number;
}
export declare class NodeGenerationErrorBoundary extends Component<NodeGenerationErrorBoundaryProps, NodeGenerationErrorBoundaryState> {
    private maxRetries;
    private retryTimeoutId;
    constructor(props: NodeGenerationErrorBoundaryProps);
    static getDerivedStateFromError(error: Error): NodeGenerationErrorBoundaryState;
    private logToMonitoringService;
    private handleRetry;
    private handleReset;
}
//# sourceMappingURL=NodeGenerationErrorBoundary.d.ts.map