import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AlertTriangle, RefreshCw } from 'lucide-react';
import './ErrorState.css';
export const ErrorState = ({ error, title = 'Something went wrong', description, onRetry, retryText = 'Try Again', showIcon = true, variant = 'default', className = '' }) => {
    const errorMessage = error instanceof Error ? error.message : error;
    const getDescription = () => {
        if (description)
            return description;
        if (errorMessage)
            return errorMessage;
        return 'An unexpected error occurred while loading the dashboard.';
    };
    const renderMinimal = () => (_jsx("div", { className: `error-state minimal ${className}`, children: _jsxs("div", { className: "error-content", children: [_jsxs("div", { className: "error-header", children: [showIcon && _jsx(AlertTriangle, { size: 20, className: "error-icon" }), _jsx("span", { className: "error-title", children: title })] }), onRetry && (_jsxs("button", { onClick: onRetry, className: "retry-btn minimal", children: [_jsx(RefreshCw, { size: 16 }), retryText] }))] }) }));
    const renderDefault = () => (_jsx("div", { className: `error-state default ${className}`, children: _jsxs("div", { className: "error-content", children: [showIcon && (_jsx("div", { className: "error-icon-container", children: _jsx(AlertTriangle, { size: 48, className: "error-icon" }) })), _jsxs("div", { className: "error-text", children: [_jsx("h3", { className: "error-title", children: title }), _jsx("p", { className: "error-description", children: getDescription() })] }), onRetry && (_jsx("div", { className: "error-actions", children: _jsxs("button", { onClick: onRetry, className: "retry-btn default", children: [_jsx(RefreshCw, { size: 16 }), retryText] }) }))] }) }));
    const renderDetailed = () => (_jsx("div", { className: `error-state detailed ${className}`, children: _jsxs("div", { className: "error-content", children: [showIcon && (_jsx("div", { className: "error-icon-container", children: _jsx(AlertTriangle, { size: 64, className: "error-icon" }) })), _jsxs("div", { className: "error-text", children: [_jsx("h2", { className: "error-title", children: title }), _jsx("p", { className: "error-description", children: getDescription() }), error instanceof Error && error.stack && (_jsxs("details", { className: "error-details", children: [_jsx("summary", { children: "Technical Details" }), _jsx("pre", { className: "error-stack", children: error.stack })] }))] }), _jsxs("div", { className: "error-actions", children: [onRetry && (_jsxs("button", { onClick: onRetry, className: "retry-btn detailed", children: [_jsx(RefreshCw, { size: 18 }), retryText] })), _jsx("button", { onClick: () => window.location.reload(), className: "reload-btn", children: "Reload Page" })] })] }) }));
    switch (variant) {
        case 'minimal':
            return renderMinimal();
        case 'detailed':
            return renderDetailed();
        default:
            return renderDefault();
    }
};
export default ErrorState;
