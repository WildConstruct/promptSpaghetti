import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// packages/core/components/Help/ContextualHelpSystem.tsx
// Contextual Help System for Story 8.4 Task 4
// Provides tooltip system explaining advanced feature usage and progressive onboarding
import { useState, useEffect, useRef, useCallback } from 'react';
import { useUISettingsStore } from '../../stores/uiSettingsStore';
// Built-in help content for common components
export 
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
export const ProgressiveOnboarding = ({ steps, currentStep, onNext, onPrevious, onSkip, onComplete }) => {
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
