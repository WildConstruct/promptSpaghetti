import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// packages/core/components/Help/HelpIntegration.tsx
// Help Integration Components for Story 8.4 Task 4
// Provides easy integration of contextual help with existing components
import React from 'react';
import { ContextualTooltip } from './ContextualHelpSystem';
import { useHelpSystem, useFieldHelp } from './HelpContentManager';
import { useUISettingsStore } from '../../stores/uiSettingsStore';
// HOC for adding help to any component
export function withHelp(WrappedComponent, helpContent) {
    const WithHelpComponent = (props) => {
        const { showHelpHints } = useHelpSystem();
        if (!showHelpHints) {
            return _jsx(WrappedComponent, { ...props });
        }
        return (_jsx(ContextualTooltip, { content: helpContent, children: _jsx(WrappedComponent, { ...props }) }));
    };
    WithHelpComponent.displayName = `withHelp(${WrappedComponent.displayName || WrappedComponent.name})`;
    return WithHelpComponent;
}
export const HelpfulInput = ({ helpId, helpTitle, helpDescription, helpCategory = 'basic', helpExamples, helpShortcut, label, error, className = '', style, ...inputProps }) => {
    const { complexityLevel } = useUISettingsStore();
    const { showHelpHints } = useHelpSystem();
    const helpContent = useFieldHelp(helpId, {
        title: helpTitle,
        description: helpDescription,
        category: helpCategory,
        trigger: 'focus',
        position: 'right',
        showOnDisclosureLevel: [complexityLevel],
        examples: helpExamples,
        shortcut: helpShortcut,
        priority: helpCategory === 'basic' ? 'high' : 'medium'
    });
    const inputElement = (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 4, ...style }, children: [label && (_jsxs("label", { htmlFor: helpId, style: {
                    fontSize: 12,
                    fontWeight: 500,
                    color: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                }, children: [label, helpCategory === 'advanced' && (_jsx("span", { style: { fontSize: 10, color: '#4299e1' }, children: "\u2699\uFE0F" })), helpCategory === 'debug' && (_jsx("span", { style: { fontSize: 10, color: '#9f7aea' }, children: "\uD83D\uDD27" }))] })), _jsx("input", { id: helpId, className: `helpful-input ${className}`, style: {
                    padding: '6px 8px',
                    background: '#4a5568',
                    border: error ? '1px solid #e53e3e' : '1px solid #718096',
                    borderRadius: 4,
                    color: '#e2e8f0',
                    fontSize: 12,
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    ...inputProps.style
                }, ...inputProps }), error && (_jsxs("div", { style: {
                    fontSize: 10,
                    color: '#e53e3e',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                }, children: ["\u26A0\uFE0F ", error] }))] }));
    if (!showHelpHints || !helpContent) {
        return inputElement;
    }
    return (_jsx(ContextualTooltip, { content: helpContent, children: inputElement }));
};
export const HelpfulButton = ({ helpId, helpTitle, helpDescription, helpCategory = 'basic', helpExamples, helpShortcut, variant = 'secondary', size = 'medium', children, className = '', style, ...buttonProps }) => {
    const { complexityLevel } = useUISettingsStore();
    const { showHelpHints } = useHelpSystem();
    const helpContent = useFieldHelp(helpId, {
        title: helpTitle,
        description: helpDescription,
        category: helpCategory,
        trigger: 'hover',
        position: 'top',
        showOnDisclosureLevel: [complexityLevel],
        examples: helpExamples,
        shortcut: helpShortcut,
        priority: helpCategory === 'basic' ? 'high' : 'medium'
    });
    const getButtonStyles = () => {
        const sizeStyles = {
            small: { padding: '4px 8px', fontSize: 10 },
            medium: { padding: '6px 12px', fontSize: 12 },
            large: { padding: '8px 16px', fontSize: 14 }
        };
        const variantStyles = {
            primary: { background: '#4299e1', color: 'white' },
            secondary: { background: '#4a5568', color: '#e2e8f0' },
            danger: { background: '#e53e3e', color: 'white' }
        };
        return {
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontWeight: 500,
            ...sizeStyles[size],
            ...variantStyles[variant]
        };
    };
    const buttonElement = (_jsx("button", { className: `helpful-button ${className}`, style: {
            ...getButtonStyles(),
            ...style
        }, ...buttonProps, children: children }));
    if (!showHelpHints || !helpContent) {
        return buttonElement;
    }
    return (_jsx(ContextualTooltip, { content: helpContent, children: buttonElement }));
};
export const HelpfulSection = ({ helpId, helpTitle, helpDescription, helpCategory = 'basic', helpExamples, title, children, collapsible = false, defaultExpanded = true, className = '', style }) => {
    const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);
    const { complexityLevel } = useUISettingsStore();
    const { showHelpHints } = useHelpSystem();
    const helpContent = useFieldHelp(helpId, {
        title: helpTitle,
        description: helpDescription,
        category: helpCategory,
        trigger: 'hover',
        position: 'right',
        showOnDisclosureLevel: [complexityLevel],
        examples: helpExamples,
        priority: helpCategory === 'basic' ? 'high' : 'medium'
    });
    const headerElement = (_jsxs("div", { style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            background: '#2d3748',
            borderRadius: collapsible ? '4px 4px 0 0' : 4,
            border: '1px solid #4a5568',
            cursor: collapsible ? 'pointer' : 'default'
        }, onClick: collapsible ? () => setIsExpanded(!isExpanded) : undefined, children: [_jsxs("div", { style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                }, children: [_jsx("span", { style: {
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#e2e8f0'
                        }, children: title }), helpCategory === 'advanced' && (_jsx("span", { style: { fontSize: 10, color: '#4299e1' }, children: "\u2699\uFE0F" })), helpCategory === 'debug' && (_jsx("span", { style: { fontSize: 10, color: '#9f7aea' }, children: "\uD83D\uDD27" }))] }), collapsible && (_jsx("span", { style: {
                    fontSize: 10,
                    color: '#a0aec0',
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                }, children: "\u25BC" }))] }));
    const sectionElement = (_jsxs("div", { className: `helpful-section ${className}`, style: style, children: [showHelpHints && helpContent ? (_jsx(ContextualTooltip, { content: helpContent, children: headerElement })) : (headerElement), (!collapsible || isExpanded) && (_jsx("div", { style: {
                    padding: 12,
                    background: '#1a202c',
                    border: '1px solid #4a5568',
                    borderTop: 'none',
                    borderRadius: '0 0 4px 4px'
                }, children: children }))] }));
    return sectionElement;
};
// Hook for adding help to any existing component
export const useContextualHelp = (helpContent) => {
    const { showHelpHints, addHelpContent } = useHelpSystem();
    React.useEffect(() => {
        addHelpContent(helpContent);
    }, [helpContent.id]);
    const wrapWithHelp = (element) => {
        if (!showHelpHints)
            return element;
        return (_jsx(ContextualTooltip, { content: helpContent, children: element }));
    };
    return { wrapWithHelp, showHelp: showHelpHints };
};
// Onboarding overlay component
export const OnboardingOverlay = ({ isActive, children }) => {
    if (!isActive)
        return _jsx(_Fragment, { children: children });
    return (_jsxs("div", { style: { position: 'relative' }, children: [_jsx("div", { style: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    zIndex: 1500,
                    pointerEvents: isActive ? 'all' : 'none'
                } }), _jsx("div", { style: { position: 'relative', zIndex: 1600 }, children: children })] }));
};
export default {
    withHelp,
    HelpfulInput,
    HelpfulButton,
    HelpfulSection,
    useContextualHelp,
    OnboardingOverlay
};
