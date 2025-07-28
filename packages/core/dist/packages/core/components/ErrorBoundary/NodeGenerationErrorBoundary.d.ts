/**
 * Node Generation Error Boundary
 * Epic 36.3: Node Generation and Canvas Integration
 *
 * Comprehensive error boundary for node generation operations with graceful
 * error handling, user-friendly fallback UI, and production monitoring
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';
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
/**
 * Error boundary component for node generation operations
 */
export declare class NodeGenerationErrorBoundary extends Component<NodeGenerationErrorBoundaryProps, NodeGenerationErrorBoundaryState> {
    private maxRetries;
    private retryTimeoutId;
    constructor(props: NodeGenerationErrorBoundaryProps);
    static getDerivedStateFromError(error: Error): NodeGenerationErrorBoundaryState;
    componentDidCatch(error: Error, errorInfo: ErrorInfo): void;
    componentWillUnmount(): void;
    private logToMonitoringService;
    private handleRetry;
    private handleReset;
    private getThemeStyles;
    private renderErrorDetails;
    private renderDefaultFallback;
    render(): string | number | boolean | Iterable<React.ReactNode> | import("react/jsx-runtime").JSX.Element;
}
/**
 * Higher-order component for wrapping components with node generation error boundary
 */
export declare function withNodeGenerationErrorBoundary<P extends object>(WrappedComponent: React.ComponentType<P>, errorBoundaryProps?: Omit<NodeGenerationErrorBoundaryProps, 'children'>): {
    (props: P): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
/**
 * Hook for programmatically triggering error boundaries in functional components
 */
export declare function useErrorHandler(): (error: Error, errorInfo?: ErrorInfo) => never;
export default NodeGenerationErrorBoundary;
//# sourceMappingURL=NodeGenerationErrorBoundary.d.ts.map