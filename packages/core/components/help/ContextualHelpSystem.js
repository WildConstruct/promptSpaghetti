import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// packages/core/components/Help/ContextualHelpSystem.tsx
// Contextual Help System for Story 8.4 Task 4
// Provides tooltip system explaining advanced feature usage and progressive onboarding
import { useState, useEffect, useRef, useCallback } from 'react';
import { useUISettingsStore } from '../../stores/uiSettingsStore';
// Built-in help content for common components
export const BUILT_IN_HELP_CONTENT = [
    // Basic Level Help
    {
        id: 'node-name',
        title: 'Node Name',
        description: 'Give your node a descriptive name to identify it in your graph. This helps organize complex workflows.',
        category: 'basic',
        trigger: 'hover',
        position: 'top',
        showOnDisclosureLevel: ['basic', 'advanced', 'debug'],
        examples: ['Fire Spell Generator', 'Character Description', 'Scene Setting'],
        priority: 'high'
    },
    {
        id: 'template-input',
        title: 'Template Input',
        description: 'Write your prompt template using {variable} syntax. Variables will become connection ports for dynamic content.',
        category: 'basic',
        trigger: 'focus',
        position: 'right',
        showOnDisclosureLevel: ['basic', 'advanced', 'debug'],
        examples: [
            'A {creature} running through {terrain}',
            'In {setting}, {character} discovers {object}'
        ],
        shortcut: 'Ctrl+T',
        priority: 'high'
    },
    {
        id: 'preview-button',
        title: 'Preview Results',
        description: 'Generate multiple examples to see how your template will behave with different random values.',
        category: 'basic',
        trigger: 'hover',
        position: 'bottom',
        showOnDisclosureLevel: ['basic', 'advanced', 'debug'],
        shortcut: 'Ctrl+P',
        priority: 'high'
    },
    // Advanced Level Help
    {
        id: 'weight-controls',
        title: 'Weight Controls',
        description: 'Adjust the probability of each option being selected. Higher weights make options more likely to appear.',
        category: 'advanced',
        trigger: 'hover',
        position: 'left',
        showOnDisclosureLevel: ['advanced', 'debug'],
        examples: ['70% Fire, 20% Ice, 10% Lightning'],
        relatedFeatures: ['weight-presets', 'distribution-charts'],
        priority: 'medium'
    },
    {
        id: 'weight-presets',
        title: 'Weight Presets',
        description: 'Apply common weight distribution patterns or save your custom patterns for reuse across projects.',
        category: 'advanced',
        trigger: 'hover',
        position: 'top',
        showOnDisclosureLevel: ['advanced', 'debug'],
        examples: ['Equal Distribution', 'Linear Decrease', 'Fibonacci Weights'],
        relatedFeatures: ['weight-controls', 'custom-presets'],
        priority: 'medium'
    },
    {
        id: 'distribution-charts',
        title: 'Distribution Visualization',
        description: 'Visual representation of your weight distribution. Pie charts show proportions, bar charts show relative values.',
        category: 'advanced',
        trigger: 'hover',
        position: 'auto',
        showOnDisclosureLevel: ['advanced', 'debug'],
        relatedFeatures: ['weight-controls', 'weight-presets'],
        priority: 'medium'
    },
    {
        id: 'drag-reorder',
        title: 'Drag to Reorder',
        description: 'Drag options to reorder them without losing weight values. Use the drag handle (⋮⋮) to move items.',
        category: 'advanced',
        trigger: 'hover',
        position: 'right',
        showOnDisclosureLevel: ['advanced', 'debug'],
        shortcut: 'Hold and drag',
        priority: 'low'
    },
    // Debug Level Help
    {
        id: 'node-id',
        title: 'Node ID',
        description: 'Internal unique identifier for this node. Useful for debugging and API integration.',
        category: 'debug',
        trigger: 'hover',
        position: 'top',
        showOnDisclosureLevel: ['debug'],
        priority: 'low'
    },
    {
        id: 'execution-stats',
        title: 'Execution Statistics',
        description: 'Performance metrics for this node including execution time, memory usage, and error rates.',
        category: 'debug',
        trigger: 'hover',
        position: 'auto',
        showOnDisclosureLevel: ['debug'],
        relatedFeatures: ['performance-monitoring'],
        priority: 'low'
    },
    {
        id: 'raw-config',
        title: 'Raw Configuration',
        description: 'JSON representation of this node\'s configuration. Useful for debugging and advanced integrations.',
        category: 'debug',
        trigger: 'hover',
        position: 'left',
        showOnDisclosureLevel: ['debug'],
        priority: 'low'
    },
    // Onboarding Help
    {
        id: 'onboarding-welcome',
        title: 'Welcome to Wild Construct',
        description: 'Start by creating a simple prompt template. Use {variables} to make your content dynamic and reusable.',
        category: 'onboarding',
        trigger: 'manual',
        position: 'auto',
        showOnDisclosureLevel: ['basic'],
        examples: ['Try: "A {color} {animal} in a {location}"'],
        priority: 'high'
    },
    {
        id: 'onboarding-variables',
        title: 'Variables Become Ports',
        description: 'When you use {variable} syntax, connection ports appear automatically. Connect other nodes to these ports for dynamic content.',
        category: 'onboarding',
        trigger: 'manual',
        position: 'right',
        showOnDisclosureLevel: ['basic'],
        relatedFeatures: ['template-input'],
        priority: 'high'
    },
    {
        id: 'onboarding-advanced',
        title: 'Ready for More?',
        description: 'Switch to Advanced view to access weight controls, presets, and visualization tools for fine-tuning your content.',
        category: 'onboarding',
        trigger: 'manual',
        position: 'top',
        showOnDisclosureLevel: ['basic'],
        relatedFeatures: ['weight-controls', 'distribution-charts'],
        priority: 'medium'
    }
];
// Individual tooltip component
export const ContextualTooltip = ({ content, children, disabled = false, delay = 500, className = '' }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [calculatedPosition, setCalculatedPosition] = useState('top');
    const containerRef = useRef(null);
    const tooltipRef = useRef(null);
    const timeoutRef = useRef(null);
    const { complexityLevel } = useUISettingsStore();
    // Check if tooltip should be shown based on current disclosure level
    const shouldShow = content.showOnDisclosureLevel
        ? content.showOnDisclosureLevel.includes(complexityLevel)
        : true;
    const showTooltip = useCallback((event) => {
        if (disabled || !shouldShow)
            return;
        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        // Calculate position
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
            const scrollY = window.pageYOffset || document.documentElement.scrollTop;
            let x = rect.left + scrollX + rect.width / 2;
            let y = rect.top + scrollY;
            // Auto-position if needed
            let pos = content.position || 'auto';
            if (pos === 'auto') {
                const viewportHeight = window.innerHeight;
                const viewportWidth = window.innerWidth;
                if (rect.top < viewportHeight / 2) {
                    pos = 'bottom';
                    y = rect.bottom + scrollY;
                }
                else {
                    pos = 'top';
                    y = rect.top + scrollY;
                }
                if (rect.left < viewportWidth / 2) {
                    x = rect.left + scrollX;
                }
                else {
                    x = rect.right + scrollX;
                }
            }
            setPosition({ x, y });
            setCalculatedPosition(pos);
        }
        // Show with delay
        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
        }, delay);
    }, [disabled, shouldShow, content.position, delay]);
    const hideTooltip = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setIsVisible(false);
    }, []);
    // Event handlers based on trigger type
    const getEventHandlers = () => {
        const trigger = content.trigger || 'hover';
        switch (trigger) {
            case 'hover':
                return {
                    onMouseEnter: showTooltip,
                    onMouseLeave: hideTooltip
                };
            case 'focus':
                return {
                    onFocus: showTooltip,
                    onBlur: hideTooltip
                };
            case 'click':
                return {
                    onClick: (e) => {
                        e.preventDefault();
                        if (isVisible) {
                            hideTooltip();
                        }
                        else {
                            showTooltip(e);
                        }
                    }
                };
            default:
                return {};
        }
    };
    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);
    return (_jsxs("div", { ref: containerRef, className: `contextual-tooltip-container ${className}`, style: { position: 'relative', display: 'inline-block' }, ...getEventHandlers(), children: [children, isVisible && shouldShow && (_jsx("div", { ref: tooltipRef, className: "contextual-tooltip", style: {
                    position: 'fixed',
                    left: position.x,
                    top: position.y,
                    zIndex: 1000,
                    pointerEvents: 'none',
                    transform: getTooltipTransform(calculatedPosition)
                }, children: _jsxs("div", { style: {
                        background: '#1a202c',
                        border: '1px solid #4a5568',
                        borderRadius: 6,
                        padding: 12,
                        maxWidth: 300,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                        color: '#e2e8f0',
                        fontSize: 12,
                        lineHeight: 1.4
                    }, children: [_jsxs("div", { style: {
                                fontWeight: 600,
                                marginBottom: 6,
                                color: getContentColor(content.category),
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6
                            }, children: [getCategoryIcon(content.category), content.title, content.priority === 'high' && (_jsx("span", { style: { fontSize: 10, color: '#f6ad55' }, children: "\u2B50" }))] }), _jsx("div", { style: { marginBottom: 8 }, children: content.description }), content.examples && content.examples.length > 0 && (_jsxs("div", { style: { marginBottom: 8 }, children: [_jsx("div", { style: {
                                        fontSize: 10,
                                        fontWeight: 600,
                                        color: '#a0aec0',
                                        marginBottom: 4
                                    }, children: "Examples:" }), content.examples.map((example, index) => (_jsx("div", { style: {
                                        fontSize: 10,
                                        color: '#68d391',
                                        fontFamily: 'monospace',
                                        background: 'rgba(72, 187, 120, 0.1)',
                                        padding: '2px 4px',
                                        borderRadius: 2,
                                        marginBottom: 2
                                    }, children: example }, index)))] })), content.shortcut && (_jsxs("div", { style: {
                                fontSize: 10,
                                color: '#a0aec0',
                                marginBottom: 4,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4
                            }, children: [_jsx("span", { children: "\u2328\uFE0F" }), _jsx("span", { style: {
                                        background: '#2d3748',
                                        padding: '1px 4px',
                                        borderRadius: 2,
                                        fontFamily: 'monospace'
                                    }, children: content.shortcut })] })), content.relatedFeatures && content.relatedFeatures.length > 0 && (_jsx("div", { style: { marginTop: 8, paddingTop: 8, borderTop: '1px solid #4a5568' }, children: _jsxs("div", { style: {
                                    fontSize: 10,
                                    color: '#a0aec0',
                                    marginBottom: 4
                                }, children: ["Related: ", content.relatedFeatures.join(', ')] }) })), content.learnMoreUrl && (_jsx("div", { style: { marginTop: 8, paddingTop: 8, borderTop: '1px solid #4a5568' }, children: _jsx("a", { href: content.learnMoreUrl, target: "_blank", rel: "noopener noreferrer", style: {
                                    fontSize: 10,
                                    color: '#4299e1',
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4
                                }, children: "\uD83D\uDCD6 Learn More" }) })), _jsx("div", { style: {
                                position: 'absolute',
                                ...getArrowStyle(calculatedPosition)
                            } })] }) }))] }));
};
// Progressive onboarding system
export const ProgressiveOnboardingSystem = ({ steps, currentStep, onNext, onPrevious, onSkip, onComplete }) => {
    const currentContent = steps[currentStep];
    if (!currentContent)
        return null;
    return (_jsxs("div", { style: {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 2000,
            background: '#1a202c',
            border: '2px solid #4299e1',
            borderRadius: 8,
            padding: 20,
            maxWidth: 400,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
        }, children: [_jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16
                }, children: [_jsxs("div", { style: {
                            fontSize: 12,
                            color: '#a0aec0'
                        }, children: ["Step ", currentStep + 1, " of ", steps.length] }), _jsx("div", { style: {
                            display: 'flex',
                            gap: 4
                        }, children: steps.map((_, index) => (_jsx("div", { style: {
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: index === currentStep ? '#4299e1' : '#4a5568'
                            } }, index))) })] }), _jsxs("div", { style: {
                    color: '#e2e8f0',
                    marginBottom: 20
                }, children: [_jsx("h3", { style: {
                            fontSize: 16,
                            fontWeight: 600,
                            marginBottom: 8,
                            color: '#4299e1'
                        }, children: currentContent.title }), _jsx("p", { style: {
                            fontSize: 14,
                            lineHeight: 1.5,
                            marginBottom: 12
                        }, children: currentContent.description }), currentContent.examples && (_jsx("div", { style: { marginBottom: 12 }, children: currentContent.examples.map((example, index) => (_jsx("div", { style: {
                                fontSize: 12,
                                color: '#68d391',
                                fontFamily: 'monospace',
                                background: 'rgba(72, 187, 120, 0.1)',
                                padding: '4px 8px',
                                borderRadius: 4,
                                marginBottom: 4
                            }, children: example }, index))) }))] }), _jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 8
                }, children: [_jsxs("div", { style: { display: 'flex', gap: 8 }, children: [currentStep > 0 && (_jsx("button", { onClick: onPrevious, style: {
                                    padding: '6px 12px',
                                    background: '#4a5568',
                                    border: 'none',
                                    borderRadius: 4,
                                    color: '#e2e8f0',
                                    cursor: 'pointer',
                                    fontSize: 12
                                }, children: "\u2190 Previous" })), _jsx("button", { onClick: onSkip, style: {
                                    padding: '6px 12px',
                                    background: 'transparent',
                                    border: '1px solid #4a5568',
                                    borderRadius: 4,
                                    color: '#a0aec0',
                                    cursor: 'pointer',
                                    fontSize: 12
                                }, children: "Skip Tour" })] }), _jsx("div", { children: currentStep < steps.length - 1 ? (_jsx("button", { onClick: onNext, style: {
                                padding: '6px 12px',
                                background: '#4299e1',
                                border: 'none',
                                borderRadius: 4,
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: 12,
                                fontWeight: 600
                            }, children: "Next \u2192" })) : (_jsx("button", { onClick: onComplete, style: {
                                padding: '6px 12px',
                                background: '#38b2ac',
                                border: 'none',
                                borderRadius: 4,
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: 12,
                                fontWeight: 600
                            }, children: "Get Started! \uD83D\uDE80" })) })] })] }));
};
// Helper functions
function getTooltipTransform(position) {
    switch (position) {
        case 'top':
            return 'translate(-50%, -100%) translateY(-8px)';
        case 'bottom':
            return 'translate(-50%, 0) translateY(8px)';
        case 'left':
            return 'translate(-100%, -50%) translateX(-8px)';
        case 'right':
            return 'translate(0, -50%) translateX(8px)';
        default:
            return 'translate(-50%, -100%) translateY(-8px)';
    }
}
function getArrowStyle(position) {
    const baseStyle = {
        width: 0,
        height: 0,
        border: '6px solid transparent'
    };
    switch (position) {
        case 'top':
            return {
                ...baseStyle,
                bottom: -12,
                left: '50%',
                marginLeft: -6,
                borderTopColor: '#1a202c'
            };
        case 'bottom':
            return {
                ...baseStyle,
                top: -12,
                left: '50%',
                marginLeft: -6,
                borderBottomColor: '#1a202c'
            };
        case 'left':
            return {
                ...baseStyle,
                right: -12,
                top: '50%',
                marginTop: -6,
                borderLeftColor: '#1a202c'
            };
        case 'right':
            return {
                ...baseStyle,
                left: -12,
                top: '50%',
                marginTop: -6,
                borderRightColor: '#1a202c'
            };
        default:
            return {
                ...baseStyle,
                bottom: -12,
                left: '50%',
                marginLeft: -6,
                borderTopColor: '#1a202c'
            };
    }
}
function getContentColor(category) {
    switch (category) {
        case 'basic':
            return '#68d391'; // Green
        case 'advanced':
            return '#4299e1'; // Blue
        case 'debug':
            return '#9f7aea'; // Purple
        case 'onboarding':
            return '#f6ad55'; // Orange
        default:
            return '#e2e8f0'; // Default gray
    }
}
function getCategoryIcon(category) {
    switch (category) {
        case 'basic':
            return '🎯';
        case 'advanced':
            return '⚙️';
        case 'debug':
            return '🔧';
        case 'onboarding':
            return '🌟';
        default:
            return '💡';
    }
}
export default ContextualTooltip;
