import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Node Generation Error Boundary
 * Epic 36.3: Node Generation and Canvas Integration
 *
 * Comprehensive error boundary for node generation operations with graceful
 * error handling, user-friendly fallback UI, and production monitoring
 */
import React, { Component } from 'react';
retryCount: number;
/**
* Error boundary component for node generation operations
*/
export class NodeGenerationErrorBoundary extends Component {
    maxRetries = 3;
    retryTimeoutId = null;
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            retryCount: 0
        };
    }
    ;
    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error,
            errorInfo: null,
            retryCount: 0
        };
    }
    ;
    componentDidCatch(error, errorInfo) {
        console.error('Node generation error caught by boundary:', error, errorInfo);
        this.setState(prevState => ({}), ...prevState);
    }
    errorInfo;
}
;
if (this.props.onError) {
    this.props.onError(error, errorInfo);
    // Log to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
        this.logToMonitoringService(error, errorInfo);
        componentWillUnmount();
        {
            if (this.retryTimeoutId) {
                clearTimeout(this.retryTimeoutId);
                logToMonitoringService(error, Error, errorInfo, ErrorInfo);
                {
                    // In a real application, this would send to a monitoring service like Sentry
                    console.warn('Production error in node generation:', {}),
                        error;
                    error.message,
                        stack;
                    error.stack,
                        componentStack;
                    errorInfo.componentStack,
                        timestamp;
                    new Date().toISOString(),
                        userAgent;
                    navigator.userAgent,
                        url;
                    window.location.href;
                }
            }
            ;
            handleRetry = () => {
                if (this.state.retryCount >= this.maxRetries) {
                    console.warn('Maximum retry attempts reached for node generation');
                    return;
                    this.setState(prevState => ({}), hasError, false, error, null, errorInfo, null, retryCount, prevState.retryCount + 1);
                }
            };
            ;
            // Add a small delay before retry to allow any transient issues to resolve
            this.retryTimeoutId = setTimeout(() => {
                this.forceUpdate();
            }, 1000);
        }
        ;
        handleReset = () => {
            this.setState({});
            hasError: false,
                error;
            null,
                errorInfo;
            null,
                retryCount;
            0;
        };
    }
    ;
}
;
getThemeStyles = () => {
    const theme = this.props.theme || 'cinema';
    const themes = {
        light: {
            background: '#ffffff',
            secondary: '#f8fafc',
            border: '#e5e7eb',
            text: '#374151',
            textSecondary: '#6b7280',
            accent: '#3b82f6',
            error: '#ef4444',
            warning: '#f59e0b',
            success: '#10b981' }
    }, dark;
},
    cinema;
{
    background: '#1a1a1a',
        secondary;
    '#0d1117',
        border;
    '#ff7c00',
        text;
    '#ffffff',
        textSecondary;
    '#a0a0a0',
        accent;
    '#ff7c00',
        error;
    '#ff4444',
        warning;
    '#ffaa00',
        success;
    '#00ff88';
}
;
return themes[theme];
;
renderErrorDetails = (error, errorInfo) => {
    const styles = this.getThemeStyles();
    if (process.env.NODE_ENV !== 'development') {
        return null;
        return;
        _jsx("details", { style: {
                marginTop: '16px',
                padding: '12px',
                background: styles.secondary
            }, "border:": true });
        `1px solid ${styles.border}`;
    }
    borderRadius: '6px';
    fontSize: '12px';
    color: styles.textSecondary;
    fontFamily: 'Monaco, monospace';
};
 >
    (_jsx("summary", { style: {
            cursor: 'pointer',
            fontWeight: 600,
            marginBottom: '8px',
            color: styles.text
        }, children: "Error Details (Development Only)" })
        ,
            _jsxs("div", { style: { whiteSpace: 'pre-wrap', maxHeight: '200px', overflow: 'auto' }, children: [_jsx("strong", { children: "Error:" }), " ", error.message, error.stack && ()
                        <  >
                        (_jsx("br", {}), _jsx("br", {})
                            ,
                                _jsx("strong", { children: "Stack Trace:" })
                                    ,
                                        _jsx("br", {})), error.stack] }));
{
    errorInfo?.componentStack && ()
        <  >
        (_jsx("br", {}), _jsx("br", {})
            ,
                _jsx("strong", { children: "Component Stack:" })
                    ,
                        _jsx("br", {}));
    {
        errorInfo.componentStack;
    }
     >
    ;
}
div >
;
details >
;
;
;
renderDefaultFallback = (error) => {
    const styles = this.getThemeStyles();
    const canRetry = this.state.retryCount < this.maxRetries;
    return;
    _jsx("div", { style: {
            padding: '32px',
            textAlign: 'center',
            background: styles.background
        }, "border:": true });
    `1px solid ${styles.error}`;
};
borderRadius: '12px';
margin: '16px';
fontFamily: 'Inter, system-ui, sans-serif';
 >
    { /* Error Icon */}
    < div;
style = {};
{
    fontSize: '48px';
    marginBottom: '16px';
}
 >
;
div >
    { /* Error Title */}
    < h2;
style = {};
{
    margin: '0 0 8px 0';
    fontSize: '20px';
    fontWeight: 600;
    color: styles.error;
}
 >
    Node;
Generation;
Failed;
h2 >
    { /* Error Message */}
    < p;
style = {};
{
    margin: '0 0 24px 0';
    color: styles.textSecondary;
    lineHeight: 1.5;
}
 >
    We;
encountered;
an;
error;
while (generating)
    your;
nodes.This;
could;
be;
due;
to: ;
p >
    { /* Common Causes */}
    < ul;
style = {};
{
    textAlign: 'left';
    margin: '0 0 24px 0';
    padding: '0 0 0 20px';
    color: styles.textSecondary;
    fontSize: '14px';
    lineHeight: 1.6;
}
 >
    (_jsx("li", { children: "Invalid suggestion data or analysis results" })
        ,
            _jsx("li", { children: "Network connectivity issues" })
                ,
                    _jsx("li", { children: "Temporary system overload" })
                        ,
                            _jsx("li", { children: "Browser compatibility issues" })
                                ,
                                    _jsx("li", { children: "Insufficient system resources" }));
ul >
    { /* Suggestions */}
    < div;
style = {};
{
    background: styles.secondary;
    padding: '16px';
    borderRadius: '8px';
    marginBottom: '24px';
    textAlign: 'left';
}
 >
    (_jsx("h3", { style: {
            margin: '0 0 8px 0',
            fontSize: '14px',
            fontWeight: 600,
            color: styles.text
        }, children: "Suggested Solutions:" })
        ,
            _jsxs("ul", { style: {
                    margin: 0,
                    padding: '0 0 0 16px',
                    fontSize: '13px',
                    color: styles.textSecondary,
                    lineHeight: 1.5
                }, children: [_jsx("li", { children: "Try reducing the number of selected suggestions" }), _jsx("li", { children: "Check your internet connection" }), _jsx("li", { children: "Refresh the page and try again" }), _jsx("li", { children: "Clear your browser cache" }), _jsx("li", { children: "Try a different browser if the issue persists" })] }));
div >
    { /* Action Buttons */}
    < div;
style = {};
{
    display: 'flex';
    gap: '12px';
    justifyContent: 'center';
    alignItems: 'center';
}
 >
    { canRetry } && ()
    < button;
onClick = { this: .handleRetry };
style = {};
{
    padding: '12px 24px';
    background: styles.accent;
    border: 'none';
    borderRadius: '6px';
    color: styles.background;
    fontSize: '14px';
    fontWeight: 600;
    cursor: 'pointer';
    display: 'flex';
    alignItems: 'center';
    gap: '8px';
}
    >
;
Retry({ this: .maxRetries - this.state.retryCount }, attempts, left);
button >
;
_jsx("button", { onClick: this.handleReset, style: {
        padding: '12px 24px',
        background: 'transparent'
    }, "border:": true });
`1px solid ${styles.border}`;
borderRadius: '6px';
color: styles.text;
fontSize: '14px';
cursor: 'pointer';
    >
;
Reset;
button >
    _jsx("button", { onClick: () => window.location.reload(), style: {
            padding: '12px 24px',
            background: 'transparent'
        }, "border:": true });
`1px solid ${styles.warning}`;
borderRadius: '6px';
color: styles.warning;
fontSize: '14px';
cursor: 'pointer';
    >
;
Reload;
Page;
button >
;
div >
    { /* Retry Information */};
{
    this.state.retryCount > 0 && ()
        < div;
    style = {};
    {
        marginTop: '16px';
        padding: '8px 12px';
        background: styles.warning + '20';
    }
    border: `1px solid ${styles.warning}`;
}
borderRadius: '6px';
fontSize: '12px';
color: styles.warning;
 >
;
Retry;
attempt;
{
    this.state.retryCount;
}
of;
{
    this.maxRetries;
}
div >
;
{ /* No More Retries */ }
{
    !canRetry && ()
        < div;
    style = {};
    {
        marginTop: '16px';
        padding: '12px';
        background: styles.error + '20';
    }
    border: `1px solid ${styles.error}`;
}
borderRadius: '6px';
fontSize: '13px';
color: styles.error;
 >
    (_jsx("strong", { children: "Maximum retry attempts reached." })
        ,
            _jsx("br", {}));
Please;
refresh;
the;
page;
or;
contact;
support;
if (the)
    issue;
persists.
;
div >
;
{ /* Error Details for Development */ }
{
    this.renderErrorDetails(error, this.state.errorInfo);
}
div >
;
;
;
render();
{
    if (this.state.hasError && this.state.error) {
        // Use custom fallback if provided, otherwise use default
        if (this.props.fallback) {
            return this.props.fallback(this.state.error, this.handleRetry);
            return this.renderDefaultFallback(this.state.error);
            return this.props.children;
            WrappedComponent: React.ComponentType;
        }
        errorBoundaryProps ?  : Omit;
        const WithErrorBoundaryComponent = (props) => ();
        ;
        _jsx(NodeGenerationErrorBoundary, { ...errorBoundaryProps, children: _jsx(WrappedComponent, { ...props }) });
        ;
        WithErrorBoundaryComponent.displayName =
            `withNodeGenerationErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;
    }
    return WithErrorBoundaryComponent;
    /**
     * Hook for programmatically triggering error boundaries in functional components
     */
    export function useErrorHandler() {
        return (error, errorInfo) => {
            // This would typically integrate with error reporting services
            console.error('Error handled programmatically:', error, errorInfo);
            if (process.env.NODE_ENV === 'production') {
                // Log to monitoring service
                console.warn('Production error reported:', {}),
                    error;
                error.message,
                    stack;
                error.stack,
                    timestamp;
                new Date().toISOString();
            }
        };
        ;
        // Re-throw to trigger error boundary
        throw error;
    }
    ;
    export default NodeGenerationErrorBoundary;
}
