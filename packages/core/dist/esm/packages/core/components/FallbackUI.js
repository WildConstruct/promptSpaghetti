import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Frontend Fallback UI Components
 * Provides graceful degradation when new features fail
 */
import { Component, useState, useEffect } from 'react';
import { useFeatureFlag } from '../safety/FeatureFlagManager';
import { monitoring } from '../monitoring/MonitoringService';
/**
 * Enhanced error boundary with fallback UI
 */
export class FallbackErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            fallbackLevel: props.fallbackLevel || 'component',
        };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        // Report to monitoring
        monitoring.recordMetric('ui.error', 1, {
            component: errorInfo.componentStack?.split('\n')[0] || 'unknown',
            level: this.state.fallbackLevel,
        });
        // Call custom error handler
        this.props.onError?.(error, errorInfo);
        this.setState({ errorInfo });
    }
    render() {
        if (this.state.hasError) {
            return (_jsx(FallbackUI, { level: this.state.fallbackLevel, error: this.state.error, onRetry: () => this.setState({ hasError: false }) }));
        }
        return this.props.children;
    }
}
/**
 * Fallback UI component
 */
const FallbackUI = ({ level, error, onRetry }) => {
    const styles = {
        padding: '20px',
        margin: '20px',
        border: '1px solid #ff6b6b',
        borderRadius: '8px',
        backgroundColor: '#ffe0e0',
        textAlign: 'center',
    };
    switch (level) {
        case 'component':
            return (_jsxs("div", { style: styles, children: [_jsx("h3", { children: "Component Error" }), _jsx("p", { children: "This component encountered an error and cannot be displayed." }), _jsx("button", { onClick: onRetry, style: { marginTop: '10px' }, children: "Try Again" })] }));
        case 'feature':
            return (_jsxs("div", { style: styles, children: [_jsx("h2", { children: "Feature Unavailable" }), _jsx("p", { children: "This feature is temporarily unavailable. We've switched to a simplified version." }), _jsxs("p", { style: { fontSize: '12px', color: '#666' }, children: ["Error: ", error?.message] }), _jsx("button", { onClick: onRetry, style: { marginTop: '10px' }, children: "Retry Feature" })] }));
        case 'page':
            return (_jsxs("div", { style: { ...styles, margin: '50px auto', maxWidth: '600px' }, children: [_jsx("h1", { children: "Page Error" }), _jsx("p", { children: "We're having trouble loading this page. Please try refreshing." }), _jsxs("div", { style: { marginTop: '20px' }, children: [_jsx("button", { onClick: () => window.location.reload(), children: "Refresh Page" }), _jsx("button", { onClick: onRetry, style: { marginLeft: '10px' }, children: "Try Again" })] })] }));
    }
};
/**
 * Feature-specific fallback wrapper
 */
export const FeatureFallback = ({ feature, children, fallback, errorFallback }) => {
    const isEnabled = useFeatureFlag(feature);
    const [hasError, setHasError] = useState(false);
    if (!isEnabled) {
        return _jsx(_Fragment, { children: fallback });
    }
    if (hasError && errorFallback) {
        return _jsx(_Fragment, { children: errorFallback });
    }
    return (_jsx(FallbackErrorBoundary, { fallbackLevel: "feature", onError: () => setHasError(true), children: children }));
};
/**
 * Progressive enhancement wrapper
 */
export const ProgressiveEnhancement = ({ basic, enhanced, checkSupport }) => {
    const [supportsEnhanced, setSupportsEnhanced] = useState(false);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        // Check browser capabilities
        try {
            const supported = checkSupport();
            setSupportsEnhanced(supported);
        }
        catch (error) {
            console.warn('Enhancement check failed:', error);
            setSupportsEnhanced(false);
        }
        setLoading(false);
    }, [checkSupport]);
    if (loading) {
        return _jsx(_Fragment, { children: basic });
    }
    return supportsEnhanced ? (_jsx(FallbackErrorBoundary, { fallbackLevel: "component", children: enhanced })) : (_jsx(_Fragment, { children: basic }));
};
/**
 * Network fallback component
 */
export const NetworkFallback = ({ children, offlineContent }) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);
    if (!isOnline) {
        return (_jsx("div", { style: {
                padding: '40px',
                textAlign: 'center',
                backgroundColor: '#f0f0f0',
            }, children: offlineContent || (_jsxs(_Fragment, { children: [_jsx("h2", { children: "You're Offline" }), _jsx("p", { children: "Please check your internet connection and try again." })] })) }));
    }
    return _jsx(_Fragment, { children: children });
};
/**
 * Lazy loading with fallback
 */
export const LazyLoadFallback = ({ load, fallback, errorFallback, props = {} }) => {
    const [Component, setComponent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        load()
            .then(module => {
            setComponent(() => module.default);
            setLoading(false);
        })
            .catch(err => {
            console.error('Lazy load failed:', err);
            setError(err);
            setLoading(false);
        });
    }, [load]);
    if (loading) {
        return _jsx(_Fragment, { children: fallback || _jsx("div", { children: "Loading..." }) });
    }
    if (error || !Component) {
        return _jsx(_Fragment, { children: errorFallback || _jsx("div", { children: "Failed to load component" }) });
    }
    return (_jsx(FallbackErrorBoundary, { fallbackLevel: "component", children: _jsx(Component, { ...props }) }));
};
/**
 * Graceful degradation for inline editing
 */
export const InlineEditingFallback = ({ nodeId, value, onChange }) => {
    const supportsInlineEditing = useFeatureFlag('epic1-inline-editing');
    if (!supportsInlineEditing) {
        // Fallback to simple form
        return (_jsxs("div", { className: "fallback-editor", children: [_jsx("label", { htmlFor: `node-${nodeId}`, children: "Node Value:" }), _jsx("input", { id: `node-${nodeId}`, type: "text", value: value, onChange: (e) => onChange(e.target.value), style: {
                        width: '100%',
                        padding: '4px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                    } })] }));
    }
    // Return null - actual inline editing component will be rendered
    return null;
};
/**
 * Performance fallback
 */
export const PerformanceFallback = ({ children, fallback, threshold = 100 }) => {
    const [shouldUseFallback, setShouldUseFallback] = useState(false);
    useEffect(() => {
        const startTime = performance.now();
        // Use requestIdleCallback if available
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(() => {
                const renderTime = performance.now() - startTime;
                if (renderTime > threshold) {
                    setShouldUseFallback(true);
                    monitoring.recordMetric('ui.performance.fallback', 1, {
                        renderTime: renderTime.toString(),
                    });
                }
            });
        }
    }, [threshold]);
    return shouldUseFallback ? _jsx(_Fragment, { children: fallback }) : _jsx(_Fragment, { children: children });
};
/**
 * Rollback status indicator
 */
export const RollbackStatusIndicator = () => {
    const [rollbackActive, setRollbackActive] = useState(false);
    useEffect(() => {
        // Check if any rollback is active
        const checkRollbackStatus = () => {
            // This would check actual rollback status
            const isActive = localStorage.getItem('rollback_active') === 'true';
            setRollbackActive(isActive);
        };
        checkRollbackStatus();
        const interval = setInterval(checkRollbackStatus, 5000);
        return () => clearInterval(interval);
    }, []);
    if (!rollbackActive)
        return null;
    return (_jsx("div", { style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: '#ff6b6b',
            color: 'white',
            padding: '10px',
            textAlign: 'center',
            zIndex: 9999,
        }, children: "\u26A0\uFE0F System is operating in rollback mode. Some features may be limited." }));
};
