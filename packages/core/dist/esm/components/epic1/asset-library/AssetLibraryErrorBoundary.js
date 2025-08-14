import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Error Boundary for Asset Library
 * Catches and handles errors gracefully to prevent app crashes
 */
import { Component } from 'react';
export class AssetLibraryErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        console.error('[AssetLibraryErrorBoundary] Caught error:', error);
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        // Log the error to console for debugging
        console.error('[AssetLibraryErrorBoundary] Error details:', {
            error,
            errorInfo,
            componentStack: errorInfo.componentStack
        });
    }
    render() {
        if (this.state.hasError) {
            // Fallback UI when error occurs
            return (this.props.fallback || (_jsxs("div", { className: "asset-library-error", style: {
                    padding: '20px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    margin: '10px'
                }, children: [_jsx("h3", { style: { color: '#dc3545', marginBottom: '10px' }, children: "\uD83D\uDCDA Asset Browser Error" }), _jsx("p", { style: { color: '#6c757d', marginBottom: '15px' }, children: "The asset browser encountered an error and couldn't load properly." }), _jsx("button", { onClick: () => this.setState({ hasError: false, error: null }), style: {
                            padding: '8px 16px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }, children: "Try Again" }), process.env.NODE_ENV === 'development' && this.state.error && (_jsxs("details", { style: { marginTop: '15px' }, children: [_jsx("summary", { style: { cursor: 'pointer', color: '#6c757d' }, children: "Error Details (Development Only)" }), _jsx("pre", { style: {
                                    marginTop: '10px',
                                    padding: '10px',
                                    backgroundColor: '#f1f3f4',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    overflow: 'auto'
                                }, children: this.state.error.stack })] }))] })));
        }
        return this.props.children;
    }
}
export default AssetLibraryErrorBoundary;
